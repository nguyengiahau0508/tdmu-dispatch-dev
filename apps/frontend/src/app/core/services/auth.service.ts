// src/app/core/services/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { LOGIN_MUTATION } from '../../features/auth/login/graphql/login.mutations';
import { LoginInputModel } from '../../features/auth/login/models/login.input';
import { ApiResponse } from '../../shared/models/api-response.model';
import { LoginOutput } from '../../features/auth/login/models/login.output';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apollo = inject(Apollo);

  login(credentials: LoginInputModel): Observable<ApiResponse<LoginOutput>> {
    return this.apollo.mutate<any>({
      mutation: LOGIN_MUTATION,
      variables: credentials,
    }).pipe(
      map(result => result.data!.signIn)
    );
  }
}
