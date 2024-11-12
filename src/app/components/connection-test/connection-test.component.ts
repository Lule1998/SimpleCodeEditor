import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-connection-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-test">
      <button (click)="testConnection()" [disabled]="isLoading()">
        {{ isLoading() ? 'Testing...' : 'Test Backend Connection' }}
      </button>
      
      @if (error()) {
        <div class="error">
          {{ error() }}
        </div>
      }
      
      @if (result()) {
        <div class="success">
          {{ result() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .connection-test {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      background: #0078d4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background: #404040;
        cursor: not-allowed;
      }
    }

    .error {
      color: #f14c4c;
      padding: 1rem;
      background: rgba(50, 0, 0, 0.95);
      border: 1px solid #ff0000;
      border-radius: 4px;
    }

    .success {
      color: #4caf50;
      padding: 1rem;
      background: rgba(0, 50, 0, 0.95);
      border: 1px solid #4caf50;
      border-radius: 4px;
    }
  `]
})
export class ConnectionTestComponent {
  private http = inject(HttpClient);
  
  isLoading = signal(false);
  error = signal('');
  result = signal('');

  testConnection() {
    this.isLoading.set(true);
    this.error.set('');
    this.result.set('');

    this.http.get(`${environment.apiUrl}/api/test`)
      .subscribe({
        next: (response: any) => {
          this.result.set(response.message);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(`Failed to connect to backend: ${err.message}`);
          this.isLoading.set(false);
        }
      });
  }
}