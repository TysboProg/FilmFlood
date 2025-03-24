import axios from "axios"
import {IUserProfile} from "@/types/userservice.interface";

const responseUrl = `http://localhost:8040/api/payments`
axios.defaults.baseURL = responseUrl

axios.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
    return config;
})

export class PaymentService {
    static async createPayment(email: string, amount: number, redirectUrl: string) {
        return new Promise(res => {
            const userId = localStorage.getItem('userId');
            axios.post(`/payment?user_id=${userId}&email=${email}&amount_value=${amount}&redirect_url=${redirectUrl}`, {
                withCredentials: true,
            })
                .then(response => res(response.data))
                .catch(error => {
                    console.error('Ошибка создания платежа:', error);
                    throw error;
                });
        });
    }

    static async successPayment() {
        return new Promise(res => {
            const userId = localStorage.getItem('userId');
            axios.get(`/success-payment?user_id=${userId}`, {
                withCredentials: true,
            })
                .then(response => res(response.data))
                .catch(error => {
                    console.error('Ошибка обработки успешного платежа:', error);
                    throw error;
                });
        })
    }

    static async getPaymentsUser() {
        return new Promise(res => {
            const userId = localStorage.getItem('userId');
            axios.get(`/get-payments?user_id=${userId}`, {
                withCredentials: true,
            })
               .then(response => res(response.data))
               .catch(error => {
                    console.error('Ошибка получения платежей пользователя:', error);
                    throw error;
                });
        });
    }
}