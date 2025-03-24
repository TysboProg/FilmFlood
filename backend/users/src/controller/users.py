from uuid import UUID
from fastapi import APIRouter, UploadFile, HTTPException
from src.repositories.s3.s3 import S3Repository
from src.service.users import UserService
from loguru import logger

router = APIRouter(tags=["Users"], prefix="/users")

@router.get("/profile")
async def get_me(user_id: str):
    user_ids = UUID(user_id)
    user = await UserService.get_user_profile(user_id=user_ids)
    if not user:
        logger.error(f"Пользователь с user_id={user_id} не найден.")
        raise ValueError("Пользователь не найден")
    return user


@router.post("/upload-image")
async def upload_image(uploaded_file: UploadFile, user_id: UUID):
    file_bytes = await uploaded_file.read()
    s3_repository = S3Repository()
    try:
        file_path = await s3_repository.upload_to_s3(
            file_bytes, user_id=str(user_id), mime_type=uploaded_file.content_type
        )
        if file_path:
            return {"message": "Файл успешно загружен"}
        else:
            raise HTTPException(
                status_code=500, detail="Ошибка при загрузке файла в S3"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Ошибка при загрузке файла: {str(e)}"
        )

@router.get("/comment")
async def create_comment(user_id: str):
    user_ids = UUID(user_id)
    user = await UserService.create_comment(user_id=user_ids)
    if not user:
        logger.error(f"Пользователь с user_id={user_id} не найден.")
        raise ValueError("Пользователь не найден")
    return user