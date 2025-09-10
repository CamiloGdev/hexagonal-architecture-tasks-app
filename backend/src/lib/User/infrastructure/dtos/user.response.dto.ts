export type UserResponseDto = {
  name: string;
  email: string;
} & Partial<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
}>;
