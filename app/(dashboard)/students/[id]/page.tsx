'use client';
import { useParams } from 'next/navigation';
import { StudentForm } from '@/components/students/student-form';

export const runtime = 'edge';

export default function EditStudentPage() {
  const params = useParams();
  const id = params.id as string;
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Student</h1>
      <StudentForm studentId={id} />
    </div>
  );
}
