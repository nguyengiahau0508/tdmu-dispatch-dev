// src/app/core/services/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, tap } from 'rxjs';
import { LOGIN_MUTATION } from '../../features/auth/login/graphql/login.mutations';
import { LOGIN_WITH_OTP_MUTATION, SENT_OTP_MUTATION } from '../../features/auth/otp-input/graphql/otp-input.mutations';
import { AuthState } from '../state/auth.state';
import { IApiResponse } from '../../shared/models/api-response.model';
import { ILoginInput, ILoginOutput } from '../../features/auth/login/interfaces/login.interface';
import { ILoginOtpInput, ILoginOtpOutput } from '../../features/auth/otp-input/interfaces/login-otp.interface';
import { ISentOtpInput, ISentOtpOutput } from '../../features/auth/otp-input/interfaces/sent-otp.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apollo = inject(Apollo);
  private authState = inject(AuthState)

  login(credentials: ILoginInput): Observable<IApiResponse<ILoginOutput>> {
    return this.apollo.mutate<{
      signIn: IApiResponse<ILoginOutput>
    }>({
      mutation: LOGIN_MUTATION,
      variables: credentials,
    }).pipe(
      tap(response => {
        const accessToken = response.data?.signIn.data?.accessToken
        if (accessToken) this.authState.setAccessToken(accessToken)
        console.log(accessToken)
      }),
      map(response => response.data!.signIn)
    );
  }

  loginWithOtp(credentials: ILoginOtpInput): Observable<IApiResponse<ILoginOtpOutput>> {
    return this.apollo.mutate<{
      signInWithOtp: IApiResponse<ILoginOtpOutput>
    }>({
      mutation: LOGIN_WITH_OTP_MUTATION,
      variables: credentials
    }).pipe(
      tap(response => {
        const accessToken = response.data?.signInWithOtp.data?.accessToken
        if (accessToken) this.authState.setAccessToken(accessToken)
      }),
      map(response => response.data!.signInWithOtp)
    )
  }

  sentOtp(input: ISentOtpInput): Observable<IApiResponse<ISentOtpOutput>> {
    return this.apollo.mutate<{
      sentOtp: IApiResponse<ISentOtpOutput>
    }>({
      mutation: SENT_OTP_MUTATION,
      variables: { input }
    }).pipe(
      map(response => response.data!.sentOtp)
    )
  }
}
