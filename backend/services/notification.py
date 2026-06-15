import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Notification")

# In-memory history for notifications so frontend can display them in an activity feed
notification_logs = []

async def send_notification(user_email: str, username: str, title: str, message: str, channels: list = None):
    if channels is None:
        channels = ["email", "sms", "line"]
        
    timestamp = datetime.utcnow().isoformat()
    log_entry = {
        "timestamp": timestamp,
        "email": user_email,
        "username": username,
        "title": title,
        "message": message,
        "channels": {}
    }
    
    # Simulate sending email
    if "email" in channels:
        email_msg = f"[EMAIL] Sending to {user_email}: {title} - {message}"
        logger.info(email_msg)
        log_entry["channels"]["email"] = {
            "status": "sent",
            "details": f"Sent via SMTP mockup to {user_email}"
        }

    # Simulate sending SMS
    if "sms" in channels:
        sms_msg = f"[SMS] Sending text: Travel Alert! {title}: {message}"
        logger.info(sms_msg)
        log_entry["channels"]["sms"] = {
            "status": "sent",
            "details": "Sent via Twilio mockup"
        }

    # Simulate sending Line
    if "line" in channels:
        line_msg = f"[LINE Notify] Sending notification: {title} \n {message}"
        logger.info(line_msg)
        log_entry["channels"]["line"] = {
            "status": "sent",
            "details": "Sent via LINE Messaging API mockup"
        }
        
    notification_logs.insert(0, log_entry) # Put newest first
    # Keep log length reasonable
    if len(notification_logs) > 50:
        notification_logs.pop()
        
    return log_entry

def get_notification_logs():
    return notification_logs
