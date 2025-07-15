import { Test, TestingModule } from '@nestjs/testing';
import { DocumentTypesResolver } from './document-types.resolver';
import { DocumentTypesService } from './document-types.service';

describe('DocumentTypesResolver', () => {
  let resolver: DocumentTypesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentTypesResolver, DocumentTypesService],
    }).compile();

    resolver = module.get<DocumentTypesResolver>(DocumentTypesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
