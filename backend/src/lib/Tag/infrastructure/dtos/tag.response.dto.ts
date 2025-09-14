export interface TagResponseDto {
  id: string;
  name: string;
  color?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
