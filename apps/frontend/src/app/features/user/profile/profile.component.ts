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
      <div class="profile-header">
        <h1>Quản lý Profile</h1>
        <p>Cập nhật thông tin cá nhân và cài đặt tài khoản</p>
      </div>

      <div class="profile-content" *ngIf="profile">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-container">
            <img 
              [src]="profile.avatar || '/assets/images/default-avatar.png'" 
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
                <i class="fas fa-camera"></i> Thay đổi
              </button>
              <button 
                type="button" 
                class="btn btn-danger btn-sm" 
                (click)="removeAvatar()"
                *ngIf="profile.avatar"
              >
                <i class="fas fa-trash"></i> Xóa
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
              <span *ngIf="isSubmitting">Đang cập nhật...</span>
              <span *ngIf="!isSubmitting">Cập nhật Profile</span>
            </button>
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="resetForm()"
            >
              Đặt lại
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
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadProfile()">Thử lại</button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .profile-header h1 {
      color: #333;
      margin-bottom: 10px;
    }

    .profile-header p {
      color: #666;
      font-size: 16px;
    }

    .avatar-section {
      text-align: center;
      margin-bottom: 30px;
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
      border: 3px solid #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .avatar-overlay {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 5px;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .avatar-container:hover .avatar-overlay {
      opacity: 1;
    }

    .profile-form {
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    .section-title {
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .section-title h3 {
      color: #333;
      margin: 0;
      font-size: 18px;
    }

    .checkbox-group {
      margin-bottom: 15px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox-label input[type="checkbox"] {
      margin-right: 10px;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
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
