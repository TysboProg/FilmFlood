import { gql } from "@apollo/client";

export const GetSerialNameInfo = gql(
    `query GetSerialName($serial_name: String!) {
        getSerialName(serialName:$serial_name) {
            filmName,
        description,
        yearProd,
        actors {
          actorName,
          dateOfBirth,
          posterUrl
        }
        genres,
        ageRating,
        countries,
        watchTime,
        posterUrl
      }
    }`
);

export const GetSerials = gql(
        `query GetSerials {
            getSerials {
                filmName,
                yearProd,
                rating,
                posterUrl,
                previewUrl,
                textUrl,
            }
    }`
);

export const GetSerialVideo = gql(
    `query GetSerialName($serial_name: String!) {
        getSerialName(serialName:$serial_name) {
            filmName,
            comment {
               comment,
               username,
               userImage,
               rating
            }
            yearProd,
            videoUrl
        }
    }`
);

export const GetSerialForFilter = gql(
    `query GetSerialForGenre($genre_name: String!, $country_name: String!, $rating: Float!) {
        getSerialFilter(filmGenre: $genre_name, countryName: $country_name, rating: $rating) {
            filmName,
            rating,
            yearProd,
            posterUrl,
        }
    }`
);