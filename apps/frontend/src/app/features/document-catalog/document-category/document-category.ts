import { Component, inject } from '@angular/core';
import { DocumentCategoryCreate } from './components/document-category-create/document-category-create';
import { DocumentCategoryUpdate } from './components/document-category-update/document-category-update';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DocumentCategoryService } from '../../../core/services/dispatch/document-category.service';
import { IDocumentCategory } from '../../../core/interfaces/dispatch.interface';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-document-category',
  standalone: true,
  imports: [DocumentCategoryCreate, DocumentCategoryUpdate, Pagination, ConfirmDialogModule],
  templateUrl: './document-category.html',
  styleUrl: './document-category.css',
  providers: [ConfirmationService]
})
export class DocumentCategory {
  documentCategories: IDocumentCategory[] = [];
  totalCount = 0;
  selectedMenuId: number | null = null;

  isCreateOpen = false;
  isUpdateOpen = false;
  updateSelected: null | IDocumentCategory = null;

  pageOptions: { page: number; take: number } = {
    page: 1,
    take: 10
  };

  private documentCategoryService = inject(DocumentCategoryService);
  private toastr = inject(ToastrService);
  private confirmationService = inject(ConfirmationService);
  private errorHandlerService = inject(ErrorHandlerService);

  constructor() {
    this.initQuery();
  }

  initQuery() {
    this.documentCategoryService.initDocumentCategoriesQuery(this.pageOptions).subscribe({
      next: (res: any) => {
        this.documentCategories = res.data;
        this.totalCount = res.meta?.itemCount || 0;
      },
      error: (err: unknown) => {
        const msg = this.errorHandlerService.extractGraphQLError(err as any)?.message || 'Lỗi tải nhóm văn bản!';
        this.toastr.error(msg);
      }
    });
  }

  refetch() {
    this.initQuery();
  }

  toggleCreate() {
    this.isCreateOpen = !this.isCreateOpen;
  }

  toggleUpdate(category?: IDocumentCategory) {
    this.isUpdateOpen = !this.isUpdateOpen;
    this.updateSelected = category || null;
  }

  toggleMenu(id: number) {
    this.selectedMenuId = this.selectedMenuId === id ? null : id;
  }

  onEdit(category: IDocumentCategory) {
    this.toggleUpdate(category);
    this.selectedMenuId = null;
  }

  onDelete(category: IDocumentCategory) {
    this.confirmationService.confirm({
      message: `Bạn có chắc muốn xóa nhóm văn bản "${category.name}"?`,
      accept: () => {
        this.documentCategoryService.removeDocumentCategory(category.id).subscribe({
          next: (res: any) => {
            if (res.data?.success) {
              this.toastr.success('Xóa thành công!');
              this.refetch();
            } else {
              this.toastr.error('Xóa thất bại!');
            }
          },
          error: (err: unknown) => {
            const msg = this.errorHandlerService.extractGraphQLError(err as any)?.message || 'Xóa thất bại!';
            this.toastr.error(msg);
          }
        });
      }
    });
    this.selectedMenuId = null;
  }

  onPageChange(page: number) {
    this.pageOptions.page = page;
    this.refetch();
  }

  onPageSizeChange(size: number) {
    this.pageOptions.take = size;
    this.refetch();
  }
}
