import { inject, Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GET_DEPARTMENTS_PAGINATED_QUERY,
  GET_DEPARTMENT_QUERY
} from '../../../features/organizational/departments/graphql/department.queries';
import {
  CREATE_DEPARTMENT_MUTATION,
  UPDATE_DEPARTMENT_MUTATION,
  REMOVE_DEPARTMENT_MUTATION
} from '../../../features/organizational/departments/graphql/department.mutations';
import { IApiResponse, IPaginatedResponse } from '../../../shared/models/api-response.model';
import { ICreateDepartmentInput } from '../../../features/organizational/departments/interfaces/create-department.interfaces';
import { IUpdateDepartmentInput } from '../../../features/organizational/departments/interfaces/update-department.interfaces';
import { IGetDepartmentsPaginatedInput } from '../../../features/organizational/departments/interfaces/get-departments-paginated.interface';
import { IDepartment } from '../../interfaces/oraganizational.interface';

@Injectable({
  providedIn: 'root'
})
export class DepartmentsService {
  private apollo = inject(Apollo);
  private queryRef!: QueryRef<{
    departmentsPaginated: IPaginatedResponse<IDepartment>;
  }, {
    input: IGetDepartmentsPaginatedInput;
  }>;

  initDepartmentsQuery(input: IGetDepartmentsPaginatedInput): Observable<IPaginatedResponse<IDepartment>> {
    this.queryRef = this.apollo.watchQuery<{
      departmentsPaginated: IPaginatedResponse<IDepartment>;
    }, {
      input: IGetDepartmentsPaginatedInput;
    }>({
      query: GET_DEPARTMENTS_PAGINATED_QUERY,
      variables: { input },
      fetchPolicy: 'network-only'
    });
    return this.queryRef.valueChanges.pipe(
      map(result => result.data.departmentsPaginated)
    );
  }

  refetchDepartments(input: IGetDepartmentsPaginatedInput) {
    return this.queryRef.refetch({ input });
  }

  getDepartment(id: number): Observable<IApiResponse<{ department: IDepartment }>> {
    return this.apollo.query<{ department: IApiResponse<{ department: IDepartment }> }>({
      query: GET_DEPARTMENT_QUERY,
      variables: { input: { id } }
    }).pipe(
      map(result => result.data.department)
    );
  }

  createDepartment(input: ICreateDepartmentInput): Observable<IApiResponse<{ department: IDepartment }>> {
    return this.apollo.mutate<{ createDepartment: IApiResponse<{ department: IDepartment }> }>({
      mutation: CREATE_DEPARTMENT_MUTATION,
      variables: { input }
    }).pipe(
      map(result => result.data!.createDepartment)
    );
  }

  updateDepartment(input: IUpdateDepartmentInput): Observable<IApiResponse<{ department: IDepartment }>> {
    return this.apollo.mutate<{ updateDepartment: IApiResponse<{ department: IDepartment }> }>({
      mutation: UPDATE_DEPARTMENT_MUTATION,
      variables: { input }
    }).pipe(
      map(result => result.data!.updateDepartment)
    );
  }

  removeDepartment(id: number): Observable<IApiResponse<{ success: boolean }>> {
    return this.apollo.mutate<{ removeDepartment: IApiResponse<{ success: boolean }> }>({
      mutation: REMOVE_DEPARTMENT_MUTATION,
      variables: { input: { id } }
    }).pipe(
      map(result => result.data!.removeDepartment)
    );
  }
}
