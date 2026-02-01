'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StudentsTable } from '@/components/students/students-table';
import { StudentForm } from '@/components/students/student-form';

export default function StudentsPage() {
  const pathname = usePathname();
  const [id, setId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Extract ID from pathname like /students/123 -> 123
    const pathParts = pathname.split('/').filter(Boolean);
    const extractedId = pathParts.length > 1 && pathParts[0] === 'students' ? pathParts[1] : null;
    setId(extractedId);
  }, [pathname]);

  if (!mounted) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Student</h1>
        <StudentForm studentId={id} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#8B4513]">Students</h1>
        <Link href="/students/new">
          <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>
      <StudentsTable />
    </div>
  );
}
