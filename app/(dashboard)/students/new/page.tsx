'use client';
import { StudentForm } from '@/components/students/student-form';

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Create New Student</h1>
      <StudentForm />
    </div>
  );
}
