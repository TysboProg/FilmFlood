from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.controller.payment import router as payment_router
from src.controller.auth import router as auth_router
from loguru import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FastAPI service start...")
    yield
    logger.info("FastAPI service end...")


app = FastAPI(
    lifespan=lifespan,
    docs_url="/docs",
    root_path='/api/notifications'
)

app.include_router(payment_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app="main:app", host="0.0.0.0", port=8020, reload=True)