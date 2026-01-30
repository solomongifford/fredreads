'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { ScheduleInput } from './schedule-input';
import { TagSelector } from '@/components/tags/tag-selector';

interface ClassFormProps {
  classId?: string;
}

interface ScheduleData {
  type: 'recurring' | 'one-time' | null;
  pattern?: string;
  time?: string;
  duration?: number;
  dates?: Array<{ date: string; time: string; duration?: number }>;
}

export function ClassForm({ classId }: ClassFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!classId);
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    privateNotes: '',
    cost: '',
    schedule: null as ScheduleData | null,
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    if (classId) {
      fetchClass();
    }
  }, [classId]);

  const parseSchedule = (schedule: any): ScheduleData | null => {
    if (!schedule) return null;
    
    // Handle old format or new format
    if (schedule.type === 'recurring') {
      return {
        type: 'recurring',
        pattern: schedule.pattern || '',
        time: schedule.time || '',
        duration: schedule.duration,
      };
    } else if (schedule.type === 'one-time') {
      return {
        type: 'one-time',
        dates: schedule.dates || [],
      };
    } else if (schedule.type === 'ad-hoc') {
      // Convert ad-hoc to one-time format
      return {
        type: 'one-time',
        dates: schedule.dates || [],
      };
    }
    
    return null;
  };

  const fetchClass = async () => {
    try {
      setError(null);
      const data = await apiGet(`/api/classes/${classId}`);
      if (!data) {
        setError('Class not found');
        setTimeout(() => router.push('/classes'), 2000);
        return;
      }
      setFormData({
        title: data.title || '',
        description: data.description || '',
        privateNotes: data.privateNotes || '',
        cost: data.cost?.toString() || '',
        schedule: parseSchedule(data.schedule),
        street: data.street || '',
        street2: data.street2 || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
      });
    } catch (error: any) {
      console.error('Error fetching class:', error);
      const errorMessage = error.message || 'Failed to load class';
      setError(errorMessage);
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setTimeout(() => router.push('/classes'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert schedule to API format
      let schedulePayload = null;
      if (formData.schedule) {
        if (formData.schedule.type === 'recurring') {
          schedulePayload = {
            type: 'recurring',
            pattern: formData.schedule.pattern || '',
            time: formData.schedule.time || '',
            duration: formData.schedule.duration,
          };
        } else if (formData.schedule.type === 'one-time') {
          schedulePayload = {
            type: 'one-time',
            dates: formData.schedule.dates || [],
          };
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description || null,
        privateNotes: formData.privateNotes || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        schedule: schedulePayload,
        street: formData.street || null,
        street2: formData.street2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
      };

      let savedId = classId;
      if (classId) {
        await apiPut(`/api/classes/${classId}`, payload);
        savedId = classId;
      } else {
        const result = await apiPost<{ id: string }>('/api/classes', payload);
        savedId = result.id;
      }
      
      // Save tags if we have pending tags (for new classes)
      if (pendingTagIds.length > 0 && savedId) {
        try {
          for (const tagId of pendingTagIds) {
            await apiPost('/api/taggable-items', {
              tagId,
              taggableType: 'class',
              taggableId: savedId,
            });
          }
        } catch (error) {
          console.error('Error saving tags:', error);
        }
      }
      
      if (!classId) {
        // Show success message for new classes
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/classes');
          router.refresh();
        }, 3000);
      } else {
        router.push('/classes');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving class:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && classId) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>{error}</p>
        <p className="text-sm mt-2">Redirecting to classes list...</p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <p className="font-semibold">Class has been added successfully!</p>
          <p className="text-sm mt-1">It may take a few minutes to be available in the list.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="title" className="text-[#333333]">
          Title *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-[#333333]">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="privateNotes" className="text-[#333333]">
          Private Notes
        </Label>
        <Textarea
          id="privateNotes"
          value={formData.privateNotes}
          onChange={(e) =>
            setFormData({ ...formData, privateNotes: e.target.value })
          }
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Location</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="street" className="text-[#333333]">Street</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="street2" className="text-[#333333]">Street 2</Label>
            <Input
              id="street2"
              value={formData.street2}
              onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-[#333333]">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-[#333333]">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1"
                maxLength={2}
                placeholder="VA"
              />
            </div>
            <div>
              <Label htmlFor="zip" className="text-[#333333]">Zip</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="mt-1"
                maxLength={10}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Schedule</h3>
        <div className="mt-1">
          <ScheduleInput
            value={formData.schedule}
            onChange={(schedule) => setFormData({ ...formData, schedule })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cost" className="text-[#333333]">
          Cost
        </Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Tags</h3>
        <TagSelector
          taggableType="class"
          taggableId={classId}
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
          {classId ? 'Update' : 'Create'} Class
        </Button>
      </div>
    </form>
  );
}
