// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { ConnectionTestComponent } from './components/connection-test/connection-test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CodeEditorComponent, ConnectionTestComponent],
  template: `
    <app-connection-test></app-connection-test>
    <app-code-editor></app-code-editor>
  `
})
export class AppComponent {
  title = 'ai-code-editor';
}