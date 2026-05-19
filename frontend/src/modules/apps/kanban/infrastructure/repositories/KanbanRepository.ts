import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type {
  KanbanBoard,
  BoardListItem,
  KanbanCard,
  KanbanUser,
  KanbanLabel,
  UpdateBoardDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  CreateColumnDto,
  ReorderColumnsDto,
} from '../../domain/models/Kanban';

export interface IKanbanRepository {
  // Board operations
  getBoards(): Promise<BoardListItem[]>;
  getBoard(id: string): Promise<KanbanBoard>;
  updateBoard(id: string, dto: UpdateBoardDto): Promise<KanbanBoard>;
  toggleFavorite(id: string): Promise<KanbanBoard>;
  
  // Column operations
  createColumn(boardId: string, dto: CreateColumnDto): Promise<KanbanBoard>;
  reorderColumns(boardId: string, dto: ReorderColumnsDto): Promise<KanbanBoard>;
  
  // Card operations
  getCard(cardId: string): Promise<KanbanCard>;
  createCard(dto: CreateCardDto): Promise<KanbanCard>;
  updateCard(cardId: string, dto: UpdateCardDto): Promise<KanbanCard>;
  moveCard(cardId: string, dto: MoveCardDto): Promise<KanbanCard>;
  
  // Reference data
  getUsers(): Promise<KanbanUser[]>;
  getLabels(): Promise<KanbanLabel[]>;
}

@injectable()
export class KanbanRepository extends BaseRepository implements IKanbanRepository {
  private readonly baseUrl = '/kanban';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  // ============================================================================
  // Board Operations
  // ============================================================================

  async getBoards(): Promise<BoardListItem[]> {
    return this.get<BoardListItem[]>(
      `${this.baseUrl}/boards`,
      'Failed to fetch boards'
    );
  }

  async getBoard(id: string): Promise<KanbanBoard> {
    return this.get<KanbanBoard>(
      `${this.baseUrl}/boards/${id}`,
      'Failed to fetch board'
    );
  }

  async updateBoard(id: string, dto: UpdateBoardDto): Promise<KanbanBoard> {
    return this.put<KanbanBoard, UpdateBoardDto>(
      `${this.baseUrl}/boards/${id}`,
      dto,
      'Failed to update board'
    );
  }

  async toggleFavorite(id: string): Promise<KanbanBoard> {
    return this.put<KanbanBoard>(
      `${this.baseUrl}/boards/${id}/favorite`,
      undefined,
      'Failed to toggle favorite'
    );
  }

  // ============================================================================
  // Column Operations
  // ============================================================================

  async createColumn(boardId: string, dto: CreateColumnDto): Promise<KanbanBoard> {
    return this.post<KanbanBoard, CreateColumnDto>(
      `${this.baseUrl}/boards/${boardId}/columns`,
      dto,
      'Failed to create column'
    );
  }

  async reorderColumns(boardId: string, dto: ReorderColumnsDto): Promise<KanbanBoard> {
    return this.put<KanbanBoard, ReorderColumnsDto>(
      `${this.baseUrl}/boards/${boardId}/columns/reorder`,
      dto,
      'Failed to reorder columns'
    );
  }

  // ============================================================================
  // Card Operations
  // ============================================================================

  async getCard(cardId: string): Promise<KanbanCard> {
    return this.get<KanbanCard>(
      `${this.baseUrl}/cards/${cardId}`,
      'Failed to fetch card'
    );
  }

  async createCard(dto: CreateCardDto): Promise<KanbanCard> {
    return this.post<KanbanCard, CreateCardDto>(
      `${this.baseUrl}/cards`,
      dto,
      'Failed to create card'
    );
  }

  async updateCard(cardId: string, dto: UpdateCardDto): Promise<KanbanCard> {
    return this.put<KanbanCard, UpdateCardDto>(
      `${this.baseUrl}/cards/${cardId}`,
      dto,
      'Failed to update card'
    );
  }

  async moveCard(cardId: string, dto: MoveCardDto): Promise<KanbanCard> {
    return this.put<KanbanCard, MoveCardDto>(
      `${this.baseUrl}/cards/${cardId}/move`,
      dto,
      'Failed to move card'
    );
  }

  // ============================================================================
  // Reference Data
  // ============================================================================

  async getUsers(): Promise<KanbanUser[]> {
    return this.get<KanbanUser[]>(
      `${this.baseUrl}/users`,
      'Failed to fetch users'
    );
  }

  async getLabels(): Promise<KanbanLabel[]> {
    return this.get<KanbanLabel[]>(
      `${this.baseUrl}/labels`,
      'Failed to fetch labels'
    );
  }
}
