import axios from "axios";
import {IUserProfile} from "@/types/userservice.interface";

const responseUrl = `/api/users`
axios.defaults.baseURL = responseUrl

axios.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
    return config;
})

export class UserService {
    static getUserProfile(userId: string | null) {
        return new Promise<IUserProfile>(res => {
            axios.get<IUserProfile>(`/profile?user_id=${userId}`, {
                withCredentials: true,
            })
                .then(response => res(response.data))
                .catch(error => {
                    console.error('Ошибка получения профиля пользователя:', error);
                    throw error;
                });
        });
    }

    static createCommentFilm(userId: string | null) {
        return new Promise<IUserProfile>(res => {
            axios.get<IUserProfile>(`/comment?user_id=${userId}`, {
                withCredentials: true,
            })
               .then(response => res(response.data))
               .catch(error => {
                    console.error('Ошибка создания комментария:', error);
                    throw error;
                });
        })
    }

    static uploadUserImage() {
        return new Promise(res => {
            const userId = localStorage.getItem('userId');
            axios.post(`/upload-image?user_id=${userId}`, {
                withCredentials: true,
            })
                .then(response => res(response.data))
                .catch(error => {
                    console.error('Ошибка загрузки изображения:', error);
                    throw error;
                });
        })
    }
}