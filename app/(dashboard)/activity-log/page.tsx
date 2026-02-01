'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ActivityLogTable } from '@/components/activity-log/activity-log-table';
import { ActivityLogForm } from '@/components/activity-log/activity-log-form';

export default function ActivityLogPage() {
  const pathname = usePathname();
  const [id, setId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Extract ID from pathname like /activity-log/123 -> 123
    const pathParts = pathname.split('/').filter(Boolean);
    const extractedId = pathParts.length > 1 && pathParts[0] === 'activity-log' ? pathParts[1] : null;
    setId(extractedId);
  }, [pathname]);

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
