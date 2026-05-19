/**
 * Kanban Domain Models
 * 
 * Core types for the Kanban board feature including boards, columns, cards,
 * labels, and activity tracking.
 */

// ============================================================================
// Priority & Status Types
// ============================================================================

export type CardPriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Label
// ============================================================================

export interface KanbanLabel {
  id: string;
  name: string;
  color: string; // Tailwind color class (e.g., 'bg-blue-500')
}

// ============================================================================
// Activity
// ============================================================================

export interface CardActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string; // ISO 8601
}

export interface KanbanSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface KanbanAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  labels: KanbanLabel[];
  assigneeIds: string[];
  priority: CardPriority;
  dueDate: string | null; // ISO 8601 or null
  position: number;
  columnId: string;
  coverImage?: string | null;
  attachments: KanbanAttachment[];
  subtasks: KanbanSubtask[];
  activities: CardActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardDto {
  title: string;
  columnId: string;
  description?: string;
  labels?: KanbanLabel[];
  assigneeIds?: string[];
  priority?: CardPriority;
  dueDate?: string | null;
  coverImage?: string | null;
  attachments?: KanbanAttachment[];
  subtasks?: KanbanSubtask[];
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
  labels?: KanbanLabel[];
  assigneeIds?: string[];
  priority?: CardPriority;
  dueDate?: string | null;
  coverImage?: string | null;
  attachments?: KanbanAttachment[];
  subtasks?: KanbanSubtask[];
}

export interface MoveCardDto {
  sourceColumnId: string;
  targetColumnId: string;
  targetPosition: number;
}

// ============================================================================
// Column
// ============================================================================

export interface KanbanColumn {
  id: string;
  name: string;
  color?: string; // Optional color indicator
  wipLimit?: number; // Work in progress limit
  position: number;
  cards: KanbanCard[];
}

export interface CreateColumnDto {
  name: string;
  color?: string;
  wipLimit?: number;
}

export interface UpdateColumnDto {
  name?: string;
  color?: string;
  wipLimit?: number;
}

// ============================================================================
// Board
// ============================================================================

export interface BoardStats {
  columnsCount: number;
  cardsCount: number;
}

export interface KanbanBoard {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  columns: KanbanColumn[];
  stats?: BoardStats;
  createdAt: string;
  updatedAt: string;
}

export interface BoardListItem {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  stats: BoardStats;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardDto {
  name: string;
  description?: string;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
  isFavorite?: boolean;
}

export interface ReorderColumnsDto {
  columnIds: string[];
}

// ============================================================================
// User (for assignees display)
// ============================================================================

export interface KanbanUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface CardFilters {
  search?: string;
  labelIds?: string[];
  assigneeIds?: string[];
  priorities?: CardPriority[];
}

// ============================================================================
// Available Labels (for selection)
// ============================================================================

export const DEFAULT_LABELS: KanbanLabel[] = [
  { id: 'label-bug', name: 'Bug', color: 'bg-red-500' },
  { id: 'label-feature', name: 'Feature', color: 'bg-blue-500' },
  { id: 'label-enhancement', name: 'Enhancement', color: 'bg-purple-500' },
  { id: 'label-documentation', name: 'Documentation', color: 'bg-yellow-500' },
  { id: 'label-design', name: 'Design', color: 'bg-pink-500' },
  { id: 'label-backend', name: 'Backend', color: 'bg-gray-500' },
];

export const PRIORITY_CONFIG: Record<CardPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-500' },
  medium: { label: 'Medium', color: 'bg-blue-500' },
  high: { label: 'High', color: 'bg-amber-500' },
  critical: { label: 'Critical', color: 'bg-red-500' },
};
