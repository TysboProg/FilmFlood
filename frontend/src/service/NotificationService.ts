import axios from "axios";

const responseUrl = `/api/notifications`
axios.defaults.baseURL = responseUrl

export class NotificationService {
    static async sendPaymentEmailSuccess() {
        return new Promise(res => {
            axios.get(`/send-order-email`, {
                withCredentials: true,
            })
                .then(response => res(response.data))
                .catch(error => {
                    console.error('Ошибка создания платежа:', error);
                    throw error;
                });
        });
    }

    static async sendAuthEmailSuccess() {
        return new Promise(res => {
            axios.get(`/api/notifications/send-auth-email`, {
                withCredentials: true,
            })
                .then(response => res(response.data))
                .catch(error => {
                    console.error('Ошибка создания платежа:', error);
                    throw error;
                });
        });
}
}