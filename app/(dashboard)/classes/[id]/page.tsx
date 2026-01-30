'use client';
import { useParams } from 'next/navigation';
import { ClassForm } from '@/components/classes/class-form';

export const runtime = 'edge';

export default function EditClassPage() {
  const params = useParams();
  const id = params.id as string;
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Class</h1>
      <ClassForm classId={id} />
    </div>
  );
}
