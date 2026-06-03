/**
 * Scholarship types and interfaces
 */

// Database entity (from scholarships table)
export interface Scholarship {
  id: string;
  code: string;
  name: string;
  type: string;
  recipients?: number;
  percentage?: number;
  requirements?: string;
  year: number;
  notes?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Public API response
export interface ScholarshipPublic {
  id: string;
  code: string;
  name: string;
  type: string;
  recipients?: number;
  percentage?: number;
  requirements?: string;
  year: number;
  notes?: string;
  is_active: boolean;
}

// Request interfaces
export interface CreateScholarshipRequest {
  code: string;
  name: string;
  type: string;
  recipients?: number;
  percentage?: number;
  requirements?: string;
  year: number;
  notes?: string;
}

export interface UpdateScholarshipRequest {
  code?: string;
  name?: string;
  type?: string;
  recipients?: number;
  percentage?: number;
  requirements?: string;
  year?: number;
  notes?: string;
  is_active?: boolean;
}

// Query parameters interfaces
export interface ScholarshipQueryParams {
  year?: number;
  type?: string;
  limit?: number;
  offset?: number;
}
