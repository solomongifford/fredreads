'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

export function AddActivityModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    studentId: '',
    volunteerId: '',
    classId: '',
    durationMinutes: '',
    amountReceived: '',
    notes: '',
  });

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

      const response = await fetch('/api/activity-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
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
        router.refresh();
      }
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
              <Label htmlFor="studentId" className="text-[#333333]">Student ID</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="volunteerId" className="text-[#333333]">Volunteer ID</Label>
              <Input
                id="volunteerId"
                value={formData.volunteerId}
                onChange={(e) => setFormData({ ...formData, volunteerId: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="classId" className="text-[#333333]">Class ID</Label>
              <Input
                id="classId"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="mt-1"
              />
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
              className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
            >
              Save Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
