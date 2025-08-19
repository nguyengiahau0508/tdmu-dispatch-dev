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
    <div class="profile">
      <div class="profile__content" *ngIf="profile">
        <!-- Avatar Section -->
        <div class="profile__avatar-section">
          <div class="avatar-container">
            <div class="avatar-wrapper">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  Thay đổi
                </button>
                <button 
                  type="button" 
                  class="btn btn-danger btn-sm" 
                  (click)="removeAvatar()"
                  *ngIf="profile.avatar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                  </svg>
                  Xóa
                </button>
              </div>
            </div>
            <div class="avatar-info">
              <h3>{{ profile.fullName }}</h3>
              <p>{{ profile.email }}</p>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile__form">
          <div class="form-section">
            <h4 class="form-section__title">Thông tin cá nhân</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="form-group__label">
                  Họ <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="firstName" 
                  formControlName="firstName" 
                  class="form-group__input"
                  [class.error]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                />
                @if (profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched) {
                  <div class="form-group__error">Họ là bắt buộc</div>
                }
              </div>

              <div class="form-group">
                <label for="lastName" class="form-group__label">
                  Tên <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="lastName" 
                  formControlName="lastName" 
                  class="form-group__input"
                  [class.error]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                />
                @if (profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched) {
                  <div class="form-group__error">Tên là bắt buộc</div>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email" class="form-group__label">
                  Email <span class="required">*</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email" 
                  class="form-group__input"
                  [class.error]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                />
                @if (profileForm.get('email')?.invalid && profileForm.get('email')?.touched) {
                  <div class="form-group__error">Email không hợp lệ</div>
                }
              </div>

              <div class="form-group">
                <label for="phoneNumber" class="form-group__label">Số điện thoại</label>
                <input 
                  type="tel" 
                  id="phoneNumber" 
                  formControlName="phoneNumber" 
                  class="form-group__input"
                  placeholder="0123456789"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="address" class="form-group__label">Địa chỉ</label>
              <textarea 
                id="address" 
                formControlName="address" 
                class="form-group__textarea" 
                rows="2"
                placeholder="Nhập địa chỉ của bạn..."
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="dateOfBirth" class="form-group__label">Ngày sinh</label>
                <input 
                  type="date" 
                  id="dateOfBirth" 
                  formControlName="dateOfBirth" 
                  class="form-group__input"
                />
              </div>

              <div class="form-group">
                <label for="gender" class="form-group__label">Giới tính</label>
                <select id="gender" formControlName="gender" class="form-group__select">
                  <option value="">Chọn giới tính</option>
                  <option value="male">👨 Nam</option>
                  <option value="female">👩 Nữ</option>
                  <option value="other">🤷 Khác</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="jobTitle" class="form-group__label">Chức danh</label>
              <input 
                type="text" 
                id="jobTitle" 
                formControlName="jobTitle" 
                class="form-group__input"
                placeholder="Nhập chức danh công việc..."
              />
            </div>

            <div class="form-group">
              <label for="bio" class="form-group__label">Mô tả về bản thân</label>
              <textarea 
                id="bio" 
                formControlName="bio" 
                class="form-group__textarea" 
                rows="3"
                placeholder="Giới thiệu ngắn về bản thân..."
              ></textarea>
              <div class="form-group__help">Mô tả ngắn gọn về bản thân, kinh nghiệm và sở thích</div>
            </div>
          </div>

          <!-- Social Media Links -->
          <div class="form-section">
            <h4 class="form-section__title">Liên kết mạng xã hội</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label for="website" class="form-group__label">Website</label>
                <input 
                  type="url" 
                  id="website" 
                  formControlName="website" 
                  class="form-group__input"
                  placeholder="https://example.com"
                />
              </div>

              <div class="form-group">
                <label for="linkedin" class="form-group__label">LinkedIn</label>
                <input 
                  type="text" 
                  id="linkedin" 
                  formControlName="linkedin" 
                  class="form-group__input"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="facebook" class="form-group__label">Facebook</label>
                <input 
                  type="text" 
                  id="facebook" 
                  formControlName="facebook" 
                  class="form-group__input"
                  placeholder="facebook.com/username"
                />
              </div>

              <div class="form-group">
                <label for="twitter" class="form-group__label">Twitter</label>
                <input 
                  type="text" 
                  id="twitter" 
                  formControlName="twitter" 
                  class="form-group__input"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="form-section">
            <h4 class="form-section__title">Cài đặt thông báo</h4>
            
            <div class="form-row">
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="emailNotifications"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">Nhận thông báo qua email</span>
                </label>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="pushNotifications"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">Nhận thông báo push</span>
                </label>
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="isProfilePublic"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">Cho phép hiển thị thông tin công khai</span>
              </label>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="profile__actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="profileForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
                <div class="loading-spinner"></div>
              }
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                <polyline points="7,3 7,8 15,8"></polyline>
              </svg>
              {{ isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Profile' }}
            </button>
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="resetForm()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1,4 1,10 7,10"></polyline>
                <polyline points="23,20 23,14 17,14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              Đặt lại
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading__spinner"></div>
        <p>Đang tải thông tin profile...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadProfile()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1,4 1,10 7,10"></polyline>
            <polyline points="23,20 23,14 17,14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          Thử lại
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Container ===== */
    .profile {
      max-width: 800px;
      margin: 0 auto;
    }

    /* ===== Avatar Section ===== */
    .profile__avatar-section {
      text-align: center;
      margin-bottom: 2rem;
      background: var(--color-background-primary);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .avatar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .avatar-wrapper {
      position: relative;
      display: inline-block;
    }

    .avatar-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--color-background-primary);
      box-shadow: var(--shadow-default);
      background-color: var(--color-background-secondary);
      transition: all 0.3s ease;
    }

    .avatar-overlay {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .avatar-wrapper:hover .avatar-overlay {
      opacity: 1;
    }

    .avatar-wrapper:hover .avatar-image {
      transform: scale(1.05);
    }

    .avatar-info h3 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .avatar-info p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 1rem;
    }

    /* ===== Form ===== */
    .profile__form {
      background: var(--color-background-primary);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    /* ===== Form Sections ===== */
    .form-section {
      margin-bottom: 2rem;
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .form-section__title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--color-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-section__title::before {
      content: '';
      width: 4px;
      height: 1.1rem;
      background: var(--color-primary);
      border-radius: 2px;
    }

    /* ===== Form Groups ===== */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group__label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .required {
      color: #dc2626;
      font-weight: 600;
    }

    .form-group__input,
    .form-group__select,
    .form-group__textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .form-group__input:focus,
    .form-group__select:focus,
    .form-group__textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
      background-color: var(--color-background-primary);
    }

    .form-group__input.error,
    .form-group__select.error {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px color-mix(in srgb, #dc2626 25%, transparent);
    }

    .form-group__textarea {
      resize: vertical;
      min-height: 100px;
      font-family: inherit;
    }

    .form-group__error {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .form-group__error::before {
      content: '⚠️';
      font-size: 0.75rem;
    }

    .form-group__help {
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      margin-top: 0.25rem;
      font-style: italic;
    }

    /* ===== Form Row ===== */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* ===== Checkbox Groups ===== */
    .checkbox-group {
      margin-bottom: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 0.9rem;
      gap: 0.75rem;
    }

    .checkbox-label input[type="checkbox"] {
      display: none;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-background-secondary);
      position: relative;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .checkbox-text {
      flex: 1;
    }

    /* ===== Actions ===== */
    .profile__actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);
    }

    /* ===== Buttons ===== */
    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 90%, black);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 40%, transparent);
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }

    .btn-secondary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-text-secondary) 90%, black);
      transform: translateY(-1px);
    }

    .btn-danger {
      background: #ef4444;
      color: white;
      box-shadow: 0 2px 4px color-mix(in srgb, #ef4444 30%, transparent);
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, #ef4444 40%, transparent);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    /* ===== Loading Spinner ===== */
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* ===== Loading State ===== */
    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .loading__spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--color-background-secondary);
      border-top: 4px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    .loading-state p {
      color: var(--color-text-secondary);
      font-size: 1rem;
      margin: 0;
    }

    /* ===== Error State ===== */
    .error-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .error-state svg {
      color: #dc2626;
      opacity: 0.6;
      margin-bottom: 1rem;
    }

    .error-state p {
      color: var(--color-text-secondary);
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 768px) {
      .profile__avatar-section {
        padding: 1.5rem;
      }

      .profile__form {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .profile__actions {
        flex-direction: column;
        gap: 0.75rem;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .avatar-overlay {
        opacity: 1;
        position: static;
        transform: none;
        margin-top: 1rem;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .profile__avatar-section {
        padding: 1rem;
      }

      .profile__form {
        padding: 1rem;
      }

      .avatar-image {
        width: 100px;
        height: 100px;
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
