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

interface Class {
  id: string;
  title: string;
  description: string | null;
  cost: number | null;
  createdAt: number;
  updatedAt: number;
}

export function ClassesTable() {
  const pathname = usePathname();
  const [classes, setClasses] = useState<Class[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchClasses();
  }, [pathname]);

  const fetchClasses = async () => {
    try {
      const data = await apiGet<Class[]>('/api/classes');
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await apiDelete(`/api/classes/${id}`);
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.title.toLowerCase().includes(search.toLowerCase()) ||
    cls.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to page 1 when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClasses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);
  const showPagination = filteredClasses.length > pageSize;

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search classes..."
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
              <TableHead className="text-white">Title</TableHead>
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-white">Cost</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[#333333]">
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              paginatedClasses.map((cls, index) => (
                <TableRow
                  key={cls.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                >
                  <TableCell className="font-medium text-[#333333]">
                    {cls.title}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {cls.description ? (
                      <span 
                        title={cls.description}
                        className="block truncate max-w-[200px]"
                      >
                        {cls.description.length > 20 
                          ? `${cls.description.substring(0, 20)}...` 
                          : cls.description}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {cls.cost ? `$${cls.cost.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/classes/${cls.id}`}>
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
                        onClick={() => handleDelete(cls.id)}
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredClasses.length)} of {filteredClasses.length} classes
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
