export default interface IAppConfig {
  nodeEnv: string;
  name: string;
  port: number;
  apiPrefix: string;
  clientUrl: string; // URL của frontend client
  corsOrigin: string | string[] | boolean; // Cấu hình CORS
}
