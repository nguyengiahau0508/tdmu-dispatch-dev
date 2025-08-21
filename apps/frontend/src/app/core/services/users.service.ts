import { inject, Injectable } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import { gql } from "apollo-angular";
import { IResetPasswordInput, IResetPasswordOutput } from "../../features/auth/reset-password/interfaces/reset-password.interface";
import { map, Observable, tap } from "rxjs";
import { IApiResponse, IPaginatedResponse } from "../../shared/models/api-response.model";
import { CHANGE_PASSWORD_MUTATION } from "../../features/auth/reset-password/graphql/reset-password.mutations";
import { IUser } from "../interfaces/user.interface";
import { GET_CURRENT_USER_DATA_MUTATIONS } from "../../features/admin/users/graphql/users.mutations";
import { UserState } from "../state/user.state";
import { IGetUsersPaginatedInput } from "../../features/admin/users/interfaces/get-users-paginated.interfaces";
import { GET_USERS_PAGINATED_QUERY } from "../../features/admin/users/graphql/users.queries";
import { ICreateUserInput } from "../../features/admin/users/interfaces/create-user.interfaces";
import { CREATE_USER_MUTATION } from "../../features/admin/users/graphql/users.mutations";
import { IUpdateUserInput } from "../../features/admin/users/interfaces/update-user.interfaces";
import { UPDATE_USER_MUTATION } from "../../features/admin/users/graphql/users.mutations";
import { ADD_ROLE_MUTAION, REMOVE_ROLE_MUTAION } from "../../features/admin/users/graphql/users.mutations";
import { CHANGE_ROLES_MUTATION, GET_USER_ROLES } from "../../features/admin/users/graphql/users.queries";
import { Role } from "../../shared/enums/role.enum";
import { GET_USER_BY_ID_QUERY } from '../../features/admin/users/graphql/users.queries';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apollo = inject(Apollo)
  private userState = inject(UserState)
  private queryRef!: QueryRef<{
    usersPaginated: IPaginatedResponse<IUser>;
  }, {
    input: IGetUsersPaginatedInput;
  }>;

  initUsersQuery(input: IGetUsersPaginatedInput): Observable<IPaginatedResponse<IUser>> {
    this.queryRef = this.apollo.watchQuery<{
      usersPaginated: IPaginatedResponse<IUser>;
    }, {
      input: IGetUsersPaginatedInput;
    }>({
      query: GET_USERS_PAGINATED_QUERY,
      variables: { input },
      fetchPolicy: 'network-only'
    });

    return this.queryRef.valueChanges.pipe(
      map(result => result.data.usersPaginated)
    );
  }

  refetchUsers(input: IGetUsersPaginatedInput) {
    return this.queryRef.refetch({ input });
  }

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

  getAllUsers(): Observable<IUser[]> {
    return this.apollo.query<{
      users: IUser[]
    }>({
      query: gql`
        query GetAllUsers {
          users {
            id
            fullName
            email
            roles
            isActive
          }
        }
      `,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.users)
    );
  }


  createUser(
    input: ICreateUserInput,
    avatarFile?: File | null
  ): Observable<IApiResponse<IUser>> {
    return this.apollo.mutate<{
      createUser: IApiResponse<IUser>;
    }>({
      mutation: CREATE_USER_MUTATION,
      variables: {
        createUserInput: input,
        avatarImageFile: avatarFile ?? null,
      },
    }).pipe(
      map(result => result.data!.createUser)
    );
  }

  updateUser(
    input: IUpdateUserInput,
    avatarFile?: File | null
  ): Observable<IApiResponse<IUser>> {
    return this.apollo.mutate<{
      updateUser: IApiResponse<IUser>;
    }>({
      mutation: UPDATE_USER_MUTATION,
      variables: {
        updateUserInput: input,
        avatarImageFile: avatarFile ?? null,
      },
    }).pipe(
      map(result => result.data!.updateUser)
    );
  }

  /**
   * Thêm role cho user
   */
  addRole(input: { userId: number; role: Role }): Observable<IApiResponse<{ user: IUser }>> {
    return this.apollo.mutate<{
      addRole: IApiResponse<{ user: IUser }>
    }>({
      mutation: ADD_ROLE_MUTAION,
      variables: { input }
    }).pipe(
      map(result => result.data!.addRole)
    );
  }

  /**
   * Xóa role khỏi user
   */
  removeRole(input: { userId: number; role: Role }): Observable<IApiResponse<{ user: IUser }>> {
    return this.apollo.mutate<{
      removeRole: IApiResponse<{ user: IUser }>
    }>({
      mutation: REMOVE_ROLE_MUTAION,
      variables: { input }
    }).pipe(
      map(result => result.data!.removeRole)
    );
  }

  /**
   * Đổi toàn bộ roles của user
   */
  changeRoles(id: number, roles: Role[]): Observable<IApiResponse<{ id: number; roles: Role[] }>> {
    return this.apollo.mutate<{
      changeRoles: IApiResponse<{ id: number; roles: Role[] }>
    }>({
      mutation: CHANGE_ROLES_MUTATION,
      variables: { id, roles }
    }).pipe(
      map(result => result.data!.changeRoles)
    );
  }

  /**
   * Lấy roles của user
   */
  getUserRoles(userId: number): Observable<IApiResponse<{ roles: Role[] }>> {
    return this.apollo.query<{
      getUserRoles: IApiResponse<{ roles: Role[] }>
    }>({
      query: GET_USER_ROLES,
      variables: { userId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.getUserRoles)
    );
  }

  getUserById(id: number) {
    return this.apollo.query<{ user: IUser }>({
      query: GET_USER_BY_ID_QUERY,
      variables: { id },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.user)
    );
  }
}
