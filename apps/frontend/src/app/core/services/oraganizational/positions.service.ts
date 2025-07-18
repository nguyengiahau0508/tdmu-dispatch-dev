import { inject, Injectable } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { GET_POSITIONS_QUERY, GET_ALL_POSITIONS_QUERY, GET_POSITIONS_BY_DEPARTMENT_ID } from '../../../features/admin/organizational/positions/graphql/positions.queries';
import { CREATE_POSITION_MUTATION, UPDATE_POSITION_MUTATION, REMOVE_POSITION_MUTATION } from '../../../features/admin/organizational/positions/graphql/positions.mutations';
import { IPosition } from '../../interfaces/oraganizational.interface';
import { IGetPositionsPaginatedInput } from '../../../features/admin/organizational/positions/interfaces/get-positions-paginated.interface';
import { ICreatePositionInput } from '../../../features/admin/organizational/positions/interfaces/position-create.interface';
import { IUpdatePositionInput } from '../../../features/admin/organizational/positions/interfaces/position-update.interface';
import { IApiResponse, IPaginatedResponse } from '../../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PositionsService {
  private apollo = inject(Apollo);

  private queryRef!: QueryRef<{
    positions: IPaginatedResponse<IPosition>;
  }, {
    input: IGetPositionsPaginatedInput;
  }>;

  initPositionsQuery(input: IGetPositionsPaginatedInput): Observable<IPaginatedResponse<IPosition>> {
    this.queryRef = this.apollo.watchQuery<{
      positions: IPaginatedResponse<IPosition>;
    }, {
      input: IGetPositionsPaginatedInput;
    }>({
      query: GET_POSITIONS_QUERY,
      variables: { input },
      fetchPolicy: 'network-only'
    });

    return this.queryRef.valueChanges.pipe(
      map(result => result.data.positions)
    );
  }

  getAllPositions(): Observable<IApiResponse<IPosition[]>> {
    return this.apollo.query<{
      allPositions: IApiResponse<IPosition[]>
    }>({
      query: GET_ALL_POSITIONS_QUERY
    }).pipe(
      map(response => response.data.allPositions)
    );
  }

  refetchPositions(input: IGetPositionsPaginatedInput) {
    return this.queryRef.refetch({ input });
  }

  createPosition(input: ICreatePositionInput): Observable<IApiResponse<{ position: IPosition }>> {
    return this.apollo.mutate<{ createPosition: IApiResponse<{ position: IPosition }> }>({
      mutation: CREATE_POSITION_MUTATION,
      variables: { createPositionInput: input }
    }).pipe(
      map(result => result.data!.createPosition)
    );
  }

  updatePosition(input: IUpdatePositionInput): Observable<IApiResponse<{ position: IPosition }>> {
    return this.apollo.mutate<{ updatePosition: IApiResponse<{ position: IPosition }> }>({
      mutation: UPDATE_POSITION_MUTATION,
      variables: { updatePositionInput: input }
    }).pipe(
      map(result => result.data!.updatePosition)
    );
  }

  removePosition(id: number): Observable<IApiResponse<{ success: boolean }>> {
    return this.apollo.mutate<{ removePosition: IApiResponse<{ success: boolean }> }>({
      mutation: REMOVE_POSITION_MUTATION,
      variables: { id }
    }).pipe(
      map(result => result.data!.removePosition)
    );
  }

  getPostionsByDepartmnetId(departmentId: number): Observable<IApiResponse<{
    positions: IPosition[] 
  }>> {
    return this.apollo.query<{
      allPositionsByDepartmentId: IApiResponse<{
         positions: IPosition[] 
      }>
    }>({
      query: GET_POSITIONS_BY_DEPARTMENT_ID,
      variables: {departmentId}
    }).pipe(
      //tap(response=>console.log(response)),
      map(response=>response.data.allPositionsByDepartmentId)
    )
  }
}
