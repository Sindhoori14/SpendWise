from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime, timezone

try:
    from backend.database import Base
except ImportError:
    from database import Base


def get_current_time():
    return datetime.now(timezone.utc)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False, index=True)  # 'income' or 'expense'
    category = Column(String(50), nullable=False, index=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_current_time)
