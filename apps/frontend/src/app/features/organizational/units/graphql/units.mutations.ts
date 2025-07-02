import { gql } from "apollo-angular";

export const CREATE_UNIT_MUTATION = gql`
  mutation CreateUnit($createUnitInput: CreateUnitInput!) {
    createUnit(createUnitInput: $createUnitInput) {
      metadata {
        statusCode
        message
      }
      data {
        unit {
          id
          unitName
          unitTypeId
          parentUnitId
          establishmentDate
          email
          phone
        }
      }
    }
  }
`;

export const UPDATE_UNIT_MUTATION = gql`
  mutation UpdateUnit($updateUnitInput: UpdateUnitInput!) {
    updateUnit(updateUnitInput: $updateUnitInput) {
      metadata {
        statusCode
        message
      }
      data {
        unit {
          id
          unitName
          unitTypeId
          parentUnitId
          establishmentDate
          email
          phone
        }
      }
    }
  }
`;

export const REMOVE_UNIT_MUTATION = gql`
  mutation RemoveUnit($id: Int!) {
    removeUnit(id: $id) {
      metadata {
        statusCode
        message
      }
      data {
        success
      }
    }
  }
`; 