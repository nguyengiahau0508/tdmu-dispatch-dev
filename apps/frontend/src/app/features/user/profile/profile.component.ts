import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService, IUpdateProfileInput } from '../../../core/services/profile.service';
import { IUser } from '../../../core/interfaces/user.interface';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-content" *ngIf="profile">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-container">
            <img 
              [src]="profile.avatar || '/icons/account_circle.svg'" 
              alt="Avatar" 
              class="avatar-image"
            />
            <div class="avatar-overlay">
              <input 
                type="file" 
                #fileInput 
                (change)="onFileSelected($event)" 
                accept="image/*" 
                style="display: none;"
              />
              <button 
                type="button" 
                class="btn btn-primary btn-sm" 
                (click)="fileInput.click()"
              >
                <img src="/icons/camera.svg" alt="Change">
                <span>Thay đổi</span>
              </button>
              <button 
                type="button" 
                class="btn btn-danger btn-sm" 
                (click)="removeAvatar()"
                *ngIf="profile.avatar"
              >
                <img src="/icons/delete.svg" alt="Remove">
                <span>Xóa</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Họ *</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName" 
                class="form-control"
                [class.error]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
              />
              <div class="error-message" *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                Họ là bắt buộc
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Tên *</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName" 
                class="form-control"
                [class.error]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
              />
              <div class="error-message" *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                Tên là bắt buộc
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                class="form-control"
                [class.error]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
              />
              <div class="error-message" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                Email không hợp lệ
              </div>
            </div>

            <div class="form-group">
              <label for="phoneNumber">Số điện thoại</label>
              <input 
                type="tel" 
                id="phoneNumber" 
                formControlName="phoneNumber" 
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="address">Địa chỉ</label>
            <textarea 
              id="address" 
              formControlName="address" 
              class="form-control" 
              rows="2"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="dateOfBirth">Ngày sinh</label>
              <input 
                type="date" 
                id="dateOfBirth" 
                formControlName="dateOfBirth" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="gender">Giới tính</label>
              <select id="gender" formControlName="gender" class="form-control">
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="jobTitle">Chức danh</label>
            <input 
              type="text" 
              id="jobTitle" 
              formControlName="jobTitle" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="bio">Mô tả về bản thân</label>
            <textarea 
              id="bio" 
              formControlName="bio" 
              class="form-control" 
              rows="3"
              placeholder="Giới thiệu ngắn về bản thân..."
            ></textarea>
          </div>

          <!-- Social Media Links -->
          <div class="section-title">
            <h3>Liên kết mạng xã hội</h3>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="website">Website</label>
              <input 
                type="url" 
                id="website" 
                formControlName="website" 
                class="form-control"
                placeholder="https://example.com"
              />
            </div>

            <div class="form-group">
              <label for="linkedin">LinkedIn</label>
              <input 
                type="text" 
                id="linkedin" 
                formControlName="linkedin" 
                class="form-control"
                placeholder="linkedin.com/in/username"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="facebook">Facebook</label>
              <input 
                type="text" 
                id="facebook" 
                formControlName="facebook" 
                class="form-control"
                placeholder="facebook.com/username"
              />
            </div>

            <div class="form-group">
              <label for="twitter">Twitter</label>
              <input 
                type="text" 
                id="twitter" 
                formControlName="twitter" 
                class="form-control"
                placeholder="@username"
              />
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="section-title">
            <h3>Cài đặt thông báo</h3>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="emailNotifications"
                />
                <span class="checkmark"></span>
                Nhận thông báo qua email
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="pushNotifications"
                />
                <span class="checkmark"></span>
                Nhận thông báo push
              </label>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="isProfilePublic"
              />
              <span class="checkmark"></span>
              Cho phép hiển thị thông tin công khai
            </label>
          </div>

          <!-- Submit Buttons -->
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="profileForm.invalid || isSubmitting"
            >
              <img *ngIf="!isSubmitting" src="/icons/save.svg" alt="Save">
              <span *ngIf="isSubmitting">Đang cập nhật...</span>
              <span *ngIf="!isSubmitting">Cập nhật Profile</span>
            </button>
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="resetForm()"
            >
              <img src="/icons/refresh.svg" alt="Reset">
              <span>Đặt lại</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Đang tải thông tin profile...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <img src="/icons/error.svg" alt="Error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadProfile()">
          <img src="/icons/refresh.svg" alt="Retry">
          <span>Thử lại</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      margin: 0 auto;
    }

    .avatar-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .avatar-container {
      position: relative;
      display: inline-block;
    }

    .avatar-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-background-primary);
      box-shadow: var(--shadow-default);
      background-color: var(--color-background-secondary);
    }

    .avatar-overlay {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .avatar-container:hover .avatar-overlay {
      opacity: 1;
    }

    .profile-form {
      background: var(--color-background-primary);
      padding: 32px;
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
      background-color: var(--color-background-primary);
    }

    .form-control.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px color-mix(in srgb, #ef4444 20%, transparent);
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 6px;
      font-weight: 500;
    }

    .section-title {
      margin: 32px 0 24px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .section-title h3 {
      color: var(--color-text-primary);
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .checkbox-group {
      margin-bottom: 15px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .checkbox-label input[type="checkbox"] {
      margin-right: 12px;
      width: 16px;
      height: 16px;
      accent-color: var(--color-primary);
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--color-border);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
      justify-content: center;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
      transform: translateY(-1px);
      box-shadow: var(--shadow-default);
    }

    .btn-primary:disabled {
      background: var(--color-background-secondary);
      color: var(--color-text-secondary);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-secondary {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-background-primary);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: var(--shadow-default);
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 12px;
      min-width: auto;
    }

    .btn img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
    }

    .btn-secondary img {
      filter: brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
    }

    .btn-secondary:hover img {
      filter: brightness(0) saturate(100%) invert(27%) sepia(87%) saturate(5091%) hue-rotate(202deg) brightness(94%) contrast(101%);
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-background-primary);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-default);
    }

    .spinner {
      border: 4px solid var(--color-background-secondary);
      border-top: 4px solid var(--color-primary);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    .error-state img {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      opacity: 0.6;
    }

    .error-state p {
      color: var(--color-text-secondary);
      margin-bottom: 16px;
      font-size: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
        gap: 12px;
      }

      .btn {
        min-width: auto;
        width: 100%;
      }

      .profile-form {
        padding: 24px 16px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  profile: IUser | null = null;
  profileForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;

  ngOnInit() {
    this.initForm();
    this.loadProfile();
  }

  private initForm() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
      dateOfBirth: [''],
      gender: [''],
      jobTitle: [''],
      bio: [''],
      website: [''],
      linkedin: [''],
      facebook: [''],
      twitter: [''],
      emailNotifications: [true],
      pushNotifications: [true],
      isProfilePublic: [true]
    });
  }

  loadProfile() {
    this.isLoading = true;
    this.error = null;

    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.populateForm(profile);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải thông tin profile';
        this.isLoading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  private populateForm(profile: IUser) {
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || '',
      dateOfBirth: profile.dateOfBirth || '',
      gender: profile.gender || '',
      jobTitle: profile.jobTitle || '',
      bio: profile.bio || '',
      website: profile.website || '',
      linkedin: profile.linkedin || '',
      facebook: profile.facebook || '',
      twitter: profile.twitter || '',
      emailNotifications: profile.emailNotifications ?? true,
      pushNotifications: profile.pushNotifications ?? true,
      isProfilePublic: profile.isProfilePublic ?? true
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.profileForm.value as IUpdateProfileInput;

    this.profileService.updateProfile(formData).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Thành công', 'Cập nhật profile thành công!');
        this.profile = response.data || null;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi cập nhật profile');
        this.isSubmitting = false;
        console.error('Error updating profile:', error);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File) {
    this.profileService.uploadAvatar(file).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Thành công', 'Upload avatar thành công!');
        this.profile = response.data || null;
      },
      error: (error) => {
        this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi upload avatar');
        console.error('Error uploading avatar:', error);
      }
    });
  }

  removeAvatar() {
    if (confirm('Bạn có chắc chắn muốn xóa avatar?')) {
      this.profileService.removeAvatar().subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Thành công', 'Xóa avatar thành công!');
          this.profile = response.data || null;
        },
        error: (error) => {
          this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi xóa avatar');
          console.error('Error removing avatar:', error);
        }
      });
    }
  }

  resetForm() {
    if (this.profile) {
      this.populateForm(this.profile);
    }
  }
}
