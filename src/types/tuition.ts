/**
 * Tuition types and interfaces
 */

// Database entity (from progressive_tuition table)
export interface ProgressiveTuition {
  id: string;
  program_id: string;
  campus_id: string;
  year: number;
  semester_group_1_3_fee: number;
  semester_group_4_6_fee: number;
  semester_group_7_9_fee: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Public API response (from v_tuition_summary view)
export interface TuitionSummary {
  id: string;
  year: number;
  program_id: string;
  program_code: string;
  program_name: string;
  program_name_en?: string;
  department_id: string;
  department_code: string;
  department_name: string;
  department_name_en?: string;
  campus_id: string;
  campus_code: string;
  campus_name: string;
  campus_city: string;
  campus_discount: number;
  semester_group_1_3_fee: number;
  semester_group_4_6_fee: number;
  semester_group_7_9_fee: number;
  total_program_fee: number;
  min_semester_fee: number;
  max_semester_fee: number;
}

// Tuition comparison data (from v_tuition_comparison view)
export interface TuitionComparison {
  program_code: string;
  program_name: string;
  department_name: string;
  year: number;
  campus_fees: CampusFee[];
  min_semester_fee: number;
  max_semester_fee: number;
  min_total_fee: number;
  max_total_fee: number;
}

export interface CampusFee {
  campus_code: string;
  campus_name: string;
  city: string;
  discount_percentage: number;
  semester_1_3_fee: number;
  semester_4_6_fee: number;
  semester_7_9_fee: number;
  total_program_fee: number;
}

// Campus tuition summary (from v_campus_tuition_summary view)
export interface CampusTuitionSummary {
  campus_id: string;
  campus_code: string;
  campus_name: string;
  campus_city: string;
  discount_percentage: number;
  year: number;
  total_programs: number;
  total_departments: number;
  min_semester_fee: number;
  max_semester_fee: number;
  avg_semester_1_3_fee: number;
  avg_semester_4_6_fee: number;
  avg_semester_7_9_fee: number;
  programs: ProgramFee[];
}

export interface ProgramFee {
  program_code: string;
  program_name: string;
  department_name: string;
  semester_1_3_fee: number;
  semester_4_6_fee: number;
  semester_7_9_fee: number;
}

// Cost calculation result (from calculate_total_program_cost function)
export interface TuitionCalculation {
  program_fee: number;
  preparation_fees: number;
  total_cost: number;
  cost_breakdown: {
    tuition_total: number;
    orientation_fee: number;
    english_prep_fee: number;
    english_periods: number;
    has_ielts_exemption: boolean;
  };
}

// Request interfaces
export interface CreateTuitionRequest {
  program_id: string;
  campus_id: string;
  year: number;
  semester_group_1_3_fee: number;
  semester_group_4_6_fee: number;
  semester_group_7_9_fee: number;
}

export interface UpdateTuitionRequest {
  program_id?: string;
  campus_id?: string;
  year?: number;
  semester_group_1_3_fee?: number;
  semester_group_4_6_fee?: number;
  semester_group_7_9_fee?: number;
  is_active?: boolean;
}

// Query parameters interfaces
export interface TuitionQueryParams {
  program_code?: string;
  campus_code?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface TuitionCalculateParams {
  program_code: string;
  campus_code: string;
  has_ielts?: boolean;
  year?: number;
}

export interface TuitionComparisonParams {
  program_code?: string;
  year?: number;
}

export interface CampusTuitionParams {
  campus_code: string;
  year?: number;
}

// Response interfaces
export interface TuitionResponse {
  data: TuitionSummary;
}

export interface TuitionListResponse {
  data: TuitionSummary[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface TuitionComparisonResponse {
  data: TuitionComparison[];
}

export interface TuitionCalculationResponse {
  data: TuitionCalculation;
}

export interface CampusTuitionResponse {
  data: CampusTuitionSummary;
}

export interface TuitionDeleteResponse {
  message: string;
}

// Error response interface
export interface TuitionErrorResponse {
  error: string;
  message: string;
  details?: any;
}
