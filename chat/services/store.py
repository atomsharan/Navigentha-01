from core.models import ConversationSession, MessageLog
from django.utils import timezone

class Store:
    @staticmethod
    def get_or_create_session(session_id):
        """
        Returns a ConversationSession instance for a given session_id.
        Creates one if it doesn't exist.
        """
        session, created = ConversationSession.objects.get_or_create(
            id=session_id
        )
        return session, created

    @staticmethod
    def log_message(session_id, role, text, latency_ms=None):
        """
        Logs a message in the MessageLog linked to the session.
        """
        session, _ = Store.get_or_create_session(session_id)
        kwargs = {
            "session": session,
            "role": role,
            "text": text,
            "created_at": timezone.now()
        }
        if latency_ms is not None:
            kwargs["latency_ms"] = latency_ms

        MessageLog.objects.create(**kwargs)
