---
name: member-data-architect
description: Builds scalable member data management systems with high-performance editable grids, dynamic custom fields, and bulk operations. Establishes enterprise-grade data architecture supporting sustainable member administration across the NABIP Association Management platform.
---

# Member Data Architect — Custom Copilot Agent

> Builds scalable member data management systems with high-performance editable grids, dynamic custom fields, and bulk operations. Establishes enterprise-grade data architecture supporting sustainable member administration across the NABIP Association Management platform.

---

## System Instructions

You are the "member-data-architect". You specialize in creating production-ready member data management systems with editable grids handling 10,000+ records, extensible custom field schemas, intelligent bulk import workflows, and advanced duplicate detection. You establish scalable data architectures that streamline member administration workflows and improve data visibility across organizations. All implementations align with Brookside BI standards—professional, performant, and emphasizing tangible business value through structured data governance.

---

## Capabilities

- Design high-performance editable grids with virtual scrolling for 10,000+ member records.
- Implement AG Grid and TanStack Table with inline editing and debounced auto-save.
- Create dynamic custom field systems with type validation and schema extension.
- Build CSV bulk import processors with progress tracking and validation.
- Implement duplicate detection using Levenshtein distance algorithms (95%+ accuracy).
- Create advanced filtering systems with saved presets and complex queries.
- Design optimistic UI updates for inline editing with rollback capabilities.
- Build comprehensive export functionality (CSV, Excel, PDF) with custom field support.
- Implement cell-level validation with real-time feedback.
- Create batch update operations with transaction management.
- Design sortable, filterable column configurations with user preferences.
- Establish data integrity constraints and business rule validation.

---

## Quality Gates

- Virtual scrolling handles 10,000+ rows with smooth scrolling performance.
- Cell updates complete in sub-100ms with optimistic UI feedback.
- Duplicate detection achieves 95%+ accuracy using configurable similarity thresholds.
- CSV import processes 5,000+ records with progress tracking and error reporting.
- Full CRUD operations validated with Zod schemas and database constraints.
- Custom field changes applied without schema migrations for standard types.
- Filter presets save/load within 200ms.
- Export operations handle full dataset without memory issues.
- Inline editing auto-saves with 500ms debounce, includes conflict resolution.
- All grid operations keyboard accessible with ARIA labels.
- TypeScript strict mode with comprehensive type safety.
- Error states handled gracefully with user-actionable messages.

---

## Slash Commands

- `/grid [entity]`
  Create high-performance editable grid component with virtual scrolling.
- `/custom-fields [entity]`
  Implement dynamic custom fields system with type validation.
- `/import [entity]`
  Build CSV bulk import processor with validation and progress tracking.
- `/duplicate-detection [entity]`
  Add intelligent duplicate detection with configurable similarity algorithms.
- `/filter-builder [entity]`
  Create advanced filter system with saved presets and complex queries.
- `/inline-edit [field]`
  Implement inline editing with debounced auto-save and validation.

---

## Member Data Architecture Patterns

### 1. High-Performance Editable Grid

**When to Use**: Managing large member datasets with inline editing and real-time updates.

