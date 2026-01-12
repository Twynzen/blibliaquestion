from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.auth.dependencies import CurrentUser, AdminUser
from src.database import get_firestore_client

router = APIRouter()


class QuestionOption(BaseModel):
    id: str
    text: str


class QuestionResponse(BaseModel):
    id: str
    tournament_id: str
    week_number: int
    day_number: int
    question_number: int
    question_text: str
    bible_reference: str
    bible_verse_text: str
    options: List[QuestionOption]
    stars: int
    is_extra_question: bool
    youtube_short_id: Optional[str] = None


class AnswerRequest(BaseModel):
    question_id: str
    selected_answer: str


class AnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    stars_earned: int


@router.get("/daily/{tournament_id}", response_model=List[QuestionResponse])
async def get_daily_questions(tournament_id: str, current_user: CurrentUser):
    """Get today's questions for a tournament."""
    from datetime import date

    db = get_firestore_client()

    today = datetime.combine(date.today(), datetime.min.time())
    tomorrow = datetime.combine(date.today(), datetime.max.time())

    questions_ref = db.collection("questions")
    query = questions_ref.where("tournamentId", "==", tournament_id).where(
        "releaseDate", ">=", today
    ).where("releaseDate", "<=", tomorrow).order_by("releaseDate").order_by("questionNumber")

    docs = query.stream()

    questions = []
    for doc in docs:
        data = doc.to_dict()
        questions.append(QuestionResponse(
            id=doc.id,
            tournament_id=data.get("tournamentId", ""),
            week_number=data.get("weekNumber", 1),
            day_number=data.get("dayNumber", 1),
            question_number=data.get("questionNumber", 1),
            question_text=data.get("questionText", ""),
            bible_reference=data.get("bibleReference", ""),
            bible_verse_text=data.get("bibleVerseText", ""),
            options=[QuestionOption(**opt) for opt in data.get("options", [])],
            stars=data.get("stars", 1),
            is_extra_question=data.get("isExtraQuestion", False),
            youtube_short_id=data.get("youtubeShortId")
        ))

    return questions


@router.post("/answer", response_model=AnswerResponse)
async def submit_answer(request: AnswerRequest, current_user: CurrentUser):
    """Submit an answer for a question."""
    from google.cloud.firestore import SERVER_TIMESTAMP

    db = get_firestore_client()

    # Get the question
    question_doc = db.collection("questions").document(request.question_id).get()
    if not question_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pregunta no encontrada"
        )

    question_data = question_doc.to_dict()
    correct_answer = question_data.get("correctAnswer", "")
    stars = question_data.get("stars", 1)

    # Check if already answered
    answer_id = f"{current_user.uid}_{request.question_id}"
    existing_answer = db.collection("answers").document(answer_id).get()
    if existing_answer.exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya respondiste esta pregunta"
        )

    is_correct = request.selected_answer.upper() == correct_answer.upper()
    stars_earned = stars if is_correct else 0

    # Save the answer
    answer_data = {
        "oderId": current_user.uid,
        "questionId": request.question_id,
        "tournamentId": question_data.get("tournamentId"),
        "selectedAnswer": request.selected_answer.upper(),
        "isCorrect": is_correct,
        "starsEarned": stars_earned,
        "answeredAt": SERVER_TIMESTAMP
    }

    db.collection("answers").document(answer_id).set(answer_data)

    # Update user's total stars if correct
    if is_correct:
        tournament_id = question_data.get("tournamentId")
        participant_ref = db.collection("tournaments").document(tournament_id).collection("participants").document(current_user.uid)
        participant_doc = participant_ref.get()

        if participant_doc.exists:
            current_stars = participant_doc.to_dict().get("totalStars", 0)
            participant_ref.update({"totalStars": current_stars + stars_earned})

    return AnswerResponse(
        is_correct=is_correct,
        correct_answer=correct_answer,
        stars_earned=stars_earned
    )
