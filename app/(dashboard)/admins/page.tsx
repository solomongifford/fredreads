'use client';
import { AdminsTable } from '@/components/admins/admins-table';

export default function AdminsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#8B4513] mb-6">Admin Management</h1>
      <AdminsTable />
    </div>
  );
}
