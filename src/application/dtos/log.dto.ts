export interface LogQuery {
  userUuid?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface LogItem {
  id: string;
  userUuid: string;
  userName?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  description?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface LogResponse {
  logs: LogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LogSummary {
  totalLogs: number;
  uniqueUsers: number;
  mostCommonActions: Array<{
    action: string;
    count: number;
  }>;
  recentActivity: LogItem[];
}