'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';

interface Admin {
  id: string;
  email: string;
  createdAt: number;
}

export function AdminsTable() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await apiGet<Admin[]>('/api/admins');
      setAdmins(data);
      setError('');
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAdminEmail.trim()) {
      setError('Email is required');
      return;
    }

    try {
      await apiPost('/api/admins', { email: newAdminEmail.trim() });
      setNewAdminEmail('');
      setCreateDialogOpen(false);
      setError('');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      setError(error.message || 'Failed to create admin');
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    try {
      await apiDelete(`/api/admins/${selectedAdmin.id}`);
      setDeleteDialogOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      alert(error.message || 'Failed to delete admin');
    }
  };

  const openDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#8B4513]">Add New Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="adminEmail" className="text-[#333333]">Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => {
                    setNewAdminEmail(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="admin@example.com"
                  className="mt-1"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setNewAdminEmail('');
                    setError('');
                  }}
                  className="border-[#333333] text-[#333333]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
                >
                  Add Admin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#333333] hover:bg-[#333333]">
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Created</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-[#333333]">
                  No admins found
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin, index) => (
                <TableRow
                  key={admin.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                >
                  <TableCell className="font-medium text-[#333333]">
                    {admin.email}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(admin)}
                      className="text-[#333333] hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#8B4513]">Delete Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[#333333]">
              Are you sure you want to remove admin access for &quot;{selectedAdmin?.email}&quot;?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedAdmin(null);
                }}
                className="border-[#333333] text-[#333333]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
