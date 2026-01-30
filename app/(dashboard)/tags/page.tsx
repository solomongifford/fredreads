'use client';
import { useEffect, useState } from 'react';
import { TagsTable } from '@/components/tags/tags-table';
import TagDetailPage from './tag-detail';

export const runtime = 'edge';

export default function TagsPage() {
  const [tagId, setTagId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Extract ID from pathname like /tags/123 -> 123
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const pathParts = pathname.split('/').filter(Boolean);
      const extractedId = pathParts.length > 1 && pathParts[0] === 'tags' ? pathParts[1] : null;
      setTagId(extractedId);
    }
  }, []);

  if (!mounted) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (tagId) {
    return <TagDetailPage tagId={tagId} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Tag Manager</h1>
      <TagsTable />
    </div>
  );
}
