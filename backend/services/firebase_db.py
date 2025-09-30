"""Firebase Realtime Database service for Cash Track."""
import firebase_admin
from firebase_admin import credentials, db
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from services.firebase import initialize_app

class FirebaseDataStore:
    """Firebase Realtime Database data store for transactions and stocks."""
    
    def __init__(self):
        self.firebase_available = self._check_firebase_availability()
        
    def _check_firebase_availability(self) -> bool:
        """Check if Firebase is properly initialized."""
        try:
            app = initialize_app()
            return app is not None
        except Exception as e:
            return False
        
    def _get_ref(self, path: str):
        """Get Firebase database reference."""
        if not self.firebase_available:
            return None
        try:
            return db.reference(path)
        except Exception as e:
            return None
    
    # Transaction methods
    def save_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Save a transaction to Firebase."""
        if not self.firebase_available:
            return transaction
            
        try:
            ref = self._get_ref('transactions')
            if ref:
                ref.child(transaction['id']).set(transaction)
        except Exception as e:
            pass
        
        return transaction
    
    def get_transactions(self) -> List[Dict[str, Any]]:
        """Get all transactions from Firebase."""
        if not self.firebase_available:
            return []
            
        try:
            ref = self._get_ref('transactions')
            if ref:
                transactions_data = ref.get()
                if transactions_data:
                    if isinstance(transactions_data, dict):
                        return list(transactions_data.values())
                    elif isinstance(transactions_data, list):
                        # Filter out None values from array indices
                        return [t for t in transactions_data if t is not None]
        except Exception as e:
            pass
        
        return []
    
    def delete_transaction(self, transaction_id: str) -> bool:
        """Delete a transaction from Firebase."""
        if not self.firebase_available:
            return False
            
        try:
            ref = self._get_ref(f'transactions/{transaction_id}')
            if ref:
                ref.delete()
                return True
        except Exception as e:
            pass
        
        return False
    
    # Stock methods
    def save_stock(self, stock: Dict[str, Any]) -> Dict[str, Any]:
        """Save a stock position to Firebase."""
        if not self.firebase_available:
            return stock
            
        try:
            ref = self._get_ref('stocks')
            if ref:
                ref.child(stock['ticker']).set(stock)
        except Exception as e:
            pass
        
        return stock
    
    def get_stocks(self) -> List[Dict[str, Any]]:
        """Get all stocks from Firebase."""
        if not self.firebase_available:
            return []
            
        try:
            ref = self._get_ref('stocks')
            if ref:
                stocks_data = ref.get()
                if stocks_data and isinstance(stocks_data, dict):
                    return list(stocks_data.values())
        except Exception as e:
            pass
        
        return []
    
    def delete_stock(self, ticker: str) -> bool:
        """Delete a stock position from Firebase."""
        if not self.firebase_available:
            return False
            
        try:
            ref = self._get_ref(f'stocks/{ticker}')
            if ref:
                ref.delete()
                return True
        except Exception as e:
            pass
        
        return False

# Global instance using singleton pattern
_firebase_store_instance = None

def get_firebase_store() -> FirebaseDataStore:
    """Get the singleton Firebase store instance."""
    global _firebase_store_instance
    if _firebase_store_instance is None:
        _firebase_store_instance = FirebaseDataStore()
    return _firebase_store_instance

# For backward compatibility
firebase_store = get_firebase_store()