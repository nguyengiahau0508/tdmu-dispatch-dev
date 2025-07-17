import { Test, TestingModule } from '@nestjs/testing';
import { UserPositionsResolver } from './user-positions.resolver';
import { UserPositionsService } from './user-positions.service';

describe('UserPositionsResolver', () => {
  let resolver: UserPositionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPositionsResolver, UserPositionsService],
    }).compile();

    resolver = module.get<UserPositionsResolver>(UserPositionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
