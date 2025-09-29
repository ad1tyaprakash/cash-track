"""Simple file-based storage for development when Firebase isn't available."""
import json
import os
from typing import Dict, List, Any
from datetime import datetime

DATA_FILE = "dev_data.json"

def load_data():
    """Load data from file or return empty structure."""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {"transactions": [], "stocks": []}

def save_data(data):
    """Save data to file."""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except:
        return False

class FileDataStore:
    """File-based data store for development."""
    
    def __init__(self):
        self.data = load_data()
    
    def save_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Save a transaction to file."""
        # Remove existing transaction with same ID
        self.data["transactions"] = [t for t in self.data["transactions"] if t.get("id") != transaction.get("id")]
        # Add new transaction
        self.data["transactions"].append(transaction)
        save_data(self.data)
        return transaction
    
    def get_transactions(self) -> List[Dict[str, Any]]:
        """Get all transactions from file."""
        self.data = load_data()  # Reload to get latest data
        return self.data.get("transactions", [])
    
    def delete_transaction(self, transaction_id: str) -> bool:
        """Delete a transaction from file."""
        original_count = len(self.data["transactions"])
        self.data["transactions"] = [t for t in self.data["transactions"] if t.get("id") != transaction_id]
        success = len(self.data["transactions"]) < original_count
        if success:
            save_data(self.data)
        return success
    
    def save_stock(self, stock: Dict[str, Any]) -> Dict[str, Any]:
        """Save a stock position to file."""
        # Remove existing stock with same ticker
        self.data["stocks"] = [s for s in self.data["stocks"] if s.get("ticker") != stock.get("ticker")]
        # Add new stock
        self.data["stocks"].append(stock)
        save_data(self.data)
        return stock
    
    def get_stocks(self) -> List[Dict[str, Any]]:
        """Get all stocks from file."""
        self.data = load_data()  # Reload to get latest data
        return self.data.get("stocks", [])
    
    def delete_stock(self, ticker: str) -> bool:
        """Delete a stock position from file."""
        original_count = len(self.data["stocks"])
        self.data["stocks"] = [s for s in self.data["stocks"] if s.get("ticker") != ticker]
        success = len(self.data["stocks"]) < original_count
        if success:
            save_data(self.data)
        return success

# Global instance
file_store = FileDataStore()