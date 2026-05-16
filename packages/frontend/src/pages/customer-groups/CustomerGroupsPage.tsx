import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomerGroups,
  useCreateCustomerGroup,
  useUpdateCustomerGroup,
  useDeleteCustomerGroup,
  useAddGroupMember,
  useRemoveGroupMember,
} from '@/hooks/useCustomerGroups';
import { useCustomers } from '@/hooks/useCustomers';
import { PillButton } from '@/components/pricing/PillButton';
import { TextInput } from '@/components/pricing/TextInput';
import { useDebounce } from '@/hooks/useDebounce';
import type { CustomerGroup } from '@/types';

export function CustomerGroupsPage() {
  const [searchFilter, setSearchFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [managingGroupId, setManagingGroupId] = useState<string | null>(null);
  const [addCustomerId, setAddCustomerId] = useState('');

  const debouncedSearch = useDebounce(searchFilter, 300);
  const { data: groups = [], isLoading, isError } = useCustomerGroups(debouncedSearch || undefined);
  const { data: allCustomers = [] } = useCustomers();

  // Derive managingGroup from live query data so it stays in sync
  const managingGroup = managingGroupId ? groups.find((g) => g.id === managingGroupId) ?? null : null;

  const createMutation = useCreateCustomerGroup();
  const updateMutation = useUpdateCustomerGroup();
  const deleteMutation = useDeleteCustomerGroup();
  const addMemberMutation = useAddGroupMember();
  const removeMemberMutation = useRemoveGroupMember();

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormName('');
    setFormDescription('');
    setShowModal(true);
  };

  const openEditModal = (group: CustomerGroup) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormDescription(group.description ?? '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Group name is required');
      return;
    }
    try {
      if (editingGroup) {
        await updateMutation.mutateAsync({
          id: editingGroup.id,
          payload: { name: formName.trim(), description: formDescription.trim() || null },
        });
        toast.success('Group updated');
      } else {
        await createMutation.mutateAsync({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
        });
        toast.success('Group created');
      }
      setShowModal(false);
    } catch {
      toast.error(editingGroup ? 'Failed to update group' : 'Failed to create group');
    }
  };

  const handleDelete = async (group: CustomerGroup) => {
    if (!window.confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(group.id);
      toast.success(`"${group.name}" deleted`);
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const handleAddMember = async () => {
    if (!managingGroup || !addCustomerId) return;
    try {
      await addMemberMutation.mutateAsync({ groupId: managingGroup.id, customerId: addCustomerId });
      toast.success('Member added');
      setAddCustomerId('');
    } catch {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (customerId: string, customerName: string) => {
    if (!managingGroup) return;
    try {
      await removeMemberMutation.mutateAsync({ groupId: managingGroup.id, customerId });
      toast.success(`${customerName} removed`);
    } catch {
      toast.error('Failed to remove member');
    }
  };

  // Customers not yet in the managed group
  const availableCustomers = managingGroup
    ? allCustomers.filter(
        (c) => !managingGroup.memberships?.some((m) => m.customerId === c.id)
      )
    : [];

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="rounded-card bg-surface-panel p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Customer Groups</h1>
          <p className="mt-1 text-[13px] text-ink-500">Organize customers into groups for bulk pricing</p>
        </div>
        <PillButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
          Add Group
        </PillButton>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <TextInput placeholder="Search groups..." value={searchFilter} onChange={setSearchFilter} />
      </div>

      {/* Results count */}
      <p className="mb-4 text-[13px] text-ink-500">
        Showing <span className="font-semibold text-ink-900">{groups.length}</span> groups
      </p>

      {/* Table */}
      <div className="rounded-card border border-surface-border-soft bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading groups...
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Failed to load groups.</div>
        ) : groups.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-500">No customer groups found.</p>
            <PillButton variant="primary" className="mt-4" icon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
              Create Your First Group
            </PillButton>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Name</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Description</th>
                <th className="px-6 py-3 text-center text-[13px] font-medium text-ink-500">Members</th>
                <th className="px-6 py-3 text-left text-[13px] font-medium text-ink-500">Created</th>
                <th className="px-6 py-3 text-right text-[13px] font-medium text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group: CustomerGroup) => (
                <tr key={group.id} className="border-b border-surface-border-soft last:border-b-0 hover:bg-surface-panel/50">
                  <td className="px-6 py-4 text-sm font-medium text-ink-900">{group.name}</td>
                  <td className="px-6 py-4 text-sm text-ink-700">{group.description || '—'}</td>
                  <td className="px-6 py-4 text-center text-sm text-ink-700">
                    {group._count?.memberships ?? group.memberships?.length ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-500">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setManagingGroupId(group.id)}
                        className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
                        title="Manage Members"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Members
                      </button>
                      <button
                        onClick={() => openEditModal(group)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-panel hover:text-ink-900"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(group)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900">
                {editingGroup ? 'Edit Group' : 'Add Customer Group'}
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
                  className="h-11 w-full rounded-input border border-surface-border bg-white px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
                  placeholder="Group name"
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-ink-700">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="h-11 w-full rounded-input border border-surface-border bg-white px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <PillButton variant="secondary" onClick={() => setShowModal(false)}>Cancel</PillButton>
              <PillButton variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : editingGroup ? 'Update' : 'Create'}
              </PillButton>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {managingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink-900">
                Members of "{managingGroup.name}"
              </h2>
              <button onClick={() => setManagingGroupId(null)} className="text-ink-400 hover:text-ink-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Add member */}
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <label className="mb-1 block text-[13px] font-medium text-ink-700">Add Customer</label>
                <select
                  value={addCustomerId}
                  onChange={(e) => setAddCustomerId(e.target.value)}
                  className="h-11 w-full rounded-input border border-surface-border bg-white px-3.5 text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-teal/30"
                >
                  <option value="">Select a customer...</option>
                  {availableCustomers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <PillButton
                variant="primary"
                icon={<UserPlus className="h-4 w-4" />}
                onClick={handleAddMember}
                disabled={!addCustomerId || addMemberMutation.isPending}
              >
                Add
              </PillButton>
            </div>

            {/* Current members */}
            <div className="rounded-card border border-surface-border-soft bg-surface-panel">
              {managingGroup.memberships && managingGroup.memberships.length > 0 ? (
                <div className="divide-y divide-surface-border-soft">
                  {managingGroup.memberships.map((m) => (
                    <div key={m.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{m.customer?.name}</p>
                        {m.customer?.email && (
                          <p className="text-xs text-ink-500">{m.customer.email}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveMember(m.customerId, m.customer?.name ?? '')}
                        disabled={removeMemberMutation.isPending}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-ink-500">No members in this group.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <PillButton variant="secondary" onClick={() => setManagingGroupId(null)}>Done</PillButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
