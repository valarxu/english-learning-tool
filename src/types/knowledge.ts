export interface KnowledgeTag {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeContent {
  id: string;
  title: string;
  content: string;
  tag_id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
} 