import { gql } from 'apollo-angular';

export const GET_UNITS_QUERY = gql`
  query GetUnits($input: GetUnitsPaginatedInput!) {
    units(input: $input) {
      metadata {
        message
        timestamp
      }
      data {
        id
        unitName
        unitType {
          id
          typeName
        }
        parentUnit {
          id
          unitName
        }
        establishmentDate
        email
        phone
        childUnits {
          id
          unitName
        }
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_UNIT_QUERY = gql`
  query GetUnit($id: Int!) {
    unit(id: $id) {
      metadata {
        message
        timestamp
      }
      data {
        unit {
          id
          unitName
          unitType {
            id
            typeName
          }
          parentUnit {
            id
            unitName
          }
          establishmentDate
          email
          phone
          childUnits {
            id
            unitName
          }
        }
      }
    }
  }
`;

export const GET_ALL_UNIT_QUERY = gql`
query {
  allUnits {
    metadata {
      statusCode
      message
      timestamp
    }
    data {
      id
      unitName
    }
  }
}
`
