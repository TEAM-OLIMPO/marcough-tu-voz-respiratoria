import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

AUDIO_DIR = os.path.join(BASE_DIR, "ml", "audio")
POSITIVOS_DIR = os.path.join(AUDIO_DIR, "positivos")
NEGATIVOS_DIR = os.path.join(AUDIO_DIR, "negativos")
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.h5")
