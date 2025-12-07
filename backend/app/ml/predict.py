import numpy as np
import tensorflow as tf
import pickle
from app.ml.preprocessor import preprocess_audio

MODEL_PATH = "models/best_covid_model.keras"
ENCODER_PATH = "models/label_encoder_covid.pkl"

# Cargar modelo y encoder solo una vez, para que no se recarguen cada vez
model = tf.keras.models.load_model(MODEL_PATH)
with open(ENCODER_PATH, "rb") as f:
    encoder = pickle.load(f)

def predict_audio(audio_path: str):
    # cargar modelo
    model = tf.keras.models.load_model(MODEL_PATH)

    # cargar label encoder
    with open(ENCODER_PATH, "rb") as f:
        encoder = pickle.load(f)

    # preprocesar audio
    input_data = preprocess_audio(audio_path)

    # predecir
    preds = model.predict(input_data)
    class_index = np.argmax(preds)
    class_name = encoder.inverse_transform([class_index])[0]

    # Devolver el resultado
    return {
        "label": class_name,
        "confidence": preds[0][class_index]
    }
