import { ObjectType } from '@nestjs/graphql';
import { Assignment } from '../../entities/assignment.entity';

@ObjectType()
export class GetAssignmentsPaginatedOutput extends Assignment {}