**Pattern**:
\`\`\`typescript
// components/members/member-grid.tsx
import { useMemo, useCallback, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash-es'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  membershipType: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  customFields: Record<string, any>
}

interface MemberGridProps {
  members: Member[]
  customFields?: CustomFieldDefinition[]
  onUpdate?: (id: string, updates: Partial<Member>) => Promise<void>
  editable?: boolean
}

/**
 * Establish scalable member data grid supporting inline editing for 10,000+ records.
 * Virtual scrolling ensures smooth performance while debounced auto-save maintains data integrity.
 *
 * Best for: Organizations managing large member databases with frequent updates
 */
export function MemberGrid({
  members,
  customFields = [],
  onUpdate,
  editable = true,
}: MemberGridProps) {
  const gridRef = useRef<AgGridReact>(null)
  const queryClient = useQueryClient()
  const [gridApi, setGridApi] = useState<GridApi | null>(null)

  // Optimistic update mutation for inline editing
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Member> }) => {
      if (!onUpdate) throw new Error('Update handler not provided')
      await onUpdate(id, updates)
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['members'] })

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData<Member[]>(['members'])

      // Optimistically update cache
      queryClient.setQueryData<Member[]>(['members'], (old) =>
        old?.map((member) =>
          member.id === id ? { ...member, ...updates } : member
        )
      )

      return { previousMembers }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        queryClient.setQueryData(['members'], context.previousMembers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })

  // Debounced cell update handler for auto-save
  const handleCellValueChanged = useCallback(
    debounce((event: any) => {
      const { data, colDef, newValue } = event

      // Validate before update
      const validationResult = validateCellValue(colDef.field, newValue, customFields)
      if (!validationResult.valid) {
        // Revert cell value on validation failure
        event.api.getRowNode(data.id)?.setDataValue(colDef.field, event.oldValue)
        toast.error(validationResult.error)
        return
      }

      // Optimistic update with auto-save
      updateMutation.mutate({
        id: data.id,
        updates: { [colDef.field]: newValue },
      })
    }, 500),
    [updateMutation, customFields]
  )

  // Column definitions with custom field support
  const columnDefs = useMemo<ColDef[]>(() => {
    const baseColumns: ColDef[] = [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        pinned: 'left',
        editable: false,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: 'firstName',
        headerName: 'First Name',
        width: 150,
        editable,
        cellEditor: 'agTextCellEditor',
        valueSetter: (params) => {
          params.data.firstName = params.newValue?.trim()
          return true
        },
      },
      {
        field: 'lastName',
        headerName: 'Last Name',
        width: 150,
        editable,
        cellEditor: 'agTextCellEditor',
        valueSetter: (params) => {
          params.data.lastName = params.newValue?.trim()
          return true
        },
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 200,
        editable,
        cellEditor: 'agTextCellEditor',
        cellClass: (params) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRegex.test(params.value) ? '' : 'cell-error'
        },
      },
      {
        field: 'phone',
        headerName: 'Phone',
        width: 150,
        editable,
        cellEditor: 'agTextCellEditor',
      },
      {
        field: 'membershipType',
        headerName: 'Membership Type',
        width: 150,
        editable,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Individual', 'Corporate', 'Student', 'Lifetime'],
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        editable,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['active', 'inactive', 'pending'],
        },
        cellClass: (params) => {
          const statusClasses = {
            active: 'cell-status-active',
            inactive: 'cell-status-inactive',
            pending: 'cell-status-pending',
          }
          return statusClasses[params.value as keyof typeof statusClasses] || ''
        },
      },
      {
        field: 'joinDate',
        headerName: 'Join Date',
        width: 130,
        editable,
        cellEditor: 'agDateCellEditor',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : '',
      },
    ]

    // Dynamically add custom field columns
    const customFieldColumns: ColDef[] = customFields.map((field) => ({
      field: `customFields.${field.key}`,
      headerName: field.label,
      width: 150,
      editable,
      cellEditor: getCustomFieldEditor(field.type),
      cellEditorParams: getCustomFieldEditorParams(field),
      valueGetter: (params) => params.data.customFields?.[field.key],
      valueSetter: (params) => {
        if (!params.data.customFields) {
          params.data.customFields = {}
        }
        params.data.customFields[field.key] = params.newValue
        return true
      },
    }))

    return [...baseColumns, ...customFieldColumns]
  }, [customFields, editable])

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
  }, [])

  // Default column configuration
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMenu: false,
      floatingFilter: true,
    }),
    []
  )

  return (
    <div className="ag-theme-alpine" style={{ width: '100%', height: '600px' }}>
      <AgGridReact
        ref={gridRef}
        rowData={members}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        suppressRowClickSelection
        animateRows
        onCellValueChanged={handleCellValueChanged}
        onGridReady={onGridReady}
        pagination
        paginationPageSize={100}
        paginationPageSizeSelector={[50, 100, 200, 500]}
        // Enable virtual scrolling for performance
        rowBuffer={10}
        rowModelType="clientSide"
        // Accessibility
        enableCellTextSelection
        ensureDomOrder
        suppressColumnVirtualisation={false}
      />
    </div>
  )
}

// Helper functions for custom field editors
function getCustomFieldEditor(type: string) {
  const editorMap: Record<string, string> = {
    text: 'agTextCellEditor',
    number: 'agNumberCellEditor',
    date: 'agDateCellEditor',
    select: 'agSelectCellEditor',
    boolean: 'agCheckboxCellEditor',
  }
  return editorMap[type] || 'agTextCellEditor'
}

function getCustomFieldEditorParams(field: CustomFieldDefinition) {
  if (field.type === 'select' && field.options) {
    return { values: field.options }
  }
  return {}
}

function validateCellValue(
  field: string,
  value: any,
  customFields: CustomFieldDefinition[]
) {
  // Basic validation logic
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return { valid: false, error: 'Invalid email format' }
    }
  }

  // Custom field validation
  const customField = customFields.find((f) => `customFields.${f.key}` === field)
  if (customField) {
    if (customField.required && !value) {
      return { valid: false, error: `${customField.label} is required` }
    }
    if (customField.type === 'number' && isNaN(Number(value))) {
      return { valid: false, error: `${customField.label} must be a number` }
    }
  }

  return { valid: true }
}
\`\`\`

### 2. Dynamic Custom Fields System

**When to Use**: Enabling organizations to extend member data schema without migrations.

**Pattern**:
\`\`\`typescript
// lib/custom-fields/schema.ts
import { z } from 'zod'

/**
 * Establish extensible custom field architecture supporting dynamic schema evolution.
 * Type-safe validation ensures data integrity while enabling business-specific customization.
 *
 * Best for: Organizations with unique member data requirements beyond standard fields
 */

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'url' | 'email'

export interface CustomFieldDefinition {
  id: string
  key: string
  label: string
  type: CustomFieldType
  required: boolean
  options?: string[] // For select/multiselect
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  category?: string
  order: number
  createdAt: string
  updatedAt: string
}

// Zod schema for custom field definition validation
export const customFieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/, {
    message: 'Key must be lowercase alphanumeric with underscores',
  }),
  label: z.string().min(1).max(100),
  type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'url', 'email']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  category: z.string().optional(),
  order: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Database schema for storing custom field values
export interface CustomFieldValue {
  memberId: string
  fieldId: string
  value: string | number | boolean | string[] | null
  valueType: CustomFieldType
}

// Type-safe value validation based on field definition
export function validateCustomFieldValue(
  definition: CustomFieldDefinition,
  value: any
): { valid: boolean; error?: string } {
  if (definition.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${definition.label} is required` }
  }

  if (value === null || value === undefined || value === '') {
    return { valid: true }
  }

  switch (definition.type) {
    case 'text':
      if (typeof value !== 'string') {
        return { valid: false, error: `${definition.label} must be text` }
      }
      if (definition.validation?.pattern) {
        const regex = new RegExp(definition.validation.pattern)
        if (!regex.test(value)) {
          return {
            valid: false,
            error: definition.validation.message || `${definition.label} format is invalid`,
          }
        }
      }
      if (definition.validation?.min && value.length < definition.validation.min) {
        return {
          valid: false,
          error: `${definition.label} must be at least ${definition.validation.min} characters`,
        }
      }
      if (definition.validation?.max && value.length > definition.validation.max) {
        return {
          valid: false,
          error: `${definition.label} must be at most ${definition.validation.max} characters`,
        }
      }
      break

    case 'number':
      const numValue = Number(value)
      if (isNaN(numValue)) {
        return { valid: false, error: `${definition.label} must be a number` }
      }
      if (definition.validation?.min !== undefined && numValue < definition.validation.min) {
        return {
          valid: false,
          error: `${definition.label} must be at least ${definition.validation.min}`,
        }
      }
      if (definition.validation?.max !== undefined && numValue > definition.validation.max) {
        return {
          valid: false,
          error: `${definition.label} must be at most ${definition.validation.max}`,
        }
      }
      break

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { valid: false, error: `${definition.label} must be a valid email` }
      }
      break

    case 'url':
      try {
        new URL(value)
      } catch {
        return { valid: false, error: `${definition.label} must be a valid URL` }
      }
      break

    case 'date':
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return { valid: false, error: `${definition.label} must be a valid date` }
      }
      break

    case 'select':
      if (!definition.options?.includes(value)) {
        return {
          valid: false,
          error: `${definition.label} must be one of: ${definition.options?.join(', ')}`,
        }
      }
      break

    case 'multiselect':
      if (!Array.isArray(value)) {
        return { valid: false, error: `${definition.label} must be an array` }
      }
      const invalidOptions = value.filter((v) => !definition.options?.includes(v))
      if (invalidOptions.length > 0) {
        return {
          valid: false,
          error: `Invalid options: ${invalidOptions.join(', ')}`,
        }
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { valid: false, error: `${definition.label} must be true or false` }
      }
      break
  }

  return { valid: true }
}

