import { gql } from "@apollo/client"

export const GetFilmNameInfo = gql(
    `query GetFilmName($film_name: String!) {
      getFilmName(filmName: $film_name) {
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

export const GetFilmVideo = gql(
    `query GetFilmName($film_name: String!) {
      getFilmName(filmName: $film_name) {
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
    }
`)

export const GetFilms = gql(`
    query GetFilms {
        getFilms {
            filmName,
            yearProd,
            rating,
            posterUrl,
            previewUrl,
            textUrl,
        }
    }`
);

export const GetFilmForFilter = gql(
    `query GetFilmForGenre($genre_name: String!, $country_name: String!, $rating: Float!) {
        getFilmFilter(filmGenre: $genre_name, countryName: $country_name, rating: $rating) {
            filmName,
            rating,
            yearProd,
            posterUrl,
        }
    }`
);

export const GetFiltres = gql(
    `query GetFilmFilter {
      getFilmsFilters {
        genres
        countries
      }
    }
    `
)