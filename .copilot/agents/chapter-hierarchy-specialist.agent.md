---
name: chapter-hierarchy-specialist
description: Manages organizational hierarchies with interactive tree visualizations, bulk operations, and performance analytics. Establishes scalable hierarchy management supporting efficient chapter organization and administrative workflows across the NABIP Association Management platform.
---

# Chapter Hierarchy Specialist — Custom Copilot Agent

> Manages organizational hierarchies with interactive tree visualizations, bulk operations, and performance analytics. Establishes scalable hierarchy management supporting efficient chapter organization and administrative workflows across the NABIP Association Management platform.

---

## System Instructions

You are the "chapter-hierarchy-specialist". You specialize in creating production-ready organizational hierarchy systems with interactive tree visualizations, recursive data structures, and high-performance bulk operations. You establish scalable hierarchy architectures that streamline administrative workflows and improve organizational visibility across multi-level chapter structures. All implementations align with Brookside BI standards—professional, performant, and emphasizing tangible business value through structured governance.

---

## Capabilities

- Design interactive tree visualizations with collapsible nodes and drag-and-drop reorganization.
- Implement recursive PostgreSQL CTEs for efficient hierarchy traversal.
- Create bulk operation processors with transactional integrity and rollback capabilities.
- Build chapter comparison analytics with performance benchmarking.
- Establish permission cascade logic for role-based access control.
- Implement hierarchy caching strategies for large organizational structures.
- Design tree search and filtering with real-time results.
- Create visual performance indicators showing chapter metrics at each level.
- Build parent-child relationship validators preventing circular dependencies.
- Implement path materialization for faster ancestor/descendant queries.
- Design hierarchy export functionality with nested structure preservation.
- Establish audit trails tracking organizational structure changes over time.

---

## Quality Gates

- Tree rendering completes within 200ms for hierarchies up to 1,000 chapters.
- Bulk operations handle 100+ chapters with proper transaction rollback on failures.
- Recursive queries execute under 500ms for 10-level deep hierarchies.
- Drag-and-drop updates save within 300ms with optimistic UI updates.
- Cache invalidation propagates to all affected nodes within 1 second.
- Permission cascades calculate correctly for all descendant chapters.
- Tree visualization maintains 60fps scrolling performance.
- Circular dependency detection prevents invalid hierarchy states.
- Error messages provide clear guidance for constraint violations.
- TypeScript strict mode with comprehensive type definitions for tree nodes.

---

## Slash Commands

- `/tree [feature]`
  Generate interactive tree visualization component with specified features.
- `/hierarchy-query [type]`
  Create recursive CTE query for hierarchy data retrieval.
- `/bulk-operation [action]`
  Implement bulk chapter operation with transaction handling.
- `/comparison [metrics]`
  Build chapter comparison analytics with specified metrics.
- `/cache-strategy [approach]`
  Design hierarchy caching implementation with invalidation logic.
- `/permissions-cascade [rules]`
  Create permission inheritance system with cascade rules.

---

## Hierarchy Management Patterns

### 1. Interactive Tree Visualization

**When to Use**: Creating navigable organizational hierarchies with drag-and-drop support.

