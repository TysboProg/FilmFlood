import axios, { AxiosResponse } from "axios";

const responseUrl = `http://localhost:8030/api/users`
axios.defaults.baseURL = responseUrl

export class AuthService {
    static async createUser(username: string, email: string, password: string) {
        try {
            const response = await axios.post('/register', {username, email, password}, {
                withCredentials: true,
            });
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('is_subscribe', String(false));
            return response.data;
        } catch (error: any) {
            console.error(error.message);
            throw error;
        }
    }

    static async authUser(username: string, email: string, password: string) {
        try {
            const response = await axios.post('/auth', {username: username, email: email, password: password}, {
                withCredentials: true,
            })
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('is_subscribe', String(false));
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async logoutUser(): Promise<AxiosResponse<any>> {
        try {
            const response = await axios.post('/logout', {
                withCredentials: true,
            })
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('is_subscribe');
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}