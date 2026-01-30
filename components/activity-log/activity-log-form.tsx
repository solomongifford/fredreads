'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ActivityLogFormProps {
  logId?: string;
}

export function ActivityLogForm({ logId }: ActivityLogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!logId);
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
    if (logId) {
      fetchLog();
    }
  }, [logId]);

  const fetchLog = async () => {
    try {
      const response = await fetch(`/api/activity-log/${logId}`);
      const data = await response.json();
      setFormData({
        date: new Date(data.date).toISOString().split('T')[0],
        studentId: data.studentId || '',
        volunteerId: data.volunteerId || '',
        classId: data.classId || '',
        durationMinutes: data.durationMinutes?.toString() || '',
        amountReceived: data.amountReceived?.toString() || '',
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setLoading(false);
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

      const url = logId ? `/api/activity-log/${logId}` : '/api/activity-log';
      const method = logId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/activity-log');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && logId) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="date" className="text-[#333333]">
          Date *
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="studentId" className="text-[#333333]">
            Student ID
          </Label>
          <Input
            id="studentId"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="volunteerId" className="text-[#333333]">
            Volunteer ID
          </Label>
          <Input
            id="volunteerId"
            value={formData.volunteerId}
            onChange={(e) => setFormData({ ...formData, volunteerId: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="classId" className="text-[#333333]">
          Class ID
        </Label>
        <Input
          id="classId"
          value={formData.classId}
          onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="durationMinutes" className="text-[#333333]">
            Duration (minutes)
          </Label>
          <Input
            id="durationMinutes"
            type="number"
            min="0"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="amountReceived" className="text-[#333333]">
            Amount Received
          </Label>
          <Input
            id="amountReceived"
            type="number"
            step="0.01"
            min="0"
            value={formData.amountReceived}
            onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-[#333333]">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-[#333333] text-[#333333]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
        >
          {logId ? 'Update' : 'Create'} Activity Log
        </Button>
      </div>
    </form>
  );
}
