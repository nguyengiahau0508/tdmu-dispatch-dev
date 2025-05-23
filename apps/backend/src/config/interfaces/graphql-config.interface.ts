// src/config/interfaces/graphql-config.interface.ts
export default interface IGraphQLConfig {
  playgroundEnabled: boolean;
  debugEnabled: boolean;
  schemaDestination: string; // Đường dẫn file schema, ví dụ: './src/schema.gql'
  sortSchema: boolean;
}
