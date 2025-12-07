import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

AUDIO_DIR = os.path.join(BASE_DIR, "ml", "audio")
POSITIVOS_DIR = os.path.join(AUDIO_DIR, "positivos")
NEGATIVOS_DIR = os.path.join(AUDIO_DIR, "negativos")

MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.h5")

# --- Parámetros de preprocesamiento de audio ---
SAMPLE_RATE = 16000        # frecuencia de muestreo (16 kHz)
DURATION = 2.0             # duración fija de los audios en segundos (ajusta a tu dataset)
N_MELS = 64                # número de bandas Mel para el espectrograma
N_FFT = 1024               # tamaño de la FFT / ventana para STFT
HOP_LENGTH = 256           # salto entre ventanas para STFT
