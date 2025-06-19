import { inject, Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import { ICreateUnitTypeInput, ICreateUnitTypeOuput } from "../../../features/organizational/unit-types/interfaces/unit-type-create.interfaces";
import { map, Observable } from "rxjs";
import { IApiResponse } from "../../../shared/models/api-response.model";
import { CREATE_UNIT_TYPE_MUTATION } from "../../../features/organizational/unit-types/unit-types.mutations";

@Injectable({ providedIn: 'root' })
export class UnitTypesService {
  private apollo = inject(Apollo)

  createUnitType(input: ICreateUnitTypeInput): Observable<IApiResponse<ICreateUnitTypeOuput>> {
    return this.apollo.mutate<{
      createUnitType: IApiResponse<ICreateUnitTypeOuput>
    }>({
      mutation: CREATE_UNIT_TYPE_MUTATION,
      variables: {
        createUnitTypeInput: input
      }
    }).pipe(
      map((response) => response.data!.createUnitType)
    );
  }
}
