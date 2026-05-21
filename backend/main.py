from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import string

app = FastAPI(title="Sovereign Civic Care Ecosystem API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────
#  REQUEST MODELS
# ─────────────────────────────

class SOSPayload(BaseModel):
    name: str
    phone: str
    message: str
    lat: float
    lng: float

class ChatPayload(BaseModel):
    message: str
    lang: str = "en-IN"

class PayrollRequest(BaseModel):
    worker_id: str
    hours_worked: float
    hourly_rate: float
    multiplier: float

class AadhaarOTPRequest(BaseModel):
    aadhaar_number: str

class AadhaarVerifyRequest(BaseModel):
    ref_id: str
    otp: str


# ─────────────────────────────
#  EXISTING ENDPOINTS
# ─────────────────────────────

@app.post("/api/sos/trigger")
async def trigger_emergency_sos(payload: SOSPayload):
    return {
        "status": "Success",
        "message": f"Distress ticket generated successfully for {payload.name}.",
        "triage_priority": "HIGH",
        "action_taken": "Automated alert forwarded to local District Emergency Command Center."
    }

@app.post("/api/chat")
async def handle_chat(payload: ChatPayload):
    user_msg = payload.message.lower()
    response_text = "I am the AI E-Governance Citizen Assistant. Your request has been noted. Please contact 112 for immediate emergencies."

    if "shelter" in user_msg:
        response_text = "The nearest verified relief shelter is at the District Community Hall, 2.4 km away. Beds and food are available."
    elif "mla" in user_msg or "power" in user_msg:
        response_text = "Your ward MLA is Mr. Sharma (Ph: 9876543210). The power cutoff is due to precautionary grid isolation and will be restored in 4 hours."
    elif "scheme" in user_msg or "relief" in user_msg or "compensation" in user_msg:
        response_text = "Under the Cyclone Relief Scheme, affected citizens are eligible for ₹10,000 ex-gratia. Apply via the Citizen Distress Hub with your Aadhaar number."

    return {"response": response_text}


# ─────────────────────────────
#  PAYROLL ENDPOINTS
# ─────────────────────────────

@app.post("/api/workforce/payroll")
async def calculate_payroll_post(payload: PayrollRequest):
    """Frontend POST endpoint — accepts JSON body."""
    base_pay = payload.hours_worked * payload.hourly_rate
    hazard_bonus = base_pay * (payload.multiplier - 1.0)
    total_gross = base_pay + hazard_bonus
    return {
        "worker_id": payload.worker_id,
        "total_hours": payload.hours_worked,
        "base_earnings": round(base_pay, 2),
        "emergency_bonus": round(hazard_bonus, 2),
        "total_payable_inr": round(total_gross, 2),
        "compliance_status": "COMPLIANT" if payload.hours_worked <= 12.0
                             else "VIOLATION: Overwork Flagged (> 12 hrs)"
    }

@app.get("/api/workforce/payroll/{worker_id}")
async def calculate_payroll_get(worker_id: int, hours_worked: float,
                                hourly_rate: float, multiplier: float):
    """Legacy GET endpoint with query params."""
    base_pay = hours_worked * hourly_rate
    hazard_bonus = base_pay * (multiplier - 1.0)
    total_gross = base_pay + hazard_bonus
    return {
        "worker_id": worker_id,
        "total_hours": hours_worked,
        "base_earnings": round(base_pay, 2),
        "emergency_bonus": round(hazard_bonus, 2),
        "total_payable_inr": round(total_gross, 2),
        "compliance_status": "COMPLIANT" if hours_worked <= 12.0
                             else "VIOLATION: Overwork Flagged"
    }


# ─────────────────────────────
#  DISTRICT NAVIGATOR
# ─────────────────────────────

DISTRICT_DATA = {
    "bengaluru urban": {
        "mla_name": "Ramalinga Reddy",
        "mla_contact": "9880299370",
        "sdrf_dispatch": "ACTIVE – SDRF Battalion 5 deployed"
    },
    "mysuru": {
        "mla_name": "G.T. Deve Gowda",
        "mla_contact": "9845099867",
        "sdrf_dispatch": "ACTIVE – SDRF Battalion 2 deployed"
    },
    "mangaluru": {
        "mla_name": "U.T. Khader",
        "mla_contact": "9880101010",
        "sdrf_dispatch": "STANDBY – District Civil Defense on alert"
    },
    "hubballi": {
        "mla_name": "Jagadish Shettar",
        "mla_contact": "9845011111",
        "sdrf_dispatch": "ACTIVE – Emergency Response Team deployed"
    },
    "belagavi": {
        "mla_name": "Lakshmi Hebbalkar",
        "mla_contact": "9986660000",
        "sdrf_dispatch": "ACTIVE – SDRF Battalion 3 on ground"
    },
}

@app.get("/api/navigator/lookup")
async def lookup_district(district: str):
    key = district.lower().strip()
    data = DISTRICT_DATA.get(key, {
        "mla_name": f"District Authority ({district})",
        "mla_contact": "1078",
        "sdrf_dispatch": "STANDBY – Monitoring active"
    })
    return {
        "success": True,
        "district": district,
        "source": "NIC Karnataka District Registry",
        "records": [data]
    }


# ─────────────────────────────
#  SCHEMES
# ─────────────────────────────

@app.get("/api/schemes")
async def get_schemes():
    return {
        "success": True,
        "schemes": [
            {
                "id": "cyclone-1",
                "title": "Cyclone Biparjoy Relief Fund",
                "category": "Natural Disaster",
                "description": "Ex-gratia compensation of ₹10,000 for flood-affected families. Additional ₹5,000 for loss of agricultural equipment.",
                "eligibility": "Families in declared flood-affected taluks with Aadhaar-linked bank account",
                "link": "https://ndma.gov.in",
                "link_text": "Apply on NDMA Portal"
            },
            {
                "id": "relief-2",
                "title": "State Disaster Relief Fund (SDRF) 2024",
                "category": "Emergency Relief",
                "description": "Immediate relief of ₹3,500 per family for temporary shelter, food, and drinking water during declared disasters.",
                "eligibility": "BPL & AAY ration card holders in disaster-declared districts",
                "link": "https://dpar.kar.nic.in",
                "link_text": "Karnataka DPAR Portal"
            },
            {
                "id": "agri-3",
                "title": "PM Fasal Bima Yojana (PMFBY)",
                "category": "Agricultural Support",
                "description": "Crop insurance providing financial support to farmers suffering crop loss due to natural calamities, pests & diseases.",
                "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops",
                "link": "https://pmfby.gov.in",
                "link_text": "Apply on PMFBY Portal"
            },
            {
                "id": "health-4",
                "title": "Ayushman Bharat PM-JAY",
                "category": "Medical Relief",
                "description": "Health coverage of up to ₹5 lakh per family per year for secondary and tertiary hospitalization for disaster-related injuries.",
                "eligibility": "Families listed in SECC database and BPL certificate holders",
                "link": "https://pmjay.gov.in",
                "link_text": "Check Eligibility on PM-JAY"
            },
            {
                "id": "housing-5",
                "title": "PMAY Gramin Housing Grant",
                "category": "Housing Support",
                "description": "Financial assistance for reconstruction of fully damaged house. ₹1.2 lakh in plain areas, ₹1.3 lakh in hilly/difficult areas.",
                "eligibility": "Houseless families or those with kuchha houses as per SECC-2011 data",
                "link": "https://pmayg.nic.in",
                "link_text": "Apply on PMAYG Portal"
            }
        ]
    }


# ─────────────────────────────
#  AADHAAR SANDBOX
# ─────────────────────────────

@app.post("/api/aadhaar/send-otp")
async def send_aadhaar_otp(payload: AadhaarOTPRequest):
    if len(payload.aadhaar_number) != 12:
        raise HTTPException(status_code=400, detail="Aadhaar number must be 12 digits.")
    ref_id = "".join(random.choices(string.ascii_uppercase + string.digits, k=12))
    return {
        "success": True,
        "ref_id": ref_id,
        "message": "OTP sent to Aadhaar-linked mobile. Use 123456 for sandbox testing."
    }

@app.post("/api/aadhaar/verify-otp")
async def verify_aadhaar_otp(payload: AadhaarVerifyRequest):
    if payload.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
    return {
        "success": True,
        "citizen_details": {
            "name": "Ramesh Kumar Sharma",
            "dob": "15/08/1987",
            "gender": "Male",
            "address": "H.No. 47, 3rd Cross, Basaveshwaranagar, Bengaluru – 560079, Karnataka"
        }
    }
