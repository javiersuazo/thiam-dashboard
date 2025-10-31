'use client'

import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AdvancedTableEnhanced } from '@/components/shared/tables/AdvancedTable/AdvancedTableEnhanced'
import Badge from '@/components/shared/ui/badge/Badge'
import { TrashBinIcon, PencilIcon, EyeIcon, CheckLineIcon, CloseIcon } from '@/icons'

interface SampleData {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  department: string
  salary: number
  joinDate: string
  skills: string[]
}

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Customer Success', 'Analytics', 'Operations']
const roles = ['Software Engineer', 'Product Manager', 'Designer', 'Marketing Manager', 'Sales Rep', 'Financial Analyst', 'HR Specialist', 'Customer Success Manager', 'Data Analyst', 'Operations Manager']
const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'active', 'active', 'active', 'inactive', 'pending']
const allSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Leadership', 'Communication', 'Project Management', 'Data Analysis']

function generateEmployee(id: number): SampleData {
  const firstName = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah'][id % 10]
  const lastName = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Martinez', 'Davis', 'Garcia', 'Wilson', 'Lee'][Math.floor(id / 10) % 10]
  const name = `${firstName} ${lastName} ${id > 15 ? id : ''}`
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id > 15 ? id : ''}@example.com`
  const role = roles[id % roles.length]
  const department = departments[id % departments.length]
  const status = statuses[id % statuses.length]
  const salary = 60000 + (id % 10) * 10000 + Math.floor(id / 10) * 5000
  const joinDate = new Date(2020 + (id % 5), (id % 12), (id % 28) + 1).toISOString().split('T')[0]

  // Generate 2-4 random skills per employee
  const skillCount = 2 + (id % 3)
  const skills = Array.from({ length: skillCount }, (_, i) =>
    allSkills[(id + i) % allSkills.length]
  )

  return {
    id: String(id),
    name,
    email,
    role,
    status,
    department,
    salary,
    joinDate,
    skills,
  }
}

const mockData: SampleData[] = Array.from({ length: 100 }, (_, i) => generateEmployee(i + 1))

export default function TableTestPage() {
  const [data, setData] = useState<SampleData[]>(mockData)
  const [editedRows, setEditedRows] = useState<Record<string, Partial<SampleData>>>({})

  const handleCellEdit = async (rowId: string, columnId: string, value: any) => {
    setEditedRows(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [columnId]: value
      }
    }))
  }

  const handleSaveRow = (rowId: string) => {
    setData((prev) =>
      prev.map((item) => {
        if (item.id === rowId && editedRows[rowId]) {
          return { ...item, ...editedRows[rowId] }
        }
        return item
      })
    )

    const changes = editedRows[rowId]
    const changedFields = Object.keys(changes).join(', ')

    alert(`Successfully saved changes to row ${rowId}!\n\nUpdated fields: ${changedFields}`)
    console.log('Row saved:', rowId, changes)

    setEditedRows(prev => {
      const newEdited = { ...prev }
      delete newEdited[rowId]
      return newEdited
    })
  }

  const handleCancelRow = (rowId: string) => {
    setEditedRows(prev => {
      const newEdited = { ...prev }
      delete newEdited[rowId]
      return newEdited
    })
  }

  const handleSaveAllChanges = () => {
    setData((prev) =>
      prev.map((item) => {
        if (editedRows[item.id]) {
          return { ...item, ...editedRows[item.id] }
        }
        return item
      })
    )

    const changedCount = Object.keys(editedRows).length
    const totalChanges = Object.values(editedRows).reduce(
      (sum, changes) => sum + Object.keys(changes).length,
      0
    )

    alert(
      `Successfully saved all changes!\n\n` +
      `• ${changedCount} employee(s) updated\n` +
      `• ${totalChanges} total field(s) changed`
    )

    console.log('Bulk changes saved:', editedRows)
    setEditedRows({})
  }

  const handleCancelAllChanges = () => {
    if (confirm(`Discard changes for ${Object.keys(editedRows).length} row(s)?`)) {
      setEditedRows({})
    }
  }

  const columns = useMemo<ColumnDef<SampleData>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      {
        accessorKey: 'name',
        header: 'Employee',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-800 dark:text-white/90">
              {row.original.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <span className="text-gray-800 dark:text-gray-400">
            {editedRows[row.id]?.role ?? row.original.role}
          </span>
        ),
        meta: {
          filterType: 'text',
        },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span className="text-gray-800 dark:text-gray-400">
            {editedRows[row.id]?.department ?? row.original.department}
          </span>
        ),
        meta: {
          filterType: 'select',
          filterOptions: [
            { label: 'Engineering', value: 'Engineering' },
            { label: 'Product', value: 'Product' },
            { label: 'Design', value: 'Design' },
            { label: 'Marketing', value: 'Marketing' },
            { label: 'Sales', value: 'Sales' },
            { label: 'Finance', value: 'Finance' },
            { label: 'HR', value: 'HR' },
            { label: 'Customer Success', value: 'Customer Success' },
            { label: 'Analytics', value: 'Analytics' },
            { label: 'Operations', value: 'Operations' },
          ],
          editType: 'select',
          editOptions: [
            { label: 'Engineering', value: 'Engineering' },
            { label: 'Product', value: 'Product' },
            { label: 'Design', value: 'Design' },
            { label: 'Marketing', value: 'Marketing' },
            { label: 'Sales', value: 'Sales' },
            { label: 'Finance', value: 'Finance' },
            { label: 'HR', value: 'HR' },
            { label: 'Customer Success', value: 'Customer Success' },
            { label: 'Analytics', value: 'Analytics' },
            { label: 'Operations', value: 'Operations' },
          ],
        },
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => (
          <span className="font-medium text-gray-800 dark:text-white/90">
            ${(editedRows[row.id]?.salary ?? row.original.salary).toLocaleString()}
          </span>
        ),
        meta: {
          filterType: 'range',
        },
      },
      {
        accessorKey: 'joinDate',
        header: 'Join Date',
        cell: ({ row }) => {
          const date = editedRows[row.id]?.joinDate ?? row.original.joinDate
          return (
            <span className="text-gray-800 dark:text-gray-400">
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )
        },
        meta: {
          editType: 'date',
        },
      },
      {
        accessorKey: 'skills',
        header: 'Skills',
        cell: ({ row }) => {
          const skills = editedRows[row.id]?.skills ?? row.original.skills
          return (
            <div className="flex flex-wrap gap-1">
              {skills.map((skill, idx) => (
                <Badge key={idx} size="sm" color="default">
                  {skill}
                </Badge>
              ))}
            </div>
          )
        },
        meta: {
          editType: 'multiselect',
          editOptions: allSkills.map(skill => ({ label: skill, value: skill })),
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = editedRows[row.id]?.status ?? row.original.status
          const colorMap = {
            active: 'success' as const,
            inactive: 'error' as const,
            pending: 'warning' as const,
          }

          return (
            <Badge size="sm" color={colorMap[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )
        },
        meta: {
          filterType: 'select',
          filterOptions: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' },
          ],
          editType: 'select',
          editOptions: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' },
          ],
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const hasChanges = !!editedRows[row.id]

          if (hasChanges) {
            return (
              <div className="flex items-center gap-2">
                <button
                  className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveRow(row.id)
                  }}
                  title="Save changes"
                >
                  <CheckLineIcon className="w-5 h-5" />
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelRow(row.id)
                  }}
                  title="Cancel changes"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            )
          }

          return (
            <div className="flex items-center gap-2">
              <button
                className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-500"
                onClick={(e) => {
                  e.stopPropagation()
                  alert(`View details for ${row.original.name}`)
                }}
                title="View"
              >
                <EyeIcon />
              </button>
              <button
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                onClick={(e) => {
                  e.stopPropagation()
                  alert(`Edit ${row.original.name}`)
                }}
                title="Edit"
              >
                <PencilIcon />
              </button>
              <button
                className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete ${row.original.name}?`)) {
                    alert('Deleted!')
                  }
                }}
                title="Delete"
              >
                <TrashBinIcon />
              </button>
            </div>
          )
        },
        enableSorting: false,
        size: 120,
      },
    ],
    [editedRows]
  )

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Advanced Table Test - Enhanced Edition
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating inline editing with multiple input types. Double-click cells to edit: text (Role), number (Salary), select (Department, Status), multiselect (Skills), and date (Join Date).
        </p>
      </div>

      <AdvancedTableEnhanced
        columns={columns}
        data={data}
        enableSorting
        enableFiltering
        enableGlobalFilter
        enablePagination
        enableRowSelection
        enableMultiRowSelection
        enableVirtualization={false}
        searchPlaceholder="Search employees..."
        defaultPageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        onCellEdit={handleCellEdit}
        editableColumns={['salary', 'role', 'department', 'status', 'joinDate', 'skills']}
        getRowClassName={(row) => editedRows[row.id] ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
        showBulkSave={Object.keys(editedRows).length > 0}
        onSaveAll={handleSaveAllChanges}
        onCancelAll={handleCancelAllChanges}
        bulkSaveLabel={`Save Changes (${Object.keys(editedRows).length})`}
        showSearch={false}
        bulkActions={[
          {
            label: 'Delete Selected',
            variant: 'destructive',
            icon: <TrashBinIcon />,
            onClick: (selectedRows) => {
              if (confirm(`Delete ${selectedRows.length} employee(s)?`)) {
                alert(`Deleted ${selectedRows.length} employees!`)
              }
            },
          },
          {
            label: 'Export Selected',
            variant: 'outline',
            onClick: (selectedRows) => {
              alert(`Exporting ${selectedRows.length} employees...`)
              console.log('Selected rows:', selectedRows)
            },
          },
          {
            label: 'Send Email',
            variant: 'default',
            onClick: (selectedRows) => {
              alert(`Sending email to ${selectedRows.length} employees...`)
            },
          },
        ]}
        onRowClick={(row) => {
          console.log('Row clicked:', row)
        }}
        showSearch
        showPagination
        showExport
        showRowsPerPage
        showColumnVisibility
        exportFileName="employees-enhanced"
        onExport={(data) => {
          console.log('Exporting data:', data)
        }}
      />

      <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Features Demonstrated
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Base Features</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Sorting:</strong> Click column headers to sort</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Global Search:</strong> Search across all columns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Pagination:</strong> Navigate with page sizes (10-100)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Row Selection:</strong> Select multiple rows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Bulk Actions:</strong> Perform actions on selected rows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Export:</strong> Export table data to CSV</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span><strong>Dark Mode:</strong> Full light/dark theme support</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Advanced Features</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">★</span>
                <span><strong>Virtual Scrolling:</strong> Handles 100k+ rows efficiently (toggle in code)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">★</span>
                <span><strong>Inline Editing:</strong> Multiple input types - text, number, select, multiselect, date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">★</span>
                <span><strong>Row Highlighting:</strong> Edited rows get yellow background</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">★</span>
                <span><strong>Save/Cancel Actions:</strong> Action buttons change to Save/Cancel when row is edited</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">ℹ</span>
                <span className="text-xs italic">Changes tracked per row with visual feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">ℹ</span>
                <span className="text-xs italic">100 employee records with realistic data</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 text-sm">
            💡 How to Use Inline Editing
          </h4>
          <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-400">
            <li>1. <strong>Double-click</strong> any editable cell (Role, Salary, Department, Status, Skills, Join Date)</li>
            <li>2. <strong>Edit the value</strong> - different input types for each column:</li>
            <li className="ml-4">• <strong>Text:</strong> Role - type freely</li>
            <li className="ml-4">• <strong>Number:</strong> Salary - numeric input</li>
            <li className="ml-4">• <strong>Select:</strong> Department & Status - choose one option</li>
            <li className="ml-4">• <strong>Multi-select:</strong> Skills - check multiple options, then Save</li>
            <li className="ml-4">• <strong>Date:</strong> Join Date - use date picker</li>
            <li>3. <strong>Press Enter</strong> to confirm (or Save button for multi-select) or <strong>Escape</strong> to cancel</li>
            <li>4. <strong>Click the green checkmark (✓)</strong> in Actions column to save all row changes</li>
            <li>5. <strong>Click the X</strong> to discard all changes and restore original values</li>
            <li>• You can edit multiple fields in the same row before saving</li>
            <li>• The row background turns yellow when it has unsaved changes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
