import sys
import os

# Ensure backend and root paths are available
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")))

from fastapi.testclient import TestClient

try:
    from backend.main import app
except ImportError:
    from main import app


def test_api():
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("✓ Health check passed:", res.json())

        # 2. Get summary
        res = client.get("/api/summary")
        assert res.status_code == 200, f"Summary failed: {res.text}"
        summary = res.json()
        print("✓ Summary loaded:", summary)
        assert summary["total_income"] > 0
        assert summary["total_expenses"] > 0
        assert "category_breakdown" in summary

        # 3. List transactions
        res = client.get("/api/transactions")
        assert res.status_code == 200
        txs = res.json()
        print(f"✓ Found {len(txs)} transactions")

        # 4. Search and filter
        res = client.get("/api/transactions?type=expense")
        assert res.status_code == 200
        assert all(t["type"] == "expense" for t in res.json())
        print(f"✓ Filter by expense passed: {len(res.json())} items")

        res = client.get("/api/transactions?search=groceries")
        assert res.status_code == 200
        assert len(res.json()) >= 1
        print("✓ Search passed")

        # 5. Create transaction
        new_tx = {
            "title": "Special Books & Notebooks",
            "amount": 450.00,
            "type": "expense",
            "category": "Education",
            "date": "2026-10-13",
            "description": "Stationery supplies"
        }
        res = client.post("/api/transactions", json=new_tx)
        assert res.status_code == 201, f"Create failed: {res.text}"
        created = res.json()
        created_id = created["id"]
        print("✓ Created transaction ID:", created_id)

        # 6. Update transaction
        update_tx = {
            "title": "Books and Tech Supplies",
            "amount": 550.00
        }
        res = client.put(f"/api/transactions/{created_id}", json=update_tx)
        assert res.status_code == 200, f"Update failed: {res.text}"
        updated = res.json()
        assert updated["title"] == "Books and Tech Supplies"
        assert updated["amount"] == 550.00
        print("✓ Updated transaction:", updated["title"])

        # 7. Delete transaction
        res = client.delete(f"/api/transactions/{created_id}")
        assert res.status_code == 200, f"Delete failed: {res.text}"
        print("✓ Deleted transaction ID:", created_id)

        # 8. Verify deleted
        res = client.get(f"/api/transactions/{created_id}")
        assert res.status_code == 404
        print("✓ Verified 404 for deleted transaction")

        # 9. Test validation failure on creation (negative amount)
        res = client.post("/api/transactions", json={
            "title": "Invalid Amount Item",
            "amount": -100,
            "type": "expense",
            "category": "Food & Dining",
            "date": "2026-10-10"
        })
        assert res.status_code == 422, "Negative amount on create should fail with 422"
        print("✓ Validation failed as expected for negative amount on create")

        # 10. Test validation failure on update with explicitly null required fields
        # Create a temporary item to update
        res = client.post("/api/transactions", json={
            "title": "Temporary Item for Update Test",
            "amount": 100.0,
            "type": "expense",
            "category": "Other",
            "date": "2026-10-13"
        })
        assert res.status_code == 201
        temp_id = res.json()["id"]

        for invalid_patch in [
            {"title": None},
            {"amount": None},
            {"type": None},
            {"category": None},
            {"date": None},
            {"amount": -50.0},
            {"type": "invalid_type"},
            {"date": "not-a-date"},
        ]:
            res = client.put(f"/api/transactions/{temp_id}", json=invalid_patch)
            assert res.status_code == 422, f"Expected 422 for invalid patch {invalid_patch}, got {res.status_code}"
        print("✓ Validation failed as expected for null/invalid values in update")

        # Clean up temporary item
        client.delete(f"/api/transactions/{temp_id}")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! 🎉")


if __name__ == "__main__":
    test_api()
