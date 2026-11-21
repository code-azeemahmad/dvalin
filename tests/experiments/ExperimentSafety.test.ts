import { describe, it, expect } from 'vitest';
import { ExperimentSafety } from '../../src/features/experiments/services/ExperimentSafety';

describe('ExperimentSafety Engine', () => {
  it('approves safe educational shell commands', () => {
    const safeCmds = [
      'echo "Current Shell PID: $$"',
      'ps',
      'free',
      'head -n 10 /proc/meminfo',
      'mkdir -p projects/alpha',
      'touch test.txt && chmod 644 test.txt',
      'cat /proc/uptime && uptime',
      'for i in 1 2 3; do echo $i; done',
    ];

    for (const cmd of safeCmds) {
      const res = ExperimentSafety.validateCommand(cmd);
      expect(res.isSafe, `Expected "${cmd}" to be safe`).toBe(true);
    }
  });

  it('blocks dangerous root-destructive rm commands', () => {
    const badCmds = [
      'rm -rf /',
      'rm -rf /*',
      'rm -rf /etc',
      'rm -rf /bin',
      'rm -f /boot',
    ];

    for (const cmd of badCmds) {
      const res = ExperimentSafety.validateCommand(cmd);
      expect(res.isSafe, `Expected "${cmd}" to be blocked`).toBe(false);
      expect(res.reason).toContain('Destructive deletion');
    }
  });

  it('blocks dangerous device-wiping and filesystem formatting operations', () => {
    expect(ExperimentSafety.validateCommand('mkfs.ext4 /dev/sda1').isSafe).toBe(false);
    expect(ExperimentSafety.validateCommand('dd if=/dev/zero of=/dev/sda').isSafe).toBe(false);
    expect(ExperimentSafety.validateCommand('echo c > /dev/sysrq-trigger').isSafe).toBe(false);
  });

  it('blocks fork bombs and uncontrolled shutdowns', () => {
    expect(ExperimentSafety.validateCommand(':(){ :|:& };:').isSafe).toBe(false);
    expect(ExperimentSafety.validateCommand('poweroff').isSafe).toBe(false);
    expect(ExperimentSafety.validateCommand('init 0').isSafe).toBe(false);
  });

  it('resolves isolated experiment workspace paths', () => {
    const ws = ExperimentSafety.getIsolatedWorkspace('exp-proc-01');
    expect(ws).toBe('/tmp/webos-experiments/exp_proc_01');
  });

  it('wraps commands in workspace context with execution markers and code capture', () => {
    const wrapped = ExperimentSafety.wrapCommandForExecution('echo Hello', 'exp-test', 'step1');
    expect(wrapped).toContain('mkdir -p "/tmp/webos-experiments/exp_test"');
    expect(wrapped).toContain('cd "/tmp/webos-experiments/exp_test"');
    expect(wrapped).toContain('echo "___START_step1___"');
    expect(wrapped).toContain('echo "___END_step1___:$__CODE"');
  });

  it('builds scoped cleanup commands', () => {
    const clean = ExperimentSafety.buildCleanupCommand('exp-test', 'kill $PID');
    expect(clean).toContain('rm -rf "/tmp/webos-experiments/exp_test"');
    expect(clean).toContain('kill $PID');
  });

  it('sanitizes ANSI escapes and control characters', () => {
    const dirty = '\x1B[32mPASS\x1B[0m\r\nLine 2';
    const clean = ExperimentSafety.sanitizeOutput(dirty);
    expect(clean).toBe('PASS\nLine 2');
  });
});
