import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { CodeRequest, CodeResponse, CodeStreamResponse } from '../interfaces/code.interface';

@Injectable({
  providedIn: 'root'
})
export class CodeCompletionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCodeStream(request: CodeRequest): Observable<string> {
    return new Observable(observer => {
      const eventSource = new EventSource(
        `${this.apiUrl}/api/complete-code-stream?code=${encodeURIComponent(request.code)}&language=${request.language}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as CodeStreamResponse;
          observer.next(data.content);
        } catch (error) {
          observer.error(new Error('Failed to parse server response'));
        }
      };

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    });
  }

  completeCode(request: CodeRequest): Observable<CodeResponse> {
    return this.http.post<CodeResponse>(`${this.apiUrl}/api/complete-code`, request)
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => new Error(error.message || 'An error occurred'));
        })
      );
  }
}