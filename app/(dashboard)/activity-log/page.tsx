'use client';
import { useSearchParams } from 'next/navigation';
import { ActivityLogTable } from '@/components/activity-log/activity-log-table';
import { ActivityLogForm } from '@/components/activity-log/activity-log-form';

export const runtime = 'edge';

export default function ActivityLogPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Activity Log</h1>
        <ActivityLogForm logId={id} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Activity Log</h1>
      <ActivityLogTable />
    </div>
  );
}
