# SpendWise 💰

**SpendWise** is a full-stack personal expense tracker and finance dashboard built with **React**, **Vite**, **Plain CSS**, **Python FastAPI**, **SQLAlchemy**, **SQLite**, and **Recharts**.

It offers a responsive dashboard styled to manage transactions, monitor spending distributions, and format all currency amounts in **Indian Rupees (₹)** according to the Indian numbering system.

---

## 🌟 Key Features

1. **Financial Overview Dashboard**:
   - Total Income, Total Expenses, and Net Balance KPI metric cards.
   - Dynamic Savings Rate percentage indicator and target tracking.
2. **Complete Transaction Management (CRUD)**:
   - Add, view, edit, and delete income and expense transactions.
   - Fields supported: `title`, `amount`, `type` (`income` or `expense`), `category`, `date`, and optional `description`.
3. **Interactive Spending-by-Category Chart**:
   - Built with **Recharts**.
   - Dual view modes: **Donut (Pie) Chart** and **Bar Chart**.
   - Custom hover tooltips displaying amounts in ₹ and percentage shares.
   - Visual category list with colored progress bars.
4. **Search and Advanced Filtering**:
   - Instant search across transaction title, category, and notes.
   - Quick filter tabs: `All`, `Income`, `Expenses`.
   - Category-specific dropdown filter.
   - One-click filter reset.
5. **Data Persistence**:
   - Real SQLite database managed by SQLAlchemy ORM (`spendwise.db`).
   - Automatically initializes tables and seeds realistic sample data on first run.
6. **Input Validation & Error Handling**:
   - Backend validation with Pydantic (strictly positive amounts, non-empty titles, valid ISO dates).
   - Frontend form feedback with inline errors and auto-dismissing toast notifications.
7. **Indian Rupee (₹) Currency Formatting**:
   - Standardized `en-IN` localized formatting (e.g., `₹85,000.00`, `₹4,650.00`).
8. **Responsive Dashboard UI**:
   - Clean, modern layout using plain CSS (custom CSS variables, card elevation, modals, and responsive grid).

---

## 🏗️ Project Architecture

```
SpendWise/
├── .gitignore               # Excludes venv, node_modules, .db files, and secrets
├── README.md                # Project documentation and setup guide
├── backend/
│   ├── venv/                # Python virtual environment (ignored in git)
│   ├── spendwise.db         # Local SQLite database (ignored in git)
│   ├── requirements.txt     # Python backend production dependencies
│   ├── requirements-dev.txt # Python testing & development dependencies
│   ├── __init__.py          # Python package marker
│   ├── database.py          # SQLAlchemy SQLite connection and session management
│   ├── models.py            # Transaction SQLAlchemy database model
│   ├── schemas.py           # Pydantic validation schemas
│   ├── crud.py              # Querying, filtering, and aggregation logic
│   ├── main.py              # FastAPI application, CORS, and API endpoints
│   └── test_api.py          # Integration and CRUD test suite
└── frontend/
    ├── package.json         # NPM dependencies & scripts
    ├── vite.config.js       # Vite configuration with API proxy
    ├── index.html           # Main HTML template with Google Fonts
    └── src/
        ├── main.jsx         # React application entrypoint
        ├── App.jsx          # Dashboard root component & state coordination
        ├── api.js           # Fetch API client communicating with FastAPI
        ├── index.css        # Plain CSS stylesheet
        ├── components/
        │   ├── Header.jsx           # App bar & Add Transaction CTA
        │   ├── SummaryCards.jsx     # Net Balance, Income, Expenses, Savings Rate
        │   ├── CategoryChart.jsx    # Recharts Donut & Bar spending breakdown
        │   ├── FilterBar.jsx        # Search, type tabs, and category dropdown
        │   ├── TransactionList.jsx  # Recent transactions table with Edit/Delete
        │   ├── TransactionModal.jsx # Add / Edit transaction dialog
        │   ├── DeleteModal.jsx      # Confirmation dialog for safe deletion
        │   └── Toast.jsx            # Toast alerts for success and error messages
        └── utils/
            └── formatters.js        # Indian Rupee (₹) and date formatters
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended; v24 installed)
- **Python** (v3.10+ recommended; v3.15 installed)

---

### Step 1: Run the Backend (FastAPI + SQLite)

**Option A: From the Project Root (`d:\SpendWise`)**

1. Open PowerShell in the project root:
   ```powershell
   cd d:\SpendWise
   ```

2. Activate the virtual environment:
   ```powershell
   .\backend\venv\Scripts\Activate.ps1
   ```

3. (Optional) Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   # For running the test suite:
   pip install -r backend/requirements-dev.txt
   ```

4. Start the FastAPI server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```

**Option B: From the `backend` Directory (`d:\SpendWise\backend`)**

1. Open PowerShell and navigate to `backend`:
   ```powershell
   cd d:\SpendWise\backend
   ```

2. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

The backend will be running at:
- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`
- Alternative ReDoc: `http://127.0.0.1:8000/redoc`

---

### Step 2: Run the Frontend (React + Vite)

1. Open a second terminal window:
   ```powershell
   cd d:\SpendWise\frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   *(Vite's built-in dev proxy automatically routes `/api` requests to `http://127.0.0.1:8000`)*

---

## 🧪 Running the Backend Tests

SpendWise comes with an automated API test suite verifying all endpoints, validations, and SQLite persistence.

To execute the tests:
```powershell
cd d:\SpendWise
.\backend\venv\Scripts\python.exe backend/test_api.py
```
*(Ensure `backend/requirements-dev.txt` is installed in the virtual environment)*

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and server status |
| `GET` | `/api/summary` | Net balance, total income, total expenses, category breakdown |
| `GET` | `/api/transactions` | List transactions with `search`, `type`, and `category` filters |
| `POST` | `/api/transactions` | Create a new transaction |
| `GET` | `/api/transactions/{id}` | Retrieve a transaction by ID |
| `PUT` | `/api/transactions/{id}` | Update an existing transaction |
| `DELETE` | `/api/transactions/{id}` | Delete a transaction by ID |
| `GET` | `/api/categories` | Retrieve standard and used categories |

---

## 💻 Tech Stack Summary

- **Frontend**: React 18, Vite, Plain CSS (CSS Variables, Flexbox, CSS Grid), Lucide React Icons
- **Visualization**: Recharts 2.x (Responsive Donut & Bar Charts)
- **Backend**: Python FastAPI, Uvicorn ASGI Server
- **Database**: SQLite3 via SQLAlchemy 2.x ORM
- **Validation**: Pydantic v2
