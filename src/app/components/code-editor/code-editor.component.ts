import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodeCompletionService } from '../../services/code-completion.service';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <div class="toolbar">
        <select 
          [ngModel]="selectedLanguage()" 
          (ngModelChange)="setLanguage($event)"
          class="language-select">
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="python">Python</option>
        </select>
        <button 
          [disabled]="isLoading()" 
          (click)="requestCompletion()"
          class="completion-button">
          {{ isLoading() ? 'Getting Suggestions...' : 'Get AI Suggestions' }}
        </button>
      </div>

      <div class="editor-panes">
        <div class="editor-pane">
          <div class="line-numbers">
            {{ lineNumbers }}
          </div>
          <textarea
            [ngModel]="code()"
            (ngModelChange)="onCodeChange($event)"
            class="code-textarea"
            spellcheck="false"
            placeholder="Start coding here..."
          ></textarea>
        </div>
        <div class="suggestions-pane">
          <h3>AI Suggestions</h3>
          <pre>{{ suggestions() || 'AI suggestions will appear here...' }}</pre>
        </div>
      </div>

      @if (error()) {
        <div class="error-container">
          <div class="error-message">
            {{ error() }}
            <button 
              (click)="dismissError()" 
              class="dismiss-button">
              Dismiss
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .editor-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      padding: 1rem;
      gap: 1rem;
      background-color: #1e1e1e;
      color: #fff;
    }

    .toolbar {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding: 0.5rem;
      background: #252525;
      border-radius: 4px;
    }

    .language-select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #3c3c3c;
      background: #2d2d2d;
      color: #fff;
      font-size: 14px;
      outline: none;
      cursor: pointer;

      &:focus {
        border-color: #0078d4;
      }

      option {
        background: #2d2d2d;
        color: #fff;
      }
    }

    .editor-panes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      flex: 1;
      min-height: 0;
    }

    .editor-pane {
      position: relative;
      border: 1px solid #3c3c3c;
      border-radius: 4px;
      overflow: hidden;
      background: #1e1e1e;
    }

    .line-numbers {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3rem;
      padding: 1rem 0.5rem;
      background: #252525;
      border-right: 1px solid #3c3c3c;
      color: #858585;
      font-family: 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.5;
      text-align: right;
      user-select: none;
      pointer-events: none;
    }

    .code-textarea {
      width: 100%;
      height: 100%;
      padding: 1rem 0.5rem 1rem 3.5rem;
      background: transparent;
      color: #d4d4d4;
      border: none;
      resize: none;
      font-family: 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.5;
      tab-size: 2;

      &:focus {
        outline: none;
      }

      &::placeholder {
        color: #6e6e6e;
      }
    }

    .suggestions-pane {
      padding: 1rem;
      background: #252525;
      border: 1px solid #3c3c3c;
      border-radius: 4px;
      overflow: auto;

      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #fff;
        font-size: 16px;
        font-weight: 500;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        font-family: 'Consolas', monospace;
        font-size: 14px;
        line-height: 1.5;
        color: #d4d4d4;
      }
    }

    .error-container {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      z-index: 1000;
    }

    .error-message {
      color: #f14c4c;
      padding: 1rem;
      background: rgba(50, 0, 0, 0.95);
      border: 1px solid #ff0000;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(4px);
    }

    .dismiss-button {
      padding: 0.25rem 0.75rem;
      background: transparent;
      color: #f14c4c;
      border: 1px solid #f14c4c;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-left: 1rem;

      &:hover {
        background: rgba(241, 76, 76, 0.1);
      }
    }

    .completion-button {
      padding: 0.5rem 1rem;
      background: #0078d4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;

      &:disabled {
        background: #404040;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        background: #006cbd;
      }
    }
  `]
})
export class CodeEditorComponent {
  private readonly codeCompletionService = inject(CodeCompletionService);

  selectedLanguage = signal<string>('typescript');
  code = signal<string>('');
  suggestions = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string>('');

  get lineNumbers(): string {
    const lines = (this.code() || '').split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  }

  setLanguage(language: string) {
    this.selectedLanguage.set(language);
  }

  onCodeChange(value: string) {
    this.code.set(value);
  }

  dismissError() {
    this.error.set('');
  }

  requestCompletion() {
    if (!this.code()) {
      this.error.set('Please enter some code before requesting suggestions.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.suggestions.set('');

    this.codeCompletionService
      .getCodeStream({
        code: this.code(),
        language: this.selectedLanguage()
      })
      .subscribe({
        next: (content) => {
          this.suggestions.update(prev => prev + content);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to get AI suggestions. Please try again.');
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }
}