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

interface ActivityLogEntry {
  id: string;
  adminId: string;
  studentId: string | null;
  volunteerId: string | null;
  classId: string | null;
  date: number;
  durationMinutes: number | null;
  amountReceived: number | null;
  notes: string | null;
  createdAt: number;
}

export function ActivityLogTable() {
  const pathname = usePathname();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [pathname]);

  const fetchLogs = async () => {
    try {
      const data = await apiGet<ActivityLogEntry[]>('/api/activity-log');
      setLogs(data);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity log entry?')) return;
    
    try {
      await apiDelete(`/api/activity-log/${id}`);
      fetchLogs();
    } catch (error) {
      console.error('Error deleting activity log:', error);
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.notes?.toLowerCase().includes(search.toLowerCase()) ||
    log.adminId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search activity log..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#333333] hover:bg-[#333333]">
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Admin</TableHead>
              <TableHead className="text-white">Duration</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Notes</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#333333]">
                  No activity log entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, index) => (
                <TableRow
                  key={log.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                >
                  <TableCell className="text-[#333333]">
                    {new Date(log.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {log.adminId}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {log.durationMinutes ? `${log.durationMinutes} min` : '-'}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {log.amountReceived ? `$${log.amountReceived.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {log.notes || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/activity-log/${log.id}`}>
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
                        onClick={() => handleDelete(log.id)}
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
