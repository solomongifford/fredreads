'use client';
import { useParams, useRouter } from 'next/navigation';
import { VolunteerForm } from '@/components/volunteers/volunteer-form';
import { useEffect } from 'react';

export const runtime = 'edge';

export default function EditVolunteerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  
  useEffect(() => {
    if (!id) {
      router.push('/volunteers');
    }
  }, [id, router]);
  
  if (!id) {
    return <div className="text-[#333333]">Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Volunteer</h1>
      <VolunteerForm volunteerId={id} />
    </div>
  );
}
