'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface Tag {
  id: string;
  name: string;
}

interface Class {
  id: string;
  title: string;
  description: string | null;
  cost: number | null;
}

interface Student {
  id: string;
  name: string;
  email: string | null;
  description: string | null;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
  notes: string | null;
}

interface TagItems {
  classes: Class[];
  students: Student[];
  volunteers: Volunteer[];
}

interface TagDetailPageProps {
  tagId: string;
}

export default function TagDetailPage({ tagId }: TagDetailPageProps) {
  const router = useRouter();

  const [tag, setTag] = useState<Tag | null>(null);
  const [items, setItems] = useState<TagItems>({ classes: [], students: [], volunteers: [] });
  const [loading, setLoading] = useState(true);

  // Pagination state for each table
  const [classesPageSize, setClassesPageSize] = useState(10);
  const [classesCurrentPage, setClassesCurrentPage] = useState(1);
  const [studentsPageSize, setStudentsPageSize] = useState(10);
  const [studentsCurrentPage, setStudentsCurrentPage] = useState(1);
  const [volunteersPageSize, setVolunteersPageSize] = useState(10);
  const [volunteersCurrentPage, setVolunteersCurrentPage] = useState(1);

  useEffect(() => {
    if (!tagId) {
      router.push('/tags');
      return;
    }
    fetchTagAndItems();
  }, [tagId]);

  const fetchTagAndItems = async () => {
    setLoading(true);
    try {
      const [tagData, itemsData] = await Promise.all([
        apiGet<Tag>(`/api/tags/${tagId}`),
        apiGet<TagItems>(`/api/tags/${tagId}/items`),
      ]);
      setTag(tagData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching tag and items:', error);
      router.push('/tags');
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations for classes
  const classesTotalPages = Math.ceil(items.classes.length / classesPageSize);
  const classesStartIndex = (classesCurrentPage - 1) * classesPageSize;
  const classesEndIndex = classesStartIndex + classesPageSize;
  const paginatedClasses = items.classes.slice(classesStartIndex, classesEndIndex);
  const showClassesPagination = items.classes.length > classesPageSize;

  // Pagination calculations for students
  const studentsTotalPages = Math.ceil(items.students.length / studentsPageSize);
  const studentsStartIndex = (studentsCurrentPage - 1) * studentsPageSize;
  const studentsEndIndex = studentsStartIndex + studentsPageSize;
  const paginatedStudents = items.students.slice(studentsStartIndex, studentsEndIndex);
  const showStudentsPagination = items.students.length > studentsPageSize;

  // Pagination calculations for volunteers
  const volunteersTotalPages = Math.ceil(items.volunteers.length / volunteersPageSize);
  const volunteersStartIndex = (volunteersCurrentPage - 1) * volunteersPageSize;
  const volunteersEndIndex = volunteersStartIndex + volunteersPageSize;
  const paginatedVolunteers = items.volunteers.slice(volunteersStartIndex, volunteersEndIndex);
  const showVolunteersPagination = items.volunteers.length > volunteersPageSize;

  // Reset page when page size changes
  useEffect(() => {
    setClassesCurrentPage(1);
  }, [classesPageSize]);

  useEffect(() => {
    setStudentsCurrentPage(1);
  }, [studentsPageSize]);

  useEffect(() => {
    setVolunteersCurrentPage(1);
  }, [volunteersPageSize]);

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (!tag) {
    return null;
  }

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
    onPrev: () => void,
    onNext: () => void,
    startIndex: number,
    endIndex: number,
    total: number,
    itemName: string
  ) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-[#333333]">
          Showing {startIndex + 1} to {Math.min(endIndex, total)} of {total} {itemName}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
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
                  onClick={() => onPageChange(pageNum)}
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
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="text-[#333333]"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tags">
          <Button variant="outline" size="sm" className="text-[#333333]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tags
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-[#8B4513]">
          Tag: {tag.name}
        </h1>
      </div>

      {/* Classes Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#333333]">
            Classes ({items.classes.length})
          </h2>
          {items.classes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#333333]">Items per page:</span>
              <Select 
                value={classesPageSize.toString()} 
                onValueChange={(value) => setClassesPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {items.classes.length === 0 ? (
          <p className="text-[#333333]">No classes found with this tag.</p>
        ) : (
          <>
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
                  {paginatedClasses.map((cls, index) => (
                    <TableRow
                      key={cls.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                    >
                      <TableCell className="font-medium text-[#333333]">
                        <Link href={`/classes/${cls.id}`} className="hover:text-[#8B4513] hover:underline">
                          {cls.title}
                        </Link>
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
                        <Link href={`/classes/${cls.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#333333] hover:text-[#8B4513]"
                          >
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {showClassesPagination && renderPagination(
              classesCurrentPage,
              classesTotalPages,
              setClassesCurrentPage,
              () => setClassesCurrentPage((prev) => Math.max(1, prev - 1)),
              () => setClassesCurrentPage((prev) => Math.min(classesTotalPages, prev + 1)),
              classesStartIndex,
              classesEndIndex,
              items.classes.length,
              'classes'
            )}
          </>
        )}
      </div>

      {/* Students Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#333333]">
            Students ({items.students.length})
          </h2>
          {items.students.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#333333]">Items per page:</span>
              <Select 
                value={studentsPageSize.toString()} 
                onValueChange={(value) => setStudentsPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {items.students.length === 0 ? (
          <p className="text-[#333333]">No students found with this tag.</p>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#333333] hover:bg-[#333333]">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Description</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                    >
                      <TableCell className="font-medium text-[#333333]">
                        <Link href={`/students/${student.id}`} className="hover:text-[#8B4513] hover:underline">
                          {student.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[#333333]">
                        {student.email || '-'}
                      </TableCell>
                      <TableCell className="text-[#333333]">
                        {student.description ? (
                          <span 
                            title={student.description}
                            className="block truncate max-w-[200px]"
                          >
                            {student.description.length > 20 
                              ? `${student.description.substring(0, 20)}...` 
                              : student.description}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/students/${student.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#333333] hover:text-[#8B4513]"
                          >
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {showStudentsPagination && renderPagination(
              studentsCurrentPage,
              studentsTotalPages,
              setStudentsCurrentPage,
              () => setStudentsCurrentPage((prev) => Math.max(1, prev - 1)),
              () => setStudentsCurrentPage((prev) => Math.min(studentsTotalPages, prev + 1)),
              studentsStartIndex,
              studentsEndIndex,
              items.students.length,
              'students'
            )}
          </>
        )}
      </div>

      {/* Volunteers Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#333333]">
            Volunteers ({items.volunteers.length})
          </h2>
          {items.volunteers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#333333]">Items per page:</span>
              <Select 
                value={volunteersPageSize.toString()} 
                onValueChange={(value) => setVolunteersPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {items.volunteers.length === 0 ? (
          <p className="text-[#333333]">No volunteers found with this tag.</p>
        ) : (
          <>
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
                  {paginatedVolunteers.map((volunteer, index) => (
                    <TableRow
                      key={volunteer.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                    >
                      <TableCell className="font-medium text-[#333333]">
                        <Link href={`/volunteers/${volunteer.id}`} className="hover:text-[#8B4513] hover:underline">
                          {volunteer.name}
                        </Link>
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
                        <Link href={`/volunteers/${volunteer.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#333333] hover:text-[#8B4513]"
                          >
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {showVolunteersPagination && renderPagination(
              volunteersCurrentPage,
              volunteersTotalPages,
              setVolunteersCurrentPage,
              () => setVolunteersCurrentPage((prev) => Math.max(1, prev - 1)),
              () => setVolunteersCurrentPage((prev) => Math.min(volunteersTotalPages, prev + 1)),
              volunteersStartIndex,
              volunteersEndIndex,
              items.volunteers.length,
              'volunteers'
            )}
          </>
        )}
      </div>
    </div>
  );
}
