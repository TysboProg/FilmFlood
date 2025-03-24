import { gql } from "@apollo/client";

export const addCommentFilm = gql(
    `mutation addCommentFilm($createCommentModel: CommentInput!) {
      createCommentToFilm(createCommentModel: $createCommentModel) {
        message
      }
    }`
)