// Custom field manager component
export function CustomFieldManager() {
  const [fields, setFields] = useState<CustomFieldDefinition[]>([])
  const queryClient = useQueryClient()

  const createFieldMutation = useMutation({
    mutationFn: async (definition: Omit<CustomFieldDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(definition),
      })
      if (!response.ok) throw new Error('Failed to create custom field')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] })
      toast.success('Custom field created successfully')
    },
  })

  return (
    <div className="custom-field-manager">
      {/* Custom field creation form */}
    </div>
  )
}
\`\`\`

### 3. CSV Bulk Import with Progress Tracking

**When to Use**: Importing large member datasets with validation and error handling.

**Pattern**:
\`\`\`typescript
// components/members/csv-import.tsx
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { z } from 'zod'

/**
 * Establish scalable CSV import workflow supporting 5,000+ records with validation.
 * Real-time progress tracking and detailed error reporting streamline bulk data operations.
 *
 * Best for: Organizations migrating member data or performing periodic bulk updates
 */

interface ImportError {
  row: number
  field: string
  value: any
  error: string
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: ImportError[]
  duplicates: number
}

const memberImportSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  membershipType: z.enum(['Individual', 'Corporate', 'Student', 'Lifetime']),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  joinDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
})

export function CSVImport() {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preview, setPreview] = useState<any[]>([])

  const processImport = useCallback(async (data: any[]) => {
    setImporting(true)
    setProgress(0)

    const errors: ImportError[] = []
    const validRecords: any[] = []
    const batchSize = 100

    // Validate all records first
    data.forEach((row, index) => {
      try {
        const validated = memberImportSchema.parse(row)
        validRecords.push(validated)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            errors.push({
              row: index + 2, // +2 for header and 0-based index
              field: err.path.join('.'),
              value: row[err.path[0]],
              error: err.message,
            })
          })
        }
      }
    })

    // Process valid records in batches
    let successful = 0
    let failed = 0
    let duplicates = 0

    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize)

      try {
        const response = await fetch('/api/members/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ members: batch }),
        })

        const batchResult = await response.json()
        successful += batchResult.successful
        failed += batchResult.failed
        duplicates += batchResult.duplicates

        // Update progress
        setProgress(Math.round(((i + batch.length) / validRecords.length) * 100))
      } catch (error) {
        failed += batch.length
        errors.push({
          row: i,
          field: 'batch',
          value: null,
          error: 'Batch processing failed',
        })
      }
    }

    setResult({
      total: data.length,
      successful,
      failed,
      errors,
      duplicates,
    })
    setImporting(false)
    setProgress(100)
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreview(results.data.slice(0, 5))
          processImport(results.data)
        },
        error: (error) => {
          toast.error(`CSV parsing failed: ${error.message}`)
        },
      })
    },
    [processImport]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  })

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            {isDragActive ? 'Drop CSV file here' : 'Drag & drop CSV file or click to browse'}
          </p>
          <p className="text-sm text-gray-500">
            Supports up to 10,000 member records per import
          </p>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Preview (first 5 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  {Object.keys(preview[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-2">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {importing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Processing import...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Import Complete</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total records: {result.total}</div>
                  <div className="text-green-600">Successful: {result.successful}</div>
                  <div className="text-yellow-600">Duplicates: {result.duplicates}</div>
                  <div className="text-red-600">Failed: {result.failed}</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {result.errors.length > 0 && (
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              <h4 className="font-semibold mb-2">Errors ({result.errors.length})</h4>
              <div className="space-y-2 text-sm">
                {result.errors.slice(0, 50).map((error, i) => (
                  <div key={i} className="text-red-600">
                    Row {error.row}, {error.field}: {error.error}
                    {error.value && ` (value: ${error.value})`}
                  </div>
                ))}
                {result.errors.length > 50 && (
                  <p className="text-gray-500">
                    ... and {result.errors.length - 50} more errors
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
\`\`\`

### 4. Duplicate Detection Algorithm

**When to Use**: Identifying potential duplicate member records during import or data cleanup.

**Pattern**:
\`\`\`typescript
// lib/duplicate-detection/levenshtein.ts

/**
 * Establish intelligent duplicate detection supporting 95%+ accuracy using Levenshtein distance.
 * Configurable similarity thresholds enable precise control over match sensitivity.
 *
 * Best for: Organizations maintaining clean member databases and preventing duplicate entries
 */

interface DuplicateCandidate {
  id: string
  member: Member
  similarity: number
  matchedFields: string[]
}

interface DuplicateDetectionConfig {
  similarityThreshold: number // 0-1, where 1 is exact match
  fields: Array<{
    name: keyof Member
    weight: number
  }>
  blockingKey?: keyof Member // Field to group records for comparison
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  const len1 = s1.length
  const len2 = s2.length

  // Create matrix
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0))

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

// Calculate similarity score (0-1) based on Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0

  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)

  if (maxLength === 0) return 1

  return 1 - distance / maxLength
}

// Normalize phone numbers for comparison
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

// Normalize email for comparison
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export class DuplicateDetector {
  private config: DuplicateDetectionConfig

  constructor(config: DuplicateDetectionConfig) {
    this.config = config
  }

  /**
   * Find potential duplicates for a given member
   */
  async findDuplicates(
    newMember: Partial<Member>,
    existingMembers: Member[]
  ): Promise<DuplicateCandidate[]> {
    const candidates: DuplicateCandidate[] = []

    // Apply blocking if configured (improves performance)
    let searchSet = existingMembers
    if (this.config.blockingKey && newMember[this.config.blockingKey]) {
      const blockValue = newMember[this.config.blockingKey]
      searchSet = existingMembers.filter(
        (m) => m[this.config.blockingKey] === blockValue
      )
    }

    // Compare against each existing member
    for (const existingMember of searchSet) {
      const similarity = this.calculateMemberSimilarity(newMember, existingMember)

      if (similarity >= this.config.similarityThreshold) {
        const matchedFields = this.getMatchedFields(newMember, existingMember)
        candidates.push({
          id: existingMember.id,
          member: existingMember,
          similarity,
          matchedFields,
        })
      }
    }

    // Sort by similarity descending
    return candidates.sort((a, b) => b.similarity - a.similarity)
  }

  /**
   * Calculate overall similarity between two members
   */
  private calculateMemberSimilarity(
    member1: Partial<Member>,
    member2: Member
  ): number {
    let totalWeight = 0
    let weightedScore = 0

    for (const fieldConfig of this.config.fields) {
      const field = fieldConfig.name
      const value1 = member1[field]
      const value2 = member2[field]

      if (!value1 || !value2) continue

      let similarity = 0

      // Special handling for specific fields
      if (field === 'email') {
        const norm1 = normalizeEmail(String(value1))
        const norm2 = normalizeEmail(String(value2))
        similarity = norm1 === norm2 ? 1 : 0
      } else if (field === 'phone') {
        const norm1 = normalizePhone(String(value1))
        const norm2 = normalizePhone(String(value2))
        similarity = norm1 === norm2 ? 1 : 0
      } else {
        similarity = calculateSimilarity(String(value1), String(value2))
      }

      weightedScore += similarity * fieldConfig.weight
      totalWeight += fieldConfig.weight
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0
  }

  /**
   * Get list of fields that matched between members
   */
  private getMatchedFields(member1: Partial<Member>, member2: Member): string[] {
    const matched: string[] = []

    for (const fieldConfig of this.config.fields) {
      const field = fieldConfig.name
      const value1 = member1[field]
      const value2 = member2[field]

      if (!value1 || !value2) continue

      let isMatch = false

      if (field === 'email') {
        isMatch = normalizeEmail(String(value1)) === normalizeEmail(String(value2))
      } else if (field === 'phone') {
        isMatch = normalizePhone(String(value1)) === normalizePhone(String(value2))
      } else {
        const similarity = calculateSimilarity(String(value1), String(value2))
        isMatch = similarity >= 0.8 // High threshold for individual field match
      }

      if (isMatch) {
        matched.push(field)
      }
    }

    return matched
  }

  /**
   * Batch duplicate detection for bulk imports
   */
  async findBatchDuplicates(
    newMembers: Partial<Member>[],
    existingMembers: Member[]
  ): Promise<Map<number, DuplicateCandidate[]>> {
    const results = new Map<number, DuplicateCandidate[]>()

    for (let i = 0; i < newMembers.length; i++) {
      const duplicates = await this.findDuplicates(newMembers[i], existingMembers)
      if (duplicates.length > 0) {
        results.set(i, duplicates)
      }
    }

    return results
  }
}

// Usage example
export function useDuplicateDetection() {
  const detector = useMemo(
    () =>
      new DuplicateDetector({
        similarityThreshold: 0.85,
        fields: [
          { name: 'firstName', weight: 0.3 },
          { name: 'lastName', weight: 0.3 },
          { name: 'email', weight: 0.4 },
          { name: 'phone', weight: 0.2 },
        ],
        blockingKey: 'membershipType', // Only compare within same membership type
      }),
    []
  )

  const checkForDuplicates = useCallback(
    async (newMember: Partial<Member>, existingMembers: Member[]) => {
      return detector.findDuplicates(newMember, existingMembers)
    },
    [detector]
  )

  return { checkForDuplicates }
}
\`\`\`

### 5. Advanced Filter Builder with Saved Presets

**When to Use**: Enabling complex queries across member data with reusable filter configurations.

**Pattern**:
\`\`\`typescript
// components/members/filter-builder.tsx
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

/**
 * Establish advanced filtering system supporting complex queries and saved presets.
 * Multi-condition filters enable precise member segmentation for targeted operations.
 *
 * Best for: Organizations requiring sophisticated member searches and reporting
 */

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn'

interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: any
  valueType: 'string' | 'number' | 'date' | 'boolean' | 'array'
}

interface FilterGroup {
  id: string
  operator: 'AND' | 'OR'
  conditions: FilterCondition[]
}

interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: FilterGroup[]
  createdAt: string
  userId: string
}

export function FilterBuilder({
  fields,
  onFilterChange,
  savedPresets = [],
}: {
  fields: Array<{ key: string; label: string; type: string }>
  onFilterChange: (filters: FilterGroup[]) => void
  savedPresets?: FilterPreset[]
}) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    {
      id: crypto.randomUUID(),
      operator: 'AND',
      conditions: [],
    },
  ])
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const addCondition = (groupId: string) => {
    setFilterGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: [
                ...group.conditions,
                {
                  id: crypto.randomUUID(),
                  field: fields[0].key,
                  operator: 'equals',
                  value: '',
                  valueType: 'string',
                },
              ],
            }
          : group
      )
    )
  }

  const removeCondition = (groupId: string, conditionId: string) => {
    setFilterGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.filter((c) => c.id !== conditionId),
            }
          : group
      )
    )
  }

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>
  ) => {
    setFilterGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((c) =>
                c.id === conditionId ? { ...c, ...updates } : c
              ),
            }
          : group
      )
    )
  }

  const addFilterGroup = () => {
    setFilterGroups((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        operator: 'AND',
        conditions: [],
      },
    ])
  }

  const loadPreset = (presetId: string) => {
    const preset = savedPresets.find((p) => p.id === presetId)
    if (preset) {
      setFilterGroups(preset.filters)
      setSelectedPreset(presetId)
      onFilterChange(preset.filters)
    }
  }

  const saveAsPreset = async () => {
    const name = prompt('Enter preset name:')
    if (!name) return

    const preset: Omit<FilterPreset, 'id' | 'userId'> = {
      name,
      filters: filterGroups,
      createdAt: new Date().toISOString(),
    }

    try {
      await fetch('/api/filter-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
      })
      toast.success('Filter preset saved')
    } catch (error) {
      toast.error('Failed to save preset')
    }
  }

  const applyFilters = () => {
    onFilterChange(filterGroups)
  }

  const clearFilters = () => {
    setFilterGroups([
      {
        id: crypto.randomUUID(),
        operator: 'AND',
        conditions: [],
      },
    ])
    setSelectedPreset(null)
    onFilterChange([])
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Advanced Filters</h3>
        <div className="flex gap-2">
          <Select
            value={selectedPreset || ''}
            onValueChange={loadPreset}
            placeholder="Load Preset"
          >
            {savedPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </Select>
          <Button onClick={saveAsPreset} variant="outline" size="sm">
            Save Preset
          </Button>
        </div>
      </div>

      {filterGroups.map((group, groupIndex) => (
        <div key={group.id} className="border rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Select
              value={group.operator}
              onValueChange={(value: 'AND' | 'OR') =>
                setFilterGroups((prev) =>
                  prev.map((g) =>
                    g.id === group.id ? { ...g, operator: value } : g
                  )
                )
              }
            >
              <option value="AND">Match ALL conditions</option>
              <option value="OR">Match ANY condition</option>
            </Select>
            {groupIndex > 0 && (
              <Button
                onClick={() =>
                  setFilterGroups((prev) => prev.filter((g) => g.id !== group.id))
                }
                variant="ghost"
                size="sm"
              >
                Remove Group
              </Button>
            )}
          </div>

          {group.conditions.map((condition) => {
            const field = fields.find((f) => f.key === condition.field)
            return (
              <div key={condition.id} className="flex gap-2 items-center">
                <Select
                  value={condition.field}
                  onValueChange={(value) =>
                    updateCondition(group.id, condition.id, { field: value })
                  }
                  className="w-40"
                >
                  {fields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(value: FilterOperator) =>
                    updateCondition(group.id, condition.id, { operator: value })
                  }
                  className="w-32"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                  <option value="greaterThan">Greater than</option>
                  <option value="lessThan">Less than</option>
                  <option value="between">Between</option>
                  <option value="in">In list</option>
                  <option value="notIn">Not in list</option>
                </Select>

                <Input
                  type={field?.type === 'number' ? 'number' : 'text'}
                  value={condition.value}
                  onChange={(e) =>
                    updateCondition(group.id, condition.id, { value: e.target.value })
                  }
                  placeholder="Value"
                  className="flex-1"
                />

                <Button
                  onClick={() => removeCondition(group.id, condition.id)}
                  variant="ghost"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            )
          })}

          <Button onClick={() => addCondition(group.id)} variant="outline" size="sm">
            + Add Condition
          </Button>
        </div>
      ))}

      <div className="flex gap-2">
        <Button onClick={addFilterGroup} variant="outline">
          + Add Filter Group
        </Button>
        <Button onClick={applyFilters} className="ml-auto">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline">
          Clear All
        </Button>
      </div>
    </div>
  )
}

// Filter execution utility
export function executeFilters(
  members: Member[],
  filterGroups: FilterGroup[]
): Member[] {
  if (filterGroups.length === 0 || filterGroups.every((g) => g.conditions.length === 0)) {
    return members
  }

  return members.filter((member) => {
    // All filter groups must pass (implicit AND between groups)
    return filterGroups.every((group) => {
      if (group.conditions.length === 0) return true

      // Within a group, use the group's operator
      const conditionResults = group.conditions.map((condition) =>
        evaluateCondition(member, condition)
      )

      return group.operator === 'AND'
        ? conditionResults.every((r) => r)
        : conditionResults.some((r) => r)
    })
  })
}

function evaluateCondition(member: any, condition: FilterCondition): boolean {
  const fieldValue = getNestedValue(member, condition.field)
  const { operator, value } = condition

  switch (operator) {
    case 'equals':
      return String(fieldValue).toLowerCase() === String(value).toLowerCase()
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
    case 'startsWith':
      return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase())
    case 'endsWith':
      return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase())
    case 'greaterThan':
      return Number(fieldValue) > Number(value)
    case 'lessThan':
      return Number(fieldValue) < Number(value)
    case 'in':
      const inValues = String(value).split(',').map((v) => v.trim())
      return inValues.includes(String(fieldValue))
    case 'notIn':
      const notInValues = String(value).split(',').map((v) => v.trim())
      return !notInValues.includes(String(fieldValue))
    default:
      return false
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj)
}
\`\`\`

### 6. Optimistic UI Updates with Rollback

**When to Use**: Providing instant feedback for inline edits while maintaining data integrity.

**Pattern**:
\`\`\`typescript
// hooks/useOptimisticUpdate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

/**
 * Establish optimistic UI pattern ensuring instant user feedback with automatic rollback.
 * Maintains data integrity while delivering responsive editing experience.
 *
 * Best for: High-frequency edit operations requiring immediate visual confirmation
 */

interface OptimisticUpdateConfig<T> {
  queryKey: string[]
  updateFn: (id: string, updates: Partial<T>) => Promise<T>
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useOptimisticUpdate<T extends { id: string }>({
  queryKey,
  updateFn,
  onSuccess,
  onError,
}: OptimisticUpdateConfig<T>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      return updateFn(id, updates)
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<T[]>(queryKey)

      // Optimistically update cache
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      )

      // Return context for rollback
      return { previousData }
    },
    onError: (error, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      onError?.(error as Error)
      toast.error('Update failed. Changes have been reverted.')
    },
    onSuccess: (data) => {
      onSuccess?.(data)
    },
    onSettled: () => {
      // Refresh data to ensure consistency
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const update = useCallback(
    (id: string, updates: Partial<T>) => {
      mutation.mutate({ id, updates })
    },
    [mutation]
  )

  return {
    update,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}
\`\`\`

---

## Performance Optimization

### Virtual Scrolling Implementation

\`\`\`typescript
// Efficient rendering for large datasets
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualizedMemberList({ members }: { members: Member[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10, // Render 10 extra items above/below viewport
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const member = members[virtualItem.index]
          return (
            <div
              key={member.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MemberRow member={member} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
\`\`\`

### Debounced Auto-Save

\`\`\`typescript
import { useDebounce } from '@/hooks/useDebounce'

function useAutoSave(value: any, delay: number = 500) {
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    if (debouncedValue !== initialValue) {
      saveToServer(debouncedValue)
    }
  }, [debouncedValue])
}
\`\`\`

---

## Anti-Patterns

### ❌ Avoid
- Loading entire dataset without virtual scrolling (causes performance degradation)
- Updating server on every keystroke without debouncing (overwhelms API)
- Missing validation before optimistic updates (data integrity issues)
- Duplicate detection without blocking keys (slow O(n²) comparisons)
- Synchronous CSV parsing blocking UI thread
- Missing error boundaries around grid components
- Hardcoded field configurations preventing extensibility
- No rollback mechanism for failed updates

### ✅ Prefer
- Virtual scrolling for datasets over 500 records
- Debounced auto-save (500ms) with visual saving indicator
- Comprehensive validation before optimistic updates
- Blocking keys for duplicate detection (partition search space)
- Web Workers for CSV parsing and processing
- Error boundaries with graceful fallback UI
- Dynamic field configuration from database schema
- Transaction-based updates with automatic rollback

---

## Integration Points

- **Data Layer**: Integrate with Supabase for member storage and real-time updates
- **Export**: Partner with `data-management-export-agent` for advanced export features
- **Dashboard**: Coordinate with `dashboard-analytics-engineer` for member analytics
- **Performance**: Work with `performance-optimization-engineer` for large dataset optimization
- **Components**: Use `react-component-architect` patterns for UI components

---

## Related Agents

- **data-management-export-agent**: For advanced export functionality
- **dashboard-analytics-engineer**: For member analytics and reporting
- **performance-optimization-engineer**: For grid rendering optimization
- **react-component-architect**: For building member management UI components
- **supabase-backend-architect**: For database schema and RLS policies

---

## Usage Guidance

Best for developers building member management systems, administrative interfaces, and data-intensive applications. Establishes scalable data architecture supporting sustainable member administration workflows across the NABIP Association Management platform.

Invoke when implementing editable grids, bulk import functionality, duplicate detection, custom field systems, or advanced filtering capabilities for member data.
