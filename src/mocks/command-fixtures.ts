import type { Model } from '../api/client';
import { now } from './fixtures';
export const originCommandID = 'cmd_' + '1'.repeat(32);
export const uncertainCommandID = 'cmd_' + '2'.repeat(32);
export const consumedCommandID = 'cmd_' + '3'.repeat(32);
export const commandPolicy: Model<'CommandPolicy'> = {
  enabled: true,
  allow_disable: true,
  allow_rollback: true,
  protected_devices: [],
  protected_interfaces: ['ether1'],
};
export const originCommand: Model<'CommandRecord'> = {
  id: originCommandID,
  agent_id: 'demo-edge-01',
  device_id: 'simulated:mikrotik-01',
  interface_id: 'ether5',
  operation: 'disable',
  expected_admin_up: true,
  timeout_seconds: 30,
  idempotency_key: 'simulated-origin-key',
  actor_id: 'simulated-operator',
  state: 'success',
  reason: 'SIMULATED typed command fixture',
  created_at: now,
  updated_at: now,
  deadline_at: now,
  session_id: 'simulated-command-session',
  dispatched_at: now,
  result: {
    message_id: 'simulated-result',
    status: 'COMMAND_STATUS_SUCCESS',
    started_at: now,
    finished_at: now,
    changed: true,
    uncertain: false,
    error_code: '',
    error_message: '',
    snapshot_id: 'simulated-agent-snapshot-1',
    verification: {
      interface_id: 'ether5',
      name: 'ether5',
      expected_admin_up: false,
      observed_admin_up: false,
      observed_at: now,
      verified: true,
      changed: true,
      uncertain: false,
      evidence: 'SIMULATED qualified RouterOS observation',
    },
  },
  rollback_of_command_id: null,
  rollback_snapshot_id: null,
};
export const originSnapshot: Model<'CommandSnapshot'> = {
  agent_id: originCommand.agent_id,
  snapshot_id: 'simulated-agent-snapshot-1',
  origin_command_id: originCommandID,
  device_id: originCommand.device_id,
  interface_id: 'ether5',
  status: 'candidate',
  reason: 'simulated_verified_result',
  initial_observed_admin_up: true,
  after_admin_up: false,
  previous_state_basis: 'backend_initial_observation_not_agent_snapshot',
  recorded_at: now,
  expires_at: null,
  expiry_basis: 'not_transmitted_by_agent',
  rollback_command_id: null,
};
export const commandFixtures: Model<'CommandRecord'>[] = [
  originCommand,
  {
    ...structuredClone(originCommand),
    id: uncertainCommandID,
    state: 'uncertain',
    reason: 'agent_result_missing',
    result: {
      ...structuredClone(originCommand.result!),
      snapshot_id: 'simulated-agent-snapshot-2',
      uncertain: true,
    },
  },
  {
    ...structuredClone(originCommand),
    id: consumedCommandID,
    result: {
      ...structuredClone(originCommand.result!),
      snapshot_id: 'simulated-agent-snapshot-3',
    },
  },
  {
    ...structuredClone(originCommand),
    id: 'cmd_' + '4'.repeat(32),
    operation: 'rollback',
    expected_admin_up: false,
    rollback_of_command_id: consumedCommandID,
    rollback_snapshot_id: 'simulated-agent-snapshot-3',
    result: {
      ...structuredClone(originCommand.result!),
      snapshot_id: '',
      verification: {
        ...structuredClone(originCommand.result!.verification!),
        expected_admin_up: true,
        observed_admin_up: true,
      },
    },
  },
];
export const commandSnapshotFixtures: Model<'CommandSnapshot'>[] = [
  originSnapshot,
  {
    ...structuredClone(originSnapshot),
    origin_command_id: uncertainCommandID,
    snapshot_id: 'simulated-agent-snapshot-2',
    status: 'uncertain',
    after_admin_up: null,
  },
  {
    ...structuredClone(originSnapshot),
    origin_command_id: consumedCommandID,
    snapshot_id: 'simulated-agent-snapshot-3',
    status: 'consumed',
    rollback_command_id: 'cmd_' + '4'.repeat(32),
  },
];
