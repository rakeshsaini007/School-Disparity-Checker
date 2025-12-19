
export interface School {
  name: string;
  nyayPanchayat: string;
}

export interface ApiResponse {
  success: boolean;
  data?: School[];
  pdfBase64?: string;
  message?: string;
}
