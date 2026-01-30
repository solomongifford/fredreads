'use client';
import { ClassForm } from '@/components/classes/class-form';

export default function NewClassPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Create New Class</h1>
      <ClassForm />
    </div>
  );
}
