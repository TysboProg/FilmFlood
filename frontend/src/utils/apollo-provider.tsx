import { ApolloProvider } from "@apollo/client";
import type { PropsWithChildren } from "react"
import { filmClient } from "@/utils/apollo-client";


export default function ApolloClientProvider({ children }: PropsWithChildren<unknown>) {
    return (
        <ApolloProvider client={filmClient}>
                {children}
        </ApolloProvider>
    );
}