import { exec } from 'node:child_process'
import { promisify } from 'node:util'

import { error, info, setFailed } from '@actions/core'

interface ConsoleOutput {
  stdout: string
  stderr: string
}

/**
 * Executes a shell command asynchronously.
 * @param {string} command - The command to execute.
 * @param {NodeJS.Platform} platform - The platform, defaults to `process.platform`.
 * @returns {Promise<string>} The standard output of the command.
 */
const execShellCommand = async (
  command: string,
  platform: NodeJS.Platform = process.platform
): Promise<string> => {
  info(`Executing command: ${command}`)

  const execAsPromised = promisify(exec)

  // Determine the shell to use
  const shell =
    process.env.SHELL && platform !== 'win32'
      ? process.env.SHELL // Use SHELL if set (only on non-Windows)
      : platform === 'win32'
        ? 'C:\\Program Files\\Git\\bin\\bash.exe'
        : '/usr/bin/bash'

  info(`Using shell: ${shell}`)

  try {
    const output: ConsoleOutput = await execAsPromised(command, { shell })

    if (output.stdout) {
      info(`stdout: ${output.stdout.trim()}`)
    }
    if (output.stderr) {
      error(`stderr: ${output.stderr.trim()}`)
    }

    return output.stdout.trim()
  } catch (err: unknown) {
    const errorMessage = (err as Error).message || 'Unknown error occurred'
    setFailed(`Command execution failed: ${errorMessage}`)
    return '' // Return an empty string on failure to prevent undefined behavior
  }
}

export { type ConsoleOutput, execShellCommand }
