import os
import numpy as np
import librosa
import tensorflow as tf
import pickle
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

from app.ml.preprocessor import preprocess_audio
from app.config import settings

DATASET_PATH = "app/ml/audio"   # carpeta donde están las subcarpetas de clases

def load_dataset():
    X = []
    y = []

    for label in os.listdir(DATASET_PATH):
        class_path = os.path.join(DATASET_PATH, label)

        if not os.path.isdir(class_path):
            continue

        print(f"Cargando clase: {label}")

        for file in os.listdir(class_path):
            if file.endswith((".wav", ".mp3", ".ogg")):
                file_path = os.path.join(class_path, file)
                try:
                    features = preprocess_audio(file_path)
                    X.append(features)
                    y.append(label)
                except Exception as e:
                    print(f"Error procesando {file_path}: {e}")

    X = np.array(X)
    y = np.array(y)

    return X, y


def build_model(input_shape, num_classes):
    model = tf.keras.models.Sequential([
        tf.keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=input_shape),
        tf.keras.layers.MaxPooling2D((2,2)),
        tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
        tf.keras.layers.MaxPooling2D((2,2)),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    return model


def train():
    print("Cargando dataset...")
    X, y = load_dataset()

    print("Codificando etiquetas...")
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    print("Guardando label encoder...")
    with open("models/label_encoder_covid.pkl", "wb") as f:
        pickle.dump(encoder, f)

    X = X.reshape(X.shape[0], settings.N_MELS, -1, 1)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    print("Construyendo modelo...")
    model = build_model(input_shape=X_train.shape[1:], num_classes=len(encoder.classes_))

    print("Entrenando modelo...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=20,
        batch_size=32
    )

    print("Guardando modelo...")
    model.save("models/best_covid_model.keras")

    print("Entrenamiento completado ✔")


if __name__ == "__main__":
    train()
