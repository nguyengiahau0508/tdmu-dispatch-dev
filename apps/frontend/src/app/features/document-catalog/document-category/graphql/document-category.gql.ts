import { gql } from 'apollo-angular';

export const GET_DOCUMENT_CATEGORIES_QUERY = gql`
  query documentCategories($input: GetDocumentCategoriesPaginatedInput!) {
    documentCategories(input: $input) {
      data {
        id
        name
        description
      }
      totalCount
      hasNextPage
      metadata {
        statusCode
        message
        timestamp
      }
    }
  }
`;

export const GET_ALL_DOCUMENT_CATEGORIES_QUERY = gql`
  query allDocumentCategories {
    allDocumentCategories {
      id
      name
      description
    }
  }
`;

export const CREATE_DOCUMENT_CATEGORY_MUTATION = gql`
  mutation createDocumentCategory($createDocumentCategoryInput: CreateDocumentCategoryInput!) {
    createDocumentCategory(createDocumentCategoryInput: $createDocumentCategoryInput) {
      data {
        documentCategory {
          id
          name
          description
        }
      }
      metadata {
        statusCode
        message
        timestamp
      }
    }
  }
`;

export const UPDATE_DOCUMENT_CATEGORY_MUTATION = gql`
  mutation updateDocumentCategory($updateDocumentCategoryInput: UpdateDocumentCategoryInput!) {
    updateDocumentCategory(updateDocumentCategoryInput: $updateDocumentCategoryInput) {
      data {
        documentCategory {
          id
          name
          description
        }
      }
      metadata {
        statusCode
        message
        timestamp
      }
    }
  }
`;

export const REMOVE_DOCUMENT_CATEGORY_MUTATION = gql`
  mutation removeDocumentCategory($id: Int!) {
    removeDocumentCategory(id: $id) {
      data {
        success
      }
      metadata {
        statusCode
        message
        timestamp
      }
    }
  }
`; 