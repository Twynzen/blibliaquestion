import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from src.config import settings


_firebase_app = None
_firestore_client = None


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    if firebase_admin._apps:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app

    cred = None

    # Try to get credentials from base64 first
    cred_dict = settings.get_firebase_credentials()
    if cred_dict:
        cred = credentials.Certificate(cred_dict)
    elif settings.FIREBASE_CREDENTIALS_PATH:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    else:
        # Use application default credentials (for Google Cloud environments)
        cred = credentials.ApplicationDefault()

    _firebase_app = firebase_admin.initialize_app(cred, {
        'projectId': settings.FIREBASE_PROJECT_ID,
        'storageBucket': f"{settings.FIREBASE_PROJECT_ID}.appspot.com"
    })

    return _firebase_app


def get_firestore_client():
    """Get Firestore client instance."""
    global _firestore_client

    if _firestore_client is None:
        initialize_firebase()
        _firestore_client = firestore.client()

    return _firestore_client


def get_auth():
    """Get Firebase Auth instance."""
    initialize_firebase()
    return auth


def get_storage():
    """Get Firebase Storage bucket."""
    initialize_firebase()
    return storage.bucket()


# Dependency for FastAPI
def get_db():
    """FastAPI dependency for Firestore client."""
    return get_firestore_client()
