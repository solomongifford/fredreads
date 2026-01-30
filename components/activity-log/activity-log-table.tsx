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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface Student {
  id: string;
  name: string;
}

interface Volunteer {
  id: string;
  name: string;
}

interface Class {
  id: string;
  title: string;
}

export function ActivityLogTable() {
  const pathname = usePathname();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLogs();
    fetchLookups();
  }, [pathname]);

  const fetchLookups = async () => {
    try {
      const [studentsData, volunteersData, classesData] = await Promise.all([
        apiGet<Student[]>('/api/students').catch(() => [] as Student[]),
        apiGet<Volunteer[]>('/api/volunteers').catch(() => [] as Volunteer[]),
        apiGet<Class[]>('/api/classes').catch(() => [] as Class[]),
      ]);
      setStudents(studentsData || []);
      setVolunteers(volunteersData || []);
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error fetching lookups:', error);
    }
  };

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

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    
    const searchLower = search.toLowerCase();
    
    // Search in notes
    if (log.notes?.toLowerCase().includes(searchLower)) return true;
    
    // Search in admin ID
    if (log.adminId.toLowerCase().includes(searchLower)) return true;
    
    // Search in student name
    if (log.studentId) {
      const student = students.find(s => s.id === log.studentId);
      if (student?.name.toLowerCase().includes(searchLower)) return true;
    }
    
    // Search in volunteer name
    if (log.volunteerId) {
      const volunteer = volunteers.find(v => v.id === log.volunteerId);
      if (volunteer?.name.toLowerCase().includes(searchLower)) return true;
    }
    
    // Search in class title
    if (log.classId) {
      const classItem = classes.find(c => c.id === log.classId);
      if (classItem?.title.toLowerCase().includes(searchLower)) return true;
    }
    
    // Search in date
    const dateStr = new Date(log.date).toLocaleDateString();
    if (dateStr.toLowerCase().includes(searchLower)) return true;
    
    // Search in formatted date parts (e.g., "01/15/2024")
    const dateParts = dateStr.split('/');
    if (dateParts.some(part => part.includes(searchLower))) return true;
    
    return false;
  });

  // Reset to page 1 when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const showPagination = filteredLogs.length > pageSize;

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by student, volunteer, class, date, notes, or admin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#333333]">Items per page:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
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
              paginatedLogs.map((log, index) => (
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
                    {log.notes ? (
                      <span 
                        title={log.notes}
                        className="block truncate max-w-[200px]"
                      >
                        {log.notes.length > 20 
                          ? `${log.notes.substring(0, 20)}...` 
                          : log.notes}
                      </span>
                    ) : (
                      '-'
                    )}
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
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#333333]">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-[#333333]"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-[#333333] text-white hover:bg-[#555555]" : "text-[#333333]"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="text-[#333333]"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
