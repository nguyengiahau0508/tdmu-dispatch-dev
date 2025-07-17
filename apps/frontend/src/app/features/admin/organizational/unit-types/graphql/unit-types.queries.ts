import { gql } from 'apollo-angular';

export const GET_UNIT_TYPES_QUERY = gql`
  query GetUnitTypes($input: GetUnitTypesPaginatedInput!) {
    unitTypes(input: $input) {
      metadata {
        message
        timestamp
      }
      data {
        id
        typeName
        description
      }
      totalCount
      hasNextPage
    }
  }
`;

