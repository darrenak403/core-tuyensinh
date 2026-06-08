export interface AdmissionYear {
  year: number;
  label: string;
  is_active: boolean;
  created_at: Date;
}

export interface CreateAdmissionYearRequest {
  year: number;
  label?: string;
  is_active?: boolean;
}

export interface UpdateAdmissionYearRequest {
  label?: string;
  is_active?: boolean;
}
