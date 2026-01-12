from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime

from src.auth.dependencies import CurrentUser, AdminUser
from src.database import get_firestore_client

router = APIRouter()


class TournamentResponse(BaseModel):
    id: str
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    total_weeks: int
    status: str
    participant_count: int
    late_registration_allowed: bool
    catch_up_percentage: int


class CreateTournamentRequest(BaseModel):
    name: str
    description: str
    start_date: datetime
    total_weeks: int = 15
    late_registration_allowed: bool = True
    catch_up_percentage: int = 70


@router.get("/", response_model=List[TournamentResponse])
async def list_tournaments(current_user: CurrentUser):
    """List all tournaments."""
    db = get_firestore_client()
    tournaments_ref = db.collection("tournaments")
    docs = tournaments_ref.order_by("startDate", direction="DESCENDING").stream()

    tournaments = []
    for doc in docs:
        data = doc.to_dict()
        tournaments.append(TournamentResponse(
            id=doc.id,
            name=data.get("name", ""),
            description=data.get("description", ""),
            start_date=data.get("startDate").datetime if data.get("startDate") else datetime.now(),
            end_date=data.get("endDate").datetime if data.get("endDate") else datetime.now(),
            total_weeks=data.get("totalWeeks", 15),
            status=data.get("status", "upcoming"),
            participant_count=data.get("participantCount", 0),
            late_registration_allowed=data.get("lateRegistrationAllowed", True),
            catch_up_percentage=data.get("catchUpPercentage", 70)
        ))

    return tournaments


@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(tournament_id: str, current_user: CurrentUser):
    """Get a specific tournament."""
    db = get_firestore_client()
    doc = db.collection("tournaments").document(tournament_id).get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado"
        )

    data = doc.to_dict()
    return TournamentResponse(
        id=doc.id,
        name=data.get("name", ""),
        description=data.get("description", ""),
        start_date=data.get("startDate").datetime if data.get("startDate") else datetime.now(),
        end_date=data.get("endDate").datetime if data.get("endDate") else datetime.now(),
        total_weeks=data.get("totalWeeks", 15),
        status=data.get("status", "upcoming"),
        participant_count=data.get("participantCount", 0),
        late_registration_allowed=data.get("lateRegistrationAllowed", True),
        catch_up_percentage=data.get("catchUpPercentage", 70)
    )


@router.post("/", response_model=TournamentResponse)
async def create_tournament(
    request: CreateTournamentRequest,
    admin_user: AdminUser
):
    """Create a new tournament. Admin only."""
    from datetime import timedelta
    from google.cloud.firestore import SERVER_TIMESTAMP

    db = get_firestore_client()

    end_date = request.start_date + timedelta(weeks=request.total_weeks)

    tournament_data = {
        "name": request.name,
        "description": request.description,
        "startDate": request.start_date,
        "endDate": end_date,
        "totalWeeks": request.total_weeks,
        "status": "upcoming",
        "participantCount": 0,
        "lateRegistrationAllowed": request.late_registration_allowed,
        "catchUpPercentage": request.catch_up_percentage,
        "createdBy": admin_user.uid,
        "createdAt": SERVER_TIMESTAMP,
        "updatedAt": SERVER_TIMESTAMP
    }

    doc_ref = db.collection("tournaments").add(tournament_data)

    return TournamentResponse(
        id=doc_ref[1].id,
        name=request.name,
        description=request.description,
        start_date=request.start_date,
        end_date=end_date,
        total_weeks=request.total_weeks,
        status="upcoming",
        participant_count=0,
        late_registration_allowed=request.late_registration_allowed,
        catch_up_percentage=request.catch_up_percentage
    )


@router.post("/{tournament_id}/join")
async def join_tournament(tournament_id: str, current_user: CurrentUser):
    """Join a tournament as a participant."""
    from google.cloud.firestore import SERVER_TIMESTAMP

    db = get_firestore_client()

    # Check if tournament exists
    tournament_doc = db.collection("tournaments").document(tournament_id).get()
    if not tournament_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado"
        )

    tournament_data = tournament_doc.to_dict()

    # Check if can join
    if tournament_data.get("status") == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este torneo ya ha finalizado"
        )

    # Check if already a participant
    participant_ref = db.collection("tournaments").document(tournament_id).collection("participants").document(current_user.uid)
    if participant_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya estas inscrito en este torneo"
        )

    # Add participant
    participant_data = {
        "oderId": current_user.uid,
        "displayName": current_user.display_name or current_user.email.split("@")[0],
        "joinedAt": SERVER_TIMESTAMP,
        "totalStars": 0,
        "weeklyStars": {},
        "rank": 0,
        "isCatchUp": tournament_data.get("status") == "active",
        "catchUpStars": 0
    }

    participant_ref.set(participant_data)

    # Update participant count
    tournament_doc.reference.update({
        "participantCount": tournament_data.get("participantCount", 0) + 1
    })

    return {"success": True, "message": "Te has inscrito exitosamente"}
