// src/config/interfaces/graphql-config.interface.ts
export default interface IGraphQLConfig {
  playgroundEnabled: boolean;
  debugEnabled: boolean;
  autoSchemaFile: string | boolean; // Đường dẫn file schema hoặc true để tự động tạo
  sortSchema: boolean;
  introspection: boolean; // Cho phép introspection trong production (thường là false)
  // ... các tùy chọn khác cho Apollo Server
}
