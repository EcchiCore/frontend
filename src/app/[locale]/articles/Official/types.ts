export interface Source {
  id: number;
  articleId: number;
  name: string;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submitNote: string;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
  article: { title: string };
  submitter: { name: string };
  reviewer: { name: string };
}

export interface SourcesResponse {
  sources: Source[];
  sourcesCount: number;
}