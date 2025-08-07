from pydantic import BaseModel
from typing import Optional

# Input schema for prediction
class TransactionInput(BaseModel):
    cc_num: int
    amt: float
    lat: float
    long: float
    city_pop: int
    merch_lat: float
    merch_long: float
    age: int
    hour_of_day: int
    day_of_week: int
    merchant_index: int
    category_index: int

# Basic user profile schema
class UserProfile(BaseModel):
    cc_num: int
    lat: float
    long: float
    city_pop: int
    age: int

# Prediction response
class PredictionResponse(BaseModel):
    prediction: int
    fraud_probability: float
    transaction_id: int
