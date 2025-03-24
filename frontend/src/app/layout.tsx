"use client"
import "./globals.css";
import ApolloClientProvider from "@/utils/apollo-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Loading from "@/components/ui/loading";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/ui/header";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            placeholderData: <Loading />,
        },
    }
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{
    return (
        <html lang="en">
        <body className="bg-[#0f1014] text-white overflow-x-hidden">
        <ApolloClientProvider>
            <QueryClientProvider client={queryClient}>
                <main className="flex-1">
                    <div className="flex min-h-screen w-full">
                        <Sidebar />
                        <div className="flex-1 flex flex-col">
                            <Header />
                            <div className="flex-1 overflow-y-auto">{children}</div>
                        </div>
                    </div>
                </main>
                <ReactQueryDevtools />
            </QueryClientProvider>
        </ApolloClientProvider>
        </body>
        </html>
    )
}