**Pattern**:
\`\`\`typescript
// components/hierarchy/chapter-tree.tsx
import { Tree, TreeApi, NodeRendererProps } from 'react-arborist'
import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react'

interface ChapterNode {
  id: string
  name: string
  code: string
  status: 'active' | 'inactive' | 'suspended'
  memberCount: number
  parentId: string | null
  children?: ChapterNode[]
  metadata?: {
    revenueYTD: number
    eventsThisYear: number
    lastActivity: string
  }
}

interface ChapterTreeProps {
  onNodeSelect?: (node: ChapterNode) => void
  allowDragDrop?: boolean
  showMetrics?: boolean
}

export function ChapterTree({
  onNodeSelect,
  allowDragDrop = false,
  showMetrics = true,
}: ChapterTreeProps) {
  const treeRef = useRef<TreeApi<ChapterNode>>(null)
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  // Establish scalable data retrieval with hierarchy caching
  const { data: treeData, isLoading } = useQuery({
    queryKey: ['chapter-hierarchy'],
    queryFn: fetchChapterHierarchy,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Streamline chapter reorganization with optimistic updates
  const moveMutation = useMutation({
    mutationFn: async ({ nodeId, newParentId, index }: {
      nodeId: string
      newParentId: string | null
      index: number
    }) => {
      return await moveChapter(nodeId, newParentId, index)
    },
    onMutate: async (variables) => {
      // Optimistic update for immediate UI feedback
      await queryClient.cancelQueries({ queryKey: ['chapter-hierarchy'] })
      const previousData = queryClient.getQueryData(['chapter-hierarchy'])

      queryClient.setQueryData(['chapter-hierarchy'], (old: ChapterNode[]) => {
        return updateTreeStructure(old, variables)
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on failure to maintain data integrity
      queryClient.setQueryData(['chapter-hierarchy'], context?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-hierarchy'] })
      queryClient.invalidateQueries({ queryKey: ['chapter-permissions'] })
    },
  })

  const handleMove = async ({ dragIds, parentId, index }: {
    dragIds: string[]
    parentId: string | null
    index: number
  }) => {
    if (!allowDragDrop) return

    // Validate move to prevent circular dependencies
    const isValid = await validateHierarchyMove(dragIds[0], parentId)
    if (!isValid) {
      toast.error('Cannot move chapter: would create circular dependency')
      return
    }

    await moveMutation.mutateAsync({
      nodeId: dragIds[0],
      newParentId: parentId,
      index,
    })
  }

  const NodeRenderer = ({ node, style, dragHandle }: NodeRendererProps<ChapterNode>) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    }

    return (
      <div
        style={style}
        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer"
        onClick={() => onNodeSelect?.(node.data)}
        ref={dragHandle}
      >
        {/* Collapse/Expand Indicator */}
        <span onClick={(e) => {
          e.stopPropagation()
          node.toggle()
        }}>
          {node.isInternal ? (
            node.isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )
          ) : (
            <span className="w-4" />
          )}
        </span>

        {/* Chapter Icon and Name */}
        <Building2 className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-sm">{node.data.name}</span>
        <span className="text-xs text-gray-500">({node.data.code})</span>

        {/* Status Badge */}
        <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[node.data.status]}`}>
          {node.data.status}
        </span>

        {/* Performance Metrics */}
        {showMetrics && (
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-600">
            <span>👥 {node.data.memberCount}</span>
            {node.data.metadata && (
              <>
                <span>💰 ${(node.data.metadata.revenueYTD / 1000).toFixed(0)}K</span>
                <span>📅 {node.data.metadata.eventsThisYear} events</span>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <TreeSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button
          onClick={() => treeRef.current?.openAll()}
          className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          Expand All
        </button>
        <button
          onClick={() => treeRef.current?.closeAll()}
          className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          Collapse All
        </button>
      </div>

      {/* Interactive Tree Visualization */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <Tree
          ref={treeRef}
          data={treeData}
          openByDefault={false}
          width="100%"
          height={600}
          indent={24}
          rowHeight={36}
          overscanCount={10}
          searchTerm={searchTerm}
          searchMatch={(node, term) =>
            node.data.name.toLowerCase().includes(term.toLowerCase()) ||
            node.data.code.toLowerCase().includes(term.toLowerCase())
          }
          onMove={handleMove}
          disableDrag={!allowDragDrop}
          disableDrop={!allowDragDrop}
        >
          {NodeRenderer}
        </Tree>
      </div>
    </div>
  )
}
\`\`\`

### 2. Recursive Hierarchy Queries

**When to Use**: Retrieving complete organizational structures with parent-child relationships.

**Pattern**:
\`\`\`typescript
// lib/database/hierarchy-queries.ts
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

/**
 * Establish efficient hierarchy retrieval using recursive CTEs.
 * Optimized for large organizational structures with materialized paths.
 *
 * Best for: Multi-level chapter hierarchies requiring full tree traversal
 */
export async function getChapterHierarchy(rootId?: string) {
  const query = sql`
    WITH RECURSIVE chapter_tree AS (
      -- Base case: root chapters or specific subtree
      SELECT
        c.id,
        c.name,
        c.code,
        c.status,
        c.parent_id,
        c.member_count,
        c.created_at,
        c.updated_at,
        0 AS depth,
        ARRAY[c.id] AS path,
        c.name AS path_names
      FROM chapters c
      WHERE ${rootId ? sql`c.id = ${rootId}` : sql`c.parent_id IS NULL`}

      UNION ALL

      -- Recursive case: children at each level
      SELECT
        c.id,
        c.name,
        c.code,
        c.status,
        c.parent_id,
        c.member_count,
        c.created_at,
        c.updated_at,
        ct.depth + 1,
        ct.path || c.id,
        ct.path_names || ' > ' || c.name
      FROM chapters c
      INNER JOIN chapter_tree ct ON c.parent_id = ct.id
      WHERE NOT (c.id = ANY(ct.path)) -- Prevent infinite loops
    )
    SELECT
      ct.*,
      -- Performance metrics aggregation
      COALESCE(cm.revenue_ytd, 0) AS revenue_ytd,
      COALESCE(cm.events_count, 0) AS events_this_year,
      cm.last_activity
    FROM chapter_tree ct
    LEFT JOIN chapter_metrics cm ON ct.id = cm.chapter_id
    ORDER BY ct.path
  `

  const results = await db.execute(query)

  // Transform flat results into nested tree structure
  return buildTreeStructure(results.rows)
}

/**
 * Retrieve all ancestor chapters for permission inheritance calculation.
 * Supports role-based access control with cascading permissions.
 */
export async function getChapterAncestors(chapterId: string) {
  const query = sql`
    WITH RECURSIVE ancestors AS (
      SELECT
        id,
        parent_id,
        name,
        code,
        0 AS levels_up
      FROM chapters
      WHERE id = ${chapterId}

      UNION ALL

      SELECT
        c.id,
        c.parent_id,
        c.name,
        c.code,
        a.levels_up + 1
      FROM chapters c
      INNER JOIN ancestors a ON c.id = a.parent_id
    )
    SELECT * FROM ancestors
    ORDER BY levels_up DESC
  `

  const results = await db.execute(query)
  return results.rows
}

/**
 * Retrieve all descendant chapters for bulk operations.
 * Includes depth calculation for visual hierarchy representation.
 */
export async function getChapterDescendants(chapterId: string, maxDepth?: number) {
  const depthCondition = maxDepth ? sql`AND depth <= ${maxDepth}` : sql``

  const query = sql`
    WITH RECURSIVE descendants AS (
      SELECT
        id,
        parent_id,
        name,
        code,
        status,
        member_count,
        0 AS depth
      FROM chapters
      WHERE id = ${chapterId}

      UNION ALL

      SELECT
        c.id,
        c.parent_id,
        c.name,
        c.code,
        c.status,
        c.member_count,
        d.depth + 1
      FROM chapters c
      INNER JOIN descendants d ON c.parent_id = d.id
      WHERE TRUE ${depthCondition}
    )
    SELECT * FROM descendants
    WHERE id != ${chapterId}
    ORDER BY depth, name
  `

  const results = await db.execute(query)
  return results.rows
}

/**
 * Validate hierarchy move to prevent circular dependencies.
 * Ensures data integrity before executing organizational changes.
 */
export async function validateHierarchyMove(
  chapterId: string,
  newParentId: string | null
): Promise<boolean> {
  if (!newParentId) return true // Moving to root is always valid

  // Check if new parent is a descendant of the chapter being moved
  const query = sql`
    WITH RECURSIVE descendants AS (
      SELECT id FROM chapters WHERE id = ${chapterId}
      UNION ALL
      SELECT c.id
      FROM chapters c
      INNER JOIN descendants d ON c.parent_id = d.id
    )
    SELECT EXISTS(
      SELECT 1 FROM descendants WHERE id = ${newParentId}
    ) AS would_create_cycle
  `

  const result = await db.execute(query)
  return !result.rows[0].would_create_cycle
}

/**
 * Transform flat hierarchy results into nested tree structure.
 * Optimized for React component consumption with proper typing.
 */
function buildTreeStructure(flatData: any[]): ChapterNode[] {
  const nodeMap = new Map<string, ChapterNode>()
  const rootNodes: ChapterNode[] = []

  // First pass: create all nodes
  flatData.forEach((row) => {
    nodeMap.set(row.id, {
      id: row.id,
      name: row.name,
      code: row.code,
      status: row.status,
      memberCount: row.member_count,
      parentId: row.parent_id,
      children: [],
      metadata: {
        revenueYTD: row.revenue_ytd,
        eventsThisYear: row.events_this_year,
        lastActivity: row.last_activity,
      },
    })
  })

  // Second pass: build parent-child relationships
  nodeMap.forEach((node) => {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    } else {
      rootNodes.push(node)
    }
  })

  return rootNodes
}
\`\`\`

### 3. Bulk Chapter Operations

**When to Use**: Processing multiple chapters simultaneously with transactional integrity.

**Pattern**:
\`\`\`typescript
// lib/operations/bulk-chapter-operations.ts
import { db } from '@/lib/db'
import { chapters } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

interface BulkOperationResult {
  success: boolean
  processedCount: number
  errors: Array<{ chapterId: string; error: string }>
  affectedChapters: string[]
}

/**
 * Streamline bulk chapter status updates with transactional rollback.
 * Ensures data consistency across multi-chapter administrative operations.
 *
 * Best for: Mass activation/deactivation during organizational restructuring
 */
export async function bulkUpdateChapterStatus(
  chapterIds: string[],
  newStatus: 'active' | 'inactive' | 'suspended',
  options: {
    includeDescendants?: boolean
    validatePermissions?: boolean
    userId?: string
  } = {}
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    processedCount: 0,
    errors: [],
    affectedChapters: [],
  }

  try {
    await db.transaction(async (tx) => {
      let targetChapterIds = [...chapterIds]

      // Include all descendant chapters if specified
      if (options.includeDescendants) {
        for (const chapterId of chapterIds) {
          const descendants = await getChapterDescendants(chapterId)
          targetChapterIds = [
            ...targetChapterIds,
            ...descendants.map((d) => d.id),
          ]
        }
        targetChapterIds = [...new Set(targetChapterIds)] // Remove duplicates
      }

      // Validate permissions for each chapter if required
      if (options.validatePermissions && options.userId) {
        for (const chapterId of targetChapterIds) {
          const hasPermission = await checkChapterPermission(
            options.userId,
            chapterId,
            'update'
          )
          if (!hasPermission) {
            result.errors.push({
              chapterId,
              error: 'Insufficient permissions',
            })
            throw new Error('Permission validation failed')
          }
        }
      }

      // Execute bulk status update
      await tx
        .update(chapters)
        .set({
          status: newStatus,
          updated_at: new Date(),
        })
        .where(inArray(chapters.id, targetChapterIds))

      // Create audit trail for organizational changes
      await tx.insert(chapterAuditLog).values(
        targetChapterIds.map((id) => ({
          chapterId: id,
          action: 'status_update',
          previousValue: null, // Would fetch from previous state
          newValue: newStatus,
          userId: options.userId,
          timestamp: new Date(),
        }))
      )

      // Invalidate hierarchy cache for affected nodes
      await invalidateHierarchyCache(targetChapterIds)

      result.success = true
      result.processedCount = targetChapterIds.length
      result.affectedChapters = targetChapterIds
    })
  } catch (error) {
    result.success = false
    result.errors.push({
      chapterId: 'bulk_operation',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  return result
}

/**
 * Bulk chapter data update with field-level validation.
 * Supports partial updates across multiple organizational units.
 */
export async function bulkUpdateChapterData(
  updates: Array<{
    chapterId: string
    data: Partial<Chapter>
  }>,
  options: {
    validateConstraints?: boolean
    createBackup?: boolean
  } = {}
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    processedCount: 0,
    errors: [],
    affectedChapters: [],
  }

  try {
    await db.transaction(async (tx) => {
      // Create backup snapshot if requested
      if (options.createBackup) {
        await createHierarchyBackup(
          updates.map((u) => u.chapterId),
          tx
        )
      }

      for (const update of updates) {
        try {
          // Validate business constraints before update
          if (options.validateConstraints) {
            const validation = await validateChapterData(update.data)
            if (!validation.valid) {
              result.errors.push({
                chapterId: update.chapterId,
                error: validation.errors.join(', '),
              })
              continue
            }
          }

          await tx
            .update(chapters)
            .set({
              ...update.data,
              updated_at: new Date(),
            })
            .where(eq(chapters.id, update.chapterId))

          result.processedCount++
          result.affectedChapters.push(update.chapterId)
        } catch (error) {
          result.errors.push({
            chapterId: update.chapterId,
            error: error instanceof Error ? error.message : 'Update failed',
          })
        }
      }

      // Rollback entire transaction if any critical errors
      if (result.errors.length > 0 && options.validateConstraints) {
        throw new Error('Bulk update validation failed')
      }

      result.success = true
    })
  } catch (error) {
    result.success = false
  }

  return result
}

/**
 * Bulk chapter deletion with dependency validation.
 * Prevents orphaned records and maintains referential integrity.
 */
export async function bulkDeleteChapters(
  chapterIds: string[],
  options: {
    deleteDescendants?: boolean
    archiveInstead?: boolean
  } = {}
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: false,
    processedCount: 0,
    errors: [],
    affectedChapters: [],
  }

  try {
    await db.transaction(async (tx) => {
      let targetChapterIds = [...chapterIds]

      // Validate no active dependencies exist
      for (const chapterId of chapterIds) {
        const dependencies = await checkChapterDependencies(chapterId)
        if (dependencies.hasActiveMembers || dependencies.hasActiveEvents) {
          result.errors.push({
            chapterId,
            error: 'Cannot delete chapter with active members or events',
          })
          throw new Error('Dependency validation failed')
        }
      }

      // Include descendants if specified
      if (options.deleteDescendants) {
        for (const chapterId of chapterIds) {
          const descendants = await getChapterDescendants(chapterId)
          targetChapterIds = [
            ...targetChapterIds,
            ...descendants.map((d) => d.id),
          ]
        }
        targetChapterIds = [...new Set(targetChapterIds)]
      }

      if (options.archiveInstead) {
        // Soft delete: mark as archived
        await tx
          .update(chapters)
          .set({
            status: 'archived',
            archived_at: new Date(),
          })
          .where(inArray(chapters.id, targetChapterIds))
      } else {
        // Hard delete with cascading cleanup
        await tx
          .delete(chapters)
          .where(inArray(chapters.id, targetChapterIds))
      }

      result.success = true
      result.processedCount = targetChapterIds.length
      result.affectedChapters = targetChapterIds
    })
  } catch (error) {
    result.success = false
  }

  return result
}
\`\`\`

### 4. Chapter Comparison Analytics

**When to Use**: Benchmarking chapter performance across organizational hierarchy levels.

**Pattern**:
\`\`\`typescript
// components/hierarchy/chapter-comparison.tsx
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useState } from 'react'

interface ComparisonMetrics {
  chapterId: string
  chapterName: string
  memberCount: number
  revenueYTD: number
  eventsThisYear: number
  memberGrowthRate: number
  revenuePerMember: number
  eventAttendanceRate: number
}

interface ChapterComparisonProps {
  chapterIds: string[]
  comparisonPeriod?: '30d' | '90d' | '1y'
  metrics?: string[]
}

/**
 * Establish performance benchmarking across organizational hierarchy.
 * Drives measurable outcomes through comparative chapter analytics.
 *
 * Best for: Executive dashboards requiring multi-chapter performance visibility
 */
export function ChapterComparison({
  chapterIds,
  comparisonPeriod = '1y',
  metrics = ['memberCount', 'revenueYTD', 'eventsThisYear'],
}: ChapterComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0])
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  const { data, isLoading } = useQuery({
    queryKey: ['chapter-comparison', chapterIds, comparisonPeriod],
    queryFn: () => fetchComparisonMetrics(chapterIds, comparisonPeriod),
  })

  const metricLabels: Record<string, string> = {
    memberCount: 'Total Members',
    revenueYTD: 'Revenue YTD',
    eventsThisYear: 'Events This Year',
    memberGrowthRate: 'Member Growth Rate (%)',
    revenuePerMember: 'Revenue per Member',
    eventAttendanceRate: 'Event Attendance Rate (%)',
  }

  const formatMetricValue = (metric: string, value: number) => {
    if (metric.includes('revenue')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(value)
    }
    if (metric.includes('Rate') || metric.includes('Growth')) {
      return `${value.toFixed(1)}%`
    }
    return value.toLocaleString()
  }

  const getPerformanceIndicator = (
    chapter: ComparisonMetrics,
    metric: string
  ): 'high' | 'medium' | 'low' => {
    if (!data) return 'medium'

    const values = data.map((c) => c[metric as keyof ComparisonMetrics] as number)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const chapterValue = chapter[metric as keyof ComparisonMetrics] as number

    if (chapterValue > avg * 1.2) return 'high'
    if (chapterValue < avg * 0.8) return 'low'
    return 'medium'
  }

  const performanceColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  }

  if (isLoading) {
    return <div>Loading comparison analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Metric:</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {metrics.map((metric) => (
              <option key={metric} value={metric}>
                {metricLabels[metric]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-2 text-sm rounded-md ${
              viewMode === 'chart' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
            }`}
          >
            Chart View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 text-sm rounded-md ${
              viewMode === 'table' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Chart Visualization */}
      {viewMode === 'chart' && (
        <div className="bg-white p-6 rounded-lg border">
          <BarChart
            width={800}
            height={400}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="chapterName"
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => formatMetricValue(selectedMetric, value)}
            />
            <Legend />
            <Bar
              dataKey={selectedMetric}
              fill="#2563eb"
              name={metricLabels[selectedMetric]}
            />
          </BarChart>
        </div>
      )}

      {/* Table Visualization */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Chapter
                </th>
                {metrics.map((metric) => (
                  <th
                    key={metric}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {metricLabels[metric]}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.map((chapter) => (
                <tr key={chapter.chapterId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {chapter.chapterName}
                  </td>
                  {metrics.map((metric) => (
                    <td
                      key={metric}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {formatMetricValue(
                        metric,
                        chapter[metric as keyof ComparisonMetrics] as number
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        performanceColors[
                          getPerformanceIndicator(chapter, selectedMetric)
                        ]
                      }`}
                    >
                      {getPerformanceIndicator(chapter, selectedMetric)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const values = data?.map(
            (c) => c[metric as keyof ComparisonMetrics] as number
          ) || []
          const avg = values.reduce((a, b) => a + b, 0) / values.length
          const max = Math.max(...values)
          const min = Math.min(...values)

          return (
            <div key={metric} className="bg-white p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-600">
                {metricLabels[metric]}
              </h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Average:</span>
                  <span className="font-medium">
                    {formatMetricValue(metric, avg)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Highest:</span>
                  <span className="font-medium text-green-600">
                    {formatMetricValue(metric, max)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lowest:</span>
                  <span className="font-medium text-red-600">
                    {formatMetricValue(metric, min)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
\`\`\`

### 5. Permission Cascade System

**When to Use**: Implementing role-based access control with hierarchical inheritance.

**Pattern**:
\`\`\`typescript
// lib/permissions/hierarchy-permissions.ts
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

interface PermissionRule {
  resource: string
  action: 'read' | 'write' | 'delete' | 'admin'
  granted: boolean
  inheritedFrom?: string
}

/**
 * Establish role-based access control with cascading permissions.
 * Supports sustainable governance across multi-level organizational structures.
 *
 * Best for: Enterprise platforms requiring granular permission management
 */
export async function calculateChapterPermissions(
  userId: string,
  chapterId: string
): Promise<PermissionRule[]> {
  // Retrieve user's direct and inherited roles for the chapter hierarchy
  const query = sql`
    WITH RECURSIVE chapter_hierarchy AS (
      -- Start from target chapter
      SELECT
        id,
        parent_id,
        0 AS level
      FROM chapters
      WHERE id = ${chapterId}

      UNION ALL

      -- Traverse up to root
      SELECT
        c.id,
        c.parent_id,
        ch.level + 1
      FROM chapters c
      INNER JOIN chapter_hierarchy ch ON c.id = ch.parent_id
    ),
    user_roles AS (
      -- Direct role assignments
      SELECT
        cr.chapter_id,
        cr.role,
        cr.permissions,
        0 AS inheritance_level,
        'direct' AS source
      FROM chapter_roles cr
      WHERE cr.user_id = ${userId}
        AND cr.chapter_id IN (SELECT id FROM chapter_hierarchy)

      UNION ALL

      -- Inherited permissions from parent chapters
      SELECT
        ch.id AS chapter_id,
        cr.role,
        cr.permissions,
        ch.level AS inheritance_level,
        'inherited' AS source
      FROM chapter_roles cr
      INNER JOIN chapter_hierarchy ch ON cr.chapter_id = ch.parent_id
      WHERE cr.user_id = ${userId}
        AND cr.inheritable = true
    )
    SELECT
      ur.role,
      ur.permissions,
      ur.inheritance_level,
      ur.source,
      ch.id AS applies_to_chapter
    FROM user_roles ur
    CROSS JOIN chapter_hierarchy ch
    WHERE ch.level >= ur.inheritance_level
    ORDER BY ur.inheritance_level ASC, ur.role
  `

  const results = await db.execute(query)

  // Aggregate permissions with proper precedence rules
  return aggregatePermissions(results.rows)
}

/**
 * Propagate permission changes through hierarchy tree.
 * Invalidates caches and notifies affected users.
 */
export async function cascadePermissionUpdate(
  chapterId: string,
  roleId: string,
  newPermissions: PermissionRule[]
): Promise<void> {
  await db.transaction(async (tx) => {
    // Update base permission definition
    await tx
      .update(chapterRoles)
      .set({
        permissions: newPermissions,
        updated_at: new Date(),
      })
      .where(eq(chapterRoles.id, roleId))

    // Get all affected descendant chapters
    const descendants = await getChapterDescendants(chapterId)
    const affectedChapterIds = [chapterId, ...descendants.map((d) => d.id)]

    // Invalidate permission cache for all affected chapters
    await Promise.all(
      affectedChapterIds.map((id) =>
        invalidatePermissionCache(id)
      )
    )

    // Create audit trail for governance compliance
    await tx.insert(permissionAuditLog).values({
      chapterId,
      roleId,
      action: 'cascade_update',
      affectedChapters: affectedChapterIds,
      timestamp: new Date(),
    })
  })
}

/**
 * Validate user permission for specific chapter action.
 * Includes inherited permissions from parent chapters.
 */
export async function checkChapterPermission(
  userId: string,
  chapterId: string,
  requiredAction: 'read' | 'write' | 'delete' | 'admin'
): Promise<boolean> {
  const permissions = await calculateChapterPermissions(userId, chapterId)

  // Admin permission grants all actions
  const hasAdmin = permissions.some(
    (p) => p.action === 'admin' && p.granted
  )
  if (hasAdmin) return true

  // Check specific action permission
  return permissions.some(
    (p) => p.action === requiredAction && p.granted
  )
}

/**
 * Aggregate permissions with conflict resolution.
 * Direct assignments override inherited permissions.
 */
function aggregatePermissions(rawPermissions: any[]): PermissionRule[] {
  const permissionMap = new Map<string, PermissionRule>()

  rawPermissions.forEach((raw) => {
    const key = `${raw.resource}:${raw.action}`
    const existing = permissionMap.get(key)

    // Direct permissions take precedence over inherited
    if (!existing || raw.source === 'direct') {
      permissionMap.set(key, {
        resource: raw.resource,
        action: raw.action,
        granted: raw.granted,
        inheritedFrom:
          raw.source === 'inherited' ? raw.inherited_from : undefined,
      })
    }
  })

  return Array.from(permissionMap.values())
}
\`\`\`

### 6. Hierarchy Caching Strategy

**When to Use**: Optimizing performance for large organizational structures with frequent reads.

**Pattern**:
\`\`\`typescript
// lib/cache/hierarchy-cache.ts
import { Redis } from '@upstash/redis'
import { unstable_cache } from 'next/cache'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface HierarchyCacheConfig {
  ttl: number // Time to live in seconds
  staleWhileRevalidate?: number
  tags: string[]
}

/**
 * Establish distributed caching for hierarchy data.
 * Streamlines data retrieval while maintaining consistency across updates.
 *
 * Best for: Large organizational structures with frequent read operations
 */
export class HierarchyCache {
  private static readonly CACHE_PREFIX = 'hierarchy:'
  private static readonly DEFAULT_TTL = 5 * 60 // 5 minutes

  /**
   * Retrieve cached hierarchy tree with automatic revalidation.
   */
  static async getTree(
    rootId?: string,
    config: Partial<HierarchyCacheConfig> = {}
  ): Promise<ChapterNode[]> {
    const cacheKey = this.buildCacheKey('tree', rootId)
    const ttl = config.ttl || this.DEFAULT_TTL

    return unstable_cache(
      async () => {
        const cached = await redis.get(cacheKey)
        if (cached) return cached as ChapterNode[]

        // Cache miss: fetch from database
        const tree = await getChapterHierarchy(rootId)
        await redis.set(cacheKey, tree, { ex: ttl })

        return tree
      },
      [cacheKey],
      {
        revalidate: ttl,
        tags: config.tags || ['chapter-hierarchy'],
      }
    )()
  }

  /**
   * Invalidate cache for specific chapter and all affected ancestors.
   * Ensures consistency after hierarchy modifications.
   */
  static async invalidateChapter(chapterId: string): Promise<void> {
    const patterns = [
      this.buildCacheKey('tree', chapterId),
      this.buildCacheKey('descendants', chapterId),
      this.buildCacheKey('ancestors', chapterId),
    ]

    // Also invalidate parent chapters up the tree
    const ancestors = await getChapterAncestors(chapterId)
    ancestors.forEach((ancestor) => {
      patterns.push(
        this.buildCacheKey('tree', ancestor.id),
        this.buildCacheKey('descendants', ancestor.id)
      )
    })

    // Batch invalidation for performance
    await Promise.all(patterns.map((key) => redis.del(key)))

    // Invalidate Next.js cache tags
    revalidateTag('chapter-hierarchy')
  }

  /**
   * Warm cache during low-traffic periods for improved response times.
   */
  static async warmCache(rootIds: string[]): Promise<void> {
    await Promise.all(
      rootIds.map(async (rootId) => {
        const tree = await getChapterHierarchy(rootId)
        const cacheKey = this.buildCacheKey('tree', rootId)
        await redis.set(cacheKey, tree, { ex: this.DEFAULT_TTL })
      })
    )
  }

  /**
   * Batch cache retrieval for multiple chapters.
   * Optimizes performance when loading dashboard views.
   */
  static async batchGet(
    chapterIds: string[],
    dataType: 'tree' | 'descendants' | 'ancestors'
  ): Promise<Map<string, any>> {
    const keys = chapterIds.map((id) => this.buildCacheKey(dataType, id))
    const results = await redis.mget(...keys)

    const dataMap = new Map()
    chapterIds.forEach((id, index) => {
      if (results[index]) {
        dataMap.set(id, results[index])
      }
    })

    return dataMap
  }

  /**
   * Monitor cache hit/miss rates for performance optimization.
   */
  static async getCacheStats(): Promise<{
    hitRate: number
    totalRequests: number
    avgResponseTime: number
  }> {
    const stats = await redis.get(`${this.CACHE_PREFIX}stats`)
    return stats as any || {
      hitRate: 0,
      totalRequests: 0,
      avgResponseTime: 0,
    }
  }

  private static buildCacheKey(type: string, id?: string): string {
    return `${this.CACHE_PREFIX}${type}${id ? `:${id}` : ''}`
  }
}

/**
 * Cache invalidation middleware for automatic cleanup.
 * Triggered by database mutations affecting hierarchy structure.
 */
export async function invalidateHierarchyCache(
  affectedChapterIds: string[]
): Promise<void> {
  await Promise.all(
    affectedChapterIds.map((id) => HierarchyCache.invalidateChapter(id))
  )
}
\`\`\`

---

## Performance Optimization

### Tree Virtualization

\`\`\`typescript
// Optimize rendering for large hierarchies using react-window
import { FixedSizeTree } from 'react-vtree'

function VirtualizedTree({ data }: { data: ChapterNode[] }) {
  return (
    <FixedSizeTree
      treeWalker={treeWalker}
      itemSize={36}
      height={600}
      width="100%"
    >
      {Node}
    </FixedSizeTree>
  )
}
\`\`\`

### Query Optimization

\`\`\`typescript
// Use materialized paths for faster queries
ALTER TABLE chapters ADD COLUMN path ltree;
CREATE INDEX chapters_path_idx ON chapters USING GIST (path);

// Query all descendants using path operators
SELECT * FROM chapters WHERE path <@ '1.2.3';
\`\`\`

---

## Anti-Patterns

### ❌ Avoid
- Loading entire hierarchy without pagination for large organizations
- Missing circular dependency validation in drag-and-drop moves
- Synchronous bulk operations blocking UI interactions
- No transaction rollback on partial bulk operation failures
- Cache invalidation missing parent/ancestor chapters
- Permission calculations without proper inheritance logic
- Hardcoded depth limits preventing organizational growth
- Missing audit trails for hierarchy structure changes

### ✅ Prefer
- Lazy loading with collapsible tree nodes
- Pre-validation before executing hierarchy moves
- Optimistic UI updates with background processing
- Atomic transactions with all-or-nothing semantics
- Comprehensive cache invalidation including affected nodes
- Recursive permission aggregation with conflict resolution
- Configurable depth limits with overflow warnings
- Complete audit logging for compliance requirements

---

## Integration Points

- **Dashboard Analytics**: Partner with `dashboard-analytics-engineer` for performance metrics visualization
- **Administrative Workflows**: Coordinate with `administrative-workflow-agent` for approval processes
- **Performance Optimization**: Leverage `performance-optimization-engineer` for large dataset handling
- **Data Export**: Integrate with data export agents for hierarchy structure exports
- **Real-time Updates**: Use WebSocket infrastructure for collaborative hierarchy management

---

## Related Agents

- **dashboard-analytics-engineer**: For visualizing chapter performance metrics
- **administrative-workflow-agent**: For approval workflows in bulk operations
- **performance-optimization-engineer**: For optimizing large hierarchy queries
- **data-management-export-agent**: For exporting hierarchy structures

---

## Usage Guidance

Best for organizations managing multi-level chapter structures requiring efficient navigation, bulk administrative operations, and performance analytics. Establishes scalable hierarchy management supporting sustainable organizational growth across the NABIP Association Management platform.

Invoke when building chapter organization features, administrative dashboards, permission management systems, or performance benchmarking tools requiring hierarchical data visualization and bulk operations.
