import { Component, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { UserState } from '../../core/state/user.state';
import { IUser } from '../../core/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { AppsLauncher } from '../components/apps-launcher/apps-launcher';
import { AuthService } from '../../core/services/auth.service';
import { FileService } from '../../core/services/file.service';
import { WorkflowApolloService } from '../../features/user/workflow/services/workflow-apollo.service';
import { DocumentProcessingApolloService } from '../../features/user/document-processing/services/document-processing-apollo.service';
import { TaskAssignmentService } from '../../core/services/dispatch/task-assignment.service';
import { TaskRequestService } from '../../core/services/dispatch/task-request.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppsLauncher],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit, OnDestroy {
  isDarkMode = false;
  currentUser: IUser | null = null

  isAppsLauncherOpen = false

  avatarUrl: string | null = null
  pendingWorkflowCount = 0;
  pendingDocumentCount = 0;
  pendingTaskCount = 0;
  private subscriptions = new Subscription();
  constructor(
    private renderer: Renderer2,
    private userState: UserState,
    private authService: AuthService,
    private router: Router,
    private fileService: FileService,
    private workflowApolloService: WorkflowApolloService,
    private documentProcessingApolloService: DocumentProcessingApolloService,
    private taskAssignmentService: TaskAssignmentService,
    private taskRequestService: TaskRequestService
  ) {
    const storedTheme = localStorage.getItem('theme');
    this.isDarkMode = storedTheme === 'dark';
    this.updateThemeClass();

    this.subscriptions.add(
      this.userState.user$.subscribe(async user => {
        this.currentUser = user;

        if (user && user.avatarFileId) {
          this.avatarUrl = await this.fileService.getFileUrl(user.avatarFileId);
          console.log(this.avatarUrl)
        } else {
          this.avatarUrl = null;
        }
      })
    );
  }

  ngOnInit(): void {
    this.loadPendingWorkflowCount();
    this.loadPendingDocumentCount();
    this.loadPendingTaskCount();
    
    // Auto-refresh pending counts every 30 seconds
    setInterval(() => {
      this.loadPendingWorkflowCount();
      this.loadPendingDocumentCount();
      this.loadPendingTaskCount();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadPendingWorkflowCount(): void {
    this.subscriptions.add(
      this.workflowApolloService.getMyPendingWorkflows().subscribe({
        next: (workflows) => {
          this.pendingWorkflowCount = workflows.length;
        },
        error: (error) => {
          console.error('Error loading pending workflows:', error);
          this.pendingWorkflowCount = 0;
        }
      })
    );
  }

  private loadPendingDocumentCount(): void {
    this.subscriptions.add(
      this.documentProcessingApolloService.getPendingDocumentCount().subscribe({
        next: (count) => {
          this.pendingDocumentCount = count;
        },
        error: (error) => {
          console.error('Error loading pending document count:', error);
          this.pendingDocumentCount = 0;
        }
      })
    );
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateThemeClass();
  }

  toggleAppsLauncher() {
    this.isAppsLauncherOpen = !this.isAppsLauncherOpen;
  }

  private updateThemeClass() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.documentElement, 'dark-mode');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark-mode');
    }
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: response => {
        this.router.navigate(['auth'])
      }
    })
  }

  refreshPendingWorkflowCount(): void {
    this.loadPendingWorkflowCount();
  }

  refreshPendingDocumentCount(): void {
    this.loadPendingDocumentCount();
  }

  refreshTaskCount(): void {
    this.loadPendingTaskCount();
  }

  navigateToTaskManagement(): void {
    this.router.navigate(['/task-management']);
  }

  navigateToDocumentForm(): void {
    // TODO: Navigate to document form or create modal
    console.log('Navigate to document form');
    alert('Tính năng tạo văn bản sẽ được triển khai sau.');
  }

  private loadPendingTaskCount(): void {
    this.subscriptions.add(
      this.taskRequestService.getMyTaskRequests().subscribe({
        next: (tasks) => {
          // Count only pending task requests
          this.pendingTaskCount = tasks.filter(task => 
            task.status === 'PENDING'
          ).length;
        },
        error: (error) => {
          console.error('Error loading pending task count:', error);
          this.pendingTaskCount = 0;
        }
      })
    );
  }
}
