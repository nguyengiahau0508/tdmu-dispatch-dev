import { gql } from "apollo-angular";

// Định nghĩa mutation bằng gql tag
export const CREATE_UNIT_TYPE_MUTATION = gql`
  mutation CreateUnitType($createUnitTypeInput: CreateUnitTypeInput!) {
    createUnitType(createUnitTypeInput: $createUnitTypeInput) {
      metadata {
        statusCode
        message
      }
      data {
        unitType {
          id
          typeName
          description
        }
      }
    }
  }
`;
