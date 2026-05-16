import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { PillButton } from '@/components/pricing/PillButton';
import { TextInput } from '@/components/pricing/TextInput';
import { useDebounce } from '@/hooks/useDebounce';
import type { Customer } from '@/types';

export function CustomersPage() {
  const [searchFilter, setSearchFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const debouncedSearch = useDebounce(searchFilter, 300);
  const { data: customers = [], isLoading, isError } = useCustomers(debouncedSearch || undefined);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormEmail('');
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name);
    setFormEmail(customer.email ?? '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({
          id: editingCustomer.id,
          payload: { name: formName.trim(), email: formEmail.trim() || null },
        });
        toast.success('Customer updated');
      } else {
        await createMutation.mutateAsync({
          name: formName.trim(),
          email: formEmail.trim() || undefined,
        });
        toast.success('Customer created');
      }
      setShowModal(false);
    } catch {
      toast.error(editingCustomer ? 'Failed to update customer' : 'Failed to create customer');
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Delete "${customer.name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(customer.id);
      toast.success(`"${customer.name}" deleted`);
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="rounded-card bg-surface-panel p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Customers</h1>
          <p className="mt-1 text-[13px] text-ink-500">Manage customers for pricing profiles</p>
        </div>
        <PillButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          Add Customer
        </PillButton>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <TextInput
          placeholder="Search customers..."
          value={searchFilter}
          onChange={setSearchFilter}
        />
      </div>

      {/* Table */}
      <div className="rounded-card border border-surface-border-soft bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading customers...
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">
            Failed to load customers.
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-500">No customers found.</p>
            <PillButton variant="primary" className="mt-4" icon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
              Add Your First Customer
            </PillButton>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Name</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Email</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Groups</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Created</th>
                <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer: Customer) => (
                <tr key={customer.id} className="border-b border-surface-border-soft last:border-b-0 hover:bg-surface-panel/50">
                  <td className="px-6 py-4 text-sm font-medium text-ink-900">{customer.name}</td>
                  <td className="px-6 py-4 text-sm text-ink-700">{customer.email || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {customer.memberships && customer.memberships.length > 0 ? (
                        customer.memberships.map((m) => (
                          <span key={m.id} className="rounded-pill bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {m.customerGroup?.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-ink-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-panel hover:text-ink-900"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-ink-700">Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-input border border-surface-border px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-ink-700">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-input border border-surface-border px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <PillButton variant="secondary" onClick={() => setShowModal(false)}>Cancel</PillButton>
              <PillButton variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
