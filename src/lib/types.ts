export type ScheduleStatus = 'Planned' | 'Ongoing' | 'Completed';

export interface Schedule {
  id: string;
  kegiatan: string;
  tanggal: string; // ISO date string (YYYY-MM-DD)
  jam_mulai: string; // HH:mm
  jam_selesai: string; // HH:mm
  pj: string;
  pengisi?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleFormData {
  kegiatan: string;
  tanggals: string[];
  jam_mulai: string;
  jam_selesai: string;
  pj: string;
  pengisi?: string;
}

export interface EventTemplate {
  id: string;
  nama: string;
  jam_mulai: string;
  jam_selesai: string;
  pj: string;
  pengisi?: string;
}
