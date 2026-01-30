'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { TagSelector } from '@/components/tags/tag-selector';

interface VolunteerFormProps {
  volunteerId?: string;
}

export function VolunteerForm({ volunteerId }: VolunteerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!volunteerId);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    gender: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    phones: [] as string[],
    languages: [] as string[],
    notes: '',
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters except + for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's a valid US phone number (10 digits) or international (+ followed by digits)
    if (phone.startsWith('+')) {
      // International format: + followed by 7-15 digits
      return /^\+[1-9]\d{6,14}$/.test(phone.replace(/\s/g, ''));
    } else {
      // US format: exactly 10 digits
      return digitsOnly.length === 10;
    }
  };

  useEffect(() => {
    if (volunteerId) {
      fetchVolunteer();
    }
  }, [volunteerId]);

  const fetchVolunteer = async () => {
    if (!volunteerId) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      const data = await apiGet(`/api/volunteers/${volunteerId}`);
      
      if (!data || typeof data !== 'object') {
        setError('Volunteer not found');
        setTimeout(() => router.push('/volunteers'), 2000);
        return;
      }
      
      setFormData({
        name: (data.name && typeof data.name === 'string') ? data.name : '',
        nickname: (data.nickname && typeof data.nickname === 'string') ? data.nickname : '',
        email: (data.email && typeof data.email === 'string') ? data.email : '',
        gender: (data.gender && typeof data.gender === 'string') ? data.gender : '',
        street: (data.street && typeof data.street === 'string') ? data.street : '',
        street2: (data.street2 && typeof data.street2 === 'string') ? data.street2 : '',
        city: (data.city && typeof data.city === 'string') ? data.city : '',
        state: (data.state && typeof data.state === 'string') ? data.state : '',
        zip: (data.zip && typeof data.zip === 'string') ? data.zip : '',
        phones: Array.isArray(data.phones) ? data.phones.filter((p): p is string => typeof p === 'string') : [],
        languages: Array.isArray(data.languages) ? data.languages.filter((l): l is string => typeof l === 'string') : [],
        notes: (data.notes && typeof data.notes === 'string') ? data.notes : '',
      });
    } catch (error: any) {
      console.error('Error fetching volunteer:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load volunteer';
      setError(errorMessage);
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setTimeout(() => router.push('/volunteers'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const addPhone = () => {
    const trimmedPhone = phoneInput.trim();
    if (!trimmedPhone) {
      setPhoneError('Phone number is required');
      return;
    }
    
    if (!validatePhone(trimmedPhone)) {
      setPhoneError('Please enter a valid phone number (e.g., (123) 456-7890, 123-456-7890, or +1 123 456 7890)');
      return;
    }
    
    setPhoneError(null);
    setFormData({
      ...formData,
      phones: [...formData.phones, trimmedPhone],
    });
    setPhoneInput('');
  };

  const removePhone = (index: number) => {
    setFormData({
      ...formData,
      phones: formData.phones.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    if (languageInput.trim()) {
      setFormData({
        ...formData,
        languages: [...formData.languages, languageInput.trim()],
      });
      setLanguageInput('');
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        nickname: formData.nickname || null,
        email: formData.email,
        gender: formData.gender || null,
        street: formData.street || null,
        street2: formData.street2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        phones: formData.phones,
        languages: formData.languages,
        notes: formData.notes || null,
      };

      let savedId = volunteerId;
      if (volunteerId) {
        await apiPut(`/api/volunteers/${volunteerId}`, payload);
        savedId = volunteerId;
      } else {
        const result = await apiPost<{ id: string }>('/api/volunteers', payload);
        savedId = result.id;
      }
      
      // Save tags if we have pending tags (for new volunteers)
      if (pendingTagIds.length > 0 && savedId) {
        try {
          for (const tagId of pendingTagIds) {
            await apiPost('/api/taggable-items', {
              tagId,
              taggableType: 'volunteer',
              taggableId: savedId,
            });
          }
        } catch (error) {
          console.error('Error saving tags:', error);
        }
      }
      
      if (!volunteerId) {
        // Show success message for new volunteers
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/volunteers');
          router.refresh();
        }, 3000);
      } else {
        router.push('/volunteers');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving volunteer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && volunteerId) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>{error}</p>
        <p className="text-sm mt-2">Redirecting to volunteers list...</p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <p className="font-semibold">Volunteer has been added successfully!</p>
          <p className="text-sm mt-1">It may take a few minutes to be available in the list.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="name" className="text-[#333333]">
          Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="nickname" className="text-[#333333]">
          Nickname
        </Label>
        <Input
          id="nickname"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-[#333333]">
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="gender" className="text-[#333333]">
          Gender
        </Label>
        <Select
          value={formData.gender || undefined}
          onValueChange={(value) => setFormData({ ...formData, gender: value === '__none__' ? '' : value || '' })}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            <SelectItem value="M">Male</SelectItem>
            <SelectItem value="F">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[#333333]">Phones</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={phoneInput}
            onChange={(e) => {
              setPhoneInput(e.target.value);
              if (phoneError) setPhoneError(null);
            }}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPhone())}
            placeholder="Add phone number (e.g., (123) 456-7890)"
            className={phoneError ? 'border-red-500' : ''}
          />
          <Button type="button" onClick={addPhone} variant="outline">
            Add
          </Button>
        </div>
        {phoneError && (
          <p className="text-sm text-red-600 mt-1">{phoneError}</p>
        )}
        {formData.phones.length > 0 && (
          <div className="mt-2 space-y-1">
            {formData.phones.map((phone, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-[#333333]">{phone}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePhone(index)}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label className="text-[#333333]">Languages</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
            placeholder="Add language"
          />
          <Button type="button" onClick={addLanguage} variant="outline">
            Add
          </Button>
        </div>
        {formData.languages.length > 0 && (
          <div className="mt-2 space-y-1">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-[#333333]">{lang}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLanguage(index)}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#8B4513]">Address</h3>
        <div>
          <Label htmlFor="street" className="text-[#333333]">Street</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="street2" className="text-[#333333]">Street 2</Label>
          <Input
            id="street2"
            value={formData.street2}
            onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="text-[#333333]">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state" className="text-[#333333]">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="mt-1"
              maxLength={2}
              placeholder="VA"
            />
          </div>
          <div>
            <Label htmlFor="zip" className="text-[#333333]">Zip</Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              className="mt-1"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-[#333333]">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="mt-1"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Tags</h3>
        <TagSelector
          taggableType="volunteer"
          taggableId={volunteerId}
          onTagsChange={setPendingTagIds}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-[#333333] text-[#333333]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#8B4513] hover:bg-[#6B3410] text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {volunteerId ? 'Update' : 'Create'} Volunteer
        </Button>
      </div>
    </form>
  );
}
