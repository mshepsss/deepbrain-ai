import type { Role, RoleId } from './types';

export const ALL_ROLES: Role[] = [
  {
    id: 'head-of-sales',
    name: 'Head of Sales',
    description: 'Revenue-focused leader who scales the sales org fast.',
    passiveBonus: {
      revenuePerRepMultiplier: 1.2,
      repRampTimeMultiplier: 0.85,
    },
    achievementPath: 'Revenue milestones unlock enterprise deals',
  },
  {
    id: 'cto',
    name: 'CTO',
    description: 'Technical visionary who ships research breakthroughs faster.',
    passiveBonus: {
      researchSpeedMultiplier: 1.25,
      engineeringHireCostMultiplier: 0.9,
    },
    achievementPath: 'Hiring milestones unlock senior engineer tier',
  },
  {
    id: 'cfo',
    name: 'CFO',
    description: 'Financial operator who extends runway and controls burn.',
    passiveBonus: {
      startingCashMultiplier: 2,
      burnRateMultiplier: 0.85,
    },
    achievementPath: 'Runway milestones unlock investor relations events',
  },
  {
    id: 'head-of-research',
    name: 'Head of Research',
    description: 'AGI-obsessed researcher who pushes progress faster at higher cost.',
    passiveBonus: {
      agiProgressMultiplier: 1.3,
      computeCostMultiplier: 1.1,
    },
    achievementPath: 'Research milestones unlock breakthrough events',
  },
  {
    id: 'growth-hacker',
    name: 'Growth Hacker',
    description: 'Viral marketing expert who acquires users and press fast.',
    passiveBonus: {
      userAcquisitionMultiplier: 1.25,
    },
    achievementPath: 'User milestones unlock press coverage bonuses',
  },
];

export const getRoleById = (id: RoleId): Role => {
  const role = ALL_ROLES.find(r => r.id === id);
  if (!role) throw new Error(`Unknown role: ${id}`);
  return role;
};
