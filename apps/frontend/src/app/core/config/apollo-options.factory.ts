
import { inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, ApolloLink, fromPromise } from '@apollo/client/core';
import { environment } from '../../../environments/environment';
import { AuthState } from '../state/auth.state';
import { TokenRefreshHttpService } from '../services/token-refresh-http.service';
import { TokenValidationService } from '../services/token-validation.service';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Observable } from 'rxjs';
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
const uri = environment.apiBaseUrl + '/graphql';

export function apolloOptionsFactory(): ApolloClientOptions<any> {
  const authState = inject(AuthState);
  const tokenRefreshService = inject(TokenRefreshHttpService);
  const tokenValidationService = inject(TokenValidationService);
  // const httpLink = inject(HttpLink); // ⬅️ KHÔNG DÙNG httpLink.create() nữa

  // Queue để xử lý các request đang chờ khi refresh token
  let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  // Flag để tránh vòng lặp vô hạn
  let isHandlingAuthError = false;

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueue = [];
  };

  // Helper function để force logout
  const forceLogout = () => {
    console.log('Force logout from Apollo error handler');
    authState.clearAllTokens();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth/login';
  };

  const authLink = setContext((operation, context) => {
    const accessToken = authState.getAccessToken();
    const headers = {
      ...(context['headers'] || {}),
      Authorization: `Bearer ${accessToken}`,
      'apollo-require-preflight': 'true',
    };
    return { headers };
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        console.error(`[GraphQL error]: Message: ${err.message}`);
        
        // Kiểm tra lỗi 401 (Unauthorized) và tránh vòng lặp
        if ((err.extensions?.['code'] === 'UNAUTHENTICATED' || 
             err.extensions?.['status'] === 401 ||
             err.message.includes('Unauthorized') ||
             err.message.includes('Token không hợp lệ')) && 
            !isHandlingAuthError) {
          
          console.log('Token expired, checking token validity...');
          isHandlingAuthError = true;
          
          // Kiểm tra xem có access token không
          const accessToken = authState.getAccessToken();
          if (!accessToken) {
            console.log('No access token available, redirecting to login');
            isHandlingAuthError = false;
            forceLogout();
            return;
          }

          // Kiểm tra token validity
          if (!tokenValidationService.isTokenValid(accessToken)) {
            console.log('Access token is invalid/expired, redirecting to login');
            isHandlingAuthError = false;
            forceLogout();
            return;
          }
          
          // Chỉ refresh token nếu token còn hợp lệ và chưa đang refresh
          if (!tokenRefreshService.isRefreshingToken) {
            console.log('Token valid, attempting to refresh...');
            // Gọi service refresh token
            tokenRefreshService.refreshToken().then(
              (newToken) => {
                console.log('Token refreshed successfully');
                processQueue(null, newToken);
                isHandlingAuthError = false;
                
                // Gửi lại request ban đầu với token mới
                const oldHeaders = operation.getContext()['headers'];
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    Authorization: `Bearer ${newToken}`,
                  },
                });
              },
              (error) => {
                console.error('Failed to refresh token:', error);
                processQueue(error, null);
                isHandlingAuthError = false;
                
                // Nếu refresh thất bại, force logout
                forceLogout();
              }
            );
          } else {
            console.log('Token refresh already in progress, waiting...');
          }
          
          // Trả về promise để chờ refresh token hoàn thành
          return fromPromise(
            new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
          ).flatMap(() => {
            return forward(operation);
          });
        }
      }
    }
    
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      
      // Kiểm tra network error 401 và tránh vòng lặp
      if ('statusCode' in networkError && networkError.statusCode === 401 && !isHandlingAuthError) {
        console.log('Network error 401, checking token validity...');
        isHandlingAuthError = true;
        
        // Kiểm tra xem có access token không
        const accessToken = authState.getAccessToken();
        if (!accessToken) {
          console.log('No access token available, redirecting to login');
          isHandlingAuthError = false;
          forceLogout();
          return;
        }

        // Kiểm tra token validity
        if (!tokenValidationService.isTokenValid(accessToken)) {
          console.log('Access token is invalid/expired, redirecting to login');
          isHandlingAuthError = false;
          forceLogout();
          return;
        }
        
        // Chỉ refresh token nếu token còn hợp lệ và chưa đang refresh
        if (!tokenRefreshService.isRefreshingToken) {
          console.log('Token valid, attempting to refresh from network error...');
          tokenRefreshService.refreshToken().then(
            (newToken) => {
              console.log('Token refreshed successfully from network error');
              processQueue(null, newToken);
              isHandlingAuthError = false;
              
              const oldHeaders = operation.getContext()['headers'];
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  Authorization: `Bearer ${newToken}`,
                },
              });
            },
            (error) => {
              console.error('Failed to refresh token from network error:', error);
              processQueue(error, null);
              isHandlingAuthError = false;
              
              // Nếu refresh thất bại, force logout
              forceLogout();
            }
          );
        } else {
          console.log('Token refresh already in progress, waiting...');
        }
        
        return fromPromise(
          new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
        ).flatMap(() => {
          return forward(operation);
        });
      }
    }
    
    // Return undefined nếu không có lỗi 401
    return undefined;
  });

  // ✅ Dùng createUploadLink thay thế httpLink.create
  const uploadLink = createUploadLink({
    uri,
    credentials: 'include', // same as withCredentials: true
  });

  const link = ApolloLink.from([authLink, errorLink, uploadLink]);

  return {
    link,
    cache: new InMemoryCache(),
  };
}

