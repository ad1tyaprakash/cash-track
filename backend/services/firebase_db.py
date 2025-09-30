"""Firebase Realtime Database service for Cash Track with user isolation."""
import firebase_admin
from firebase_admin import credentials, db
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from services.firebase import initialize_app

class FirebaseDataStore:
    """Firebase Realtime Database data store for transactions and stocks with user isolation."""
    
    def __init__(self):
        self.firebase_available = self._check_firebase_availability()
        
    def _check_firebase_availability(self) -> bool:
        """Check if Firebase is properly initialized."""
        try:
            app = initialize_app()
            return app is not None
        except Exception as e:
            return False
        
    def _get_user_ref(self, user_id: str, path: str):
        """Get Firebase database reference for a specific user's data."""
        if not self.firebase_available or not user_id:
            return None
        try:
            # User-specific path: users/{user_id}/{data_type}
            user_path = f"users/{user_id}/{path}"
            return db.reference(user_path)
        except Exception as e:
            return None
    
    # Transaction methods
    def save_transaction(self, user_id: str, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Save a transaction to Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return transaction
            
        try:
            ref = self._get_user_ref(user_id, 'transactions')
            if ref:
                ref.child(transaction['id']).set(transaction)
        except Exception as e:
            pass
        
        return transaction
    
    def get_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all transactions from Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return []
            
        try:
            ref = self._get_user_ref(user_id, 'transactions')
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
    
    def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
        """Delete a transaction from Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return False
            
        try:
            ref = self._get_user_ref(user_id, f'transactions/{transaction_id}')
            if ref:
                ref.delete()
                return True
        except Exception as e:
            pass
        
        return False
    
    # Stock methods
    def save_stock(self, user_id: str, stock: Dict[str, Any]) -> Dict[str, Any]:
        """Save a stock position to Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return stock
            
        try:
            ref = self._get_user_ref(user_id, 'stocks')
            if ref:
                ref.child(stock['ticker']).set(stock)
        except Exception as e:
            pass
        
        return stock
    
    def get_stocks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all stocks from Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return []
            
        try:
            ref = self._get_user_ref(user_id, 'stocks')
            if ref:
                stocks_data = ref.get()
                if stocks_data and isinstance(stocks_data, dict):
                    return list(stocks_data.values())
        except Exception as e:
            pass
        
        return []
    
    def delete_stock(self, user_id: str, ticker: str) -> bool:
        """Delete a stock position from Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return False
            
        try:
            ref = self._get_user_ref(user_id, f'stocks/{ticker}')
            if ref:
                ref.delete()
                return True
        except Exception as e:
            pass
        
        return False
    
    # Investment methods
    def save_investment(self, user_id: str, investment: Dict[str, Any]) -> Dict[str, Any]:
        """Save an investment to Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return investment
            
        try:
            ref = self._get_user_ref(user_id, 'investments')
            if ref:
                ref.child(investment['id']).set(investment)
        except Exception as e:
            pass
        
        return investment
    
    def get_investments(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all investments from Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return []
            
        try:
            ref = self._get_user_ref(user_id, 'investments')
            if ref:
                investments_data = ref.get()
                if investments_data and isinstance(investments_data, dict):
                    return list(investments_data.values())
        except Exception as e:
            pass
        
        return []
    
    def delete_investment(self, user_id: str, investment_id: str) -> bool:
        """Delete an investment from Firebase for a specific user."""
        if not self.firebase_available or not user_id:
            return False
            
        try:
            ref = self._get_user_ref(user_id, f'investments/{investment_id}')
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