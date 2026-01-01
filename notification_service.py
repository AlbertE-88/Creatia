import logging
import os
from typing import Optional

import requests

logger = logging.getLogger(__name__)


def send_email_notification(
    to_email: Optional[str],
    subject: str,
    content: str,
    *,
    sender_email: Optional[str] = None,
    sender_name: Optional[str] = None,
) -> bool:
    """
    Send an email via SendGrid.

    Set SENDGRID_API_KEY and NOTIFY_EMAIL_FROM (or SENDGRID_FROM_EMAIL) in the environment.
    """
    api_key = os.environ.get("SENDGRID_API_KEY")
    from_email = sender_email or os.environ.get("NOTIFY_EMAIL_FROM") or os.environ.get("SENDGRID_FROM_EMAIL")
    if not api_key or not from_email or not to_email:
        logger.info("Email notification skipped (missing config or recipient). to=%s", to_email)
        return False

    payload = {
        "from": {"email": from_email},
        "personalizations": [{"to": [{"email": to_email}]}],
        "subject": subject,
        "content": [{"type": "text/plain", "value": content}],
    }
    if sender_name:
        payload["from"]["name"] = sender_name

    try:
        resp = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10,
        )
        if resp.status_code >= 400:
            logger.warning("Email notification failed (%s): %s", resp.status_code, resp.text)
            return False
        return True
    except Exception:
        logger.exception("Email notification error for %s", to_email)
        return False


def send_sms_notification(to_number: Optional[str], message: str, *, sender_number: Optional[str] = None) -> bool:
    """
    Send an SMS via Twilio.

    Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in the environment.
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number = sender_number or os.environ.get("TWILIO_FROM_NUMBER")

    if not account_sid or not auth_token or not from_number or not to_number:
        logger.info("SMS notification skipped (missing config or recipient). to=%s", to_number)
        return False

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    try:
        resp = requests.post(
            url,
            data={
                "From": from_number,
                "To": to_number,
                "Body": message,
            },
            auth=(account_sid, auth_token),
            timeout=10,
        )
        if resp.status_code >= 400:
            logger.warning("SMS notification failed (%s): %s", resp.status_code, resp.text)
            return False
        return True
    except Exception:
        logger.exception("SMS notification error for %s", to_number)
        return False


def notify_user_channels(
    user,
    subject: str,
    email_body: str,
    sms_body: Optional[str] = None,
    *,
    sender_name: Optional[str] = None,
) -> None:
    """Fan out a notification to both email and SMS for a user."""
    if not user:
        return
    send_email_notification(user.email, subject, email_body, sender_name=sender_name)
    sms_text = sms_body or subject
    send_sms_notification(getattr(user, "phone_number", None), sms_text)
