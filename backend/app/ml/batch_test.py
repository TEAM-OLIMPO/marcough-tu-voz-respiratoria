from app.ml.predict import predict_audio
import os

def test_folder(folder_path):
    print("\n=== Probando audios en:", folder_path, "===\n")

    for file in os.listdir(folder_path):
        if file.lower().endswith((".wav", ".mp3")):
            path = os.path.join(folder_path, file)
            print(f"\n--- {file} ---")
            try:
                predict_audio(path)
            except Exception as e:
                print(f"Error al procesar {file}: {e}")

if __name__ == "__main__":
    test_folder("app/ml/to_test")
