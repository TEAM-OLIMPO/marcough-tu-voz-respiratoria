"""
Schemas Pydantic para Autenticación y Usuarios
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    """Base de usuario"""
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True


class UserCreate(BaseModel):
    """Schema para crear usuario"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        """Validar fortaleza de contraseña"""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!",
                "full_name": "Juan Pérez"
            }
        }


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }


class UserResponse(BaseModel):
    """Respuesta con datos de usuario"""
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
        schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "Juan Pérez",
                "is_active": True,
                "created_at": "2025-12-07T12:00:00"
            }
        }


class UserUpdate(BaseModel):
    """Schema para actualizar usuario"""
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    
    @validator('password')
    def password_strength(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v


# ============================================================================
# TOKEN SCHEMAS
# ============================================================================

class Token(BaseModel):
    """Token de acceso"""
    access_token: str
    token_type: str = "bearer"
    
    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


class TokenData(BaseModel):
    """Datos contenidos en el token"""
    user_id: Optional[int] = None
    email: Optional[str] = None


class LoginResponse(BaseModel):
    """Respuesta de login exitoso"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    
    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": "user@example.com",
                    "full_name": "Juan Pérez",
                    "is_active": True,
                    "created_at": "2025-12-07T12:00:00"
                }
            }
        }