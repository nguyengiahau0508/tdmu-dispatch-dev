import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';
import { User } from '../../entities/user.entity';
import { PaginatedResponse } from 'src/common/graphql/api-response.dto';

@ObjectType()
export class GetUsersPaginatedResponse extends PaginatedResponse(User) { } 
