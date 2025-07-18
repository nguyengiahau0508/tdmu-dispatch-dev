import { inject, Injectable } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import { IApiResponse } from "../../../shared/models/api-response.model";
import { IUserPosition } from "../../interfaces/oraganizational.interface";
import { map, Observable, take, tap } from "rxjs";
import { GET_ALL_BY_USER } from "../../../features/admin/organizational/user-positions/graphql/user-position.queries";
import { responsePathAsArray } from "graphql";
import { ICreateUserPositionInput } from "../../../features/admin/organizational/user-positions/interfaces/create-user-position.interfaces";
import { CREATE_USER_POSITION } from "../../../features/admin/organizational/user-positions/graphql/user-position.mutations";


@Injectable({ providedIn: 'root' })
export class UserPositionsService {
    private apollo = inject(Apollo)

    private getAllByUserQueryRef!: QueryRef<{
        getAllByUser: IApiResponse<{ userPositions: IUserPosition[] }>
    }, {
        userId: number
    }>;

    initGetAllUserPositionByUserQuery(userId: number): Observable<IApiResponse<{ userPositions: IUserPosition[] }>> {
        this.getAllByUserQueryRef = this.apollo.watchQuery<{
            getAllByUser: IApiResponse<{ userPositions: IUserPosition[] }>
        }, {
            userId: number
        }>({
            query: GET_ALL_BY_USER,
            variables: { userId },
            fetchPolicy: 'network-only'
        })

        return this.getAllByUserQueryRef.valueChanges.pipe(
            //tap(response => console.log(response)),
            map(response => response.data.getAllByUser)
        )
    }

    createUserPosition(data: ICreateUserPositionInput): Observable<IApiResponse<{ userPosition: IUserPosition }>> {
        return this.apollo.mutate<{
            CreateUserPosition: IApiResponse<{ userPosition: IUserPosition }>
        }>({
            mutation: CREATE_USER_POSITION,
            variables: { createUserPositionInput: data }
        }).pipe(
            map(response => response.data!.CreateUserPosition)
        )
    }
}