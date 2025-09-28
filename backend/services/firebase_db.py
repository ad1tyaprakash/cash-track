"""Firebase Realtime Database service for Cash Track."""
import firebase_admin
from firebase_admin import credentials, db
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    if not firebase_admin._apps:
        try:
            # Load service account key
            service_account_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-service-account.json')
            
            # Check if service account file exists and is properly configured
            if not os.path.exists(service_account_path):
                print("Firebase service account file not found")
                return False
                
            with open(service_account_path, 'r') as f:
                config = json.load(f)
                if config.get('project_id', '').startswith('TODO_'):
                    print("Firebase service account not configured (contains TODO placeholders)")
                    return False
            
            cred = credentials.Certificate(service_account_path)
            
            # Try to get database URL from environment or construct from project ID
            project_id = config.get('project_id')
            database_url = os.getenv('FIREBASE_DATABASE_URL', f'https://{project_id}-default-rtdb.firebaseio.com/')
            
            # Initialize the app with the service account key and database URL
            firebase_admin.initialize_app(cred, {
                'databaseURL': database_url
            })
            print(f"Firebase initialized successfully with database: {database_url}")
            return True
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")
            return False
    return True

class FirebaseDataStore:
    """Firebase Realtime Database data store for transactions and stocks."""
    
    def __init__(self):
        self.firebase_available = initialize_firebase()
        
    def _get_ref(self, path: str):
        """Get Firebase database reference."""
        if not self.firebase_available:
            return None
        try:
            return db.reference(path)
        except Exception as e:
            print(f"Firebase error accessing {path}: {e}")
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
                print(f"Transaction {transaction['id']} saved to Firebase")
        except Exception as e:
            print(f"Failed to save transaction to Firebase: {e}")
        
        return transaction
    
    def get_transactions(self) -> List[Dict[str, Any]]:
        """Get all transactions from Firebase."""
        if not self.firebase_available:
            return []
            
        try:
            ref = self._get_ref('transactions')
            if ref:
                transactions_data = ref.get()
                if transactions_data and isinstance(transactions_data, dict):
                    return list(transactions_data.values())
        except Exception as e:
            print(f"Failed to get transactions from Firebase: {e}")
        
        return []
    
    def delete_transaction(self, transaction_id: str) -> bool:
        """Delete a transaction from Firebase."""
        if not self.firebase_available:
            return False
            
        try:
            ref = self._get_ref(f'transactions/{transaction_id}')
            if ref:
                ref.delete()
                print(f"Transaction {transaction_id} deleted from Firebase")
                return True
        except Exception as e:
            print(f"Failed to delete transaction from Firebase: {e}")
        
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
                print(f"Stock {stock['ticker']} saved to Firebase")
        except Exception as e:
            print(f"Failed to save stock to Firebase: {e}")
        
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
            print(f"Failed to get stocks from Firebase: {e}")
        
        return []
    
    def delete_stock(self, ticker: str) -> bool:
        """Delete a stock position from Firebase."""
        if not self.firebase_available:
            return False
            
        try:
            ref = self._get_ref(f'stocks/{ticker}')
            if ref:
                ref.delete()
                print(f"Stock {ticker} deleted from Firebase")
                return True
        except Exception as e:
            print(f"Failed to delete stock from Firebase: {e}")
        
        return False

# Global instance
firebase_store = FirebaseDataStore()