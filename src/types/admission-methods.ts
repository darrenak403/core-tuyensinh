/**
 * Admission Method types and interfaces
 */

// Database entity (from admission_methods table)
export interface AdmissionMethod {
  id: string;
  method_code: string;
  name: string;
  requirements?: string;
  notes?: string;
  year: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Public API response
export interface AdmissionMethodPublic {
  id: string;
  method_code: string;
  name: string;
  requirements?: string;
  notes?: string;
  year: number;
  is_active: boolean;
}

// Request interfaces
export interface CreateAdmissionMethodRequest {
  method_code: string;
  name: string;
  requirements?: string;
  notes?: string;
  year: number;
}

export interface UpdateAdmissionMethodRequest {
  method_code?: string;
  name?: string;
  requirements?: string;
  notes?: string;
  year?: number;
  is_active?: boolean;
}

// Query parameters interfaces
export interface AdmissionMethodQueryParams {
  year?: number;
  limit?: number;
  offset?: number;
}
