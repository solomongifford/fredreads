'use client';
import { TagsTable } from '@/components/tags/tags-table';

export default function TagsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Tag Manager</h1>
      <TagsTable />
    </div>
  );
}
