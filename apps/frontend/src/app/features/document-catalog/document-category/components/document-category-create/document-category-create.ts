import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { DocumentCategoryService } from '../../../../../core/services/dispatch/document-category.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-document-category-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-category-create.html',
  styleUrl: './document-category-create.css'
})
export class DocumentCategoryCreate {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() createdSuccessfully = new EventEmitter<void>();

  form: FormGroup;
  isLoading = false;

  private fb = new FormBuilder();
  private toastr = inject(ToastrService);
  private errorHandlerService = inject(ErrorHandlerService);
  private documentCategoryService = inject(DocumentCategoryService);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(256)]],
      description: ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.documentCategoryService.createDocumentCategory(this.form.value)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toastr.success('Tạo nhóm văn bản thành công!');
          this.createdSuccessfully.emit();
          this.form.reset();
          this.close.emit();
        },
        error: (err) => {
          const msg = this.errorHandlerService.extractGraphQLError(err as any)?.message || 'Tạo thất bại!';
          this.toastr.error(msg);
        }
      });
  }

  onFormClose() {
    this.close.emit();
    this.form.reset();
  }
}
