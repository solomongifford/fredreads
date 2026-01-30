'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';

interface VolunteerFormProps {
  volunteerId?: string;
}

export function VolunteerForm({ volunteerId }: VolunteerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!volunteerId);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

  useEffect(() => {
    if (volunteerId) {
      fetchVolunteer();
    }
  }, [volunteerId]);

  const fetchVolunteer = async () => {
    try {
      const data = await apiGet(`/api/volunteers/${volunteerId}`);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        street: data.street || '',
        street2: data.street2 || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        phones: data.phones || [],
        languages: data.languages || [],
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching volunteer:', error);
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
        email: formData.email,
        street: formData.street || null,
        street2: formData.street2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        phones: formData.phones,
        languages: formData.languages,
        notes: formData.notes || null,
      };

      if (volunteerId) {
        await apiPut(`/api/volunteers/${volunteerId}`, payload);
      } else {
        await apiPost('/api/volunteers', payload);
      }
      router.push('/volunteers');
    } catch (error) {
      console.error('Error saving volunteer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && volunteerId) {
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
          {volunteerId ? 'Update' : 'Create'} Volunteer
        </Button>
      </div>
    </form>
  );
}
