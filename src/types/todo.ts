export interface Todo {
  id?: string;
  content: string;
  due_date: string;
  is_completed: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
} 