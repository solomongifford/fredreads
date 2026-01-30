'use client';
import { useParams } from 'next/navigation';
import { ActivityLogForm } from '@/components/activity-log/activity-log-form';

export const runtime = 'edge';

export default function EditActivityLogPage() {
  const params = useParams();
  const id = params.id as string;
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Activity Log</h1>
      <ActivityLogForm logId={id} />
    </div>
  );
}
