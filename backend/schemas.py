from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Literal, List
from datetime import datetime
import re

DATE_REGEX = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class TransactionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Short title of the transaction")
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    type: Literal["income", "expense"] = Field(..., description="Must be 'income' or 'expense'")
    category: str = Field(..., min_length=1, max_length=50, description="Category name")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    description: Optional[str] = Field(None, max_length=500, description="Optional extra notes")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Title cannot be empty or only whitespace")
        return clean

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Category cannot be empty or only whitespace")
        return clean

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        if not DATE_REGEX.match(v):
            raise ValueError("Date must be formatted as YYYY-MM-DD")
        # Validate actual calendar date
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid calendar date")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean = v.strip()
        return clean if clean else None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[Literal["income", "expense"]] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    date: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)

    @field_validator("title", "amount", "type", "category", "date", mode="before")
    @classmethod
    def prevent_null_on_required_fields(cls, v, info):
        if v is None:
            raise ValueError(f"'{info.field_name}' cannot be null. To leave unchanged, omit this field.")
        return v

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Title cannot be empty")
            return clean
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip()
            if not clean:
                raise ValueError("Category cannot be empty")
            return clean
        return v

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not DATE_REGEX.match(v):
                raise ValueError("Date must be formatted as YYYY-MM-DD")
            try:
                datetime.strptime(v, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Invalid calendar date")
            return v
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean = v.strip()
        return clean if clean else None


class TransactionResponse(TransactionBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int
    type: str


class SummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int
    income_count: int
    expense_count: int
    category_breakdown: List[CategoryBreakdownItem]
