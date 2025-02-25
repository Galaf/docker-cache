import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { c as coreExports } from '../../_virtual/core/index.js';

/**
 * Executes a shell command asynchronously.
 * @param {string} command - The command to execute.
 * @param {NodeJS.Platform} platform - The platform, defaults to `process.platform`.
 * @returns {Promise<string>} The standard output of the command.
 */
const execShellCommand = async (command, platform = process.platform) => {
    coreExports.info(`Executing command: ${command}`);
    const execAsPromised = promisify(exec);
    // Determine the shell to use
    const shell = process.env.SHELL && platform !== 'win32'
        ? process.env.SHELL // Use SHELL if set (only on non-Windows)
        : platform === 'win32'
            ? 'C:\\Program Files\\Git\\bin\\bash.exe'
            : '/usr/bin/bash';
    coreExports.info(`Using shell: ${shell}`);
    try {
        const output = await execAsPromised(command, { shell });
        if (output.stdout) {
            coreExports.info(`stdout: ${output.stdout.trim()}`);
        }
        if (output.stderr) {
            coreExports.error(`stderr: ${output.stderr.trim()}`);
        }
        return output.stdout.trim();
    }
    catch (err) {
        const errorMessage = err.message || 'Unknown error occurred';
        coreExports.setFailed(`Command execution failed: ${errorMessage}`);
        return ''; // Return an empty string on failure to prevent undefined behavior
    }
};

export { execShellCommand };
//# sourceMappingURL=index.js.map
