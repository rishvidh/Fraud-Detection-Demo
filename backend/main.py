from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import joblib
import numpy as np
from datetime import datetime, date
from models.schemas import TransactionInput, PredictionResponse, UserProfile

# Load model pipeline
pipeline = joblib.load("xgb_model.pkl")

app = FastAPI(title="Fraud Detection API", description="Demo fraud detection API with user/admin roles")

origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, GET, etc.
    allow_headers=["*"],
)

# In-memory "database"
transactions = []
transaction_counter = 0

# Basic auth users
security = HTTPBasic()
users = {
    "admin": {"password": "admin123", "role": "admin"},
    "johnpork67": {"password": "user123", "role": "user"}
}

user_profiles = {
    "johnpork67": {
        "cc_num": 60416207185,
        "name": "John Pork",
        "lat": 43.0048,
        "long": -108.8964, 
        "city_pop": 8000000,
        "age": 35
    } 
}


# Helper: verify user credentials
def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    user = users.get(credentials.username)
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"username": credentials.username, "role": user["role"]}


# ---- Endpoints ----
@app.post("/predict", response_model=PredictionResponse)
def predict_transaction(data: TransactionInput, user=Depends(get_current_user)):
    global transaction_counter
    X = np.array([[
        data.cc_num,
        data.amt,
        data.lat,
        data.long,
        data.city_pop,
        data.merch_lat,
        data.merch_long,
        data.age,
        data.hour_of_day,
        data.day_of_week,
        data.merchant_index,
        data.category_index
    ]])
    y_pred = pipeline.predict(X)[0]
    y_prob = pipeline.predict_proba(X)[0][1]

    # Store transaction
    transaction_counter += 1
    transaction_record = {
        "id": transaction_counter,
        "user": data.cc_num,
        "input": data.dict(),
        "prediction": int(y_pred),
        "fraud_probability": round(float(y_prob), 4)
    }
    transactions.append(transaction_record)

    return {
        "transaction_id": transaction_counter,
        "prediction": int(y_pred),
        "fraud_probability": round(float(y_prob), 4)
    }

@app.get("/transactions")
def list_transactions(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return transactions

@app.get("/user/{cc_num}", response_model=UserProfile)
def get_user_profile(cc_num: int, credentials: HTTPBasicCredentials = Depends(security)):
    user = users.get(credentials.username)
    if not user or user["password"] != credentials.password or user["role"] != "user":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # For the demo: we map CC num to fake profile info
    fake_profiles = {
        1234567890123456: {"lat": 40.7128, "long": -74.0060, "city_pop": 8000000, "age": 35},
        9876543210987654: {"lat": 34.0522, "long": -118.2437, "city_pop": 4000000, "age": 29}
    }

    profile = fake_profiles.get(cc_num)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    return UserProfile(
        cc_num=cc_num,
        lat=profile["lat"],
        long=profile["long"],
        city_pop=profile["city_pop"],
        age=profile["age"]
    )

@app.get("/user/{cc_num}/transactions")
def get_user_transactions(cc_num: int, credentials: HTTPBasicCredentials = Depends(security)):
    user = users.get(credentials.username)
    if not user or user["password"] != credentials.password or user["role"] != "user":
        raise HTTPException(status_code=403, detail="Not authorized")

    user_tx = [t for t in transactions if t["input"].cc_num == cc_num]
    return user_tx

@app.post("/login")
def login(credentials: HTTPBasicCredentials = Depends(security)):
    user = users.get(credentials.username)
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    role = user["role"]
    profile = user_profiles.get(credentials.username)
    cc_num = profile["cc_num"] if profile else "111"
    name = profile["name"] if profile else "default"
    return {"role": role, "cc_num": cc_num, "name": name}

