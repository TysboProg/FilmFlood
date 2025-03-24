from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr

class PaymentModel(BaseModel):
    number_order: str
    amount: float
    order_id: UUID
    user_id: UUID
    order_date: datetime
    email: EmailStr