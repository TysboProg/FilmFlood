from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware
from strawberry import Schema
from src.controller.users import router as users_router
from src.controller.auth import router as auth_router
from contextlib import asynccontextmanager
from loguru import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"FastApi server is starting...")
    yield
    logger.info(f"FastApi server is shutting down...")

app = FastAPI(
    lifespan=lifespan,
    docs_url="/docs",
    root_path="/api",
)

app.include_router(users_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app="main:app", host="0.0.0.0", port=8030, reload=True)