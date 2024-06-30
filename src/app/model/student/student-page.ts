import { Student } from './student';

export interface StudentPage {
  students: Student[];
  totalElements: number;
  totalPages?: number;
}
