'use client';
import { useEffect, useState } from 'react';
import { ActivityLogTable } from '@/components/activity-log/activity-log-table';
import { ActivityLogForm } from '@/components/activity-log/activity-log-form';

export default function ActivityLogPage() {
  const [id, setId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Extract ID from pathname like /activity-log/123 -> 123
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathParts = pathname.split('/').filter(Boolean);
      const extractedId = pathParts.length > 1 && pathParts[0] === 'activity-log' ? pathParts[1] : null;
      setId(extractedId);
    }
  }, []);

  if (!mounted) {
    return <div className="text-[#333333]">Loading...</div>;
  }

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
