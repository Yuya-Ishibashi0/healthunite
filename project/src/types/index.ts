export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}