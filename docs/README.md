# TDMU Dispatch - Documentation

Thư mục này chứa tất cả tài liệu liên quan đến dự án TDMU Dispatch.

## Cấu trúc thư mục

### 📋 00-intro/
Tài liệu giới thiệu và tổng quan dự án
- `project-overview.md` - Tổng quan dự án
- `domain-knowledge.md` - Kiến thức domain
- `tdmu-document-workflow.md` - Quy trình xử lý tài liệu TDMU
- `team-members.md` - Thông tin thành viên nhóm

### 📝 01-requirements/
Yêu cầu chức năng và phi chức năng
- `functional-requirements.md` - Yêu cầu chức năng
- `non-functional.md` - Yêu cầu phi chức năng

### 🎨 02-design/
Thiết kế hệ thống
- `system-architecture.md` - Kiến trúc hệ thống
- `api-specs.md` - Đặc tả API
- `database-schema.png` - Sơ đồ cơ sở dữ liệu
- `tdmu-color-palettes.md` - Bảng màu TDMU

### 🔧 03-development/
Tài liệu phát triển

#### guides/
Hướng dẫn phát triển
- `comprehensive-seeder-guide.md` - Hướng dẫn seeder
- `debug-instructions.md` - Hướng dẫn debug
- `workflow-system-guide.md` - Hướng dẫn workflow
- `workflow-routing-guide.md` - Hướng dẫn routing workflow
- `workflow-completion-guide.md` - Hướng dẫn hoàn thành workflow
- `workflow-example-usage.md` - Ví dụ sử dụng workflow
- `task-assignment-setup-guide.md` - Hướng dẫn setup task assignment
- `task-assignment-testing-guide.md` - Hướng dẫn test task assignment
- `document-update-debug-guide.md` - Hướng dẫn debug document update
- `comprehensive-seeder-summary.md` - Tóm tắt seeder
- `SEED_SYSTEM_SUMMARY.md` - Tóm tắt hệ thống seed
- `database-migration-currentStepId-nullable.md` - Migration database

#### bug-fixes/
Tài liệu sửa lỗi
- `AUTH_LOOP_FIX_SUMMARY.md` - Sửa lỗi auth loop
- `AUTHENTICATION_FLOW_FIX.md` - Sửa lỗi authentication flow
- `TOKEN_VALIDATION_FIX.md` - Sửa lỗi token validation
- `CIRCULAR_DEPENDENCY_FIX.md` - Sửa lỗi circular dependency
- `LOGOUT_FIX_SUMMARY.md` - Sửa lỗi logout
- `FIRST_LOGIN_FLOW_FIX_SUMMARY.md` - Sửa lỗi first login flow
- `FIRST_LOGIN_FLOW_ISSUE.md` - Vấn đề first login flow
- `all-documents-linter-fixes.md` - Sửa lỗi linter all documents
- `bug-fixes-summary.md` - Tóm tắt bug fixes
- `document-category-fix-summary.md` - Sửa lỗi document category
- `file-upload-fix-summary.md` - Sửa lỗi file upload
- `fileId-save-fix-summary.md` - Sửa lỗi fileId save
- `filename-encoding-fix.md` - Sửa lỗi filename encoding
- `frontend-build-fix.md` - Sửa lỗi frontend build
- `graphql-context-error-fix.md` - Sửa lỗi GraphQL context
- `graphql-nullable-fields-fix.md` - Sửa lỗi GraphQL nullable fields
- `graphql-output-type-fix.md` - Sửa lỗi GraphQL output type
- `graphql-workflow-templates-fix.md` - Sửa lỗi GraphQL workflow templates
- `permission-workflow-fixes.md` - Sửa lỗi permission workflow
- `typescript-errors-fix.md` - Sửa lỗi TypeScript
- `typescript-errors-fix-guide.md` - Hướng dẫn sửa lỗi TypeScript
- `workflow-database-update-error-fix.md` - Sửa lỗi workflow database update
- `workflow-error-fix.md` - Sửa lỗi workflow
- `workflow-instanceid-null-error-fix.md` - Sửa lỗi workflow instanceId null
- `workflow-instanceId-null-fix.md` - Sửa lỗi workflow instanceId null
- `workflow-update-debug-complete.md` - Hoàn thành debug workflow update

