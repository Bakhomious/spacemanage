import fs from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { ChildProcess, spawn } from "child_process";

import {
  findWorkspaceRootConfigFile,
  getWorkspaceConfigPath,
} from "./utils.js";
import {
  DirectoryConfig,
  DirectoryTypeChoices,
  RunMode,
  WorkspaceConfig,
} from "./types.js";
import { CLEAN, RUN, USAGE } from "./constants.js";

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
  console.log(chalk.black(`Config file: ${configFile}`));

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
  process.exit(0);
}

async function executeCommand(command: string, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if(!command) {
      console.warn(`Skipping ${label}, no command specified.`)
      return;
    }
    console.log(chalk.blue(`Running ${label} command...`));
    const commandParts: Array<string> = command.split(" ") as string[];
    const cmd: ChildProcess = spawn(commandParts[0], commandParts.slice(1), {
      stdio: "inherit",
      detached: false,
    });

    cmd.on("error", (err) => {
      console.error(
        chalk.red(`Error executing ${label} command: ${err.message}`)
      );
      reject(err);
    });

    cmd.on("exit", (code) => {
      if (code !== 0) {
        console.error(chalk.red(`${label} command failed with exit code ${code}`));
        reject(new Error(`${label} command failed`));
      } else {
        console.log(chalk.green(`${label} command completed with exit code ${code}`));
        resolve();
      }
    });

    process.on("SIGINT", () => {
      console.log(chalk.yellow("\n Caught SIGINT. Stopping process..."));
      cmd.kill("SIGINT");
      reject(new Error("SIGINT received"));
    });

    process.on("SIGTERM", () => {
      console.log(chalk.yellow("\n Caught SIGTERM. Stopping process..."));
      cmd.kill("SIGTERM");
      reject(new Error("SIGTERM received"));
    });
  });
}

export async function runWorkspaceSequentially(
  dirPath: string,
  skippedDirectories: Set<string>,
  modes: Array<RunMode>
): Promise<void> {
  for (const mode of modes) {
    console.log(chalk.blue(`Executing mode: ${mode}`));
    await runWorkspaceWithSkip(dirPath, skippedDirectories, mode);
  }
}

export async function runWorkspaceWithSkip(
  dirPath: string,
  skippedDirectories: Set<string>,
  mode: RunMode
): Promise<void> {
  const directoryName: string = path.basename(dirPath);
  if (skippedDirectories.has(directoryName)) {
    console.warn(`Skipping directory ${dirPath} as specified.`);
    process.exit(0);
  } else {
    await runWorkspace(dirPath, mode);
  }
}

export async function runWorkspace(
  dirPath: string,
  mode: RunMode
): Promise<void> {
  try {
    const directoryName: string = path.basename(dirPath);
    const workspaceConfig: string = findWorkspaceRootConfigFile(dirPath);
    const config: DirectoryConfig = JSON.parse(
      fs.readFileSync(workspaceConfig, "utf-8")
    ).directories[directoryName];

    switch (mode) {
      case RUN:
        await executeCommand(config.command, RUN);
        break;
      case CLEAN:
        await executeCommand(config.cleanCommand, CLEAN);
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
