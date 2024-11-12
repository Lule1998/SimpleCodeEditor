export interface CodeRequest {
    code: string;
    language: string;
  }
  
  export interface CodeResponse {
    suggestions: string;
    error?: string;
  }
  
  export interface CodeStreamResponse {
    content: string;
  }