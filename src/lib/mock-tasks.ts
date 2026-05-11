import { Task } from './types';

export const tasks: Task[] = [
  { id: 't1', ownerId: 'u8', programId: 'p7', title: 'Hoàn thành nhập điểm Internship', status: 'DONE', dueDate: '2025-05-10', priority: 'high', createdAt: '2025-05-01' },
  { id: 't2', ownerId: 'u8', programId: 'p7', title: 'Cập nhật hồ sơ sinh viên K63', status: 'IN_PROGRESS', dueDate: '2025-05-20', priority: 'medium', createdAt: '2025-05-05' },
  { id: 't3', ownerId: 'u8', programId: 'p7', title: 'Rà soát Turnitin cho BBAE K64', status: 'TODO', dueDate: '2025-05-15', priority: 'high', createdAt: '2025-05-10' },
  { id: 't4', ownerId: 'u9', programId: 'p3', title: 'Chuẩn bị học liệu môn Marketing', status: 'DONE', dueDate: '2025-05-08', priority: 'high', createdAt: '2025-05-01' },
];

export function getTasksByUser(userId: string) {
  return tasks.filter(t => t.ownerId === userId);
}

export function getOverdueTasksByUser(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(t => t.ownerId === userId && t.status !== 'DONE' && t.dueDate < today);
}
