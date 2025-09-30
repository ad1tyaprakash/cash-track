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
            print(f"Firebase not available: {e}")
            return False
        
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
            print("⚠️  Firebase not available, transaction not saved")
            return transaction
            
        try:
            ref = self._get_ref('transactions')
            if ref:
                ref.child(transaction['id']).set(transaction)
                print(f"✅ Transaction {transaction['id']} saved to Firebase successfully")
                
                # Verify the save by reading it back
                saved_data = ref.child(transaction['id']).get()
                if saved_data:
                    print(f"✅ Verified: Transaction {transaction['id']} exists in Firebase")
                else:
                    print(f"❌ Error: Transaction {transaction['id']} not found after save")
            else:
                print("❌ Error: Could not get Firebase reference for transactions")
        except Exception as e:
            print(f"❌ Failed to save transaction to Firebase: {e}")
        
        return transaction
    
    def get_transactions(self) -> List[Dict[str, Any]]:
        """Get all transactions from Firebase."""
        if not self.firebase_available:
            print("⚠️  Firebase not available for get_transactions")
            return []
            
        try:
            ref = self._get_ref('transactions')
            if ref:
                transactions_data = ref.get()
                print(f"🔍 Raw Firebase data: {transactions_data}")
                if transactions_data and isinstance(transactions_data, dict):
                    transactions_list = list(transactions_data.values())
                    print(f"🔍 Parsed {len(transactions_list)} transactions from Firebase")
                    return transactions_list
                else:
                    print("🔍 No transaction data found in Firebase")
            else:
                print("❌ Could not get Firebase reference for transactions")
        except Exception as e:
            print(f"❌ Failed to get transactions from Firebase: {e}")
        
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