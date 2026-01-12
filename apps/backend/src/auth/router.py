from fastapi import APIRouter, HTTPException, status
from firebase_admin import auth

from src.auth.dependencies import CurrentUser, AdminUser
from src.auth.schemas import UserProfile, SetAdminRequest
from src.database import get_firestore_client

router = APIRouter()


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: CurrentUser):
    """Get the current user's profile."""
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user.uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado"
        )

    data = user_doc.to_dict()
    return UserProfile(
        uid=current_user.uid,
        email=data.get("email", ""),
        display_name=data.get("displayName", ""),
        photo_url=data.get("photoURL"),
        role=data.get("role", "player"),
        total_stars=data.get("totalStars", 0),
        tournaments_played=data.get("tournamentsPlayed", 0),
        current_streak=data.get("currentStreak", 0)
    )


@router.post("/set-admin")
async def set_user_admin_status(
    request: SetAdminRequest,
    admin_user: AdminUser
):
    """Set admin status for a user. Only admins can do this."""
    try:
        # Set custom claims
        auth.set_custom_user_claims(request.user_id, {
            "admin": request.is_admin
        })

        # Update user document
        db = get_firestore_client()
        user_ref = db.collection("users").document(request.user_id)
        user_ref.update({
            "role": "admin" if request.is_admin else "player"
        })

        return {
            "success": True,
            "message": f"Usuario {'ahora es admin' if request.is_admin else 'ya no es admin'}"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al actualizar permisos: {str(e)}"
        )


@router.get("/verify")
async def verify_token(current_user: CurrentUser):
    """Verify that the current token is valid."""
    return {
        "valid": True,
        "uid": current_user.uid,
        "email": current_user.email,
        "is_admin": current_user.is_admin
    }
