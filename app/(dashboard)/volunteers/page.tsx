'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VolunteersTable } from '@/components/volunteers/volunteers-table';
import { VolunteerForm } from '@/components/volunteers/volunteer-form';

export const runtime = 'edge';

export default function VolunteersPage() {
  const [id, setId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Extract ID from pathname like /volunteers/123 -> 123
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathParts = pathname.split('/').filter(Boolean);
      const extractedId = pathParts.length > 1 && pathParts[0] === 'volunteers' ? pathParts[1] : null;
      setId(extractedId);
    }
  }, []);

  if (!mounted) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Volunteer</h1>
        <VolunteerForm volunteerId={id} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#8B4513]">Volunteers</h1>
        <Link href="/volunteers/new">
          <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>
      <VolunteersTable />
    </div>
  );
}
