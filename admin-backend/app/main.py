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
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "https://solarmark.in",
    "https://www.solarmark.in",
    "https://admin.solarmark.in",
    "https://www.admin.solarmark.in",
    "https://solar-mark-website.vercel.app"
]

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
from app.routes.auth import router as auth_router
app.include_router(auth_router)  # auth router already has prefix="/api" internally

from app.routes.drive_links import router as drive_links_router
app.include_router(drive_links_router, prefix="/api", tags=["drive-links"])

from app.routes.bookings import router as bookings_router
app.include_router(bookings_router, prefix="/api", tags=["bookings"])

from app.routes.contacts import router as contacts_router
app.include_router(contacts_router, prefix="/api", tags=["contacts"])

from app.routes.image_routes import router as image_router
app.include_router(image_router, prefix="/api", tags=["images"])

from app.routes.legal import router as legal_router
app.include_router(legal_router, prefix="/api/legal", tags=["legal"])

from app.routes.otp_routes import router as otp_router
app.include_router(otp_router, prefix="/api/otp", tags=["OTP"])


from app.routes.site_photos import router as site_photos_router
app.include_router(site_photos_router, prefix="/api", tags=["site-photos"])

from app.routes.payments import router as payments_router
app.include_router(payments_router, prefix="/api", tags=["payments"])

from app.routes.about import router as about_router
app.include_router(about_router, prefix="/api", tags=["about"])

from app.routes.home_stats import router as home_stats_router
app.include_router(home_stats_router, prefix="/api", tags=["home-stats"])

from app.routes.footer_social import router as footer_social_router
app.include_router(footer_social_router, prefix="/api", tags=["footer-social"])

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
            "site_photos": "/api/site-photos/*",
            "payments": "/api/payments/*"
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