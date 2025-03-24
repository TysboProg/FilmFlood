import { gql } from "@apollo/client";

export const GetActorName = gql(
    `query GetActorName($actorName: String!) {
      getActorName(actorName: $actorName) {
        actorName,
        career,
        dateOfBirth,
        placeOfBirth,
        growth,
        films {
          filmName
          posterUrl
          yearProd
          rating
        }
        sex,
        career,
        age
        biography,
        placeOfBirth,
        posterUrl
      }
    }
`)