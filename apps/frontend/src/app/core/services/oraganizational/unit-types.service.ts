import { inject, Injectable } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import { ICreateUnitTypeInput, ICreateUnitTypeOuput } from "../../../features/organizational/unit-types/interfaces/unit-type-create.interfaces";
import { map, Observable } from "rxjs";
import { IApiResponse, IPaginatedResponse } from "../../../shared/models/api-response.model";
import { CREATE_UNIT_TYPE_MUTATION, REMOVE_UNIT_TYPE, UPDATE_UNIT_TYPE } from "../../../features/organizational/unit-types/graphql/unit-types.mutations";
import { IGetUnitTypesPaginatedInput } from "../../../features/organizational/unit-types/interfaces/get-unit-types-paginated.interface";
import { IUnitType } from "../../interfaces/oraganizational.interface";
import { GET_UNIT_TYPES_QUERY } from "../../../features/organizational/unit-types/graphql/unit-types.queries";
import { IUpdateUnitTypeInput, IUpdateUnitTypeOuput } from "../../../features/organizational/unit-types/interfaces/unit-type-update.interface";


@Injectable({ providedIn: 'root' })
export class UnitTypesService {
  private apollo = inject(Apollo);

  private queryRef!: QueryRef<{
    unitTypes: IPaginatedResponse<IUnitType>;
  }, {
    input: IGetUnitTypesPaginatedInput;
  }>;

  initUnitTypesQuery(input: IGetUnitTypesPaginatedInput): Observable<IPaginatedResponse<IUnitType>> {
    this.queryRef = this.apollo.watchQuery<{
      unitTypes: IPaginatedResponse<IUnitType>;
    }, {
      input: IGetUnitTypesPaginatedInput;
    }>({
      query: GET_UNIT_TYPES_QUERY,
      variables: { input },
      fetchPolicy: 'network-only'
    });

    return this.queryRef.valueChanges.pipe(
      map(result => result.data.unitTypes)
    );
  }

  refetchUnitTypes(input: IGetUnitTypesPaginatedInput) {
    return this.queryRef.refetch({ input });
  }

  createUnitType(input: ICreateUnitTypeInput): Observable<IApiResponse<ICreateUnitTypeOuput>> {
    return this.apollo.mutate<{
      createUnitType: IApiResponse<ICreateUnitTypeOuput>
    }>({
      mutation: CREATE_UNIT_TYPE_MUTATION,
      variables: {
        createUnitTypeInput: input
      },
    }).pipe(
      map((response) => response.data!.createUnitType)
    );
  }

  getUnitTypesPaginated(input: IGetUnitTypesPaginatedInput): Observable<IPaginatedResponse<IUnitType>> {
    return this.apollo.query<{
      unitTypes: IPaginatedResponse<IUnitType>
    }>({
      query: GET_UNIT_TYPES_QUERY,
      variables: { input }
    }).pipe(
      map((response) => response.data.unitTypes)
    );
  }

  removeUnitType(id: number): Observable<IApiResponse<null>> {
    return this.apollo.mutate<{
      removeUnitType: IApiResponse<null>
    }>({
      mutation: REMOVE_UNIT_TYPE,
      variables: { id },
    }).pipe(
      map(response => response.data!.removeUnitType)
    );
  }

  updateUnitType(input: IUpdateUnitTypeInput): Observable<IApiResponse<IUpdateUnitTypeOuput>> {
    return this.apollo.mutate<{
      updateUnitType: IApiResponse<IUpdateUnitTypeOuput>
    }>({
      mutation: UPDATE_UNIT_TYPE,
      variables: {
        updateUnitTypeInput: input
      }
    }).pipe(
      map(response => response.data!.updateUnitType)
    )
  }
}

