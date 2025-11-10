/**
 * DataTable Component Usage Examples
 *
 * This file demonstrates how to use the reusable DataTable component
 * across different features (ingredients, menu items, orders, etc.)
 */

import { DataTable, DataTableColumn } from "./DataTable";
import { useBulkOperations } from "@/hooks/useBulkOperations";
import { Trash2 } from "lucide-react";

// ============================================================================
// Example 1: Basic Ingredients Table
// ============================================================================

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  costPerUnitCents: number;
  supplier: string;
  isActive: boolean;
}

export function IngredientsTableExample() {
  const ingredients: Ingredient[] = []; // From API

  const columns: DataTableColumn<Ingredient>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      editable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (value) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      editable: true,
      renderEdit: (value, onChange) => (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-20 px-2 py-1 border rounded"
        />
      ),
    },
    {
      key: "costPerUnitCents",
      label: "Cost/Unit",
      render: (cents) => `$${(cents / 100).toFixed(2)}`,
    },
    {
      key: "isActive",
      label: "Active",
      align: "center",
      editable: true,
      render: (value) => (
        <input type="checkbox" checked={value} disabled className="h-4 w-4" />
      ),
      renderEdit: (value, onChange) => (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
      ),
    },
  ];

  const { bulkDelete } = useBulkOperations({
    deleteFn: async (ids) => {
      // Call your delete API
      await fetch('/api/ingredients/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      // Refetch data
      console.log('Ingredients deleted');
    },
    messages: {
      deleted: "ingredients deleted",
    },
  });

  return (
    <DataTable
      data={ingredients}
      columns={columns}
      selectable
      onDoubleClickEdit
      onUpdate={async (id, data) => {
        await fetch(`/api/ingredients/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }}
      onDelete={async (id) => {
        await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
      }}
      bulkActions={[
        {
          label: "Delete selected",
          variant: "danger",
          onClick: (ids) => bulkDelete(ids, []),
        },
        {
          label: "Activate selected",
          onClick: async (ids) => {
            await fetch('/api/ingredients/bulk-update', {
              method: 'PUT',
              body: JSON.stringify({ ids, isActive: true }),
            });
          },
        },
      ]}
      actions={[
        {
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          variant: "danger",
          onClick: async (row) => {
            await fetch(`/api/ingredients/${row.id}`, { method: 'DELETE' });
          },
        },
      ]}
      defaultSortBy="name"
      loading={false}
      emptyMessage="No ingredients found. Add your first ingredient to get started."
    />
  );
}

// ============================================================================
// Example 2: Menu Items Table
// ============================================================================

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

export function MenuItemsTableExample() {
  const menuItems: MenuItem[] = [];

  const columns: DataTableColumn<MenuItem>[] = [
    {
      key: "name",
      label: "Dish Name",
      sortable: true,
      editable: true,
      width: "250px",
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-xs text-gray-500 truncate max-w-xs block">
          {value}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      editable: true,
      align: "right",
      render: (value) => `$${value.toFixed(2)}`,
      renderEdit: (value, onChange) => (
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-24 px-2 py-1 border rounded"
        />
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
    },
    {
      key: "available",
      label: "Available",
      align: "center",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={menuItems}
      columns={columns}
      selectable
      onDoubleClickEdit
      onUpdate={async (id, data) => {
        console.log('Update menu item', id, data);
      }}
      bulkActions={[
        {
          label: "Mark as available",
          onClick: (ids) => console.log('Mark available', ids),
        },
        {
          label: "Mark as unavailable",
          onClick: (ids) => console.log('Mark unavailable', ids),
        },
        {
          label: "Delete selected",
          variant: "danger",
          onClick: (ids) => console.log('Delete', ids),
        },
      ]}
      rowClassName={(row) =>
        !row.available ? 'opacity-60' : ''
      }
    />
  );
}

// ============================================================================
// Example 3: Orders Table (Read-only with custom actions)
// ============================================================================

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
}

export function OrdersTableExample() {
  const orders: Order[] = [];

  const columns: DataTableColumn<Order>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      align: "right",
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'confirmed' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      data={orders}
      columns={columns}
      selectable
      bulkActions={[
        {
          label: "Export selected",
          onClick: (ids) => console.log('Export', ids),
        },
        {
          label: "Print invoices",
          onClick: (ids) => console.log('Print', ids),
        },
      ]}
      actions={[
        {
          label: "View details",
          onClick: (row) => console.log('View', row.id),
        },
        {
          label: "Cancel",
          variant: "danger",
          onClick: (row) => console.log('Cancel', row.id),
          hidden: (row) => row.status === 'delivered',
        },
      ]}
      onSort={(sortBy, sortOrder) => {
        console.log('Sort by', sortBy, sortOrder);
      }}
    />
  );
}
