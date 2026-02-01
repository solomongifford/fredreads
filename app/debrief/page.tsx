'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function PublicActivitySubmissionPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    studentEmail: '',
    volunteerEmail: '',
    classId: '',
    date: new Date().toISOString().split('T')[0],
    durationMinutes: '',
    amountReceived: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fredreads-api.solomongifford.workers.dev';
      const response = await fetch(`${apiUrl}/api/public/activity-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: formData.studentEmail,
          volunteerEmail: formData.volunteerEmail,
          classId: formData.classId,
          date: formData.date,
          durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
          amountReceived: formData.amountReceived ? parseFloat(formData.amountReceived) : null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit activity log');
      }

      setSuccess(true);
      setFormData({
        studentEmail: '',
        volunteerEmail: '',
        classId: '',
        date: new Date().toISOString().split('T')[0],
        durationMinutes: '',
        amountReceived: '',
        notes: '',
      });
    } catch (err: any) {
      console.error('Error submitting activity log:', err);
      setError(err.message || 'Failed to submit debrief. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-semibold text-[#8B4513] mb-2">
            Session Debrief
          </h1>
          <p className="text-[#333333] mb-6">
            Fredericksburg READS Literacy Council
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-6">
              <p className="font-semibold">Debrief submitted successfully!</p>
              <p className="text-sm mt-1">Thank you for your submission.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="date" className="text-[#333333]">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentEmail" className="text-[#333333]">
                  Student Email *
                </Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <Label htmlFor="volunteerEmail" className="text-[#333333]">
                  Volunteer Email *
                </Label>
                <Input
                  id="volunteerEmail"
                  type="email"
                  value={formData.volunteerEmail}
                  onChange={(e) => setFormData({ ...formData, volunteerEmail: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="volunteer@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="classId" className="text-[#333333]">
                Class ID *
              </Label>
              <Input
                id="classId"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                required
                className="mt-1"
                placeholder="Enter the class ID"
              />
              <p className="text-sm text-gray-500 mt-1">
                Please enter the exact class ID provided by your coordinator.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationMinutes" className="text-[#333333]">
                  Duration (minutes)
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min="0"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  className="mt-1"
                  placeholder="60"
                />
              </div>
              <div>
                <Label htmlFor="amountReceived" className="text-[#333333]">
                  Amount Received ($)
                </Label>
                <Input
                  id="amountReceived"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amountReceived}
                  onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
                  className="mt-1"
                  placeholder="0.00"
                />
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
                className="mt-1"
                rows={4}
                placeholder="Additional notes about this activity..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B4513] hover:bg-[#6B3410] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Debrief'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
