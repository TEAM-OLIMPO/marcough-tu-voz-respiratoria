from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from app.ml.predict import predict_audio
import shutil
import os

app = FastAPI()

UPLOAD_DIR = "app/ml/audio/to_test"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Guardar archivo temporalmente
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        result = predict_audio(file_path)
        # Opcional: borrar el archivo después de predecir
        os.remove(file_path)
        return JSONResponse(content={
            "filename": file.filename,
            "prediction": result["label"],
            "confidence": result["confidence"]
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
