from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Solar Inspection API")

# CORS configuration
origins = ["*"]  # In production, replace with specific origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Import and include routers
try:
    from app.routes.auth import router as auth_router
    app.include_router(auth_router)  # auth router already has prefix="/api" internally
    print("✅ Auth router loaded successfully")
    logger.info("Auth router loaded successfully")
except ImportError as e:
    print(f"⚠️  Auth router not loaded: {e}")
    logger.warning(f"Auth router not loaded: {e}")

try:
    from app.routes.drive_links import router as drive_links_router
    app.include_router(drive_links_router, prefix="/api", tags=["drive-links"])
    print("✅ Drive links router loaded successfully")
    logger.info("Drive links router loaded successfully")
except ImportError as e:
    print(f"⚠️  Drive links router not loaded: {e}")
    logger.warning(f"Drive links router not loaded: {e}")

try:
    from app.routes.bookings import router as bookings_router
    app.include_router(bookings_router, prefix="/api", tags=["bookings"])
    print("✅ Bookings router loaded successfully")
    logger.info("Bookings router loaded successfully")
except ImportError as e:
    print(f"⚠️  Bookings router not loaded: {e}")
    logger.warning(f"Bookings router not loaded: {e}")

try:
    from app.routes.contacts import router as contacts_router
    app.include_router(contacts_router, prefix="/api", tags=["contacts"])
    print("✅ Contacts router loaded successfully")
    logger.info("Contacts router loaded successfully")
except ImportError as e:
    print(f"⚠️  Contacts router not loaded: {e}")
    logger.warning(f"Contacts router not loaded: {e}")

try:
    from app.routes.image_routes import router as image_router
    app.include_router(image_router, prefix="/api", tags=["images"])
    print("✅ Image routes router loaded successfully")
    logger.info("Image routes router loaded successfully")
except ImportError as e:
    print(f"⚠️  Image routes router not loaded: {e}")
    logger.warning(f"Image routes router not loaded: {e}")

try:
    from app.routes.legal import router as legal_router
    app.include_router(legal_router, prefix="/api/legal", tags=["legal"])
    print("✅ Legal router loaded successfully")
    logger.info("Legal router loaded successfully")
except ImportError as e:
    print(f"⚠️  Legal router not loaded: {e}")
    logger.warning(f"Legal router not loaded: {e}")

try:
    from app.routes.otp_routes import router as otp_router
    app.include_router(otp_router)
    print("✅ OTP router loaded successfully")
    logger.info("OTP router loaded successfully")
except ImportError as e:
    print(f"⚠️  OTP router not loaded: {e}")
    logger.warning(f"OTP router not loaded: {e}")

try:
    from app.routes.site_photos import router as site_photos_router
    app.include_router(site_photos_router, prefix="/api", tags=["site-photos"])
    print("✅ Site photos router loaded successfully")
    logger.info("Site photos router loaded successfully")
except ImportError as e:
    print(f"⚠️  Site photos router not loaded: {e}")
    logger.warning(f"Site photos router not loaded: {e}")

@app.get("/")
def root():
    return {
        "message": "FastAPI + MongoDB backend is running",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/*",
            "drive_links": "/api/drive-links/*",
            "bookings": "/api/bookings/*",
            "contacts": "/api/contacts/*",
            "images": "/api/images/*",
            "legal": "/api/legal/*",
            "site_photos": "/api/site-photos/*"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "solar-panel-api",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/debug/routes")
def debug_routes():
    """List all registered routes for debugging"""
    routes = []
    for route in app.routes:
        routes.append({
            "path": route.path,
            "name": route.name,
            "methods": list(route.methods) if hasattr(route, 'methods') else None
        })
    return {"routes": routes, "total": len(routes)}

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup complete")
    logger.info(f"Registered {len(app.routes)} routes")
    for route in app.routes:
        logger.info(f"  {route.path}")