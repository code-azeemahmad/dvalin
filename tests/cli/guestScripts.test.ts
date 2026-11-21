import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 5 Modular Guest Scripts Suite', () => {
  const rootDir = process.cwd();

  const scriptFiles = [
    'guest/scripts/filesystem/file-operations.sh',
    'guest/scripts/filesystem/tree.sh',
    'guest/scripts/process/process-lifecycle.sh',
    'guest/scripts/permissions/permission-demo.sh',
    'guest/scripts/scripting/variables.sh',
    'guest/scripts/scripting/conditions.sh',
    'guest/scripts/scripting/loops.sh',
    'guest/scripts/scripting/functions.sh',
    'guest/scripts/scripting/arguments.sh',
    'guest/scripts/scripting/traps.sh',
  ];

  it('provides all required modular shell scripts on disk', () => {
    for (const relPath of scriptFiles) {
      const fullPath = path.resolve(rootDir, relPath);
      expect(fs.existsSync(fullPath), `File ${relPath} must exist`).toBe(true);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content.startsWith('#!/bin/sh'), `File ${relPath} must start with #!/bin/sh`).toBe(true);
      expect(content.length).toBeGreaterThan(50);
    }
  });

  it('ensures scripts avoid non-POSIX bashisms', () => {
    const forbiddenBashisms = [
      /\[\[\s/,                     // [[ extended test keyword
      /^function\s+[a-zA-Z0-9_-]+/m, // bash-style 'function name' declaration
      /<\(/,                        // process substitution
      /\bdeclare\b/,                // declare keyword
      /\btypeset\b/,                // typeset keyword
    ];

    for (const relPath of scriptFiles) {
      const fullPath = path.resolve(rootDir, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');

      for (const pattern of forbiddenBashisms) {
        expect(pattern.test(content), `Script ${relPath} must not contain bashism ${pattern}`).toBe(false);
      }
    }
  });

  it('validates header and footer marker delimiters in demonstration scripts', () => {
    const markerScripts = [
      { path: 'guest/scripts/filesystem/file-operations.sh', start: '=== FS_DEMO_START ===', end: '=== FS_DEMO_COMPLETE ===' },
      { path: 'guest/scripts/process/process-lifecycle.sh', start: '=== PROCESS_DEMO_START ===', end: '=== PROCESS_DEMO_COMPLETE ===' },
      { path: 'guest/scripts/permissions/permission-demo.sh', start: '=== PERM_DEMO_START ===', end: '=== PERM_DEMO_COMPLETE ===' },
      { path: 'guest/scripts/scripting/variables.sh', start: '=== SCRIPTING_VARS_START ===', end: '=== SCRIPTING_VARS_COMPLETE ===' },
      { path: 'guest/scripts/scripting/conditions.sh', start: '=== SCRIPTING_COND_START ===', end: '=== SCRIPTING_COND_COMPLETE ===' },
      { path: 'guest/scripts/scripting/loops.sh', start: '=== SCRIPTING_LOOPS_START ===', end: '=== SCRIPTING_LOOPS_COMPLETE ===' },
      { path: 'guest/scripts/scripting/functions.sh', start: '=== SCRIPTING_FUNCS_START ===', end: '=== SCRIPTING_FUNCS_COMPLETE ===' },
      { path: 'guest/scripts/scripting/arguments.sh', start: '=== SCRIPTING_ARGS_START ===', end: '=== SCRIPTING_ARGS_COMPLETE ===' },
      { path: 'guest/scripts/scripting/traps.sh', start: '=== SCRIPTING_TRAPS_START ===', end: '=== SCRIPTING_TRAPS_COMPLETE ===' },
    ];

    for (const item of markerScripts) {
      const fullPath = path.resolve(rootDir, item.path);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content, `${item.path} contains start delimiter`).toContain(item.start);
      expect(content, `${item.path} contains end delimiter`).toContain(item.end);
    }
  });
});
