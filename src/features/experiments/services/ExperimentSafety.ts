/**
 * Safety engine for WebOS experiments.
 * Enforces workspace isolation, command validation, process safety boundaries, and cleanup guarantees.
 */

const DANGEROUS_PATTERNS = [
  { pattern: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?(\/\s*$|\/\*|\/bin|\/etc|\/boot|\/lib|\/sbin|\/usr)/i, reason: 'Destructive deletion of guest system directories is forbidden.' },
  { pattern: /\bmkfs(\.[a-z0-9]+)?\b/i, reason: 'Filesystem formatting operations are forbidden.' },
  { pattern: /\bdd\s+.*of=\/dev\/(sda|hda|mem|kmem)/i, reason: 'Direct block/memory device overwriting is forbidden.' },
  { pattern: />\s*\/dev\/(mem|kmem|sysrq-trigger)/i, reason: 'Raw kernel device writes are forbidden.' },
  { pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, reason: 'Fork bomb execution is prohibited.' },
  { pattern: /\bkill\s+-9\s+-1\b/i, reason: 'Broad signal dispatch to all processes is forbidden.' },
  { pattern: /\bpoweroff\b|\binit\s+0\b|\bhalt\b/i, reason: 'Uncontrolled guest shutdown commands are prohibited inside experiments.' },
];

export class ExperimentSafety {
  public static readonly BASE_WORKSPACE = '/tmp/webos-experiments';

  /**
   * Resolves the isolated guest workspace path for an experiment.
   */
  public static getIsolatedWorkspace(experimentId: string): string {
    const cleanId = experimentId.replace(/[^a-zA-Z0-9]/g, '_');
    return `${ExperimentSafety.BASE_WORKSPACE}/${cleanId}`;
  }

  /**
   * Validates a shell command against security and safety boundaries.
   */
  public static validateCommand(command: string): { isSafe: boolean; reason?: string } {
    if (!command || !command.trim()) {
      return { isSafe: false, reason: 'Command cannot be empty.' };
    }

    for (const { pattern, reason } of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        return { isSafe: false, reason };
      }
    }

    return { isSafe: true };
  }

  /**
   * Wraps a command inside an isolated workspace context with unique markers and exit code capture.
   */
  public static wrapCommandForExecution(command: string, experimentId: string, stepId: string): string {
    const workspace = ExperimentSafety.getIsolatedWorkspace(experimentId);
    const startMarker = `___START_${stepId}___`;
    const endMarker = `___END_${stepId}___`;

    return `mkdir -p "${workspace}" && cd "${workspace}" && echo "${startMarker}" && (${command}) 2>&1; __CODE=$?; echo "${endMarker}:$__CODE"`;
  }

  /**
   * Generates a deterministic, safely-scoped cleanup command for an experiment.
   */
  public static buildCleanupCommand(experimentId: string, customCleanup?: string): string {
    const workspace = ExperimentSafety.getIsolatedWorkspace(experimentId);
    const cleanCmd = `rm -rf "${workspace}"`;
    if (customCleanup && customCleanup.trim()) {
      return `${cleanCmd}; (${customCleanup}) 2>/dev/null || true`;
    }
    return cleanCmd;
  }

  /**
   * Sanitizes command output by stripping terminal control sequences.
   */
  public static sanitizeOutput(text: string): string {
    if (!text) return '';
    // Strip carriage returns and terminal control sequences (ANSI color codes)
    return text
      .replace(/\r/g, '')
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
      .trim();
  }
}
