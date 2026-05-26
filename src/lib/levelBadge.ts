export interface BadgeTier {
  name: string;
  description: string;
  file: string;
  minLevel: number;
  maxLevel: number;
}

export const BADGE_TIERS: BadgeTier[] = [
  {
    name: "Recruta",
    description: "O começo de tudo, a folha em branco.",
    file: "/badges/recruta.svg",
    minLevel: 1,
    maxLevel: 5,
  },
  {
    name: "Aventureiro",
    description: "Já sabe o básico e começou a cumprir as primeiras missões diárias.",
    file: "/badges/aventureiro.svg",
    minLevel: 6,
    maxLevel: 10,
  },
  {
    name: "Guardião",
    description: "Começa a ter consistência e a proteger sua rotina contra a procrastinação.",
    file: "/badges/guardiao.svg",
    minLevel: 11,
    maxLevel: 15,
  },
  {
    name: "Veterano",
    description: "Já tem uma boa bagagem de tarefas concluídas e domina o próprio ritmo.",
    file: "/badges/veterano.svg",
    minLevel: 16,
    maxLevel: 20,
  },
];

export function getBadgeForLevel(level: number): BadgeTier {
  return (
    BADGE_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel) ??
    BADGE_TIERS[BADGE_TIERS.length - 1]
  );
}
