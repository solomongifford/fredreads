'use client';
import { useParams, useRouter } from 'next/navigation';
import { ActivityLogForm } from '@/components/activity-log/activity-log-form';
import { useEffect } from 'react';

export default function EditActivityLogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  
  useEffect(() => {
    if (!id) {
      router.push('/activity-log');
    }
  }, [id, router]);
  
  if (!id) {
    return <div className="text-[#333333]">Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Edit Activity Log</h1>
      <ActivityLogForm logId={id} />
    </div>
  );
}
