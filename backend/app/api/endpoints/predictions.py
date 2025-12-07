"""
Endpoints para Predicciones COVID-19
Análisis de audio de tos para detectar COVID
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import logging
import os

from app.schemas.prediction import (
    PredictionResponse,
    PredictionDetail,
    PredictionList,
    PredictionStats,
    PredictionCreate
)
from app.services.prediction_service import PredictionService
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=PredictionResponse)
async def analyze_cough(
    file: UploadFile = File(..., description="Archivo de audio de tos"),
    patient_name: Optional[str] = Form(None),
    patient_age: Optional[int] = Form(None),
    patient_gender: Optional[str] = Form(None),
    symptoms: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analizar audio de tos para detectar COVID-19
    
    **Parámetros:**
    - **file**: Archivo de audio (MP3, WAV, FLAC, OGG, M4A)
    - **patient_name**: Nombre del paciente (opcional)
    - **patient_age**: Edad del paciente (opcional)
    - **patient_gender**: Género (opcional)
    - **symptoms**: Síntomas reportados (opcional)
    - **notes**: Notas adicionales (opcional)
    
    **Retorna:**
    - Predicción (positive/negative)
    - Confianza (0-1)
    - Probabilidades por clase
    - Nivel de riesgo (ALTO/MEDIO/BAJO/NEGATIVO)
    
    **Requiere autenticación:** Bearer token
    """
    try:
        # Validar archivo
        _validate_audio_file(file)
        
        # Crear servicio
        prediction_service = PredictionService(db)
        
        # Analizar audio
        logger.info(f"Usuario {current_user.email} analizando: {file.filename}")
        
        result = await prediction_service.analyze_audio(
            audio_file=file,
            user_id=current_user.id,
            patient_name=patient_name,
            patient_age=patient_age,
            patient_gender=patient_gender,
            symptoms=symptoms,
            notes=notes
        )
        
        logger.info(f"Análisis completado: {result.prediction} ({result.confidence:.2f})")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en análisis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al analizar audio: {str(e)}"
        )


@router.get("/history", response_model=PredictionList)
async def get_prediction_history(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener historial de predicciones del usuario actual
    
    **Parámetros:**
    - **skip**: Número de registros a saltar (paginación)
    - **limit**: Número máximo de registros a retornar
    
    **Requiere autenticación:** Bearer token
    """
    try:
        prediction_service = PredictionService(db)
        predictions = prediction_service.get_user_predictions(
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
        
        return PredictionList(
            total=len(predictions),
            predictions=predictions
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo historial: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al obtener historial"
        )


@router.get("/{prediction_id}", response_model=PredictionDetail)
async def get_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener detalles de una predicción específica
    
    **Parámetros:**
    - **prediction_id**: ID de la predicción
    
    **Requiere autenticación:** Bearer token
    """
    try:
        prediction_service = PredictionService(db)
        prediction = prediction_service.get_prediction(
            prediction_id=prediction_id,
            user_id=current_user.id
        )
        
        if not prediction:
            raise HTTPException(
                status_code=404,
                detail="Predicción no encontrada"
            )
        
        return prediction
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo predicción: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al obtener predicción"
        )


@router.delete("/{prediction_id}")
async def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar una predicción
    
    **Parámetros:**
    - **prediction_id**: ID de la predicción a eliminar
    
    **Requiere autenticación:** Bearer token
    """
    try:
        prediction_service = PredictionService(db)
        success = prediction_service.delete_prediction(
            prediction_id=prediction_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Predicción no encontrada"
            )
        
        return {"message": "Predicción eliminada exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando predicción: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar predicción"
        )


@router.get("/stats/summary", response_model=PredictionStats)
async def get_prediction_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de predicciones del usuario
    
    **Requiere autenticación:** Bearer token
    """
    try:
        prediction_service = PredictionService(db)
        stats = prediction_service.get_user_stats(current_user.id)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error al obtener estadísticas"
        )


@router.post("/batch", response_model=List[PredictionResponse])
async def analyze_batch(
    files: List[UploadFile] = File(..., description="Múltiples archivos de audio"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analizar múltiples archivos de audio en batch
    
    **Parámetros:**
    - **files**: Lista de archivos de audio (máximo 10)
    
    **Requiere autenticación:** Bearer token
    """
    if not files:
        raise HTTPException(
            status_code=400,
            detail="No se enviaron archivos"
        )
    
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Máximo 10 archivos por batch"
        )
    
    results = []
    prediction_service = PredictionService(db)
    
    for file in files:
        try:
            _validate_audio_file(file)
            
            result = await prediction_service.analyze_audio(
                audio_file=file,
                user_id=current_user.id
            )
            
            results.append(result)
            
        except Exception as e:
            logger.error(f"Error procesando {file.filename}: {str(e)}")
            # Continuar con los demás archivos
            continue
    
    return results


# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def _validate_audio_file(file: UploadFile):
    """Validar archivo de audio"""
    
    # Validar extensión
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Nombre de archivo inválido"
        )
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no soportado. Use: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Validar tamaño (se valida en el servicio también)
    # Aquí solo verificamos que no esté vacío
    if file.size == 0:
        raise HTTPException(
            status_code=400,
            detail="El archivo está vacío"
        )