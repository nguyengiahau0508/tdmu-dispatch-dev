import { Test, TestingModule } from '@nestjs/testing';
import { DocumentCategoryResolver } from './document-category.resolver';
import { DocumentCategoryService } from './document-category.service';

describe('DocumentCategoryResolver', () => {
  let resolver: DocumentCategoryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentCategoryResolver, DocumentCategoryService],
    }).compile();

    resolver = module.get<DocumentCategoryResolver>(DocumentCategoryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
