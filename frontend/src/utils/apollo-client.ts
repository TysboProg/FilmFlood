import {ApolloClient, InMemoryCache, createHttpLink} from "@apollo/client";

const httpLinkFilm  = createHttpLink({
    uri: `/api/film`,
    credentials: "include"
})

export const filmClient = new ApolloClient({
    link: httpLinkFilm,
    cache: new InMemoryCache(),
})