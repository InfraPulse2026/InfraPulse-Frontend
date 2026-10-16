import { describe, expect, it } from 'vitest';
import { originCommand, originSnapshot, commandPolicy } from '../../mocks/command-fixtures';
import {
  adminState,
  commandActive,
  reviewedCommandContext,
  rollbackBlocks,
  validCommandID,
} from './command-state';
describe('typed rollback follows backend-owned identity and lifecycle', () => {
  it('preserves explicit false and accepts a qualified candidate with unknown expiry', () => {
    expect(adminState(false)).toBe('Административно выключен');
    expect(adminState(null)).toBe('Неизвестно');
    expect(rollbackBlocks(originCommand, originSnapshot, commandPolicy)).toEqual([]);
  });
  it('requires all three backend policy flags and respects protected resources', () => {
    for (const flag of ['enabled', 'allow_rollback', 'allow_disable'])
      expect(
        rollbackBlocks(originCommand, originSnapshot, { ...commandPolicy, [flag]: false }),
      ).not.toEqual([]);
    expect(
      rollbackBlocks(originCommand, originSnapshot, {
        ...commandPolicy,
        protected_interfaces: ['ether5'],
      }),
    ).not.toEqual([]);
    expect(
      rollbackBlocks(originCommand, originSnapshot, {
        ...commandPolicy,
        protected_devices: [originCommand.device_id],
      }),
    ).not.toEqual([]);
  });
  it('blocks every non-candidate lifecycle and existing rollback claim', () => {
    for (const status of [
      'reserved',
      'consumed',
      'superseded',
      'uncertain',
      'unverified',
      'unavailable',
    ] as const)
      expect(
        rollbackBlocks(originCommand, { ...originSnapshot, status }, commandPolicy),
      ).not.toEqual([]);
    expect(
      rollbackBlocks(
        originCommand,
        { ...originSnapshot, rollback_command_id: 'cmd_' + 'a'.repeat(32) },
        commandPolicy,
      ),
    ).not.toEqual([]);
  });
  it('does not permit changing origin, agent, device, interface or snapshot', () => {
    for (const key of ['origin_command_id', 'agent_id', 'device_id', 'interface_id', 'snapshot_id'])
      expect(
        rollbackBlocks(originCommand, { ...originSnapshot, [key]: 'other' }, commandPolicy),
      ).not.toEqual([]);
  });
  it('blocks missing verification, uncertainty and missing after-state', () => {
    expect(
      rollbackBlocks({ ...originCommand, result: null }, originSnapshot, commandPolicy),
    ).not.toEqual([]);
    expect(
      rollbackBlocks({ ...originCommand, state: 'uncertain' }, originSnapshot, commandPolicy),
    ).not.toEqual([]);
    expect(
      rollbackBlocks(
        { ...originCommand, result: { ...originCommand.result!, uncertain: true } },
        originSnapshot,
        commandPolicy,
      ),
    ).not.toEqual([]);
    expect(
      rollbackBlocks(
        { ...originCommand, result: { ...originCommand.result!, verification: null } },
        originSnapshot,
        commandPolicy,
      ),
    ).not.toEqual([]);
    expect(
      rollbackBlocks(originCommand, { ...originSnapshot, after_admin_up: null }, commandPolicy),
    ).not.toEqual([]);
  });
  it('blocks expired or malformed explicit dates and mismatched verification', () => {
    for (const expires_at of ['2000-01-01T00:00:00Z', 'invalid'])
      expect(
        rollbackBlocks(originCommand, { ...originSnapshot, expires_at }, commandPolicy),
      ).not.toEqual([]);
    expect(
      rollbackBlocks(
        {
          ...originCommand,
          result: {
            ...originCommand.result!,
            verification: { ...originCommand.result!.verification!, observed_admin_up: true },
          },
        },
        originSnapshot,
        commandPolicy,
      ),
    ).not.toEqual([]);
  });
  it('pins snapshot and result context without inventing a server revision', () => {
    const frozen = reviewedCommandContext(originCommand, originSnapshot);
    expect(
      reviewedCommandContext(structuredClone(originCommand), structuredClone(originSnapshot)),
    ).toBe(frozen);
    expect(
      reviewedCommandContext(originCommand, { ...originSnapshot, status: 'reserved' }),
    ).not.toBe(frozen);
    expect(
      reviewedCommandContext({ ...originCommand, state: 'uncertain' }, originSnapshot),
    ).not.toBe(frozen);
  });
  it('validates command links and polls only active lifecycle states', () => {
    expect(validCommandID(originCommand.id)).toBe(true);
    for (const id of ['cmd_x', '../secret', 'cmd_' + 'A'.repeat(32)])
      expect(validCommandID(id)).toBe(false);
    expect(commandActive('running')).toBe(true);
    for (const s of ['success', 'uncertain', 'timeout', 'unknown'])
      expect(commandActive(s)).toBe(false);
  });
});
