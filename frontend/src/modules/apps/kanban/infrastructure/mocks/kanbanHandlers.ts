import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import { daysAgo, hoursAgo, minutesAgo } from '@/mocks/utils/demoDate';
import type {
  KanbanBoard,
  BoardListItem,
  KanbanCard,
  KanbanColumn,
  KanbanLabel,
  KanbanUser,
  UpdateBoardDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  CreateColumnDto,
  ReorderColumnsDto,
} from '../../domain/models/Kanban';

// ============================================================================
// Mock Users
// ============================================================================

const users: KanbanUser[] = [
  { id: 'u1', name: 'Emily Rodriguez', email: 'emily@example.com', avatar: 'https://i.pravatar.cc/150?u=emily' },
  { id: 'u2', name: 'Michael Chen', email: 'michael@example.com', avatar: 'https://i.pravatar.cc/150?u=michael' },
  { id: 'u3', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 'u4', name: 'David Kim', email: 'david@example.com', avatar: 'https://i.pravatar.cc/150?u=david' },
  { id: 'u5', name: 'Lisa Wang', email: 'lisa@example.com', avatar: 'https://i.pravatar.cc/150?u=lisa' },
];

// ============================================================================
// Mock Labels
// ============================================================================

const labels: KanbanLabel[] = [
  { id: 'label-bug', name: 'Bug', color: 'bg-red-500' },
  { id: 'label-feature', name: 'Feature', color: 'bg-blue-500' },
  { id: 'label-enhancement', name: 'Enhancement', color: 'bg-purple-500' },
  { id: 'label-documentation', name: 'Documentation', color: 'bg-yellow-500' },
  { id: 'label-design', name: 'Design', color: 'bg-pink-500' },
  { id: 'label-backend', name: 'Backend', color: 'bg-gray-500' },
];

// ============================================================================
// Mock Boards Data
// ============================================================================

