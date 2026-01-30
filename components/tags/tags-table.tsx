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
import { Pencil, Trash2, Plus } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

interface Tag {
  id: string;
  name: string;
  usageCount?: number;
}

export function TagsTable() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await apiGet<Tag[]>('/api/tags');
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTagName.trim()) return;

    try {
      await apiPost('/api/tags', { name: newTagName.trim() });
      setNewTagName('');
      setIsCreating(false);
      fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleRename = async () => {
    if (!selectedTag || !newTagName.trim()) return;

    try {
      await apiPut(`/api/tags/${selectedTag.id}`, { name: newTagName.trim() });
      setEditDialogOpen(false);
      setSelectedTag(null);
      setNewTagName('');
      fetchTags();
    } catch (error) {
      console.error('Error renaming tag:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedTag) return;

    try {
      await apiDelete(`/api/tags/${selectedTag.id}`);
      setDeleteDialogOpen(false);
      setSelectedTag(null);
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      if (error.message?.includes('usageCount') || error.message?.includes('used')) {
        alert(`Cannot delete tag. It is used by item(s).`);
      }
    }
  };

  const openEditDialog = (tag: Tag) => {
    setSelectedTag(tag);
    setNewTagName(tag.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tag: Tag) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#8B4513]">Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tagName" className="text-[#333333]">Tag Name</Label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName('');
                  }}
                  className="border-[#333333] text-[#333333]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
                >
                  Create
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
              <TableHead className="text-white">Tag Name</TableHead>
              <TableHead className="text-white">Usage Count</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-[#333333]">
                  No tags found
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag, index) => (
                <TableRow
                  key={tag.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5E1DA]'}
                >
                  <TableCell className="font-medium text-[#333333]">
                    {tag.name}
                  </TableCell>
                  <TableCell className="text-[#333333]">
                    {tag.usageCount || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                        className="text-[#333333] hover:text-[#8B4513]"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(tag)}
                        className="text-[#333333] hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#8B4513]">Rename Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTagName" className="text-[#333333]">Tag Name</Label>
              <Input
                id="editTagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedTag(null);
                  setNewTagName('');
                }}
                className="border-[#333333] text-[#333333]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRename}
                className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#8B4513]">Delete Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[#333333]">
              Are you sure you want to delete the tag &quot;{selectedTag?.name}&quot;?
              {selectedTag?.usageCount && selectedTag.usageCount > 0 && (
                <span className="block mt-2 text-red-600">
                  This tag is used by {selectedTag.usageCount} item(s) and cannot be deleted.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedTag(null);
                }}
                className="border-[#333333] text-[#333333]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={!!(selectedTag?.usageCount && selectedTag.usageCount > 0)}
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
