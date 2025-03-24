import { AuthService } from "@/service/AuthService";
import LoginDetails from "@/components/Login/LoginDetails";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {NotificationService} from "@/service/NotificationService";

export default function LoginContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false); // Состояние для отслеживания загрузки

    const handleLoginStartSubmit = async (data: { username: string, email: string, password: string }) => {
        setLoading(true);

        try {
            await AuthService.createUser(data.username, data.email, data.password);
            router.push("/");
            await NotificationService.sendAuthEmailSuccess()
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginDetails
            onSubmit={handleLoginStartSubmit}
            loading={loading}
        />
    );
}