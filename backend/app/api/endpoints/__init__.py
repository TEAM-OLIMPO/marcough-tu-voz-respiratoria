from fastapi import APIRouter
from .auth import router as auth_router
from .health import router as health_router
from .prediction import router as prediction_router
from .predictions import router as predictions_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(health_router)
router.include_router(prediction_router)
router.include_router(predictions_router)
