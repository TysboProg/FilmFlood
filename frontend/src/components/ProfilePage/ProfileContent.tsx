"use client"

import { useState, useEffect } from "react"
import { UserService } from "@/service/UserService"
import Loading from "@/components/ui/loading"
import ProfileDetails from "./ProfileDetials"
import NotFound from "@/app/not-found"
import { useQuery } from "@tanstack/react-query"
import { PaymentService } from "@/service/PaymentService"

interface UserProfile {
    username: string
    email: string
    created_at: string
    updated_at: string
    userImage: string
}

interface Payment {
    id: string
    order_id: string
    number_order: string
    receipt_url: string
    order_date: string
    amount: number
}

export default function ProfileContent() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)

    // Safely access localStorage after component mount
    useEffect(() => {
        setIsClient(true)
        const id = localStorage.getItem("userId")
        setUserId(id)
    }, [])

    // Common query options
    const queryOptions = {
        retry: false,
        enabled: !!userId && isClient,
    }

    const {
        data: userData,
        isLoading: userLoading,
        isError: userError,
    } = useQuery<UserProfile>({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            if (!userId) throw new Error("User ID not found")
            const data = await UserService.getUserProfile(userId)
            return {
                username: data.username,
                email: data.email,
                created_at: data.created_at,
                updated_at: data.updated_at,
                userImage: data.userImage,
            }
        },
        ...queryOptions,
    })

    const {
        data: paymentData = [],
        isLoading: paymentsLoading,
        isError: paymentsError,
        isFetching: paymentsFetching,
    } = useQuery<Payment[]>({
        queryKey: ["userPayments", userId],
        queryFn: async () => {
            if (!userId) throw new Error("User ID not found")
            const data = await PaymentService.getPaymentsUser()
            return Array.isArray(data) ? data : [data]
        },
        ...queryOptions,
        select: (data) => data.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()),
    })

    // Show loading state while checking for client-side rendering or loading data
    if (!isClient || userLoading || paymentsLoading) {
        return <Loading />
    }

    // Show not found if no user ID is available after client-side check
    if (!userId) {
        return <NotFound />
    }

    // Show not found on query errors
    if (userError || paymentsError) {
        return <NotFound />
    }

    // Only render the profile details when we have user data
    if (!userData) {
        return <Loading />
    }

    return (
        <div>
            <ProfileDetails userData={userData} loading={paymentsFetching} paymentData={paymentData} />
        </div>
    )
}

