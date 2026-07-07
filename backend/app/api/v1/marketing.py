"""
ForgeMind AI — Marketing API
Handles public endpoints for marketing such as Contact form and Newsletter.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.marketing import ContactMessage, NewsletterSubscriber, Department

router = APIRouter()


class ContactMessageCreate(BaseModel):
    full_name: str = Field(..., max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    department: Department
    subject: str = Field(..., max_length=255)
    message: str = Field(..., min_length=10)


class NewsletterCreate(BaseModel):
    email: EmailStr


@router.post("/contact", status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """Submit a message from the marketing contact form."""
    new_message = ContactMessage(
        full_name=data.full_name,
        company=data.company,
        email=data.email,
        phone=data.phone,
        department=data.department,
        subject=data.subject,
        message=data.message,
    )
    db.add(new_message)
    await db.commit()
    return {"message": "Message sent successfully"}


@router.post("/newsletter", status_code=status.HTTP_201_CREATED)
async def subscribe_newsletter(
    data: NewsletterCreate,
    db: AsyncSession = Depends(get_db)
):
    """Subscribe an email to the newsletter."""
    # Check if already subscribed to avoid unique constraint error
    from sqlalchemy import select
    stmt = select(NewsletterSubscriber).where(NewsletterSubscriber.email == data.email)
    result = await db.execute(stmt)
    existing = result.scalars().first()
    
    if existing:
        if not existing.is_active:
            existing.is_active = True
            await db.commit()
            return {"message": "Subscription re-activated"}
        return {"message": "Already subscribed"}

    subscriber = NewsletterSubscriber(email=data.email)
    db.add(subscriber)
    await db.commit()
    return {"message": "Successfully subscribed to newsletter"}
