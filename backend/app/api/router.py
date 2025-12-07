from app.api.endpoints import predict

router.include_router(predict.router, prefix="/ml", tags=["Machine Learning"])
