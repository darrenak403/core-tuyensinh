/**
 * Department types and interfaces
 */

export interface Department {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  admission_year?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DepartmentPublic {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  admission_year?: number;
}

export interface CreateDepartmentRequest {
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  admission_year?: number;
}

export interface UpdateDepartmentRequest {
  code?: string;
  name?: string;
  name_en?: string;
  description?: string;
  admission_year?: number;
  is_active?: boolean;
}

export interface DepartmentResponse {
  data: DepartmentPublic;
}

export interface DepartmentsResponse {
  data: DepartmentPublic[];
}
