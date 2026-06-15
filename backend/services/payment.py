import logging
import random
import asyncio
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Payment")

payment_logs = []

async def process_payment(booking_id: int, amount: float, card_number: str, card_holder: str, cvc: str, provider: str = "Stripe"):
    logger.info(f"Initiating payment via {provider} for booking #{booking_id} with amount {amount} THB...")
    
    # Simulate API network delay
    await asyncio.sleep(1.0)
    
    # Simple mockup validation
    if len(card_number.replace(" ", "")) < 12:
        error_msg = "Declined: Invalid Card Number"
        logger.error(error_msg)
        return {
            "success": False,
            "error": error_msg,
            "provider": provider,
            "transaction_id": None
        }
        
    # Standard charge simulation (95% success rate unless card ending in 9999)
    if card_number.endswith("9999"):
        error_msg = "Declined: Insufficient Funds"
        logger.error(error_msg)
        return {
            "success": False,
            "error": error_msg,
            "provider": provider,
            "transaction_id": None
        }
        
    tx_id = f"tx_{provider.lower()}_{random.randint(100000, 999999)}"
    logger.info(f"Payment successful. Tx ID: {tx_id}")
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "booking_id": booking_id,
        "amount": amount,
        "provider": provider,
        "transaction_id": tx_id,
        "status": "success",
        "card_holder": card_holder
    }
    payment_logs.insert(0, log_entry)
    
    return {
        "success": True,
        "error": None,
        "provider": provider,
        "transaction_id": tx_id
    }
