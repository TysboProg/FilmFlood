export interface IFilmData {
    id: string;
    filmName: string;
    description: string;
    ageRating: string;
    watchTime: string;
    rating: string;
    yearProd: number;
    country: ICountry[] | ICountry;
    genres: IGenre[] | IGenre;
    posterUrl: string;
    previewUrl: string;
    textUrl: string;
    videoUrl: string;
    actorsData: IActors[] | IActors
}

export interface ICountry {
    countryName: string;
}

export interface IGenreCategory {
    name: string
    href: string;
}

export interface IGenre {
    genreName: string;
}

export interface IFilmComment {
    username: string;
    comment: string;
    rating: number;
    userImage: string
}

export interface IActorsData {
    name: string;
    date_of_birth: string;
    height: number;
    biography: string;
    films: IFilms[] | IFilms
}

export interface IActors {
    PosterUrl: string;
    actorName: string;
    date_of_birth: string;
}

export interface IFilms {
    film_name: string;
    description: string;
    year_prod: number;
    country: string;
    genre: string[];
    PosterUrl: string;
}

export interface IGenreFilm {
    id: string;
    filmName: string;
    description: string;
    yearProd: number;
    country: string;
    posterUrl: string;
    genre: {
        id: string;
        genreName: string;
    };
}

export interface IFilmsRating{
    id: string;
    film_name: string;
    year_prod: number;
    PosterUrl: string;
}