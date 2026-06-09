from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models.student import Student
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.config import settings
from app.dependencies import get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(user: Student) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    payload = {"sub": str(user.id), "role": user.role, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        existing = await db.execute(select(Student).where(Student.email == data.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")
        student = Student(
            id=uuid.uuid4(),
            name=data.name,
            email=data.email,
            password_hash=pwd_context.hash(data.password),
            role="student",
            created_at=datetime.utcnow(),
            is_active=True,
        )
        db.add(student)
        await db.flush()
        token = create_access_token(student)
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    email_normalized = data.email.strip().lower()
    alternative_email = None
    if email_normalized.endswith("@timplatform.com"):
        alternative_email = email_normalized.replace("@timplatform.com", "@jeeplatform.com")
    elif email_normalized.endswith("@jeeplatform.com"):
        alternative_email = email_normalized.replace("@jeeplatform.com", "@timplatform.com")

    result = await db.execute(
        select(Student).where(
            (Student.email == email_normalized) | 
            (Student.email == alternative_email)
        )
    )
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return TokenResponse(access_token=create_access_token(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Student = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: Student = Depends(get_current_user)):
    return TokenResponse(access_token=create_access_token(current_user))
