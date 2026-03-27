from fastapi import APIRouter, HTTPException, Depends, Request
import razorpay
import os
from datetime import datetime
from dotenv import load_dotenv
from app.db import db
from app.routes.auth import get_current_user
import hmac
import hashlib

load_dotenv()

router = APIRouter(prefix="/payments", tags=["Payments"])

# Initialize Razorpay Client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_YourKeyGoesHere")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "YourSecretGoesHere")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@router.post("/create-order")
async def create_order(amount: float, currency: str = "INR", current_user: dict = Depends(get_current_user)):
    """
    Step 1: Create a Razorpay Order
    """
    try:
        # Razorpay expects amount in paise (1 INR = 100 paise)
        order_data = {
            "amount": int(amount * 100),
            "currency": currency,
            "receipt": f"receipt_{current_user.get('id')}",
            "payment_capture": 1,
            "notes": {
                "project_name": "SolarMark_Web", 
                "user_email": current_user.get("email"),
                "env": os.getenv("ENV", "development")
            }
        }
        
        order = client.order.create(data=order_data)
        
        # Save order to DB for reference
        db.payments.insert_one({
            "user_id": current_user.get("id"),
            "email": current_user.get("email"),
            "order_id": order["id"],
            "amount": amount,
            "currency": currency,
            "status": "created",
            "created_at": datetime.utcnow()
        })
        
        return order
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-payment")
async def verify_payment(data: dict, current_user: dict = Depends(get_current_user)):
    """
    Step 2: Verify Razorpay Payment Signature
    """
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    
    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        raise HTTPException(status_code=400, detail="Missing payment identification details")

    try:
        # Verify the signature manually or using the SDK
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        # This will raise an error if verification fails
        client.utility.verify_payment_signature(params_dict)
        
        # Update payment status in DB
        db.payments.update_one(
            {"order_id": razorpay_order_id},
            {"$set": {
                "status": "paid",
                "payment_id": razorpay_payment_id,
                "verified_at": datetime.utcnow()
            }}
        )
        
        # Update the related booking status if applicable
        # (Assuming you link the payment to a booking ID later)
        
        return {"status": "success", "message": "Payment verified successfully"}
    except Exception as e:
        print(f"Signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid payment signature")

@router.post("/create-subscription")
async def create_subscription(plan_id: str, current_user: dict = Depends(get_current_user)):
    """
    Step 1: Create a Razorpay Subscription
    """
    try:
        subscription_data = {
            "plan_id": plan_id,
            "customer_notify": 1,
            "total_count": 12, # e.g. for 1 year monthly
            "notes": {
                "project_name": "SolarMark_Web",
                "user_id": current_user.get("id"),
                "email": current_user.get("email")
            }
        }
        
        subscription = client.subscription.create(data=subscription_data)
        
        # Save subscription to DB
        db.subscriptions.insert_one({
            "user_id": current_user.get("id"),
            "email": current_user.get("email"),
            "subscription_id": subscription["id"],
            "plan_id": plan_id,
            "status": "created",
            "created_at": datetime.utcnow()
        })
        
        return subscription
    except Exception as e:
        print(f"Error creating subscription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-subscription")
async def verify_subscription(data: dict, current_user: dict = Depends(get_current_user)):
    """
    Step 2: Verify Razorpay Subscription Signature
    """
    razorpay_subscription_id = data.get("razorpay_subscription_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    
    if not all([razorpay_subscription_id, razorpay_payment_id, razorpay_signature]):
        raise HTTPException(status_code=400, detail="Missing subscription identification details")

    try:
        # Verify the signature
        params_dict = {
            'razorpay_subscription_id': razorpay_subscription_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        client.utility.verify_subscription_payment_signature(params_dict)
        
        # Update subscription status in DB
        db.subscriptions.update_one(
            {"subscription_id": razorpay_subscription_id},
            {"$set": {
                "status": "active",
                "last_payment_id": razorpay_payment_id,
                "verified_at": datetime.utcnow()
            }}
        )
        
        return {"status": "success", "message": "Subscription verified successfully"}
    except Exception as e:
        print(f"Subscription verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid subscription signature")

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """
    Handles Razorpay Webhooks for Subscriptions
    """
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "YourWebhookSecret")

    try:
        # Verify webhook signature
        client.utility.verify_webhook_signature(payload.decode(), signature, secret)
        
        data = await request.json()
        event = data.get("event")
        payload_data = data.get("payload", {})
        
        print(f"Received Razorpay Webhook Event: {event}")
        
        if event == "subscription.activated":
            sub_id = payload_data.get("subscription", {}).get("entity", {}).get("id")
            db.subscriptions.update_one({"subscription_id": sub_id}, {"$set": {"status": "active"}})
            
        elif event == "subscription.charged":
            sub_id = payload_data.get("subscription", {}).get("entity", {}).get("id")
            payment_id = payload_data.get("payment", {}).get("entity", {}).get("id")
            db.subscriptions.update_one({"subscription_id": sub_id}, {"$set": {"status": "active", "last_payment_on": datetime.utcnow()}})
            # Log separate payment entry
            db.payments.insert_one({
                "subscription_id": sub_id,
                "payment_id": payment_id,
                "event": "recurring_charge",
                "timestamp": datetime.utcnow()
            })
            
        elif event == "subscription.cancelled":
            sub_id = payload_data.get("subscription", {}).get("entity", {}).get("id")
            db.subscriptions.update_one({"subscription_id": sub_id}, {"$set": {"status": "cancelled"}})
            
        return {"status": "ok"}
    except Exception as e:
        print(f"Webhook verification failed: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/history")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    """
    Returns payment history for the current user
    """
    payments = list(db.payments.find({"user_id": current_user["id"]}).sort("created_at", -1))
    for payment in payments:
        payment["_id"] = str(payment["_id"])
        if isinstance(payment.get("created_at"), datetime):
            payment["created_at"] = payment["created_at"].isoformat()
        if isinstance(payment.get("verified_at"), datetime):
            payment["verified_at"] = payment["verified_at"].isoformat()
            
    return payments
