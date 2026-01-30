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

interface ClassFormProps {
  classId?: string;
}

interface ScheduleData {
  type: 'recurring' | 'one-time' | null;
  pattern?: string;
  time?: string;
  dates?: Array<{ date: string; time: string }>;
}

export function ClassForm({ classId }: ClassFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!classId);
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
      const data = await apiGet(`/api/classes/${classId}`);
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
    } catch (error) {
      console.error('Error fetching class:', error);
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

      if (classId) {
        await apiPut(`/api/classes/${classId}`, payload);
      } else {
        await apiPost('/api/classes', payload);
      }
      router.push('/classes');
    } catch (error) {
      console.error('Error saving class:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && classId) {
    return <div className="text-[#333333]">Loading...</div>;
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

      <div>
        <Label className="text-[#333333]">Schedule</Label>
        <div className="mt-1">
          <ScheduleInput
            value={formData.schedule}
            onChange={(schedule) => setFormData({ ...formData, schedule })}
          />
        </div>
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
