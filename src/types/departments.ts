/**
 * Department types and interfaces
 */

export interface Department {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  description?: string;
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
}

export interface CreateDepartmentRequest {
  code: string;
  name: string;
  name_en?: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  code?: string;
  name?: string;
  name_en?: string;
  description?: string;
  is_active?: boolean;
}

export interface DepartmentResponse {
  data: DepartmentPublic;
}

export interface DepartmentsResponse {
  data: DepartmentPublic[];
}
