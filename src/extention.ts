import * as vscode from 'vscode';
import { execSync } from 'child_process';

interface CommitStructure {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
}

interface GitChanges {
  modified: string[];
  added: string[];
  deleted: string[];
  renamed: string[];
  untracked: string[];
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'commitGenerator.generate',
    async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      try {
        // Get git status
        const status = execSync('git status --porcelain', {
          cwd: workspaceFolder.uri.fsPath,
          encoding: 'utf-8'
        });

        if (!status.trim()) {
          vscode.window.showWarningMessage('No changes to commit');
          return;
        }

        // Parse changes
        const changes = parseGitStatus(status);
        
        // Build structured commit
        const commitStructure = await buildCommitStructure(changes);
        
        if (!commitStructure) {
          return; // User cancelled
        }
        
        // Format commit message
        const message = formatCommitMessage(commitStructure);
        
        // Insert into SCM
        await setCommitMessage(message);
        
        vscode.window.showInformationMessage('Commit message generated!');
        
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to generate commit message: ${error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

function parseGitStatus(status: string): GitChanges {
  const lines = status.trim().split('\n').filter(line => line);
  
  const changes: GitChanges = {
    modified: [],
    added: [],
    deleted: [],
    renamed: [],
    untracked: []
  };

  lines.forEach(line => {
    const statusCode = line.substring(0, 2);
    const file = line.substring(3).trim();

    // Handle staged and unstaged changes
    if (statusCode[0] === 'M' || statusCode[1] === 'M') {
      changes.modified.push(file);
    } else if (statusCode[0] === 'A' || statusCode.includes('A')) {
      changes.added.push(file);
    } else if (statusCode[0] === 'D' || statusCode.includes('D')) {
      changes.deleted.push(file);
    } else if (statusCode[0] === 'R' || statusCode.includes('R')) {
      changes.renamed.push(file);
    } else if (statusCode === '??') {
      changes.untracked.push(file);
    }
  });

  return changes;
}

async function buildCommitStructure(changes: GitChanges): Promise<CommitStructure | null> {
  const totalFiles = 
    changes.modified.length +
    changes.added.length +
    changes.deleted.length +
    changes.renamed.length +
    changes.untracked.length;

  // Determine type based on changes
  const type = await selectCommitType(changes);
  
  if (!type) {
    return null; // User cancelled
  }
  
  // Determine scope
  const scope = determineScope(changes);
  
  // Generate subject
  const subject = generateSubject(changes, type, totalFiles);
  
  // Generate body
  const body = generateBody(changes, totalFiles);
  
  // Generate footer (if needed)
  const footer = await generateFooter();

  return { type, scope, subject, body, footer };
}

async function selectCommitType(changes: GitChanges): Promise<string | null> {
  const types = [
    { label: 'feat', description: 'A new feature', detail: '✨ New functionality' },
    { label: 'fix', description: 'A bug fix', detail: '🐛 Bug fixes' },
    { label: 'docs', description: 'Documentation', detail: '📚 Documentation changes' },
    { label: 'style', description: 'Code style', detail: '💎 Formatting, semicolons' },
    { label: 'refactor', description: 'Code refactoring', detail: '♻️ Code restructuring' },
    { label: 'test', description: 'Adding tests', detail: '🧪 Test coverage' },
    { label: 'chore', description: 'Maintenance', detail: '🔧 Build, dependencies' },
    { label: 'perf', description: 'Performance', detail: '⚡ Performance improvements' }
  ];

  // Auto-detect based on files
  const allFiles = [
    ...changes.modified,
    ...changes.added,
    ...changes.deleted,
    ...changes.renamed,
    ...changes.untracked
  ];

  let autoDetected: string | null = null;

  if (allFiles.some(f => /test|spec|__tests__/i.test(f))) {
    autoDetected = 'test';
  } else if (allFiles.some(f => f === 'package.json' || f === 'package-lock.json')) {
    autoDetected = 'chore';
  } else if (allFiles.some(f => /readme|\.md$/i.test(f))) {
    autoDetected = 'docs';
  } else if (allFiles.every(f => /\.css$|\.scss$|\.less$/i.test(f))) {
    autoDetected = 'style';
  }

  // Let user choose with auto-detected suggestion at top
  let typesToShow = types;
  if (autoDetected) {
    const detectedType = types.find(t => t.label === autoDetected);
    if (detectedType) {
      typesToShow = [
        { ...detectedType, description: `${detectedType.description} (suggested)` },
        ...types.filter(t => t.label !== autoDetected)
      ];
    }
  }

  const selected = await vscode.window.showQuickPick(typesToShow, {
    placeHolder: 'Select commit type'
  });

  return selected?.label || null;
}

function determineScope(changes: GitChanges): string | undefined {
  const allFiles = [
    ...changes.modified,
    ...changes.added,
    ...changes.deleted,
    ...changes.renamed
  ];

  if (allFiles.length === 0) return undefined;

  // Find common directory
  const dirs = allFiles
    .map(f => f.split('/')[0])
    .filter(d => d !== '');

  const uniqueDirs = [...new Set(dirs)];
  
  // If all files in same directory
  if (uniqueDirs.length === 1 && uniqueDirs[0] !== '.') {
    return uniqueDirs[0];
  }

  // Check for common patterns
  if (allFiles.every(f => /components?/i.test(f))) return 'components';
  if (allFiles.every(f => /api|routes?/i.test(f))) return 'api';
  if (allFiles.every(f => /utils?|helpers?/i.test(f))) return 'utils';
  if (allFiles.every(f => /types?/i.test(f))) return 'types';

  return undefined;
}

function generateSubject(changes: GitChanges, type: string, totalFiles: number): string {
  // All new files
  if (changes.added.length === totalFiles) {
    if (totalFiles === 1) {
      const fileName = getFileName(changes.added[0]);
      return `add ${fileName}`;
    }
    const category = categorizeFiles(changes.added);
    if (category) {
      return `add ${category}`;
    }
    return `add ${totalFiles} new files`;
  }

  // All deleted files
  if (changes.deleted.length === totalFiles) {
    if (totalFiles === 1) {
      const fileName = getFileName(changes.deleted[0]);
      return `remove ${fileName}`;
    }
    return `remove ${totalFiles} files`;
  }

  // Single file modified
  if (changes.modified.length === 1 && totalFiles === 1) {
    const fileName = getFileName(changes.modified[0]);
    return `update ${fileName}`;
  }

  // Multiple files - try to categorize
  const allFiles = [
    ...changes.modified,
    ...changes.added,
    ...changes.deleted
  ];

  if (totalFiles <= 3) {
    const fileNames = allFiles.slice(0, 3).map(f => getFileName(f)).join(', ');
    return `update ${fileNames}`;
  }

  // 4+ files - use categories or generic descriptions
  const category = categorizeFiles(allFiles);
  if (category) {
    return `update ${category}`;
  }

  // Type-specific descriptions for many files
  if (type === 'feat') {
    return 'implement new feature';
  }
  if (type === 'fix') {
    return 'fix multiple issues';
  }
  if (type === 'refactor') {
    return 'refactor code structure';
  }
  if (type === 'docs') {
    return 'update documentation';
  }
  if (type === 'test') {
    return 'add test coverage';
  }
  if (type === 'style') {
    return 'format code';
  }
  if (type === 'chore') {
    return 'update dependencies';
  }
  
  return `update ${totalFiles} files`;
}

function getFileName(path: string): string {
  const fileName = path.split('/').pop() || path;
  return fileName.replace(/\.[^/.]+$/, '');
}

function categorizeFiles(files: string[]): string | null {
  const categories = {
    'components': /components?/i,
    'API routes': /api|routes?|controllers?/i,
    'utilities': /utils?|helpers?/i,
    'styles': /\.css$|\.scss$|\.less$|styles?/i,
    'tests': /test|spec|__tests__/i,
    'configuration': /config|\.config\./i,
    'types': /types?|\.d\.ts$/i,
    'documentation': /readme|docs?/i,
    'models': /models?|schemas?/i,
    'services': /services?/i
  };

  for (const [category, pattern] of Object.entries(categories)) {
    const matchCount = files.filter(f => pattern.test(f)).length;
    // If majority of files match this category
    if (matchCount >= files.length * 0.6) {
      return category;
    }
  }

  return null;
}

function generateBody(changes: GitChanges, totalFiles: number): string {
  const config = vscode.workspace.getConfiguration('commitGenerator');
  const maxFilesInBody = config.get<number>('maxFilesInBody', 20);
  const lines: string[] = [];

  // If too many files, show summary instead of full list
  if (totalFiles > maxFilesInBody) {
    return generateSummary(changes);
  }

  // List changes by type
  if (changes.added.length > 0) {
    lines.push('Added:');
    changes.added.forEach(f => lines.push(`  - ${f}`));
    lines.push('');
  }

  if (changes.modified.length > 0) {
    lines.push('Modified:');
    changes.modified.forEach(f => lines.push(`  - ${f}`));
    lines.push('');
  }

  if (changes.deleted.length > 0) {
    lines.push('Deleted:');
    changes.deleted.forEach(f => lines.push(`  - ${f}`));
    lines.push('');
  }

  if (changes.renamed.length > 0) {
    lines.push('Renamed:');
    changes.renamed.forEach(f => lines.push(`  - ${f}`));
    lines.push('');
  }

  return lines.join('\n').trim();
}

function generateSummary(changes: GitChanges): string {
  const parts: string[] = [];

  if (changes.added.length > 0) {
    parts.push(`${changes.added.length} added`);
  }
  if (changes.modified.length > 0) {
    parts.push(`${changes.modified.length} modified`);
  }
  if (changes.deleted.length > 0) {
    parts.push(`${changes.deleted.length} deleted`);
  }
  if (changes.renamed.length > 0) {
    parts.push(`${changes.renamed.length} renamed`);
  }

  return `Changes: ${parts.join(', ')}`;
}

async function generateFooter(): Promise<string | undefined> {
  const config = vscode.workspace.getConfiguration('commitGenerator');
  const includeFooter = config.get<boolean>('includeFooter', false);
  
  if (!includeFooter) {
    return undefined;
  }

  // Ask for breaking changes or issue references
  const issueNumber = await vscode.window.showInputBox({
    prompt: 'Related issue number (optional, press Enter to skip)',
    placeHolder: 'e.g., 123'
  });

  if (issueNumber && issueNumber.trim()) {
    return `Closes #${issueNumber.trim()}`;
  }

  return undefined;
}

function formatCommitMessage(structure: CommitStructure): string {
  let message = '';

  // Header: type(scope): subject
  message += structure.type;
  if (structure.scope) {
    message += `(${structure.scope})`;
  }
  message += `: ${structure.subject}`;

  // Body
  if (structure.body && structure.body.trim()) {
    message += `\n\n${structure.body}`;
  }

  // Footer
  if (structure.footer && structure.footer.trim()) {
    message += `\n\n${structure.footer}`;
  }

  return message;
}

async function setCommitMessage(message: string) {
  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
  const git = gitExtension?.getAPI(1);
  
  if (git && git.repositories.length > 0) {
    const repo = git.repositories[0];
    repo.inputBox.value = message;
  } else {
    vscode.window.showWarningMessage('Could not find Git extension');
  }
}

export function deactivate() {}
