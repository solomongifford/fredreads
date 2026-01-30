'use client';
import { VolunteerForm } from '@/components/volunteers/volunteer-form';

export default function NewVolunteerPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Create New Volunteer</h1>
      <VolunteerForm />
    </div>
  );
}
