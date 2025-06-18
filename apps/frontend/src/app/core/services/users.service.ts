import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { IResetPasswordInput, IResetPasswordOutput } from "../../features/auth/reset-password/interfaces/reset-password.interface";
import { map, Observable, tap } from "rxjs";
import { IApiResponse } from "../../shared/models/api-response.model";
import { CHANGE_PASSWORD_MUTATION } from "../../features/auth/reset-password/graphql/reset-password.mutations";
import { IUser } from "../interfaces/user.interface";
import { GET_CURRENT_USER_DATA_MUTATIONS } from "../../features/users/users.mutations";
import { UserState } from "../state/user.state";

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apollo = inject(Apollo)
  private userState = inject(UserState)

  changePassword(input: IResetPasswordInput): Observable<IApiResponse<IResetPasswordOutput>> {
    return this.apollo.mutate<{
      changePassword: IApiResponse<IResetPasswordOutput>
    }>({
      mutation: CHANGE_PASSWORD_MUTATION,
      variables: { input }
    }).pipe(
      map(response => response.data!.changePassword)
    )
  }

  getCurrentUserData(): Observable<IApiResponse<{
    user: IUser
  }>> {
    return this.apollo.mutate<{
      getCurrentUserData: IApiResponse<{ user: IUser }>
    }>({
      mutation: GET_CURRENT_USER_DATA_MUTATIONS
    }).pipe(
      tap(response => {
        const currentUser = response.data?.getCurrentUserData.data?.user
        if (currentUser) this.userState.setUser(currentUser)
      }),
      map(response => response.data!.getCurrentUserData)
    )
  }
}
