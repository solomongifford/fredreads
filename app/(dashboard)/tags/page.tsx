'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TagsTable } from '@/components/tags/tags-table';
import TagDetailPage from './tag-detail';

export default function TagsPage() {
  const pathname = usePathname();
  const [tagId, setTagId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Extract ID from pathname like /tags/123 -> 123
    const pathParts = pathname.split('/').filter(Boolean);
    const extractedId = pathParts.length > 1 && pathParts[0] === 'tags' ? pathParts[1] : null;
    setTagId(extractedId);
  }, [pathname]);

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
