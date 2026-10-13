import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")))

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from contextlib import asynccontextmanager

try:
    from backend.database import engine, get_db, Base
    from backend.models import Transaction
    from backend.schemas import (
        TransactionCreate,
        TransactionUpdate,
        TransactionResponse,
        SummaryResponse
    )
    from backend import crud
except ImportError:
    from database import engine, get_db, Base
    from models import Transaction
    from schemas import (
        TransactionCreate,
        TransactionUpdate,
        TransactionResponse,
        SummaryResponse
    )
    import crud


# Automatically create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Check if database has any transactions, if empty, seed some initial realistic data
    db = next(get_db())
    try:
        count = db.query(Transaction).count()
        if count == 0:
            seed_data = [
                Transaction(
                    title="Monthly Salary",
                    amount=85000.0,
                    type="income",
                    category="Salary",
                    date="2026-10-01",
                    description="Primary monthly payroll credit"
                ),
                Transaction(
                    title="Apartment Rent",
                    amount=22000.0,
                    type="expense",
                    category="Housing & Rent",
                    date="2026-10-02",
                    description="October rent payment"
                ),
                Transaction(
                    title="Supermarket Groceries",
                    amount=4650.0,
                    type="expense",
                    category="Groceries",
                    date="2026-10-04",
                    description="Weekly essentials, fruits and dairy"
                ),
                Transaction(
                    title="Freelance Web Project",
                    amount=25000.0,
                    type="income",
                    category="Freelance",
                    date="2026-10-06",
                    description="Landing page redesign milestone"
                ),
                Transaction(
                    title="Electricity & Internet Bills",
                    amount=3420.0,
                    type="expense",
                    category="Utilities",
                    date="2026-10-07",
                    description="Broadband fiber + power bill"
                ),
                Transaction(
                    title="Dinner with Friends",
                    amount=2800.0,
                    type="expense",
                    category="Food & Dining",
                    date="2026-10-09",
                    description="Weekend restaurant outing"
                ),
                Transaction(
                    title="Fuel & Metro Card",
                    amount=1850.0,
                    type="expense",
                    category="Transportation",
                    date="2026-10-11",
                    description="Vehicle petrol and public transit recharge"
                ),
            ]
            for item in seed_data:
                db.add(item)
            db.commit()
    finally:
        db.close()
    yield


app = FastAPI(
    title="SpendWise API",
    description="Full-stack Expense Tracker Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok", "app": "SpendWise", "currency": "INR (₹)"}


@app.get("/api/transactions", response_model=List[TransactionResponse], tags=["Transactions"])
def list_transactions(
    search: Optional[str] = Query(None, description="Search in title, category, description"),
    type: Optional[str] = Query(None, description="Filter by type: 'income' or 'expense'"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    limit: Optional[int] = Query(None, ge=1, le=500, description="Limit number of results"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db)
):
    """Retrieve transactions with search and filter support."""
    return crud.get_transactions(
        db=db,
        search=search,
        type=type,
        category=category,
        limit=limit,
        offset=offset
    )


@app.post("/api/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED, tags=["Transactions"])
def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new income or expense transaction."""
    try:
        return crud.create_transaction(db=db, transaction=transaction_in)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create transaction: {str(e)}"
        )


@app.get("/api/transactions/{transaction_id}", response_model=TransactionResponse, tags=["Transactions"])
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve a single transaction by ID."""
    tx = crud.get_transaction(db=db, transaction_id=transaction_id)
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {transaction_id} not found"
        )
    return tx


@app.put("/api/transactions/{transaction_id}", response_model=TransactionResponse, tags=["Transactions"])
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing transaction."""
    updated = crud.update_transaction(
        db=db,
        transaction_id=transaction_id,
        transaction_update=transaction_in
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {transaction_id} not found"
        )
    return updated


@app.delete("/api/transactions/{transaction_id}", status_code=status.HTTP_200_OK, tags=["Transactions"])
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """Delete a transaction by ID."""
    success = crud.delete_transaction(db=db, transaction_id=transaction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {transaction_id} not found"
        )
    return {"message": "Transaction deleted successfully", "id": transaction_id}


@app.get("/api/summary", response_model=SummaryResponse, tags=["Dashboard"])
def get_summary(db: Session = Depends(get_db)):
    """Get dashboard summary metrics: total income, total expenses, balance, and category spending breakdown."""
    return crud.get_summary(db=db)


@app.get("/api/categories", response_model=List[str], tags=["Categories"])
def get_categories(db: Session = Depends(get_db)):
    """Get list of standard and custom categories."""
    return crud.get_categories(db=db)
