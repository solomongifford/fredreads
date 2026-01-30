'use client';
import { useParams } from 'next/navigation';
import { VolunteerForm } from '@/components/volunteers/volunteer-form';

export const runtime = 'edge';

export default function EditVolunteerPage() {
  const params = useParams();
  const id = params.id as string;
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Volunteer</h1>
      <VolunteerForm volunteerId={id} />
    </div>
  );
}
