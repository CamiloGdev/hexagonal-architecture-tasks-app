export interface CategoryResponseDto {
  id: string;
  name: string;
  color?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
