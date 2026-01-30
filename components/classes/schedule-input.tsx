'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ScheduleData {
  type: 'recurring' | 'one-time' | null;
  pattern?: string; // For recurring: e.g., "Monday", "Tuesday,Thursday"
  time?: string; // Time in HH:mm format
  dates?: Array<{ date: string; time: string; duration?: number }>; // For one-time: specific dates with times and duration (in minutes)
}

interface ScheduleInputProps {
  value: ScheduleData | null;
  onChange: (value: ScheduleData | null) => void;
}

export function ScheduleInput({ value, onChange }: ScheduleInputProps) {
  const schedule = value || { type: null };

  const handleTypeChange = (type: 'recurring' | 'one-time' | 'none') => {
    if (type === 'none') {
      onChange(null);
    } else if (type === 'recurring') {
      onChange({
        type: 'recurring',
        pattern: schedule.pattern || '',
        time: schedule.time || '',
      });
    } else {
      onChange({
        type: 'one-time',
        dates: schedule.dates || [],
      });
    }
  };

  const handleRecurringPatternChange = (pattern: string) => {
    onChange({
      ...schedule,
      type: 'recurring',
      pattern,
    } as ScheduleData);
  };

  const handleRecurringTimeChange = (time: string) => {
    onChange({
      ...schedule,
      type: 'recurring',
      time,
    } as ScheduleData);
  };

  const addOneTimeDate = () => {
    const dates = schedule.dates || [];
    onChange({
      ...schedule,
      type: 'one-time',
      dates: [...dates, { date: '', time: '', duration: undefined }],
    } as ScheduleData);
  };

  const updateOneTimeDate = (index: number, field: 'date' | 'time' | 'duration', newValue: string | number) => {
    const dates = [...(schedule.dates || [])];
    dates[index] = { ...dates[index], [field]: newValue };
    onChange({
      ...schedule,
      type: 'one-time',
      dates,
    } as ScheduleData);
  };

  const removeOneTimeDate = (index: number) => {
    const dates = [...(schedule.dates || [])];
    dates.splice(index, 1);
    onChange({
      ...schedule,
      type: 'one-time',
      dates,
    } as ScheduleData);
  };

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[#333333]">Schedule Type</Label>
        <Select
          value={schedule.type || 'none'}
          onValueChange={(value) => handleTypeChange(value as 'recurring' | 'one-time' | 'none')}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select schedule type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Schedule</SelectItem>
            <SelectItem value="recurring">Recurring</SelectItem>
            <SelectItem value="one-time">Specific Dates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {schedule.type === 'recurring' && (
        <div className="space-y-4 border-l-2 border-[#8B4513] pl-4">
          <div>
            <Label className="text-[#333333]">Days of Week</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const selectedDays = schedule.pattern?.split(',').map((d) => d.trim()) || [];
                const isSelected = selectedDays.includes(day);
                return (
                  <Button
                    key={day}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => {
                      const currentDays = schedule.pattern?.split(',').map((d) => d.trim()) || [];
                      let newDays: string[];
                      if (isSelected) {
                        newDays = currentDays.filter((d) => d !== day);
                      } else {
                        newDays = [...currentDays, day];
                      }
                      handleRecurringPatternChange(newDays.join(','));
                    }}
                    className={
                      isSelected
                        ? 'bg-[#8B4513] hover:bg-[#6B3410] text-white'
                        : 'border-[#333333] text-[#333333]'
                    }
                    size="sm"
                  >
                    {day.substring(0, 3)}
                  </Button>
                );
              })}
            </div>
          </div>
          <div>
            <Label htmlFor="recurring-time" className="text-[#333333]">
              Time
            </Label>
            <Input
              id="recurring-time"
              type="time"
              value={schedule.time || ''}
              onChange={(e) => handleRecurringTimeChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {schedule.type === 'one-time' && (
        <div className="space-y-4 border-l-2 border-[#8B4513] pl-4">
          <div className="flex justify-between items-center">
            <Label className="text-[#333333]">Specific Dates & Times</Label>
            <Button
              type="button"
              onClick={addOneTimeDate}
              variant="outline"
              size="sm"
              className="border-[#333333] text-[#333333]"
            >
              Add Date
            </Button>
          </div>
          {(schedule.dates || []).map((dateItem, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-[#333333] text-sm">Date</Label>
                  <Input
                    type="date"
                    value={dateItem.date}
                    onChange={(e) => updateOneTimeDate(index, 'date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-[#333333] text-sm">Time</Label>
                  <Input
                    type="time"
                    value={dateItem.time}
                    onChange={(e) => updateOneTimeDate(index, 'time', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-[#333333] text-sm">Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={dateItem.duration || ''}
                    onChange={(e) => updateOneTimeDate(index, 'duration', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1"
                    placeholder="60"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOneTimeDate(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {(!schedule.dates || schedule.dates.length === 0) && (
            <p className="text-sm text-gray-500">No dates added yet. Click "Add Date" to add a specific date and time.</p>
          )}
        </div>
      )}
    </div>
  );
}
