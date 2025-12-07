"""
Servicio de Predicciones COVID-19
Lógica de negocio para análisis de audio
"""

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
import tempfile
import os
import logging

from app.schemas.prediction import (
    PredictionResponse,
    PredictionDetail,
    PredictionStats,
    RiskLevel,
    PredictionClass
)
from app.models.prediction import Prediction
from app.ml.predictor import predict_covid
from app.config import settings
import librosa

logger = logging.getLogger(__name__)


class PredictionService:
    """Servicio para gestionar predicciones"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def analyze_audio(
        self,
        audio_file: UploadFile,
        user_id: int,
        patient_name: Optional[str] = None,
        patient_age: Optional[int] = None,
        patient_gender: Optional[str] = None,
        symptoms: Optional[str] = None,
        notes: Optional[str] = None
    ) -> PredictionResponse:
        """
        Analizar archivo de audio y predecir COVID-19
        
        Args:
            audio_file: Archivo de audio subido
            user_id: ID del usuario
            patient_name: Nombre del paciente (opcional)
            patient_age: Edad del paciente (opcional)
            patient_gender: Género del paciente (opcional)
            symptoms: Síntomas reportados (opcional)
            notes: Notas adicionales (opcional)
        
        Returns:
            PredictionResponse con resultados
        """
        temp_path = None
        
        try:
            # Leer contenido del archivo
            content = await audio_file.read()
            
            # Validar tamaño
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"Archivo muy grande. Máximo {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            # Guardar temporalmente
            file_extension = os.path.splitext(audio_file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp:
                tmp.write(content)
                temp_path = tmp.name
            
            # Obtener duración del audio
            try:
                y, sr = librosa.load(temp_path, sr=None, duration=None)
                duration = len(y) / sr
            except Exception as e:
                logger.warning(f"No se pudo obtener duración: {e}")
                duration = None
            
            # Predecir con el modelo ML
            logger.info(f"Iniciando predicción para: {audio_file.filename}")
            prediction_result = predict_covid(temp_path)
            
            # Determinar nivel de riesgo
            risk_level = self._determine_risk_level(
                prediction_result["prediction"],
                prediction_result["confidence"]
            )
            
            # Guardar en base de datos
            db_prediction = Prediction(
                user_id=user_id,
                filename=audio_file.filename,
                prediction=prediction_result["prediction"],
                confidence=prediction_result["confidence"],
                probabilities=prediction_result["probabilities"],
                risk_level=risk_level,
                patient_name=patient_name,
                patient_age=patient_age,
                patient_gender=patient_gender,
                symptoms=symptoms,
                notes=notes,
                file_size=len(content),
                duration=duration
            )
            
            self.db.add(db_prediction)
            self.db.commit()
            self.db.refresh(db_prediction)
            
            logger.info(
                f"Predicción guardada - ID: {db_prediction.id}, "
                f"Resultado: {prediction_result['prediction']} "
                f"({prediction_result['confidence']:.2f})"
            )
            
            # Retornar respuesta
            return PredictionResponse(
                prediction=PredictionClass(prediction_result["prediction"]),
                confidence=prediction_result["confidence"],
                probabilities=prediction_result["probabilities"],
                risk_level=RiskLevel(risk_level)
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error en análisis: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error al analizar audio: {str(e)}"
            )
        finally:
            # Limpiar archivo temporal
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.warning(f"No se pudo eliminar archivo temporal: {e}")
    
    def get_user_predictions(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> List[PredictionDetail]:
        """
        Obtener predicciones de un usuario
        
        Args:
            user_id: ID del usuario
            skip: Número de registros a saltar
            limit: Número máximo de registros
        
        Returns:
            Lista de predicciones
        """
        predictions = self.db.query(Prediction).filter(
            Prediction.user_id == user_id
        ).order_by(
            Prediction.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return predictions
    
    def get_prediction(
        self,
        prediction_id: int,
        user_id: int
    ) -> Optional[PredictionDetail]:
        """
        Obtener una predicción específica
        
        Args:
            prediction_id: ID de la predicción
            user_id: ID del usuario (para verificar propiedad)
        
        Returns:
            Predicción o None si no existe
        """
        prediction = self.db.query(Prediction).filter(
            Prediction.id == prediction_id,
            Prediction.user_id == user_id
        ).first()
        
        return prediction
    
    def delete_prediction(
        self,
        prediction_id: int,
        user_id: int
    ) -> bool:
        """
        Eliminar una predicción
        
        Args:
            prediction_id: ID de la predicción
            user_id: ID del usuario (para verificar propiedad)
        
        Returns:
            True si se eliminó, False si no existía
        """
        prediction = self.db.query(Prediction).filter(
            Prediction.id == prediction_id,
            Prediction.user_id == user_id
        ).first()
        
        if not prediction:
            return False
        
        self.db.delete(prediction)
        self.db.commit()
        
        return True
    
    def get_user_stats(self, user_id: int) -> PredictionStats:
        """
        Obtener estadísticas de predicciones de un usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Estadísticas
        """
        predictions = self.db.query(Prediction).filter(
            Prediction.user_id == user_id
        ).all()
        
        total = len(predictions)
        positive_count = sum(1 for p in predictions if p.prediction == "positive")
        negative_count = total - positive_count
        
        avg_confidence = (
            sum(p.confidence for p in predictions) / total
            if total > 0 else 0.0
        )
        
        high_risk = sum(1 for p in predictions if p.risk_level == "ALTO")
        medium_risk = sum(1 for p in predictions if p.risk_level == "MEDIO")
        low_risk = sum(1 for p in predictions if p.risk_level == "BAJO")
        
        return PredictionStats(
            total_predictions=total,
            positive_count=positive_count,
            negative_count=negative_count,
            avg_confidence=round(avg_confidence, 2),
            high_risk_count=high_risk,
            medium_risk_count=medium_risk,
            low_risk_count=low_risk
        )
    
    @staticmethod
    def _determine_risk_level(prediction: str, confidence: float) -> str:
        """
        Determinar nivel de riesgo basado en predicción y confianza
        
        Args:
            prediction: Clase predicha
            confidence: Nivel de confianza
        
        Returns:
            Nivel de riesgo
        """
        if prediction == "positive":
            if confidence > 0.8:
                return "ALTO"
            elif confidence > 0.6:
                return "MEDIO"
            else:
                return "BAJO"
        return "NEGATIVO"