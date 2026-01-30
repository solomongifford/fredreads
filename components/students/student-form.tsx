'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StudentFormProps {
  studentId?: string;
}

export function StudentForm({ studentId }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!studentId);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phones: [] as string[],
    languages: [] as string[],
    description: '',
    needsClassId: '',
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      const data = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        address: data.address || '',
        phones: data.phones || [],
        languages: data.languages || [],
        description: data.description || '',
        needsClassId: data.needsClassId || '',
      });
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPhone = () => {
    if (phoneInput.trim()) {
      setFormData({
        ...formData,
        phones: [...formData.phones, phoneInput.trim()],
      });
      setPhoneInput('');
    }
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
        email: formData.email || null,
        address: formData.address || null,
        phones: formData.phones,
        languages: formData.languages,
        description: formData.description || null,
        needsClassId: formData.needsClassId || null,
      };

      const url = studentId ? `/api/students/${studentId}` : '/api/students';
      const method = studentId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
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
        <Label htmlFor="address" className="text-[#333333]">
          Address
        </Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-[#333333]">Phones</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPhone())}
            placeholder="Add phone number"
          />
          <Button type="button" onClick={addPhone} variant="outline">
            Add
          </Button>
        </div>
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
          Needs Class ID
        </Label>
        <Input
          id="needsClassId"
          value={formData.needsClassId}
          onChange={(e) =>
            setFormData({ ...formData, needsClassId: e.target.value })
          }
          className="mt-1"
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
          className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
        >
          {studentId ? 'Update' : 'Create'} Student
        </Button>
      </div>
    </form>
  );
}
