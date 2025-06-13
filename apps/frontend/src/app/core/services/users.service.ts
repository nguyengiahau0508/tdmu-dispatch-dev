import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { IResetPasswordInput } from "../../features/auth/reset-password/interfaces/reset-password.input";
import { map, Observable } from "rxjs";
import { IApiResponse } from "../../shared/models/api-response.model";
import { IResetPasswordOutput } from "../../features/auth/reset-password/interfaces/reset-password.output";
import { CHANGE_PASSWORD_MUTATION } from "../../features/auth/reset-password/graphql/reset-password.mutations";

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apollo = inject(Apollo)

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
}
