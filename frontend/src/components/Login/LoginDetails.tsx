'use client'
import React, {useState} from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {Eye, EyeOff} from "lucide-react";

interface FormData {
    username: string;
    email: string;
    password: string;
}

interface RegStartFormProps {
    onSubmit: SubmitHandler<FormData>;
    loading: boolean;
}

export default function LoginDetails({ onSubmit, loading }: RegStartFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showPassword, setShowPassword] = useState(false)

    return (
        <>
            <div className="mx-auto max-w-md p-6 rounded-lg bg-[#1E1F25] text-white">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-white">Добро пожаловать!</h1>
                    <p className="text-gray-400">Зарегистрируйся на сайте FilmFLOOD!</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4 relative">
                        <input
                            {...register("username", { required: "Username is required" })}
                            type="text"
                            placeholder="Username..."
                            className="flex h-10 w-full rounded-md border border-[#3A3B45] bg-[#2A2B36] px-3 py-2 text-white text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E53E3E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>
                    <div className="mb-4 relative">
                        <input
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Неверный адрес электронной почты",
                                },
                            })}
                            type="email"
                            placeholder="Email..."
                            className="flex h-10 w-full rounded-md border border-[#3A3B45] bg-[#2A2B36] px-3 py-2 text-white text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E53E3E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                    <div className="mb-4 relative">
                        <input
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Длина пароля должна составлять не менее 8 символов",
                                },
                            })}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password..."
                            className="flex h-10 w-full rounded-md border border-[#3A3B45] bg-[#2A2B36] px-3 py-2 text-white text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E53E3E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded transition-colors duration-300 hover:bg-red-700 focus:outline-none"
                        disabled={loading}
                    >
                        {loading ? "Отправка..." : "Зарегистрироваться"}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-400">
                    У вас уже есть аккаунт?{" "}
                    <a href="/auth" className="text-[#E53E3E] hover:underline">
                        Авторизуйся
                    </a>
                </div>
            </div>
        </>
    )
}
