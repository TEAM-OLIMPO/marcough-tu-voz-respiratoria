import os
import tensorflow as tf
import numpy as np
import pickle
from app.ml.preprocessor import preprocess_audio

# --- Configura estas rutas según tu proyecto ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best_covid_model.keras")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "models", "label_encoder_covid.pkl")
TEST_AUDIO_DIR = os.path.join(os.path.dirname(__file__), "audio", "to_test")  
# <-- Aquí coloca audios nuevos para probar (puedes crear esa carpeta manualmente)

# --- Cargar modelo + encoder ---
model = tf.keras.models.load_model(MODEL_PATH)
with open(ENCODER_PATH, "rb") as f:
    encoder = pickle.load(f)

def predict_file(file_path):
    try:
        input_data = preprocess_audio(file_path)  # espera shape correcta
        pred = model.predict(input_data)
        class_idx = np.argmax(pred, axis=1)[0]
        label = encoder.inverse_transform([class_idx])[0]
        confidence = float(np.max(pred))
        return label, confidence
    except Exception as e:
        return None, None

def main():
    results = []
    for root, _, files in os.walk(TEST_AUDIO_DIR):
        for fname in files:
            if fname.lower().endswith((".wav", ".mp3", ".ogg")):
                fpath = os.path.join(root, fname)
                label, conf = predict_file(fpath)
                print(f"{fname} → {label} (confidence: {conf})")
                results.append((fname, label, conf))

    import csv
    out_csv = os.path.join(os.path.dirname(__file__), "test_results.csv")
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["filename", "predicted_label", "confidence"])
        writer.writerows(results)
    print("Resultados guardados en:", out_csv)

if __name__ == "__main__":
    main()
