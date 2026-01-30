'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClassesTable } from '@/components/classes/classes-table';
import { ClassForm } from '@/components/classes/class-form';

export const runtime = 'edge';

export default function ClassesPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Class</h1>
        <ClassForm classId={id} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#8B4513]">Classes</h1>
        <Link href="/classes/new">
          <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>
      <ClassesTable />
    </div>
  );
}
