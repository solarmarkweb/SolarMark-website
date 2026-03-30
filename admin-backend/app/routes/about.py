from fastapi import APIRouter, HTTPException, Depends
from app.db import db
from app.models.about import AboutContent
from typing import Any, Dict

router = APIRouter(prefix="/about", tags=["about"])

@router.get("/", response_model=AboutContent)
async def get_about_content():
    content = db.about_content.find_one({}, {"_id": 0})
    if not content:
        # Default content if none exists
        return {
            "hero_title": "Next-Generation",
            "hero_subtitle": "Solar Intelligence",
            "hero_description": "Elevating solar asset management with aerospace-grade drone thermal imaging and AI-driven precision. Fast, reliable, and exceptionally accurate inspections.",
            "mission_title": "Pioneering the Future of Asset Management",
            "mission_text_1": "At the intersection of aerospace technology and clean energy, our mission is to ensure that large-scale solar farms operate at absolute peak capacity. Traditional manual inspections are slow, hazardous, and prone to human error.",
            "mission_text_2": "By deploying automated drone fleets equipped with state-of-the-art radiometric thermal cameras, we scan vast solar arrays in a fraction of the time. The resulting data is processed by our proprietary AI to definitively pinpoint anomalies—down to the individual cell level.",
            "mission_highlights": [
                "Rapid deployment across global utility-scale sites",
                "Significant reduction in operations and maintenance (O&M) costs",
                "Zero manual labor risks or hazard exposure",
                "Bankable, auditor-ready digital reporting"
            ],
            "stats": [
                {"label": "Panels Inspected", "value": "2.5M+", "icon": "Zap"},
                {"label": "Efficiency Gain", "value": "18%", "icon": "BarChart3"},
                {"label": "Global Clients", "value": "500+", "icon": "Globe"},
                {"label": "Accuracy Rate", "value": "99.9%", "icon": "ShieldCheck"}
            ],
            "process": [
                {
                    "step": "01",
                    "title": "Pre-Flight Intelligence",
                    "description": "Certified pilots analyze site layout, weather conditions, and optimal flight paths using advanced 3D mapping and terrain analysis software.",
                    "icon": "MapPin",
                    "details": ["Risk assessment", "Weather analysis"]
                },
                {
                    "step": "02",
                    "title": "Thermal Data Capture",
                    "description": "High-resolution thermal cameras mounted on drones capture premium infrared imagery of every panel at optimal angles to detect microscopic defects.",
                    "icon": "Camera",
                    "details": ["FLIR resolution", "Multi-angle capture"]
                },
                {
                    "step": "03",
                    "title": "AI-Powered Analysis",
                    "description": "Proprietary machine learning algorithms process thermal data to accurately identify hotspots, cold spots, and anomalies with unmatched precision.",
                    "icon": "Activity",
                    "details": ["Machine learning", "Anomaly classification"]
                },
                {
                    "step": "04",
                    "title": "Actionable Reporting",
                    "description": "Comprehensive reports delivered with high-fidelity thermal maps, exact fault locations, and actionable recommendations for maintenance teams.",
                    "icon": "BarChart3",
                    "details": ["Visual thermal maps", "ROI calculations"]
                }
            ],
            "capabilities": [
                {"name": "Hotspot Detection", "description": "Identifies overheating cells that reduce efficiency and pose fire risks", "icon": "Thermometer"},
                {"name": "Cell Degradation", "description": "Detects aging or damaged cells showing reduced power output", "icon": "Battery"},
                {"name": "Diode Failure", "description": "Locates faulty diodes causing string performance issues", "icon": "Zap"},
                {"name": "Soiling & Shading", "description": "Maps dirt accumulation and shadow patterns affecting output", "icon": "CloudRain"}
            ],
            "values": [
                {"title": "Precision Engineering", "description": "Leveraging military-grade thermal sensors and custom AI algorithms to identify microscopic faults before they become critical failures.", "icon": "Target"},
                {"title": "Sustainable Future", "description": "Every kilowatt-hour saved is a step toward a greener planet. We are deeply committed to maximizing renewable energy potential globally.", "icon": "Rocket"},
                {"title": "Industry Excellence", "description": "Setting the absolute gold standard for thermographic inspections with certified drone pilots and world-class data analysis.", "icon": "Award"},
                {"title": "Global Reach", "description": "Our distributed network of pilots ensures we can deploy teams to any solar farm across the globe within 48 hours of your request.", "icon": "Globe"}
            ],
            "drone_tech_title": "Purpose-Built Drone Technology",
            "drone_tech_description": "Our fleet of enterprise-grade drones are specifically modified for radiometric thermal solar inspection, ensuring every pass captures millimeter-accurate data across your entire solar array.",
            "drone_tech_specs": [
                {"label": "ALTITUDE", "value": "120 FT", "status": "ACTIVE", "color": "green"},
                {"label": "AIRSPEED", "value": "15 MPH", "status": "ACTIVE", "color": "green"},
                {"label": "THERMAL SENSOR", "value": "ACTIVE", "status": "ACTIVE", "color": "orange"},
                {"label": "PANEL SCAN", "value": "IN PROGRESS", "status": "ACTIVE", "color": "blue"}
            ]
        }
    return content

@router.post("/", response_model=AboutContent)
async def update_about_content(content: AboutContent):
    db.about_content.delete_many({})
    db.about_content.insert_one(content.dict())
    return content