const boards: KanbanBoard[] = [
  {
    id: 'board-1',
    name: 'Product Development',
    description: 'Main product roadmap and feature development tracking',
    isFavorite: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(0),
    columns: [
      {
        id: 'col-1-1',
        name: 'Backlog',
        color: 'bg-slate-500',
        position: 0,
        cards: [
          {
            id: 'card-1-1-1',
            title: 'Implement user authentication',
            description: 'Focus on strategizing and outlining the development of the second option for the dashboard authentication flow.',
            labels: [labels[1], labels[5]],
            assigneeIds: ['u1', 'u2'],
            priority: 'high',
            dueDate: daysAgo(-10),
            position: 0,
            columnId: 'col-1-1',
            coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
            attachments: [
              { id: 'att-1', name: 'auth-spec.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: 1024 * 1024 * 2.5, createdAt: daysAgo(2) },
              { id: 'att-2', name: 'logo.png', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&auto=format&fit=crop', type: 'image/png', size: 1024 * 500, createdAt: daysAgo(1) }
            ],
            subtasks: [
              { id: 'st-1', title: 'Setup OAuth2', isCompleted: true, order: 0 },
              { id: 'st-2', title: 'JWT Implementation', isCompleted: true, order: 1 },
              { id: 'st-3', title: 'Unit Tests', isCompleted: false, order: 2 },
              { id: 'st-4', title: 'Documentation', isCompleted: false, order: 3 }
            ],
            activities: [
              { id: 'a1', userId: 'u1', action: 'created this card', timestamp: daysAgo(5) },
            ],
            createdAt: daysAgo(5),
            updatedAt: daysAgo(1),
          },
          {
            id: 'card-1-1-2',
            title: 'Design system documentation',
            description: 'Create comprehensive documentation for all UI components including usage examples and accessibility guidelines.',
            labels: [labels[3], labels[4]],
            assigneeIds: ['u1'],
            priority: 'medium',
            dueDate: daysAgo(-17),
            position: 1,
            columnId: 'col-1-1',
            attachments: [],
            subtasks: [
              { id: 'st-5', title: 'Color Palette', isCompleted: true, order: 0 },
              { id: 'st-6', title: 'Typography', isCompleted: false, order: 1 }
            ],
            activities: [
              { id: 'a2', userId: 'u1', action: 'created this card', timestamp: daysAgo(3) },
            ],
            createdAt: daysAgo(3),
            updatedAt: daysAgo(1),
          },
        ],
      },
      {
        id: 'col-1-2',
        name: 'In Progress',
        color: 'bg-indigo-500',
        position: 1,
        cards: [
          {
            id: 'card-1-2-1',
            title: 'Dashboard analytics widget',
            description: 'Build interactive analytics dashboard with charts and filters. The team will conclude the ideation phase by finalizing and refining concepts.',
            labels: [labels[1], labels[4]],
            assigneeIds: ['u2', 'u3'],
            priority: 'high',
            dueDate: daysAgo(-7),
            position: 0,
            columnId: 'col-1-2',
            coverImage: 'https://images.unsplash.com/photo-1560221328-12fe60f83ab8?q=80&w=800&auto=format&fit=crop',
            attachments: [
              { id: 'att-3', name: 'data-source.json', url: 'https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=400&auto=format&fit=crop', type: 'application/json', size: 1024 * 120, createdAt: daysAgo(1) }
            ],
            subtasks: [
              { id: 'st-7', title: 'Data Fetching', isCompleted: true, order: 0 },
              { id: 'st-8', title: 'Chart Component', isCompleted: true, order: 1 },
              { id: 'st-9', title: 'Filter Logic', isCompleted: true, order: 2 },
              { id: 'st-10', title: 'Mobile Resp', isCompleted: false, order: 3 }
            ],
            activities: [
              { id: 'a3', userId: 'u2', action: 'created this card', timestamp: daysAgo(7) },
              { id: 'a4', userId: 'u3', action: 'moved to In Progress', timestamp: daysAgo(2) },
            ],
            createdAt: daysAgo(7),
            updatedAt: hoursAgo(5),
          },
          {
            id: 'card-1-2-2',
            title: 'Fix navigation menu bug',
            description: 'Navigation dropdown not closing on mobile devices specifically for the project menu.',
            labels: [labels[0]],
            assigneeIds: ['u3'],
            priority: 'critical',
            dueDate: daysAgo(-2),
            position: 1,
            columnId: 'col-1-2',
            attachments: [],
            subtasks: [
              { id: 'st-11', title: 'Reproduction', isCompleted: true, order: 0 },
              { id: 'st-12', title: 'Z-index fix', isCompleted: false, order: 1 }
            ],
            activities: [
              { id: 'a5', userId: 'u3', action: 'created this card', timestamp: daysAgo(2) },
            ],
            createdAt: daysAgo(2),
            updatedAt: minutesAgo(30),
          },
        ],
      },
      {
        id: 'col-1-3',
        name: 'Review',
        color: 'bg-amber-500',
        position: 2,
        cards: [
          {
            id: 'card-1-3-1',
            title: 'API rate limiting',
            description: 'Implement rate limiting for public API endpoints using Redis as the backstore.',
            labels: [labels[1], labels[5]],
            assigneeIds: ['u4'],
            priority: 'medium',
            dueDate: daysAgo(-5),
            position: 0,
            columnId: 'col-1-3',
            attachments: [],
            subtasks: [
              { id: 'st-13', title: 'Redis Config', isCompleted: true, order: 0 },
              { id: 'st-14', title: 'Middleware', isCompleted: true, order: 1 }
            ],
            activities: [
              { id: 'a6', userId: 'u4', action: 'created this card', timestamp: daysAgo(10) },
              { id: 'a7', userId: 'u4', action: 'moved to Review', timestamp: daysAgo(1) },
            ],
            createdAt: daysAgo(10),
            updatedAt: daysAgo(1),
          },
        ],
      },
      {
        id: 'col-1-4',
        name: 'Done',
        color: 'bg-emerald-500',
        position: 3,
        cards: [
          {
            id: 'card-1-4-1',
            title: 'Setup CI/CD pipeline',
            description: 'Configure GitHub Actions for automated testing and deployment to staging and production.',
            labels: [labels[5]],
            assigneeIds: ['u5'],
            priority: 'high',
            dueDate: daysAgo(3),
            position: 0,
            columnId: 'col-1-4',
            attachments: [],
            subtasks: [
              { id: 'st-15', title: 'Test workflows', isCompleted: true, order: 0 },
              { id: 'st-16', title: 'Deploy workflows', isCompleted: true, order: 1 }
            ],
            activities: [
              { id: 'a8', userId: 'u5', action: 'created this card', timestamp: daysAgo(14) },
              { id: 'a9', userId: 'u5', action: 'completed this card', timestamp: daysAgo(3) },
            ],
            createdAt: daysAgo(14),
            updatedAt: daysAgo(3),
          },
        ],
      },
    ],
  },
  {
    id: 'board-2',
    name: 'Infrastructure Upgrades',
    description: 'Server and cloud infrastructure improvements',
    isFavorite: true,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(6),
    columns: [
      {
        id: 'col-2-1',
        name: 'Backlog',
        color: 'bg-gray-500',
        position: 0,
        cards: [],
      },
      {
        id: 'col-2-2',
        name: 'In Progress',
        color: 'bg-blue-500',
        position: 1,
        cards: [
          {
            id: 'card-2-2-1',
            title: 'Migrate to Kubernetes',
            description: 'Move all services to Kubernetes cluster',
            labels: [labels[5]],
            assigneeIds: ['u4', 'u5'],
            priority: 'high',
            dueDate: daysAgo(-14),
            position: 0,
            columnId: 'col-2-2',
            activities: [
              { id: 'a10', userId: 'u4', action: 'created this card', timestamp: daysAgo(20) },
            ],
            attachments: [],
            subtasks: [],
            createdAt: daysAgo(20),
            updatedAt: daysAgo(6),
          },
        ],
      },
      {
        id: 'col-2-3',
        name: 'Done',
        color: 'bg-green-500',
        position: 2,
        cards: [],
      },
    ],
  },
  {
    id: 'board-3',
    name: 'Marketing Campaign',
    description: 'Q4 marketing initiatives and campaign tracking',
    isFavorite: false,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(4),
    columns: [
      {
        id: 'col-3-1',
        name: 'Ideas',
        color: 'bg-purple-500',
        position: 0,
        cards: [
          {
            id: 'card-3-1-1',
            title: 'Social media strategy',
            description: 'Develop Q1 social media content calendar',
            labels: [labels[4]],
            assigneeIds: ['u1'],
            priority: 'medium',
            dueDate: daysAgo(-21),
            position: 0,
            columnId: 'col-3-1',
            activities: [
              { id: 'a11', userId: 'u1', action: 'created this card', timestamp: daysAgo(10) },
            ],
            attachments: [],
            subtasks: [],
            createdAt: daysAgo(10),
            updatedAt: daysAgo(4),
          },
        ],
      },
      {
        id: 'col-3-2',
        name: 'In Progress',
        color: 'bg-blue-500',
        position: 1,
        cards: [],
      },
      {
        id: 'col-3-3',
        name: 'Review',
        color: 'bg-yellow-500',
        position: 2,
        cards: [],
      },
      {
        id: 'col-3-4',
        name: 'Published',
        color: 'bg-green-500',
        position: 3,
        cards: [
          {
            id: 'card-3-4-1',
            title: 'Launch blog post',
            description: 'Write and publish product launch announcement',
            labels: [labels[3]],
            assigneeIds: ['u2'],
            priority: 'high',
            dueDate: daysAgo(7),
            position: 0,
            columnId: 'col-3-4',
            activities: [
              { id: 'a12', userId: 'u2', action: 'created this card', timestamp: daysAgo(14) },
              { id: 'a13', userId: 'u2', action: 'published', timestamp: daysAgo(7) },
            ],
            attachments: [],
            subtasks: [],
            createdAt: daysAgo(14),
            updatedAt: daysAgo(7),
          },
        ],
      },
    ],
  },
  {
    id: 'board-4',
    name: 'Customer Support',
    description: 'Support ticket tracking and customer feedback',
    isFavorite: false,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
    columns: [
      {
        id: 'col-4-1',
        name: 'New',
        color: 'bg-red-500',
        position: 0,
        cards: [],
      },
      {
        id: 'col-4-2',
        name: 'In Progress',
        color: 'bg-blue-500',
        position: 1,
        cards: [],
      },
      {
        id: 'col-4-3',
        name: 'Resolved',
        color: 'bg-green-500',
        position: 2,
        cards: [],
      },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getBoardStats(board: KanbanBoard): { columnsCount: number; cardsCount: number } {
  const cardsCount = board.columns.reduce((acc, col) => acc + col.cards.length, 0);
  return {
    columnsCount: board.columns.length,
    cardsCount,
  };
}

function toBoardListItem(board: KanbanBoard): BoardListItem {
  return {
    id: board.id,
    name: board.name,
    description: board.description,
    isFavorite: board.isFavorite,
    stats: getBoardStats(board),
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  };
}

function findCardInBoard(board: KanbanBoard, cardId: string): { card: KanbanCard; column: KanbanColumn } | null {
  for (const column of board.columns) {
    const card = column.cards.find(c => c.id === cardId);
    if (card) {
      return { card, column };
    }
  }
  return null;
}

// ============================================================================
// MSW Handlers
// ============================================================================

export const kanbanHandlers = [
  // GET kanban/boards - List all boards
  http.get(api('/kanban/boards'), async () => {
    await delay(300);
    const boardList = boards.map(toBoardListItem);
    return ok(boardList);
  }),

  // GET kanban/boards/:boardId - Get single board with columns and cards
  http.get(api('/kanban/boards/:boardId'), async ({ params }) => {
    await delay(400);
    const { boardId } = params;
    const board = boards.find(b => b.id === boardId);

    if (!board) {
      return fail('KANBAN_BOARD_NOT_FOUND', 'Board not found', 404);
    }

    // Return board with updated stats
    return ok({
      ...board,
      stats: getBoardStats(board),
    });
  }),

  // PUT kanban/boards/:boardId - Update board
  http.put(api('/kanban/boards/:boardId'), async ({ params, request }) => {
    await delay(300);
    const { boardId } = params;
    const dto = await request.json() as UpdateBoardDto;
    
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
      return fail('KANBAN_BOARD_NOT_FOUND', 'Board not found', 404);
    }

    boards[boardIndex] = {
      ...boards[boardIndex],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    return ok(boards[boardIndex]);
  }),

  // PUT kanban/boards/:boardId/favorite - Toggle favorite
  http.put(api('/kanban/boards/:boardId/favorite'), async ({ params }) => {
    await delay(200);
    const { boardId } = params;
    
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
      return fail('KANBAN_BOARD_NOT_FOUND', 'Board not found', 404);
    }

    boards[boardIndex] = {
      ...boards[boardIndex],
      isFavorite: !boards[boardIndex].isFavorite,
      updatedAt: new Date().toISOString(),
    };

    return ok(boards[boardIndex]);
  }),

  // POST kanban/boards/:boardId/columns - Create column
  http.post(api('/kanban/boards/:boardId/columns'), async ({ params, request }) => {
    await delay(300);
    const { boardId } = params;
    const dto = await request.json() as CreateColumnDto;
    
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
      return fail('KANBAN_BOARD_NOT_FOUND', 'Board not found', 404);
    }

    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      name: dto.name,
      color: dto.color,
      wipLimit: dto.wipLimit,
      position: boards[boardIndex].columns.length,
      cards: [],
    };

    boards[boardIndex].columns.push(newColumn);
    boards[boardIndex].updatedAt = new Date().toISOString();

    return ok(boards[boardIndex], 201);
  }),

  // PUT kanban/boards/:boardId/columns/reorder - Reorder columns
  http.put(api('/kanban/boards/:boardId/columns/reorder'), async ({ params, request }) => {
    await delay(300);
    const { boardId } = params;
    const dto = await request.json() as ReorderColumnsDto;
    
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
      return fail('KANBAN_BOARD_NOT_FOUND', 'Board not found', 404);
    }

    // Reorder columns based on the provided order
    const columnMap = new Map(boards[boardIndex].columns.map(c => [c.id, c]));
    const reorderedColumns = dto.columnIds
      .map((id, index) => {
        const column = columnMap.get(id);
        if (column) {
          return { ...column, position: index };
        }
        return null;
      })
      .filter((c): c is KanbanColumn => c !== null);

    boards[boardIndex].columns = reorderedColumns;
    boards[boardIndex].updatedAt = new Date().toISOString();

    return ok(boards[boardIndex]);
  }),

  // GET kanban/cards/:cardId - Get single card
  http.get(api('/kanban/cards/:cardId'), async ({ params }) => {
    await delay(200);
    const { cardId } = params;

    for (const board of boards) {
      const result = findCardInBoard(board, cardId as string);
      if (result) {
        return ok(result.card);
      }
    }

    return fail('KANBAN_CARD_NOT_FOUND', 'Card not found', 404);
  }),

  // POST kanban/cards - Create card
  http.post(api('/kanban/cards'), async ({ request }) => {
    await delay(300);
    const dto = await request.json() as CreateCardDto;

    // Find the board and column
    for (const board of boards) {
      const column = board.columns.find(c => c.id === dto.columnId);
      if (column) {
        const newCard: KanbanCard = {
          id: `card-${Date.now()}`,
          title: dto.title,
          description: dto.description || '',
          labels: dto.labels || [],
          assigneeIds: dto.assigneeIds || [],
          priority: dto.priority || 'medium',
          dueDate: dto.dueDate || null,
          position: 0,
          columnId: dto.columnId,
          coverImage: dto.coverImage,
          attachments: dto.attachments || [],
          subtasks: dto.subtasks || [],
          activities: [
            {
              id: `activity-${Date.now()}`,
              userId: 'u1',
              action: 'created this card',
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add to beginning and update positions
        column.cards = [newCard, ...column.cards.map((c, i) => ({ ...c, position: i + 1 }))];
        board.updatedAt = new Date().toISOString();

        return ok(newCard, 201);
      }
    }

    return fail('KANBAN_COLUMN_NOT_FOUND', 'Column not found', 404);
  }),

  // PUT kanban/cards/:cardId - Update card
  http.put(api('/kanban/cards/:cardId'), async ({ params, request }) => {
    await delay(300);
    const { cardId } = params;
    const dto = await request.json() as UpdateCardDto;

    for (const board of boards) {
      for (const column of board.columns) {
        const cardIndex = column.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          const updatedCard: KanbanCard = {
            ...column.cards[cardIndex],
            ...dto,
            coverImage: dto.coverImage === null ? undefined : dto.coverImage ?? column.cards[cardIndex].coverImage,
            updatedAt: new Date().toISOString(),
          };

          // Add activity for the update
          updatedCard.activities = [
            {
              id: `activity-${Date.now()}`,
              userId: 'u1',
              action: 'updated this card',
              timestamp: new Date().toISOString(),
            },
            ...updatedCard.activities,
          ];

          column.cards[cardIndex] = updatedCard;
          board.updatedAt = new Date().toISOString();

          return ok(updatedCard);
        }
      }
    }

    return fail('KANBAN_CARD_NOT_FOUND', 'Card not found', 404);
  }),

  // PUT kanban/cards/:cardId/move - Move card
  http.put(api('/kanban/cards/:cardId/move'), async ({ params, request }) => {
    await delay(250);
    const { cardId } = params;
    const dto = await request.json() as MoveCardDto;

    // Simulate occasional errors (5% chance)
    if (Math.random() < 0.05) {
      return fail('KANBAN_MOVE_FAILED', 'Failed to move card. Please try again.', 500);
    }

    // First, find the card in any column (it might have been moved already or sourceColumnId might be stale)
    let foundBoard: KanbanBoard | null = null;
    let foundColumn: KanbanColumn | null = null;
    let foundCardIndex = -1;

    for (const board of boards) {
      for (const column of board.columns) {
        const cardIndex = column.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          foundBoard = board;
          foundColumn = column;
          foundCardIndex = cardIndex;
          break;
        }
      }
      if (foundBoard) break;
    }

    if (!foundBoard || !foundColumn || foundCardIndex === -1) {
      return fail('KANBAN_CARD_NOT_FOUND', 'Card not found', 404);
    }

    // Find target column in the same board
    const targetColumn = foundBoard.columns.find(c => c.id === dto.targetColumnId);
    if (!targetColumn) {
      return fail('KANBAN_COLUMN_NOT_FOUND', 'Target column not found', 404);
    }

    // Remove from source column
    const [card] = foundColumn.cards.splice(foundCardIndex, 1);
    
    // Update card's column reference
    card.columnId = dto.targetColumnId;
    card.position = dto.targetPosition;
    card.updatedAt = new Date().toISOString();

    // Add activity if moving between columns
    if (foundColumn.id !== dto.targetColumnId) {
      card.activities = [
        {
          id: `activity-${Date.now()}`,
          userId: 'u1',
          action: `moved to ${targetColumn.name}`,
          timestamp: new Date().toISOString(),
        },
        ...card.activities,
      ];
    }

    // Insert into target at position (clamp to valid range)
    const insertPosition = Math.min(dto.targetPosition, targetColumn.cards.length);
    targetColumn.cards.splice(insertPosition, 0, card);

    // Update positions in both columns
    foundColumn.cards.forEach((c, i) => { c.position = i; });
    targetColumn.cards.forEach((c, i) => { c.position = i; });

    foundBoard.updatedAt = new Date().toISOString();

    return ok(card);
  }),

  // GET kanban/users - Get users for assignee selection
  http.get(api('/kanban/users'), async () => {
    await delay(200);
    return ok(users);
  }),

  // GET kanban/labels - Get available labels
  http.get(api('/kanban/labels'), async () => {
    await delay(100);
    return ok(labels);
  }),
];
