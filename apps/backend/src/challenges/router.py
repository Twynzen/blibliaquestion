from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.auth.dependencies import CurrentUser, ModeratorUser
from src.database import get_firestore_client

router = APIRouter()


class SubmissionResponse(BaseModel):
    id: str
    challenge_id: str
    user_id: str
    user_name: str
    video_url: str
    status: str
    stars_awarded: Optional[int] = None
    submitted_at: datetime


class ReviewRequest(BaseModel):
    submission_id: str
    challenge_id: str
    approved: bool
    comment: Optional[str] = None


@router.get("/pending", response_model=List[SubmissionResponse])
async def get_pending_submissions(moderator: ModeratorUser):
    """Get all pending video submissions. Moderator only."""
    db = get_firestore_client()

    # Query all submissions with status 'pending'
    # Note: This requires a collection group query
    submissions = []

    challenges_ref = db.collection("challenges")
    for challenge_doc in challenges_ref.stream():
        submissions_ref = challenge_doc.reference.collection("submissions")
        pending_docs = submissions_ref.where("status", "==", "pending").stream()

        for doc in pending_docs:
            data = doc.to_dict()
            submissions.append(SubmissionResponse(
                id=doc.id,
                challenge_id=challenge_doc.id,
                user_id=data.get("oderId", ""),
                user_name=data.get("oderName", "Usuario"),
                video_url=data.get("videoURL", ""),
                status=data.get("status", "pending"),
                stars_awarded=data.get("starsAwarded"),
                submitted_at=data.get("submittedAt").datetime if data.get("submittedAt") else datetime.now()
            ))

    return submissions


@router.post("/review")
async def review_submission(request: ReviewRequest, moderator: ModeratorUser):
    """Review a video submission. Moderator only."""
    from google.cloud.firestore import SERVER_TIMESTAMP

    db = get_firestore_client()

    submission_ref = db.collection("challenges").document(request.challenge_id).collection("submissions").document(request.submission_id)
    submission_doc = submission_ref.get()

    if not submission_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrega no encontrada"
        )

    submission_data = submission_doc.to_dict()
    user_id = submission_data.get("oderId")

    stars_awarded = 5 if request.approved else 0
    new_status = "approved" if request.approved else "rejected"

    # Update submission
    submission_ref.update({
        "status": new_status,
        "starsAwarded": stars_awarded,
        "reviewedBy": moderator.uid,
        "reviewedAt": SERVER_TIMESTAMP,
        "reviewComment": request.comment
    })

    # If approved, update user's stars
    if request.approved and user_id:
        # Find the tournament from the challenge
        challenge_doc = db.collection("challenges").document(request.challenge_id).get()
        if challenge_doc.exists:
            tournament_id = challenge_doc.to_dict().get("tournamentId")
            if tournament_id:
                participant_ref = db.collection("tournaments").document(tournament_id).collection("participants").document(user_id)
                participant_doc = participant_ref.get()

                if participant_doc.exists:
                    current_stars = participant_doc.to_dict().get("totalStars", 0)
                    participant_ref.update({"totalStars": current_stars + stars_awarded})

    return {
        "success": True,
        "status": new_status,
        "stars_awarded": stars_awarded
    }


@router.get("/user/{user_id}", response_model=List[SubmissionResponse])
async def get_user_submissions(user_id: str, current_user: CurrentUser):
    """Get all submissions for a user."""
    # Only allow users to see their own submissions or moderators to see any
    if current_user.uid != user_id and not (current_user.is_admin or current_user.is_moderator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver estas entregas"
        )

    db = get_firestore_client()
    submissions = []

    challenges_ref = db.collection("challenges")
    for challenge_doc in challenges_ref.stream():
        submissions_ref = challenge_doc.reference.collection("submissions")
        user_docs = submissions_ref.where("oderId", "==", user_id).stream()

        for doc in user_docs:
            data = doc.to_dict()
            submissions.append(SubmissionResponse(
                id=doc.id,
                challenge_id=challenge_doc.id,
                user_id=data.get("oderId", ""),
                user_name=data.get("oderName", "Usuario"),
                video_url=data.get("videoURL", ""),
                status=data.get("status", "pending"),
                stars_awarded=data.get("starsAwarded"),
                submitted_at=data.get("submittedAt").datetime if data.get("submittedAt") else datetime.now()
            ))

    return submissions
