"use client"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {PaymentService} from "@/service/PaymentService";
import { NotificationService } from "@/service/NotificationService";

export default function PaymentSuccessPage() {
    const handleSubmit = async () => {
        try {
            await PaymentService.successPayment();
            setTimeout(() => {
                console.log("Это сообщение появится через 3 секунды");
            }, 3000);
            await NotificationService.sendPaymentEmailSuccess()
        } catch (error) {
            console.error("Error during payment creation:", error);
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#1E1F24] text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-md rounded-lg border border-gray-700 bg-[#2A2B31] p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <CheckCircle className="h-20 w-20 text-red-500" />
                    </div>

                    <h1 className="mb-6 text-3xl font-bold">Payment Successful!</h1>

                    <div className="space-y-4">
                        <Link href="/">
                            <Button onClick={handleSubmit} className="w-full bg-red-500 text-white hover:bg-red-600">Go to Home Page</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

