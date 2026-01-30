'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api-client';

interface Student {
  id: string;
  name: string;
  email: string | null;
}

interface Volunteer {
  id: string;
  name: string;
  email: string;
}

interface Class {
  id: string;
  title: string;
  description: string | null;
}

export function AddActivityModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingLookups, setFetchingLookups] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    studentId: '',
    volunteerId: '',
    classId: '',
    durationMinutes: '',
    amountReceived: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchLookups();
    }
  }, [open]);

  const fetchLookups = async () => {
    setFetchingLookups(true);
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
      // Set empty arrays on error to prevent crashes
      setStudents([]);
      setVolunteers([]);
      setClasses([]);
    } finally {
      setFetchingLookups(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        date: formData.date,
        studentId: formData.studentId || null,
        volunteerId: formData.volunteerId || null,
        classId: formData.classId || null,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
        amountReceived: formData.amountReceived ? parseFloat(formData.amountReceived) : null,
        notes: formData.notes || null,
      };

      await apiPost('/api/activity-log', payload);
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        studentId: '',
        volunteerId: '',
        classId: '',
        durationMinutes: '',
        amountReceived: '',
        notes: '',
      });
      // Tables will refresh when user navigates to the activity log page
    } catch (error) {
      console.error('Error creating activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#8B4513]">Add Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-[#333333]">Date *</Label>
              <Input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-[#333333]">Duration (minutes)</Label>
              <Input
                type="number"
                id="duration"
                min="0"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="studentId" className="text-[#333333]">Student</Label>
              <Select
                value={formData.studentId || undefined}
                onValueChange={(value) => setFormData({ ...formData, studentId: value || '' })}
                disabled={fetchingLookups}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder={fetchingLookups ? "Loading..." : "Select student"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} {student.email ? `(${student.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="volunteerId" className="text-[#333333]">Volunteer</Label>
              <Select
                value={formData.volunteerId || undefined}
                onValueChange={(value) => setFormData({ ...formData, volunteerId: value || '' })}
                disabled={fetchingLookups}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder={fetchingLookups ? "Loading..." : "Select volunteer"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {volunteers.map((volunteer) => (
                    <SelectItem key={volunteer.id} value={volunteer.id}>
                      {volunteer.name} ({volunteer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="classId" className="text-[#333333]">Class</Label>
              <Select
                value={formData.classId || undefined}
                onValueChange={(value) => setFormData({ ...formData, classId: value || '' })}
                disabled={fetchingLookups}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder={fetchingLookups ? "Loading..." : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="amount" className="text-[#333333]">Amount Received</Label>
            <Input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              value={formData.amountReceived}
              onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
              className="mt-1"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-[#333333]">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#333333] text-[#333333]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#8B4513] hover:bg-[#6B3410] text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
