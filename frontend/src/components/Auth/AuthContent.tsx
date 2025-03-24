import { AuthService } from "@/service/AuthService";
import AuthDetails from "./AuthDetails"
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLoginStartSubmit = async (data: { username: string, email: string, password: string }) => {
        setLoading(true);

        try {
            await AuthService.authUser(data.username, data.email, data.password);
            router.push("/");
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthDetails
            onSubmit={handleLoginStartSubmit}
            loading={loading}
        />
    );
}