import { StudentRecord } from '../types/kiosk';

export const INITIAL_BALANCE = 890;

export const STUDENTS: StudentRecord[] = [
  {
    studentId: '7230515',
    name: 'Joanna Balinas',
    course: 'BS Information Technology',
    initialBalance: INITIAL_BALANCE,
    loyaltyPoints: 0,
  },
  {
    studentId: '7230439',
    name: 'Evangeline Caruana',
    course: 'BS Agriculture',
    initialBalance: INITIAL_BALANCE,
    loyaltyPoints: 0,
  },
  {
    studentId: '7230454',
    name: 'Rosejenel Garcia',
    course: 'BS Industrial Technology',
    initialBalance: INITIAL_BALANCE,
    loyaltyPoints: 0,
  },
  {
    studentId: '7230493',
    name: 'Joshua Rey Lucero',
    course: 'BS Computer Science',
    initialBalance: INITIAL_BALANCE,
    loyaltyPoints: 0,
  }
];

export function getStudentById(studentId: string): StudentRecord | undefined {
  const normalizedId = studentId.trim();
  return STUDENTS.find((student) => student.studentId === normalizedId);
}
