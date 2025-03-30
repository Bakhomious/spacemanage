import fs from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { ChildProcess, spawn } from "child_process";

import { findWorkspaceRootConfigFile, getWorkspaceConfigPath } from "./utils";
import {
  DirectoryConfig,
  DirectoryTypeChoices,
  RunMode,
  WorkspaceConfig,
} from "./types";
import { CLEAN, RUN, USAGE } from "./constants";

export async function initWorkspace(dirPath: string): Promise<void> {
  const absloutePath: string = path.resolve(dirPath);
  if (!fs.existsSync(absloutePath)) {
    console.error(chalk.red(`ERROR: Directory not found: ${absloutePath}`));
    process.exit(1);
  }

  const configFile: string = getWorkspaceConfigPath(dirPath);

  if (fs.existsSync(configFile)) {
    console.info(chalk.yellow(`Workspace already exists at ${absloutePath}`));
    console.info(
      chalk.blue(`Use: "spacemanage edit" to modify the configuration instead.`)
    );
    process.exit(1);
  }

  console.log(chalk.blue(`Initializing workspace at ${absloutePath}`));

  const subDirectories: Array<string> = fs
    .readdirSync(absloutePath)
    .filter((f) => fs.statSync(path.join(absloutePath, f)).isDirectory());

  const selectedDirectories = await inquirer.prompt([
    {
      name: "directories",
      type: "checkbox",
      message: "Select directories to initialize:",
      choices: subDirectories.map((directory) => ({
        name: directory,
        value: directory,
      })),
    },
  ]);

  const directoryConfigs: Record<string, DirectoryConfig> = {};

  for (const directory of selectedDirectories.directories) {
    const { type, command, cleanCommand } = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: `Select the type of directory "${directory}":`,
        choices: DirectoryTypeChoices,
      },
      {
        type: "input",
        name: "command",
        message: `Enter the command to run for the directory "${directory}":`,
        default: "",
      },
      {
        type: "input",
        name: "cleanCommand",
        message: `Enter the clean installing command to run for the directory "${directory}"`,
        default: "",
      },
    ]);

    directoryConfigs[directory] = {
      command,
      cleanCommand,
      type,
    };
  }

  const config: WorkspaceConfig = {
    dirPath: absloutePath,
    directories: directoryConfigs,
  };

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(chalk.green(`Initialized workspace at: ${absloutePath}`));
}

function executeCommand(command: string, label: string): void {
  console.log(chalk.blue(`Running ${label} command...`));
  const commandParts: Array<string> = command.split(" ");
  const cmd: ChildProcess = spawn(commandParts[0], commandParts.slice(1), {
    stdio: "inherit",
    detached: false,
  });

  cmd.on("error", (err) => {
    console.error(
      chalk.red(`Error executing ${label} command: ${err.message}`)
    );
  });

  cmd.on("exit", (code) => {
    console.log(
      chalk.green(`${label} command completed with exit code ${code}`)
    );
    process.exit(code ?? 1);
  });

  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n Caught SIGINT. Stopping process..."));
    cmd.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    console.log(chalk.yellow("\n Caught SIGTERM. Stopping process..."));
    cmd.kill("SIGTERM");
  });
}

export function runWorkspaceWithSkip(
  dirPath: string,
  skippedDirectories: Set<string>,
  mode: RunMode
): void {
  const directoryName: string = path.basename(dirPath);
  if (skippedDirectories.has(directoryName)) {
    console.warn(`Skipping directory ${dirPath} as specified.`);
    process.exit(0);
  } else {
    runWorkspace(dirPath, mode);
  }
}

export function runWorkspace(dirPath: string, mode: RunMode): void {
  try {
    const directoryName: string = path.basename(dirPath);
    const workspaceConfig: string = findWorkspaceRootConfigFile(dirPath);
    const config: DirectoryConfig = JSON.parse(
      fs.readFileSync(workspaceConfig, "utf-8")
    ).directories[directoryName];

    switch (mode) {
      case RUN:
        executeCommand(config.command, RUN);
        break;
      case CLEAN:
        executeCommand(config.cleanCommand, CLEAN);
        break;
      default:
        console.error(chalk.red(`Unexpected mode: ${mode}`));
        console.log(USAGE);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }
}
