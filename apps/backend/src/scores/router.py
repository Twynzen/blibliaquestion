from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel

from src.auth.dependencies import CurrentUser
from src.database import get_firestore_client

router = APIRouter()


class RankEntry(BaseModel):
    rank: int
    user_id: str
    display_name: str
    total_stars: int


class LeaderboardResponse(BaseModel):
    tournament_id: str
    rankings: List[RankEntry]
    user_rank: int | None = None
    user_stars: int | None = None
    total_participants: int


@router.get("/leaderboard/{tournament_id}", response_model=LeaderboardResponse)
async def get_leaderboard(tournament_id: str, current_user: CurrentUser, limit: int = 100):
    """Get the leaderboard for a tournament."""
    db = get_firestore_client()

    # Check if tournament exists
    tournament_doc = db.collection("tournaments").document(tournament_id).get()
    if not tournament_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado"
        )

    # Get participants ordered by stars
    participants_ref = db.collection("tournaments").document(tournament_id).collection("participants")
    query = participants_ref.order_by("totalStars", direction="DESCENDING").limit(limit)

    docs = list(query.stream())

    rankings = []
    user_rank = None
    user_stars = None
    rank = 1

    for doc in docs:
        data = doc.to_dict()
        rankings.append(RankEntry(
            rank=rank,
            user_id=doc.id,
            display_name=data.get("displayName", "Usuario"),
            total_stars=data.get("totalStars", 0)
        ))

        if doc.id == current_user.uid:
            user_rank = rank
            user_stars = data.get("totalStars", 0)

        rank += 1

    # If user not in top rankings, find their rank
    if user_rank is None:
        user_doc = participants_ref.document(current_user.uid).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_stars = user_data.get("totalStars", 0)

            # Count how many have more stars
            higher_count = participants_ref.where("totalStars", ">", user_stars).count().get()
            user_rank = higher_count[0][0].value + 1 if higher_count else None

    # Get total participant count
    total_count = participants_ref.count().get()
    total_participants = total_count[0][0].value if total_count else 0

    return LeaderboardResponse(
        tournament_id=tournament_id,
        rankings=rankings,
        user_rank=user_rank,
        user_stars=user_stars,
        total_participants=total_participants
    )


@router.get("/user-stats/{tournament_id}")
async def get_user_stats(tournament_id: str, current_user: CurrentUser):
    """Get the current user's stats for a tournament."""
    db = get_firestore_client()

    participant_ref = db.collection("tournaments").document(tournament_id).collection("participants").document(current_user.uid)
    participant_doc = participant_ref.get()

    if not participant_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No estas inscrito en este torneo"
        )

    data = participant_doc.to_dict()

    # Count answers for this tournament
    answers_ref = db.collection("answers")
    total_answers = answers_ref.where("oderId", "==", current_user.uid).where("tournamentId", "==", tournament_id).count().get()
    correct_answers = answers_ref.where("oderId", "==", current_user.uid).where("tournamentId", "==", tournament_id).where("isCorrect", "==", True).count().get()

    return {
        "user_id": current_user.uid,
        "display_name": data.get("displayName", ""),
        "total_stars": data.get("totalStars", 0),
        "weekly_stars": data.get("weeklyStars", {}),
        "joined_at": data.get("joinedAt"),
        "is_catch_up": data.get("isCatchUp", False),
        "catch_up_stars": data.get("catchUpStars", 0),
        "total_answers": total_answers[0][0].value if total_answers else 0,
        "correct_answers": correct_answers[0][0].value if correct_answers else 0
    }
