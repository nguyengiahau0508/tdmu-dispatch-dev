# Contributing to TDMU Dispatch

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án TDMU Dispatch! Tài liệu này sẽ hướng dẫn bạn cách đóng góp một cách hiệu quả.

## 📋 Mục lục

- [Code of Conduct](#code-of-conduct)
- [Cách đóng góp](#cách-đóng-góp)
- [Quy trình phát triển](#quy-trình-phát-triển)
- [Quy ước code](#quy-ước-code)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Request](#pull-request)
- [Báo cáo lỗi](#báo-cáo-lỗi)
- [Yêu cầu tính năng](#yêu-cầu-tính-năng)

## 🤝 Code of Conduct

Dự án này tuân thủ [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Bằng cách tham gia, bạn đồng ý tuân thủ các quy tắc này.

## 🚀 Cách đóng góp

### Báo cáo lỗi

1. **Kiểm tra Issues hiện có** để tránh trùng lặp
2. **Sử dụng template** báo cáo lỗi
3. **Cung cấp thông tin chi tiết**:
   - Mô tả lỗi
   - Các bước tái hiện
   - Kết quả mong đợi
   - Screenshots (nếu có)
   - Thông tin môi trường

### Yêu cầu tính năng

1. **Mô tả rõ ràng** tính năng mong muốn
2. **Giải thích lý do** tại sao cần tính năng này
3. **Đề xuất cách triển khai** (nếu có thể)
4. **Thảo luận** với team trước khi implement

### Đóng góp code

1. **Fork** repository
2. **Clone** về máy local
3. **Tạo branch** mới cho feature/fix
4. **Implement** thay đổi
5. **Test** kỹ lưỡng
6. **Commit** với message rõ ràng
7. **Push** và tạo Pull Request

## 🔄 Quy trình phát triển

### 1. Setup môi trường

```bash
# Fork và clone repository
git clone https://github.com/YOUR_USERNAME/tdmu-dispatch-dev.git
cd tdmu-dispatch-dev

# Cài đặt dependencies
npm install
cd apps/backend && npm install
cd ../frontend && npm install

# Cấu hình môi trường
cp .env.example .env
# Chỉnh sửa .env theo hướng dẫn
```

### 2. Tạo branch mới

```bash
# Đảm bảo main branch up-to-date
git checkout main
git pull origin main

# Tạo branch mới
git checkout -b feature/your-feature-name
# hoặc
git checkout -b fix/your-bug-fix
```

### 3. Phát triển

- **Tuân thủ quy ước code** (xem phần dưới)
- **Viết tests** cho code mới
- **Cập nhật documentation** nếu cần
- **Commit thường xuyên** với message rõ ràng

### 4. Testing

```bash
# Backend tests
cd apps/backend
npm run test
npm run test:e2e

# Frontend tests
cd apps/frontend
npm test

# Linting
npm run lint
```

### 5. Pull Request

- **Mô tả rõ ràng** thay đổi
- **Liên kết Issues** liên quan
- **Cung cấp screenshots** nếu có UI changes
- **Đảm bảo CI/CD pass**

## 📝 Quy ước code

### TypeScript/JavaScript

#### Naming Conventions
```typescript
// Variables và functions: camelCase
const userName = 'John';
function getUserData() { }

// Classes và Interfaces: PascalCase
class UserService { }
interface UserData { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Files: kebab-case
user-profile.component.ts
auth.service.ts
```

#### Code Style
```typescript
// Sử dụng TypeScript strict mode
// Luôn định nghĩa types
interface User {
  id: number;
  name: string;
  email: string;
}

// Sử dụng async/await thay vì Promises
async function fetchUser(id: number): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

// Sử dụng destructuring
const { name, email } = user;

// Sử dụng optional chaining
const userName = user?.profile?.name;
```

### Angular (Frontend)

#### Component Structure
```typescript
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  // Properties
  user: User;
  
  // Constructor injection
  constructor(private userService: UserService) {}
  
  // Lifecycle hooks
  ngOnInit(): void {
    this.loadUser();
  }
  
  // Methods
  private loadUser(): void {
    this.userService.getCurrentUser().subscribe(
      user => this.user = user
    );
  }
}
```

#### Service Pattern
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = '/api/users';
  
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
}
```

### NestJS (Backend)

#### Module Structure
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
```

#### Controller Pattern
```typescript
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
  
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}
```

#### Service Pattern
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
  
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }
}
```

## 🧪 Testing

### Backend Testing

#### Unit Tests
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository
        }
      ]
    }).compile();
    
    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should create user', async () => {
    const createUserDto = { name: 'John', email: 'john@example.com' };
    const expectedUser = { id: 1, ...createUserDto };
    
    jest.spyOn(repository, 'create').mockReturnValue(expectedUser);
    jest.spyOn(repository, 'save').mockResolvedValue(expectedUser);
    
    const result = await service.create(createUserDto);
    expect(result).toEqual(expectedUser);
  });
});
```

#### E2E Tests
```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });
});
```

### Frontend Testing

#### Component Tests
```typescript
describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let userService: jasmine.SpyObj<UserService>;
  
  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    
    await TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });
  
  it('should load user on init', () => {
    const mockUser = { id: 1, name: 'John' };
    userService.getCurrentUser.and.returnValue(of(mockUser));
    
    component.ngOnInit();
    
    expect(userService.getCurrentUser).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
  });
});
```

## 💬 Commit Messages

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Formatting, semicolons, etc.
- `refactor`: Refactoring code
- `test`: Thêm tests
- `chore`: Cập nhật build process, etc.

### Examples
```bash
feat(auth): add JWT authentication
fix(user): resolve user profile loading issue
docs(readme): update installation instructions
test(user): add unit tests for UserService
refactor(api): simplify user creation logic
```

## 🔄 Pull Request

### Template
```markdown
## Mô tả
Mô tả ngắn gọn về thay đổi

## Loại thay đổi
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (nếu có)
Thêm screenshots cho UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] No linting errors
```

### Review Process
1. **Self-review** trước khi submit
2. **CI/CD checks** phải pass
3. **Code review** từ maintainers
4. **Address feedback** nếu có
5. **Merge** sau khi approved

## 🐛 Báo cáo lỗi

### Template
```markdown
## Mô tả lỗi
Mô tả rõ ràng về lỗi

## Các bước tái hiện
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Kết quả mong đợi
Mô tả kết quả mong đợi

## Screenshots
Thêm screenshots nếu có

## Môi trường
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]

## Thông tin bổ sung
Thêm thông tin khác nếu cần
```

## 💡 Yêu cầu tính năng

### Template
```markdown
## Mô tả tính năng
Mô tả rõ ràng về tính năng mong muốn

## Lý do
Giải thích tại sao cần tính năng này

## Giải pháp đề xuất
Mô tả cách triển khai (nếu có)

## Alternatives
Các giải pháp thay thế đã xem xét

## Additional context
Thêm context khác nếu cần
```

## 📞 Liên hệ

- **Email**: support@tdmu.edu.vn
- **GitHub Issues**: [Tạo issue mới](https://github.com/your-org/tdmu-dispatch-dev/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/tdmu-dispatch-dev/discussions)

## 🙏 Cảm ơn

Cảm ơn bạn đã đóng góp cho dự án TDMU Dispatch! Mọi đóng góp, dù lớn hay nhỏ, đều rất có giá trị.
