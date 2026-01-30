'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';

interface Tag {
  id: string;
  name: string;
}

interface TaggableItem {
  id: string;
  tagId: string;
  taggableType: string;
  taggableId: string;
  createdAt: number;
}

interface TagSelectorProps {
  taggableType: 'student' | 'volunteer' | 'class' | 'activity_log';
  taggableId: string | undefined;
  onTagsChange?: (tagIds: string[]) => void;
}

export function TagSelector({ taggableType, taggableId, onTagsChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllTags();
  }, []);

  useEffect(() => {
    if (taggableId) {
      fetchSelectedTags();
    } else {
      setSelectedTagIds([]);
      setLoading(false);
    }
  }, [taggableId, taggableType]);

  const fetchAllTags = async () => {
    try {
      const tags = await apiGet<Tag[]>('/api/tags');
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchSelectedTags = async () => {
    if (!taggableId) return;
    
    setLoading(true);
    try {
      const items = await apiGet<TaggableItem[]>(
        `/api/taggable-items?taggableType=${taggableType}&taggableId=${taggableId}`
      );
      const tagIds = items.map((item) => item.tagId);
      setSelectedTagIds(tagIds);
      onTagsChange?.(tagIds);
    } catch (error) {
      console.error('Error fetching selected tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = async (tagId: string) => {
    if (!taggableId) {
      // If we don't have an ID yet (creating new), just update local state
      const newSelected = selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId];
      setSelectedTagIds(newSelected);
      onTagsChange?.(newSelected);
      return;
    }

    setSaving(true);
    try {
      if (selectedTagIds.includes(tagId)) {
        // Remove tag
        await apiDelete(
          `/api/taggable-items?tagId=${tagId}&taggableType=${taggableType}&taggableId=${taggableId}`
        );
        const newSelected = selectedTagIds.filter((id) => id !== tagId);
        setSelectedTagIds(newSelected);
        onTagsChange?.(newSelected);
      } else {
        // Add tag
        await apiPost('/api/taggable-items', {
          tagId,
          taggableType,
          taggableId,
        });
        const newSelected = [...selectedTagIds, tagId];
        setSelectedTagIds(newSelected);
        onTagsChange?.(newSelected);
      }
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-[#333333]">Loading tags...</div>;
  }

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = allTags.filter((tag) => !selectedTagIds.includes(tag.id));

  return (
    <div className="space-y-3">
      {selectedTags.length > 0 && (
        <div>
          <Label className="text-[#333333] text-sm mb-2 block">Selected Tags</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleTagToggle(tag.id)}
                disabled={saving}
                className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
              >
                {tag.name}
                <X className="w-3 h-3 ml-1" />
              </Button>
            ))}
          </div>
        </div>
      )}
      {availableTags.length > 0 && (
        <div>
          <Label className="text-[#333333] text-sm mb-2 block">
            {selectedTags.length > 0 ? 'Available Tags' : 'Tags'}
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Button
                key={tag.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTagToggle(tag.id)}
                disabled={saving}
                className="border-[#333333] text-[#333333] hover:bg-[#F5E1DA]"
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      {allTags.length === 0 && (
        <p className="text-sm text-gray-500">
          No tags available. Create tags in the Tag Manager.
        </p>
      )}
    </div>
  );
}
