export interface TaskItem {
    id?: number;
    created_at?: Date;
    user_id: string;
    task: string;
    category?: ItemCategory;
    isCompleted: boolean;
    type: 'daily' | 'weekly';
}

export type ItemCategory = 'high' | 'low' | 'others';

export interface Reward {
    id: number;
    user_id: string;
    items: string[];
    points: number;
    streakmap: string[]
}