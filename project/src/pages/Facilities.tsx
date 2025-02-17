import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useSupabaseContext } from '../context/SupabaseProvider';
import type { NewFacility, UpdateFacility, Facility } from '../types/database';

export default function Facilities() {
  const { getFacilities, createFacility, updateFacility, deleteFacility } = useSupabase();
  const { user } = useSupabaseContext();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_phone: '',
    contact_email: '',
  });

  // Fetch facilities
  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: getFacilities,
  });

  // Filter facilities based on user role
  const displayedFacilities = facilities?.filter((facility: Facility) => {
    if (user?.role === 'admin') return true;
    return facility.id === user?.facility_id;
  });

  // Create facility
  const createMutation = useMutation({
    mutationFn: (newFacility: NewFacility) => createFacility(newFacility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      resetForm();
    },
  });

  // Update facility
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateFacility }) =>
      updateFacility(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      resetForm();
    },
  });

  // Delete facility
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      contact_phone: '',
      contact_email: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: formData });
    } else {
      createMutation.mutate(formData as NewFacility);
    }
  };

  const handleEdit = (facility: Facility) => {
    setFormData({
      name: facility.name,
      address: facility.address,
      contact_phone: facility.contact_phone || '',
      contact_email: facility.contact_email || '',
    });
    setEditingId(facility.id);
    setIsEditing(true);
  };

  const canManageFacility = (facilityId: string) => {
    return user?.role === 'admin' || user?.facility_id === facilityId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editingId ? 'Update' : 'Create'} Facility
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Facility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedFacilities?.map((facility) => (
              <tr key={facility.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                      <div className="text-sm text-gray-500">{facility.address}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{facility.contact_phone}</div>
                  <div className="text-sm text-gray-500">{facility.contact_email}</div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {canManageFacility(facility.id) && (
                    <>
                      <button
                        onClick={() => handleEdit(facility)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(facility.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}