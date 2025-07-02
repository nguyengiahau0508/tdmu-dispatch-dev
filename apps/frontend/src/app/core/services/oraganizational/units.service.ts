import { inject, Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GET_UNITS, GET_UNIT, GET_ALL_UNIT } from '../../../features/organizational/units/graphql/units.queries';
import { CREATE_UNIT_MUTATION, UPDATE_UNIT_MUTATION, REMOVE_UNIT_MUTATION } from '../../../features/organizational/units/graphql/units.mutations';
import { IUnit } from '../../interfaces/oraganizational.interface';
import { IGetUnitsPaginatedInput } from '../../../features/organizational/units/interfaces/get-units-paginated.interface';
import { ICreateUnitInput } from '../../../features/organizational/units/interfaces/unit-create.interface';
import { IUpdateUnitInput } from '../../../features/organizational/units/interfaces/unit-update.interface';
import { IApiResponse, IPaginatedResponse } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private apollo = inject(Apollo);

  private queryRef!: QueryRef<{
    units: IPaginatedResponse<IUnit>;
  }, {
    input: IGetUnitsPaginatedInput;
  }>;

  initUnitsQuery(input: IGetUnitsPaginatedInput): Observable<IPaginatedResponse<IUnit>> {
    this.queryRef = this.apollo.watchQuery<{
      units: IPaginatedResponse<IUnit>;
    }, {
      input: IGetUnitsPaginatedInput;
    }>({
      query: GET_UNITS,
      variables: { input },
      fetchPolicy: 'network-only'
    });

    return this.queryRef.valueChanges.pipe(
      map(result => result.data.units)
    );
  }

  getAllUnit(): Observable<IApiResponse<
    IUnit[]
  >> {
    return this.apollo.query<{
      allUnits: IApiResponse<
        IUnit[]
      >
    }>({
      query: GET_ALL_UNIT
    }).pipe(
      map(response => response.data.allUnits)
    )
  }

  refetchUnits(input: IGetUnitsPaginatedInput) {
    return this.queryRef.refetch({ input });
  }

  getUnit(id: number): Observable<IApiResponse<{ unit: IUnit }>> {
    return this.apollo.query<{ unit: IApiResponse<{ unit: IUnit }> }>({
      query: GET_UNIT,
      variables: { id }
    }).pipe(
      map(result => result.data.unit)
    );
  }

  createUnit(input: ICreateUnitInput): Observable<IApiResponse<{ unit: IUnit }>> {
    return this.apollo.mutate<{ createUnit: IApiResponse<{ unit: IUnit }> }>({
      mutation: CREATE_UNIT_MUTATION,
      variables: { createUnitInput: input }
    }).pipe(
      map(result => result.data!.createUnit)
    );
  }

  updateUnit(input: IUpdateUnitInput): Observable<IApiResponse<{ unit: IUnit }>> {
    return this.apollo.mutate<{ updateUnit: IApiResponse<{ unit: IUnit }> }>({
      mutation: UPDATE_UNIT_MUTATION,
      variables: { updateUnitInput: input }
    }).pipe(
      map(result => result.data!.updateUnit)
    );
  }

  removeUnit(id: number): Observable<IApiResponse<{ success: boolean }>> {
    return this.apollo.mutate<{ removeUnit: IApiResponse<{ success: boolean }> }>({
      mutation: REMOVE_UNIT_MUTATION,
      variables: { id }
    }).pipe(
      map(result => result.data!.removeUnit)
    );
  }
}
