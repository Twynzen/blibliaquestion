from pydantic import BaseModel, EmailStr
from typing import Optional


class FirebaseUser(BaseModel):
    """Represents a verified Firebase user."""
    uid: str
    email: Optional[str] = None
    email_verified: bool = False
    display_name: Optional[str] = None
    is_admin: bool = False
    is_moderator: bool = False


class UserProfile(BaseModel):
    """User profile data."""
    uid: str
    email: str
    display_name: str
    photo_url: Optional[str] = None
    role: str = "player"
    total_stars: int = 0
    tournaments_played: int = 0
    current_streak: int = 0


class UserProfileUpdate(BaseModel):
    """User profile update data."""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None


class SetAdminRequest(BaseModel):
    """Request to set admin status for a user."""
    user_id: str
    is_admin: bool
