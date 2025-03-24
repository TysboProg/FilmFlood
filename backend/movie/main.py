from contextlib import asynccontextmanager
from strawberry.fastapi import GraphQLRouter
from fastapi import FastAPI
from strawberry import Schema
from loguru import logger
from fastapi.middleware.cors import CORSMiddleware
from src.controller.route import Mutations, Queries
import uvicorn

schema = Schema(query=Queries, mutation=Mutations)

graphql_app = GraphQLRouter(schema=schema)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Fastapi server...")
    yield
    logger.info("Fastapi server stopped.")


app = FastAPI(lifespan=lifespan, docs_url="/docs", root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/film")

if __name__ == "__main__":
    uvicorn.run(app="main:app", host="0.0.0.0", port=8010, reload=True)
