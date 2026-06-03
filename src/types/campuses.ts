/**
 * Campus types and interfaces
 */

export interface Campus {
  id: string;
  code: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  discount_percentage: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PreparationFee {
  id: string;
  campus_id: string;
  year: number;
  fee_type: "orientation" | "english_prep";
  fee: number;
  is_mandatory: boolean;
  max_periods: number;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CampusPublic {
  id: string;
  code: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  discount_percentage: number;
  preparation_fees?: {
    year: number;
    orientation: {
      fee: number;
      is_mandatory: boolean;
      max_periods: number;
      description?: string;
    };
    english_prep: {
      fee: number;
      is_mandatory: boolean;
      max_periods: number;
      description?: string;
    };
  };
  available_programs?: {
    count: number;
    codes: string[];
  };
}

export interface CreateCampusRequest {
  code: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  discount_percentage?: number;
}

export interface UpdateCampusRequest {
  code?: string;
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  discount_percentage?: number;
  is_active?: boolean;
}

export interface CampusResponse {
  data: CampusPublic;
}

export interface CampusesResponse {
  data: CampusPublic[];
}

export interface CampusesQueryParams {
  limit?: number;
  offset?: number;
  year?: number;
}