#### features/
Tài liệu tính năng
- `all-documents-feature.md` - Tính năng all documents
- `pending-documents-feature.md` - Tính năng pending documents
- `document-processing-feature.md` - Tính năng xử lý tài liệu
- `document-processing-features-complete.md` - Hoàn thành tính năng xử lý tài liệu
- `document-processing-complete.md` - Hoàn thành xử lý tài liệu
- `business-logic-improvements.md` - Cải tiến business logic
- `document-creation-permissions.md` - Quyền tạo tài liệu
- `document-edit-function-review.md` - Review chức năng edit tài liệu
- `document-processing-enhancements.md` - Cải tiến xử lý tài liệu
- `document-processing-navigation-integration.md` - Tích hợp navigation xử lý tài liệu
- `document-processing-sql-fix.md` - Sửa lỗi SQL xử lý tài liệu
- `document-processing-ui-refactor.md` - Refactor UI xử lý tài liệu
- `document-update-improvement-checklist.md` - Checklist cải tiến update tài liệu
- `document-update-issue-fix.md` - Sửa lỗi update tài liệu
- `document-workflow-enhancement-guide.md` - Hướng dẫn cải tiến workflow tài liệu
- `document-workflow-integration-fix.md` - Sửa lỗi tích hợp workflow tài liệu
- `file-download-debug.md` - Debug download file
- `final-status.md` - Trạng thái cuối cùng
- `quick-start-task-assignment.md` - Hướng dẫn nhanh task assignment
- `task-assignment-completion-summary.md` - Tóm tắt hoàn thành task assignment
- `task-assignment-routes-integration.md` - Tích hợp routes task assignment
- `ui-sync-admin-user.md` - Đồng bộ UI admin user
- `workflow-database-update-debug.md` - Debug update database workflow
- `workflow-main-layout-integration.md` - Tích hợp main layout workflow
- `workflow-process-change.md` - Thay đổi quy trình workflow
- `workflow-template-selection.md` - Lựa chọn template workflow

#### integration/
Tài liệu tích hợp
- `apollo-graphql-integration-guide.md` - Hướng dẫn tích hợp Apollo GraphQL
- `backend-integration-guide.md` - Hướng dẫn tích hợp backend
- `integration-guide.md` - Hướng dẫn tích hợp
- `integration-completion-summary.md` - Tóm tắt hoàn thành tích hợp

### 📊 04-diagrams/
Sơ đồ và biểu đồ

#### sequence-diagrams/
Sơ đồ tuần tự
- `authentication-sequence.puml` - Sơ đồ tuần tự authentication
- `user-management-sequence.puml` - Sơ đồ tuần tự quản lý user
- `workflow-sequence.puml` - Sơ đồ tuần tự workflow
- `document-management-sequence.puml` - Sơ đồ tuần tự quản lý tài liệu
- `approval-sequence.puml` - Sơ đồ tuần tự approval
- `notification-sequence.puml` - Sơ đồ tuần tự notification
- `authentication-sequence-description.md` - Mô tả sơ đồ authentication
- `user-management-description.md` - Mô tả sơ đồ quản lý user
- `workflow-description.md` - Mô tả sơ đồ workflow
- `document-management-description.md` - Mô tả sơ đồ quản lý tài liệu
- `approval-description.md` - Mô tả sơ đồ approval
- `notification-description.md` - Mô tả sơ đồ notification
- `summary-sequence-diagrams.md` - Tóm tắt sơ đồ tuần tự
- `README-sequence-diagrams.md` - README sơ đồ tuần tự

#### use-case-diagrams/
Sơ đồ use case
- `use-case-diagram.puml` - Sơ đồ use case
- `use-case-diagram.md` - Mô tả sơ đồ use case
- `use-case-summary.md` - Tóm tắt use case
- `README-use-case-diagrams.md` - README sơ đồ use case

## Cách sử dụng

1. **Tìm hiểu dự án**: Bắt đầu từ thư mục `00-intro/`
2. **Xem yêu cầu**: Tham khảo `01-requirements/`
3. **Hiểu thiết kế**: Đọc `02-design/`
4. **Phát triển**: Sử dụng `03-development/` theo nhu cầu
5. **Xem sơ đồ**: Tham khảo `04-diagrams/`

## Quy ước đặt tên

- File markdown: `kebab-case.md`
- File PlantUML: `kebab-case.puml`
- Thư mục: `kebab-case/`
- Tên file mô tả rõ ràng chức năng hoặc nội dung
