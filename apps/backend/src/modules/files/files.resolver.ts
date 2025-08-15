import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { CreateFileInput } from './dto/create-file.input';
import { UpdateFileInput } from './dto/update-file.input';
import { StreamFileOutput } from './dto/stream-file.output';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

@Resolver(() => File)
export class FilesResolver {
  constructor(private readonly filesService: FilesService) {}

  @Mutation(() => File)
  createFile(@Args('createFileInput') createFileInput: CreateFileInput) {
    return this.filesService.create(createFileInput);
  }

  @Query(() => [File], { name: 'files' })
  findAll() {
    return this.filesService.findAll();
  }

  @Query(() => File, { name: 'file' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.filesService.findOne(id);
  }

  @Query(() => StreamFileOutput, { name: 'streamFile' })
  async streamFile(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.filesService.getFileStreamInfo(id, user);
  }

  @Mutation(() => File)
  updateFile(@Args('updateFileInput') updateFileInput: UpdateFileInput) {
    return this.filesService.update(updateFileInput.id, updateFileInput);
  }

  @Mutation(() => File)
  removeFile(@Args('id', { type: () => Int }) id: number) {
    return this.filesService.remove(id);
  }
}
