import { Test, TestingModule } from '@nestjs/testing';
import { UnitTypesResolver } from './unit-types.resolver';
import { UnitTypesService } from './unit-types.service';

describe('UnitTypesResolver', () => {
  let resolver: UnitTypesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitTypesResolver, UnitTypesService],
    }).compile();

    resolver = module.get<UnitTypesResolver>(UnitTypesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
