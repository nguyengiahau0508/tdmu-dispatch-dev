import { inject, Injectable } from "@angular/core";
import { Apollo, QueryRef } from "apollo-angular";
import { IApiResponse, IPaginatedResponse } from "../../../shared/models/api-response.model";
import { IAssignment } from "../../interfaces/oraganizational.interface";
import { IGetAssignmentsPaginatedInput } from "../../../features/admin/organizational/assignments/interfaces/get-assignments-paginated.interfaces";
import { Observable } from "rxjs";
import { map, tap } from 'rxjs/operators';
import { GET_ASSIGNMENTS_BY_USER_QUERY } from "../../../features/admin/organizational/assignments/graphql/assignments.queries";
import { CREATE_ASSIGNMENT_MUTATION, CREATE_ASSIGNMENTS_MUTATION, REMOVE_ASSIGNMENT_MUTATION, UPDATE_ASSIGNMENT_MUTAION } from '../../../features/admin/organizational/assignments/graphql/assignments.mutations';
import { GET_ASSIGNMENT_QUERY, GET_ASSIGNMENTS_QUERY } from '../../../features/admin/organizational/assignments/graphql/assignments.queries';
import { ICreateAssignmentInput } from '../../../features/admin/organizational/assignments/interfaces/create-assignment.interfaces';
import { IUpdateAssignmentInput } from '../../../features/admin/organizational/assignments/interfaces/update-assignment.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {
  private apollo = inject(Apollo)

  private queryRef!: QueryRef<{
    assigntments: IPaginatedResponse<IAssignment>;
  }, {
    input: IGetAssignmentsPaginatedInput;
  }>;

  private queryRefByUser!: QueryRef<{
    assignmentsByUser: IPaginatedResponse<IAssignment>;
  }, {
    userId: number;
  }>;


  initAssignmentsByUserQuery(userId: number): Observable<IPaginatedResponse<IAssignment>> {
    this.queryRefByUser = this.apollo.watchQuery<{
      assignmentsByUser: IPaginatedResponse<IAssignment>
    }, {
      userId: number; // TÊN BIẾN PHẢI ĐÚNG VỚI QUERY
    }>({
      query: GET_ASSIGNMENTS_BY_USER_QUERY,
      variables: { userId }, // ✅ ĐÚNG
      fetchPolicy: 'network-only'
    });

    return this.queryRefByUser.valueChanges.pipe(
      map(result => result.data.assignmentsByUser)
    );
  }

  getAssignments(): Observable<IPaginatedResponse<IAssignment>> {
    return this.apollo.watchQuery<{
      assignments: IPaginatedResponse<IAssignment>
    }>({
      query: GET_ASSIGNMENTS_QUERY,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data.assignments)
    );
  }

  getAssignment(id: number): Observable<IAssignment> {
    return this.apollo.watchQuery<{
      assignment: { data: IAssignment }
    }>({
      query: GET_ASSIGNMENT_QUERY,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => result.data.assignment.data)
    );
  }

  createAssignment(createAssignmentInput: ICreateAssignmentInput): Observable<IAssignment> {
    return this.apollo.mutate<{
      createAssignment: { data: IAssignment }
    }>({
      mutation: CREATE_ASSIGNMENT_MUTATION,
      variables: { createAssignmentInput }
    }).pipe(
      tap(response => console.log(response)),
      map(result => result.data!.createAssignment.data)
    );
  }

  saveAssignments(createAssignmentsInput: ICreateAssignmentInput[])
    : Observable<IApiResponse<{ assignments: IAssignment[] }>> {
    return this.apollo.mutate<{
      createAssignments: IApiResponse<{ assignments: IAssignment[] }>
    }>({
      mutation: CREATE_ASSIGNMENTS_MUTATION,
      variables: { createAssignmentsInput }
    }).pipe(
      map(res => res.data!.createAssignments)
    );
  }

  updateAssignment(updateAssignmentInput: IUpdateAssignmentInput): Observable<IAssignment> {
    return this.apollo.mutate<{
      updateAssignment: { data: IAssignment }
    }>({
      mutation: UPDATE_ASSIGNMENT_MUTAION,
      variables: { updateAssignmentInput }
    }).pipe(
      map(result => result.data!.updateAssignment.data)
    );
  }

  removeAssignment(id: number): Observable<IAssignment> {
    return this.apollo.mutate<{
      removeAssignment: { data: IAssignment }
    }>({
      mutation: REMOVE_ASSIGNMENT_MUTATION,
      variables: { id }
    }).pipe(
      map(result => result.data!.removeAssignment.data)
    );
  }
}


