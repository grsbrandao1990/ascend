const AVATAR_COLORS = [
  "#7C5CFC",
  "#2DD4BF",
  "#F5A623",
  "#5B9DF9",
  "#10B981",
  "#EC4899",
  "#F97316",
  "#A78BFA",
  "#34D399",
  "#60A5FA",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) & 0xfffffff;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
