"use client"
import PaymentDetails from "@/components/PaymentPage/PaymentDetails";
import { PaymentService } from "@/service/PaymentService";

export default function PaymentContent() {
    const handleSubmit = async (email: string) => {
        try {
            const response: any = await PaymentService.createPayment(
                email,
                1000.0,
                "https://film-flood.ru/payment/payment-success"
            );

            console.log(response)
            // Проверяем, что ответ содержит ссылку для подтверждения
            if (response.confirmation_url) {
                // Перенаправляем пользователя по ссылке
                window.location.href = response.confirmation_url;
            } else {
                console.error("Confirmation URL is missing in the response");
            }
        } catch (error) {
            console.error("Error during payment creation:", error);
        }
    }

    return <PaymentDetails handleSubmit={handleSubmit} />;
}