'use client';
import { useParams, useRouter } from 'next/navigation';
import { ClassForm } from '@/components/classes/class-form';
import { useEffect } from 'react';

export const runtime = 'edge';

export default function EditClassPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  
  useEffect(() => {
    if (!id) {
      router.push('/classes');
    }
  }, [id, router]);
  
  if (!id) {
    return <div className="text-[#333333]">Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Class</h1>
      <ClassForm classId={id} />
    </div>
  );
}
