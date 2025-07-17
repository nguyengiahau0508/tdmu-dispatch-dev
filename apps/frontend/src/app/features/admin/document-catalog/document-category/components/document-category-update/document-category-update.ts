import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../../../../../core/services/error-handler.service';
import { DocumentCategoryService } from '../../../../../../core/services/dispatch/document-category.service';
import { finalize } from 'rxjs';
import { IDocumentCategory } from '../../../../../../core/interfaces/dispatch.interface';

@Component({
  selector: 'app-document-category-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-category-update.html',
  styleUrl: './document-category-update.css'
})
export class DocumentCategoryUpdate implements OnInit {
  @Input() isOpen = false;
  @Input() category: IDocumentCategory | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() updatedSuccessfully = new EventEmitter<void>();

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

  ngOnInit() {
    if (this.category) {
      this.form.patchValue({
        name: this.category.name,
        description: this.category.description
      });
    }
  }

  ngOnChanges() {
    if (this.category) {
      this.form.patchValue({
        name: this.category.name,
        description: this.category.description
      });
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.category) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.documentCategoryService.updateDocumentCategory({ ...this.form.value, id: this.category.id })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật nhóm văn bản thành công!');
          this.updatedSuccessfully.emit();
          this.form.reset();
          this.close.emit();
        },
        error: (err) => {
          const msg = this.errorHandlerService.extractGraphQLError(err as any)?.message || 'Cập nhật thất bại!';
          this.toastr.error(msg);
        }
      });
  }

  onFormClose() {
    this.close.emit();
    this.form.reset();
  }
}
