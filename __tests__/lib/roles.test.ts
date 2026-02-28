import { getRoleById, ALL_ROLES } from '@/lib/roles';

describe('roles', () => {
  it('has 5 roles', () => {
    expect(ALL_ROLES).toHaveLength(5);
  });

  it('finds role by id', () => {
    const role = getRoleById('cto');
    expect(role.name).toBe('CTO');
  });

  it('cto has research speed bonus', () => {
    const role = getRoleById('cto');
    expect(role.passiveBonus.researchSpeedMultiplier).toBe(1.25);
  });

  it('cfo has starting cash multiplier', () => {
    const role = getRoleById('cfo');
    expect(role.passiveBonus.startingCashMultiplier).toBe(2);
  });

  it('throws for unknown role id', () => {
    expect(() => getRoleById('unknown' as any)).toThrow();
  });
});
