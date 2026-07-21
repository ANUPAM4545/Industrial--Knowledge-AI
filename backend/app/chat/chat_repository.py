"""
NEXO — Chat Repository
"""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.chat.models import Conversation, Message


class ChatRepository:
    """
    Repository for Conversation and Message models.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_conversation(self, conversation_id: str, user_id: str, workspace_id: str) -> Optional[Conversation]:
        """Fetch a conversation and its messages."""
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
                Conversation.workspace_id == workspace_id,
                Conversation.deleted_at.is_(None)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
        
    async def get_user_conversations(self, user_id: str, workspace_id: str, limit: int = 50) -> List[Conversation]:
        """Fetch all conversations for a user in a workspace."""
        stmt = (
            select(Conversation)
            .where(
                Conversation.user_id == user_id,
                Conversation.workspace_id == workspace_id,
                Conversation.deleted_at.is_(None)
            )
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_conversation(self, title: str, user_id: str, workspace_id: str) -> Conversation:
        """Create a new conversation."""
        conv = Conversation(title=title, user_id=user_id, workspace_id=workspace_id)
        self.session.add(conv)
        await self.session.commit()
        await self.session.refresh(conv)
        return await self.get_conversation(conv.id, user_id, workspace_id)

    async def delete_conversation(self, conversation_id: str, user_id: str, workspace_id: str, deleted_by: str) -> bool:
        """Soft delete a conversation if owned by the user."""
        from datetime import datetime, timezone
        conv = await self.get_conversation(conversation_id, user_id, workspace_id)
        if conv:
            conv.deleted_at = datetime.now(timezone.utc)
            conv.deleted_by = deleted_by
            self.session.add(conv)
            await self.session.commit()
            return True
        return False

    async def add_message(
        self, 
        conversation_id: str, 
        role: str, 
        content: str, 
        workspace_id: str,
        context_json: Optional[dict] = None,
        tokens_used: Optional[int] = None
    ) -> Message:
        """Add a message to a conversation."""
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            context_json=context_json,
            tokens_used=tokens_used,
            workspace_id=workspace_id
        )
        self.session.add(msg)
        await self.session.commit()
        await self.session.refresh(msg)
        return msg
