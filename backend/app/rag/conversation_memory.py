"""
NEXO — RAG Conversation Memory
"""
from typing import List
from app.chat.models import Message, Role


class ConversationMemory:
    """
    Manages and formats conversation history for context inclusion.
    """
    
    def format_history(self, messages: List[Message], max_messages: int = 10) -> List[Message]:
        """
        Retrieves the last N messages to inject as chat history context.
        """
        if not messages:
            return []
            
        # Filter out system messages if any, keep only user/assistant
        history = [m for m in messages if m.role in (Role.USER, Role.ASSISTANT)]
        
        # Return the most recent N messages
        return history[-max_messages:]
