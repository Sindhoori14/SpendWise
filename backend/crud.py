from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import Optional, List, Dict, Any

try:
    from backend.models import Transaction
    from backend.schemas import TransactionCreate, TransactionUpdate
except ImportError:
    from models import Transaction
    from schemas import TransactionCreate, TransactionUpdate


DEFAULT_CATEGORIES = [
    "Salary",
    "Freelance",
    "Investment",
    "Food & Dining",
    "Groceries",
    "Housing & Rent",
    "Utilities",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Education",
    "Personal Care",
    "Travel",
    "Other"
]


def get_transactions(
    db: Session,
    search: Optional[str] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = None,
    offset: int = 0
) -> List[Transaction]:
    query = db.query(Transaction)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Transaction.title.ilike(search_pattern),
                Transaction.category.ilike(search_pattern),
                Transaction.description.ilike(search_pattern)
            )
        )

    if type and type.lower() in ["income", "expense"]:
        query = query.filter(Transaction.type == type.lower())

    if category and category.strip():
        query = query.filter(Transaction.category.ilike(category.strip()))

    query = query.order_by(desc(Transaction.date), desc(Transaction.id))

    if limit is not None:
        query = query.offset(offset).limit(limit)

    return query.all()


def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()


def create_transaction(db: Session, transaction: TransactionCreate) -> Transaction:
    db_transaction = Transaction(
        title=transaction.title,
        amount=round(float(transaction.amount), 2),
        type=transaction.type,
        category=transaction.category,
        date=transaction.date,
        description=transaction.description
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(
    db: Session,
    transaction_id: int,
    transaction_update: TransactionUpdate
) -> Optional[Transaction]:
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None

    update_data = transaction_update.model_dump(exclude_unset=True)
    if "amount" in update_data and update_data["amount"] is not None:
        update_data["amount"] = round(float(update_data["amount"]), 2)

    non_nullable_fields = {"title", "amount", "type", "category", "date"}
    for field, value in update_data.items():
        if field in non_nullable_fields and value is None:
            continue
        setattr(db_transaction, field, value)

    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int) -> bool:
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return False

    db.delete(db_transaction)
    db.commit()
    return True


def get_summary(db: Session) -> Dict[str, Any]:
    all_transactions = db.query(Transaction).all()

    total_income = 0.0
    total_expenses = 0.0
    income_count = 0
    expense_count = 0

    category_expense_map: Dict[str, Dict[str, Any]] = {}

    for tx in all_transactions:
        amount = float(tx.amount)
        if tx.type == "income":
            total_income += amount
            income_count += 1
        elif tx.type == "expense":
            total_expenses += amount
            expense_count += 1

            cat = tx.category.strip()
            if cat not in category_expense_map:
                category_expense_map[cat] = {"amount": 0.0, "count": 0, "type": "expense"}
            category_expense_map[cat]["amount"] += amount
            category_expense_map[cat]["count"] += 1

    total_income = round(total_income, 2)
    total_expenses = round(total_expenses, 2)
    balance = round(total_income - total_expenses, 2)

    category_breakdown = []
    for cat, data in category_expense_map.items():
        cat_amount = round(data["amount"], 2)
        percentage = round((cat_amount / total_expenses * 100), 1) if total_expenses > 0 else 0.0
        category_breakdown.append({
            "category": cat,
            "amount": cat_amount,
            "percentage": percentage,
            "count": data["count"],
            "type": "expense"
        })

    # Sort categories by highest spend first
    category_breakdown.sort(key=lambda x: x["amount"], reverse=True)

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "transaction_count": len(all_transactions),
        "income_count": income_count,
        "expense_count": expense_count,
        "category_breakdown": category_breakdown
    }


def get_categories(db: Session) -> List[str]:
    # Distinct categories already in the db
    db_categories = db.query(Transaction.category).distinct().all()
    used_categories = {row[0].strip() for row in db_categories if row[0]}

    # Merge with default categories maintaining unique values
    all_categories = list(DEFAULT_CATEGORIES)
    for cat in sorted(used_categories):
        if cat not in all_categories:
            all_categories.append(cat)

    return all_categories
