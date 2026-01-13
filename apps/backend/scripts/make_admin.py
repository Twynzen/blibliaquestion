"""
Script para hacer admin a un usuario en Biblia Question.

Uso:
    python make_admin.py correo@ejemplo.com
"""

import sys
import os

# Agregar el directorio padre al path para importar módulos
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import firebase_admin
from firebase_admin import credentials, firestore

def init_firebase():
    """Inicializa Firebase Admin SDK."""
    if firebase_admin._apps:
        return firestore.client()

    # Buscar el archivo de credenciales
    cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')

    if not os.path.exists(cred_path):
        print(f"Error: No se encontró el archivo de credenciales en: {cred_path}")
        print("Asegúrate de tener firebase-credentials.json en apps/backend/")
        sys.exit(1)

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

    return firestore.client()

def make_admin(email: str):
    """Hace admin a un usuario por su email."""
    db = init_firebase()

    # Buscar usuario por email
    users_ref = db.collection('users')
    query = users_ref.where('email', '==', email).limit(1)
    results = list(query.stream())

    if not results:
        print(f"Error: No se encontró usuario con email: {email}")
        print("\nUsuarios disponibles:")
        all_users = users_ref.stream()
        for user in all_users:
            data = user.to_dict()
            print(f"  - {data.get('email', 'N/A')} ({data.get('displayName', 'Sin nombre')}) - Role: {data.get('role', 'N/A')}")
        return False

    user_doc = results[0]
    user_data = user_doc.to_dict()

    print(f"\nUsuario encontrado:")
    print(f"  ID: {user_doc.id}")
    print(f"  Email: {user_data.get('email')}")
    print(f"  Nombre: {user_data.get('displayName')}")
    print(f"  Rol actual: {user_data.get('role')}")

    if user_data.get('role') == 'admin':
        print(f"\n¡{email} ya es admin!")
        return True

    # Actualizar rol a admin
    user_doc.reference.update({'role': 'admin'})

    print(f"\n¡Éxito! {email} ahora es ADMIN")
    print("\nEl usuario debe cerrar sesión y volver a entrar para ver los cambios.")

    return True

def list_users():
    """Lista todos los usuarios."""
    db = init_firebase()
    users_ref = db.collection('users')

    print("\nUsuarios registrados:")
    print("-" * 60)

    for user in users_ref.stream():
        data = user.to_dict()
        role_marker = "[ADMIN]" if data.get('role') == 'admin' else "[user]"
        print(f"{role_marker:8} {data.get('email', 'N/A'):35} | {data.get('displayName', 'Sin nombre'):20} | {data.get('role', 'player')}")

    print("-" * 60)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python make_admin.py <email>")
        print("      python make_admin.py --list  (para ver todos los usuarios)")
        sys.exit(1)

    if sys.argv[1] == '--list':
        list_users()
    else:
        email = sys.argv[1]
        make_admin(email)
