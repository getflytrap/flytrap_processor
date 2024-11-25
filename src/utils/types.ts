export interface CodeContext {
  file: string;
  line: number;
  column: number;
  context: string;
}

export interface ErrorData {
  error: {
    name?: string;
    message?: string;
    stack?: string;
  };
  codeContexts?: CodeContext[];
  handled: boolean;
  timestamp: string;
  project_id: string;
  method?: string;
  path?: string;
  ip?: string;
  os?: string;
  browser?: string;
  runtime?: string;
}

export interface RejectionData {
  value: string | number | boolean | object | null | undefined;
  timestamp: string;
  project_id: string;
  handled: boolean;
  method?: string;
  path?: string;
  ip?: string;
  os?: string;
  browser?: string;
  runtime?: string;
}
