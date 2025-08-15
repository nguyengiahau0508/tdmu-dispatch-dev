import { ObjectType, Field } from '@nestjs/graphql';
import { Assignment } from '../../entities/assignment.entity';

@ObjectType()
export class CreateAssignmentOutput extends Assignment {}
