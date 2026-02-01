'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronRight } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { TagSelector } from '@/components/tags/tag-selector';
import Link from 'next/link';

interface StudentFormProps {
  studentId?: string;
}

export function StudentForm({ studentId }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!studentId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    description: '',
    needsClassId: '',
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

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
    if (studentId) {
      fetchStudent();
    }
    fetchClasses();
  }, [studentId]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = await apiGet<Array<{ id: string; title: string }>>('/api/classes');
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudent = async () => {
    try {
      setError(null);
      const data = await apiGet(`/api/students/${studentId}`);
      if (!data) {
        setError('Student not found');
        setTimeout(() => router.push('/students'), 2000);
        return;
      }
      setFormData({
        name: data.name || '',
        nickname: data.nickname || '',
        email: data.email || '',
        gender: data.gender || '',
        street: data.street || '',
        street2: data.street2 || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        phones: Array.isArray(data.phones) ? data.phones : [],
        languages: Array.isArray(data.languages) ? data.languages : [],
        description: data.description || '',
        needsClassId: data.needsClassId || '',
      });
    } catch (error: any) {
      console.error('Error fetching student:', error);
      const errorMessage = error.message || 'Failed to load student';
      setError(errorMessage);
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setTimeout(() => router.push('/students'), 2000);
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
        email: formData.email || null,
        gender: formData.gender || null,
        street: formData.street || null,
        street2: formData.street2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        phones: formData.phones,
        languages: formData.languages,
        description: formData.description || null,
        needsClassId: formData.needsClassId || null,
      };

      let savedId = studentId;
      if (studentId) {
        await apiPut(`/api/students/${studentId}`, payload);
        savedId = studentId;
      } else {
        const result = await apiPost<{ id: string }>('/api/students', payload);
        savedId = result.id;
      }
      
      // Save tags if we have pending tags (for new students only)
      if (!studentId && pendingTagIds.length > 0 && savedId) {
        try {
          for (const tagId of pendingTagIds) {
            await apiPost('/api/taggable-items', {
              tagId,
              taggableType: 'student',
              taggableId: savedId,
            });
          }
        } catch (error) {
          console.error('Error saving tags:', error);
        }
      }
      
      if (!studentId) {
        // Show success message for new students
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/students');
          router.refresh();
        }, 3000);
      } else {
        router.push('/students');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && studentId) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>{error}</p>
        <p className="text-sm mt-2">Redirecting to students list...</p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <p className="font-semibold">Student has been added successfully!</p>
          <p className="text-sm mt-1">It may take a few minutes to be available in the list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-[#333333]">
        <Link href="/students" className="hover:text-[#8B4513] hover:underline">
          Students
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-[#8B4513]">{studentId ? 'Edit' : 'New'} Student</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
        <Label htmlFor="description" className="text-[#333333]">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="needsClassId" className="text-[#333333]">
          Needs Class
        </Label>
        <Select
          value={formData.needsClassId || '__none__'}
          onValueChange={(value) =>
            setFormData({ ...formData, needsClassId: value === '__none__' ? '' : value })
          }
          disabled={loadingClasses}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select a class"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-[#8B4513] mb-4">Tags</h3>
        <TagSelector
          taggableType="student"
          taggableId={studentId}
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
          {studentId ? 'Update' : 'Create'} Student
        </Button>
      </div>
      </form>
    </div>
  );
}
