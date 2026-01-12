from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from firebase_admin.auth import InvalidIdTokenError, ExpiredIdTokenError

from src.auth.schemas import FirebaseUser

bearer_scheme = HTTPBearer(auto_error=False)


async def get_firebase_user(
    token: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]
) -> FirebaseUser:
    """
    Verify Firebase ID token and return user information.

    Raises:
        HTTPException: If token is missing, expired, or invalid.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorizacion requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        decoded_token = auth.verify_id_token(token.credentials)

        return FirebaseUser(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            email_verified=decoded_token.get("email_verified", False),
            display_name=decoded_token.get("name"),
            is_admin=decoded_token.get("admin", False),
            is_moderator=decoded_token.get("moderator", False)
        )

    except ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado. Por favor, inicia sesion nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error de autenticacion: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_admin_user(
    user: Annotated[FirebaseUser, Depends(get_firebase_user)]
) -> FirebaseUser:
    """
    Verify that the user is an admin.

    Raises:
        HTTPException: If user is not an admin.
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador"
        )
    return user


async def get_moderator_user(
    user: Annotated[FirebaseUser, Depends(get_firebase_user)]
) -> FirebaseUser:
    """
    Verify that the user is a moderator or admin.

    Raises:
        HTTPException: If user is not a moderator or admin.
    """
    if not (user.is_admin or user.is_moderator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de moderador"
        )
    return user


# Type aliases for route dependencies
CurrentUser = Annotated[FirebaseUser, Depends(get_firebase_user)]
AdminUser = Annotated[FirebaseUser, Depends(get_admin_user)]
ModeratorUser = Annotated[FirebaseUser, Depends(get_moderator_user)]
