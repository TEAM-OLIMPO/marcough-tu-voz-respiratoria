"""
Model Loader
Carga el modelo TensorFlow y label encoder
"""

import tensorflow as tf
import pickle
import logging
import os

from app.config import settings

logger = logging.getLogger(__name__)

# Variables globales para el modelo
_model = None
_label_encoder = None


def load_ml_model():
    """
    Cargar modelo de TensorFlow y label encoder
    
    Raises:
        FileNotFoundError: Si no se encuentran los archivos del modelo
        Exception: Si hay error al cargar el modelo
    """
    global _model, _label_encoder
    
    try:
        # Verificar que existan los archivos
        if not os.path.exists(settings.MODEL_PATH):
            raise FileNotFoundError(
                f"Modelo no encontrado: {settings.MODEL_PATH}\n"
                f"Asegúrese de copiar 'best_covid_model.keras' a la carpeta 'models/'"
            )
        
        if not os.path.exists(settings.LABEL_ENCODER_PATH):
            raise FileNotFoundError(
                f"Label encoder no encontrado: {settings.LABEL_ENCODER_PATH}\n"
                f"Asegúrese de copiar 'label_encoder_covid.pkl' a la carpeta 'models/'"
            )
        
        # Cargar modelo TensorFlow
        logger.info(f"Cargando modelo desde: {settings.MODEL_PATH}")
        _model = tf.keras.models.load_model(settings.MODEL_PATH)
        logger.info("✓ Modelo TensorFlow cargado exitosamente")
        
        # Cargar label encoder
        logger.info(f"Cargando label encoder desde: {settings.LABEL_ENCODER_PATH}")
        with open(settings.LABEL_ENCODER_PATH, 'rb') as f:
            _label_encoder = pickle.load(f)
        logger.info("✓ Label encoder cargado exitosamente")
        
        # Mostrar información del modelo
        logger.info(f"Clases disponibles: {_label_encoder.classes_.tolist()}")
        logger.info(f"Input shape: {_model.input_shape}")
        logger.info(f"Output shape: {_model.output_shape}")
        logger.info(f"Total parámetros: {_model.count_params():,}")
        
    except FileNotFoundError as e:
        logger.error(str(e))
        raise
    except Exception as e:
        logger.error(f"Error cargando modelo: {str(e)}", exc_info=True)
        raise


def get_model():
    """
    Obtener modelo cargado
    
    Returns:
        Modelo de TensorFlow o None si no está cargado
    """
    return _model


def get_label_encoder():
    """
    Obtener label encoder cargado
    
    Returns:
        Label encoder de sklearn o None si no está cargado
    """
    return _label_encoder


def is_model_loaded() -> bool:
    """
    Verificar si el modelo está cargado
    
    Returns:
        True si el modelo está cargado, False en caso contrario
    """
    return _model is not None and _label_encoder is not None