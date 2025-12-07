"""
Preprocessor de Audio
Preprocesa archivos de audio para el modelo ML
"""

import librosa
import numpy as np
import logging

from app.config import settings

logger = logging.getLogger(__name__)


def preprocess_audio(audio_path: str) -> np.ndarray:
    """
    Preprocesar archivo de audio para el modelo
    
    Este preprocesamiento debe coincidir EXACTAMENTE con el usado en el entrenamiento:
    1. Cargar audio a sample_rate específico
    2. Normalizar amplitud
    3. Pad o truncar a duración fija
    4. Extraer mel spectrogram
    5. Convertir a dB
    6. Asegurar dimensiones fijas
    7. Añadir dimensiones para batch y canal
    
    Args:
        audio_path: Ruta al archivo de audio
    
    Returns:
        Array numpy con shape (1, 128, 130, 1) listo para el modelo
    
    Raises:
        Exception: Si hay error en el preprocesamiento
    """
    try:
        logger.info(f"Preprocesando audio: {audio_path}")
        
        # 1. Cargar audio
        audio, sr = librosa.load(
            audio_path,
            sr=settings.SAMPLE_RATE,
            duration=settings.DURATION
        )
        
        logger.info(f"Audio cargado: {len(audio)} samples, SR: {sr}")
        
        # 2. Normalizar
        if len(audio) > 0:
            audio = audio / (np.max(np.abs(audio)) + 1e-6)
        
        # 3. Pad o truncar a duración exacta
        target_length = settings.SAMPLE_RATE * settings.DURATION
        if len(audio) < target_length:
            # Pad con ceros
            audio = np.pad(audio, (0, target_length - len(audio)))
        else:
            # Truncar
            audio = audio[:target_length]
        
        logger.info(f"Audio ajustado a {len(audio)} samples")
        
        # 4. Extraer mel spectrogram
        mel_spec = librosa.feature.melspectrogram(
            y=audio,
            sr=settings.SAMPLE_RATE,
            n_mels=settings.N_MELS,
            n_fft=settings.N_FFT,
            hop_length=settings.HOP_LENGTH
        )
        
        # 5. Convertir a dB
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        
        logger.info(f"Mel spectrogram extraído: {mel_spec_db.shape}")
        
        # 6. Asegurar tamaño fijo (importante para el modelo)
        target_width = int(settings.SAMPLE_RATE * settings.DURATION / settings.HOP_LENGTH) + 1
        current_width = mel_spec_db.shape[1]
        
        if current_width < target_width:
            # Pad con ceros
            pad_width = target_width - current_width
            mel_spec_db = np.pad(
                mel_spec_db,
                ((0, 0), (0, pad_width)),
                mode='constant'
            )
        else:
            # Truncar
            mel_spec_db = mel_spec_db[:, :target_width]
        
        logger.info(f"Mel spectrogram ajustado: {mel_spec_db.shape}")
        
        # 7. Expandir dimensiones para el modelo
        # El modelo espera: (batch_size, height, width, channels)
        mel_spec_db = np.expand_dims(mel_spec_db, axis=0)   # Añadir batch dimension
        mel_spec_db = np.expand_dims(mel_spec_db, axis=-1)  # Añadir channel dimension
        
        logger.info(f"Shape final para modelo: {mel_spec_db.shape}")
        
        # Verificar shape esperado
        expected_shape = (1, settings.N_MELS, target_width, 1)
        if mel_spec_db.shape != expected_shape:
            raise ValueError(
                f"Shape incorrecto: {mel_spec_db.shape}. "
                f"Esperado: {expected_shape}"
            )
        
        return mel_spec_db
        
    except Exception as e:
        logger.error(f"Error en preprocesamiento: {str(e)}", exc_info=True)
        raise


def extract_audio_features(audio_path: str) -> dict:
    """
    Extraer features adicionales del audio (opcional)
    
    Args:
        audio_path: Ruta al archivo de audio
    
    Returns:
        Diccionario con features adicionales
    """
    try:
        # Cargar audio
        y, sr = librosa.load(audio_path, sr=None)
        
        # Calcular features
        duration = len(y) / sr
        rms = librosa.feature.rms(y=y)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
        
        return {
            "duration": float(duration),
            "sample_rate": int(sr),
            "rms_mean": float(np.mean(rms)),
            "spectral_centroid_mean": float(np.mean(spectral_centroid)),
            "zero_crossing_rate_mean": float(np.mean(zero_crossing_rate))
        }
        
    except Exception as e:
        logger.warning(f"No se pudieron extraer features: {e}")
        return {}