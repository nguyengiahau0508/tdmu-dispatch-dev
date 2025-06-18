
import { HttpLink } from 'apollo-angular/http';
import { inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { environment } from '../../../environments/environment';
import { AuthState } from '../state/auth.state';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error'

const uri = environment.apiBaseUrl + '/graphql';

export function apolloOptionsFactory(): ApolloClientOptions<any> {
  const authState = inject(AuthState);
  const httpLink = inject(HttpLink);

  const authLink = setContext((operation, context) => {
    const accessToken = authState.getAccessToken();
    // Truy cập headers bằng index signature
    const headers = {
      ...(context['headers'] || {}),
      Authorization: `Bearer ${accessToken}`
    };

    return {
      headers
    };
  });

  const errorLink = onError(({ graphQLErrors, operation, forward }) => {

  })

  const link = ApolloLink.from([authLink, errorLink, httpLink.create({ uri, withCredentials: true })]);

  return {
    link,
    cache: new InMemoryCache(),
  };
}

