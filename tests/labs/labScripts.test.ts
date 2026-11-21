import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Guest Diagnostic & Educational Lab Scripts Suite', () => {
  const rootDir = process.cwd();
  const configPath = path.resolve(rootDir, 'guest/config/labs.json');

  it('provides a valid labs.json metadata manifest', () => {
    expect(fs.existsSync(configPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(content.version).toBeDefined();
    expect(Array.isArray(content.labs)).toBe(true);
    expect(Array.isArray(content.diagnostics)).toBe(true);
    expect(content.labs.length).toBeGreaterThanOrEqual(2);
    expect(content.diagnostics.length).toBeGreaterThanOrEqual(4);
  });

  it('contains all referenced diagnostic scripts with valid POSIX shebangs', () => {
    const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    for (const diag of content.diagnostics) {
      const scriptFullPath = path.resolve(rootDir, diag.scriptPath);
      expect(fs.existsSync(scriptFullPath), `Script ${diag.scriptPath} exists`).toBe(true);
      const scriptContent = fs.readFileSync(scriptFullPath, 'utf8');
      expect(scriptContent.startsWith('#!/bin/sh')).toBe(true);
      expect(scriptContent).toContain('=== WEBOS_');
      expect(scriptContent.length).toBeGreaterThan(100);
    }
  });

  it('contains all referenced lab scripts with matching validation tokens', () => {
    const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    for (const lab of content.labs) {
      const scriptFullPath = path.resolve(rootDir, lab.scriptPath);
      expect(fs.existsSync(scriptFullPath), `Script ${lab.scriptPath} exists`).toBe(true);
      const scriptContent = fs.readFileSync(scriptFullPath, 'utf8');
      expect(scriptContent.startsWith('#!/bin/sh')).toBe(true);

      for (const token of lab.expectedTokens) {
        expect(scriptContent, `Script ${lab.id} contains expected token "${token}"`).toContain(token);
      }
    }
  });
});
