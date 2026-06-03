/**
 * Program types and interfaces
 */

export interface Program {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  department_id: string;
  duration_years: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProgramWithDepartment {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  department_id: string;
  duration_years: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  department: {
    id: string;
    code: string;
    name: string;
    name_en?: string;
  };
}

export interface ProgramPublic {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  department_id: string;
  duration_years: number;
  department: {
    id: string;
    code: string;
    name: string;
    name_en?: string;
  };
}

export interface CreateProgramRequest {
  code: string;
  name: string;
  name_en?: string;
  department_id: string;
  duration_years: number;
}

export interface UpdateProgramRequest {
  code?: string;
  name?: string;
  name_en?: string;
  department_id?: string;
  duration_years?: number;
  is_active?: boolean;
}

export interface ProgramResponse {
  data: ProgramPublic;
}

export interface ProgramsResponse {
  data: ProgramPublic[];
}
