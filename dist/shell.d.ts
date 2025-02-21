interface ConsoleOutput {
    stdout: string;
    stderr: string;
}
/**
 * Executes a shell command asynchronously.
 * @param {string} command - The command to execute.
 * @param {NodeJS.Platform} platform - The platform, defaults to `process.platform`.
 * @returns {Promise<string>} The standard output of the command.
 */
declare const execShellCommand: (command: string, platform?: NodeJS.Platform) => Promise<string>;
export { type ConsoleOutput, execShellCommand };
