'use client';
import { ActivityLogTable } from '@/components/activity-log/activity-log-table';

export default function ActivityLogPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Activity Log</h1>
      <ActivityLogTable />
    </div>
  );
}
