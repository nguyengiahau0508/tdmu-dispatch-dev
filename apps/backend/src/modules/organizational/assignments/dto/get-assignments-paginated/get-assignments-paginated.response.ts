import { ObjectType } from '@nestjs/graphql';
import { PaginatedResponse } from 'src/common/graphql/api-response.dto';
import { Assignment } from '../../entities/assignment.entity';

@ObjectType()
export class GetAssignmentsPaginatedResponse extends PaginatedResponse(Assignment) { } 
