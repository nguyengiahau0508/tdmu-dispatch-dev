
import { inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { environment } from '../../../environments/environment';
import { AuthState } from '../state/auth.state';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
const uri = environment.apiBaseUrl + '/graphql';

export function apolloOptionsFactory(): ApolloClientOptions<any> {
  const authState = inject(AuthState);
  // const httpLink = inject(HttpLink); // ⬅️ KHÔNG DÙNG httpLink.create() nữa

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
      }
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
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

