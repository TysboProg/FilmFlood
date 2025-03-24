import axios from "axios";

export class NotificationService {
    static async sendPaymentEmailSuccess() {
        return new Promise(res => {
            axios.get(`http://localhost:8020/api/notifications/send-order-email`, {
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
            axios.get(`http://localhost:8020/api/notifications/send-auth-email`, {
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