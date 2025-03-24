"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ExternalLink, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Payment {
    id: string
    order_id: string
    number_order: string
    receipt_url: string
    order_date: string
    amount: number
}

interface PaymentHistoryProps {
    payments: Payment[]
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, "d MMMM yyyy, HH:mm", { locale: ru })
    }

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const openReceiptInNewTab = (url: string) => {
        window.open(url, "_blank")
    }

    return (
        <Card className="w-full bg-gradient-to-r from-zinc-900 to-zinc-950 border border-red-900/20 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">История платежей</CardTitle>
            </CardHeader>
            <CardContent>
                {payments.length === 0 ? (
                    <p className="text-zinc-400 text-center py-6">У вас пока нет платежей</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800">
                                <TableHead className="text-zinc-300">Номер заказа</TableHead>
                                <TableHead className="text-zinc-300">Дата</TableHead>
                                <TableHead className="text-zinc-300">Сумма</TableHead>
                                <TableHead className="text-zinc-300 text-right">Чек</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id} className="border-zinc-800">
                                    <TableCell className="font-medium text-zinc-200">{payment.number_order}</TableCell>
                                    <TableCell className="text-zinc-300">{formatDate(payment.order_date)}</TableCell>
                                    <TableCell className="text-zinc-300">{formatAmount(payment.amount)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                        onClick={() => setSelectedReceipt(payment.receipt_url)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Просмотр
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-4xl h-[80vh] bg-zinc-950 border border-red-900/30 p-0">
                                                    <DialogHeader className="p-4 border-b border-zinc-800">
                                                        <DialogTitle className="text-xl text-white">{payment.number_order} - Чек</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="w-full h-full">
                                                        <iframe
                                                            src={selectedReceipt || ""}
                                                            className="w-full h-[calc(80vh-70px)]"
                                                            title="PDF Receipt"
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                onClick={() => openReceiptInNewTab(payment.receipt_url)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                <span className="sr-only">Открыть в новой вкладке</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
