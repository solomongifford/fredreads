'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import { apiGet, apiDelete } from '@/lib/api-client';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  notes: string | null;
  createdAt: number;
}

export function VolunteersTable() {
  const pathname = usePathname();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteers();
  }, [pathname]);

  const fetchVolunteers = async () => {
    try {
      const data = await apiGet<Volunteer[]>('/api/volunteers');
      setVolunteers(data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer?')) return;
    
    try {
      await apiDelete(`/api/volunteers/${id}`);
      fetchVolunteers();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) =>
    volunteer.name.toLowerCase().includes(search.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search volunteers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#333333] hover:bg-[#333333]">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Notes</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVolunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[#333333]">
                  No volunteers found
                </TableCell>
              </TableRow>
            ) : (
              filteredVolunteers.map((volunteer, index) => (
                <TableRow
                  key={volunteer.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                >
                  <TableCell className="font-medium text-[#333333]">
                    {volunteer.name}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {volunteer.email}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {volunteer.notes ? (
                      <span 
                        title={volunteer.notes}
                        className="block truncate max-w-[200px]"
                      >
                        {volunteer.notes.length > 20 
                          ? `${volunteer.notes.substring(0, 20)}...` 
                          : volunteer.notes}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/volunteers/${volunteer.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#333333] hover:text-[#8B4513]"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(volunteer.id)}
                        className="text-[#333333] hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
