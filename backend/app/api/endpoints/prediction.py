import numpy as np
import tensorflow as tf
from fastapi import APIRouter, UploadFile, File
import pickle
from app.ml.preprocessor import preprocess_audio

router = APIRouter()

# Cargar modelo
modelo = tf.keras.models.load_model("app/ml/modelo_coughnet.h5")

# Cargar label encoder
with open("app/ml/label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

@router.post("/predict")
async def predict_audio(file: UploadFile = File(...)):
    # Guardar temporalmente
    audio_bytes = await file.read()
    with open("temp.wav", "wb") as f:
        f.write(audio_bytes)

    # Preprocesar audio
    features = preprocess_audio("temp.wav")
    features = np.expand_dims(features, axis=0)

    # Predecir
    preds = modelo.predict(features)
    class_idx = np.argmax(preds)
    class_name = label_encoder.inverse_transform([class_idx])[0]

    return {"prediction": class_name}
