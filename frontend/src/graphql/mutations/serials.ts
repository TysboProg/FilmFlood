import {gql} from "@apollo/client";

export const addCommentSerial = gql(
    `mutation addCommentSerial($createCommentModel: CommentInput!) {
      createCommentToSerial(createCommentModel: $createCommentModel) {
        message
      }
    }`
)