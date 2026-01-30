'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { TagSelector } from '@/components/tags/tag-selector';

interface ActivityLogFormProps {
  logId?: string;
}

export function ActivityLogForm({ logId }: ActivityLogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!logId);
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
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
      const data = await apiGet(`/api/activity-log/${logId}`);
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

      let savedId = logId;
      if (logId) {
        await apiPut(`/api/activity-log/${logId}`, payload);
        savedId = logId;
      } else {
        const result = await apiPost<{ id: string }>('/api/activity-log', payload);
        savedId = result.id;
      }
      
      // Save tags if we have pending tags (for new activity logs)
      if (pendingTagIds.length > 0 && savedId) {
        try {
          for (const tagId of pendingTagIds) {
            await apiPost('/api/taggable-items', {
              tagId,
              taggableType: 'activity_log',
              taggableId: savedId,
            });
          }
        } catch (error) {
          console.error('Error saving tags:', error);
        }
      }
      
      if (!logId) {
        // Show success message for new activity logs
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/activity-log');
          router.refresh();
        }, 3000);
      } else {
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

  if (showSuccess) {
    return (
      <div className="max-w-2xl">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <p className="font-semibold">Activity log entry has been added successfully!</p>
          <p className="text-sm mt-1">It may take a few minutes to be available in the list.</p>
        </div>
      </div>
    );
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

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Tags</h3>
        <TagSelector
          taggableType="activity_log"
          taggableId={logId}
          onTagsChange={setPendingTagIds}
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
          className="bg-[#8B4513] hover:bg-[#6B3410] text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {logId ? 'Update' : 'Create'} Activity Log
        </Button>
      </div>
    </form>
  );
}
