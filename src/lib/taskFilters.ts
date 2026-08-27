export function matchesAssignee(
  task: { userId: string; assigneeId?: string },
  userId: string
): boolean {
  return task.assigneeId === userId || (!task.assigneeId && task.userId === userId);
}
