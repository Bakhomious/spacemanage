import fs from "fs";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { FolderConfig, FolderType, WorkspaceConfig } from "./types";
import { CONFIG_FILE } from "./constants";

export async function initWorkspace(dirPath: string = "."): Promise<void> {
  const absloutePath = path.resolve(dirPath);
  if (!fs.existsSync(absloutePath)) {
    console.error(`ERROR: Directory not found: ${absloutePath}`);
    process.exit(1);
  }

  const workspaceName = path.basename(absloutePath);
  const subfolders = fs
    .readdirSync(absloutePath)
    .filter((f) => fs.statSync(path.join(absloutePath, f)).isDirectory());

  const selectedFolders: string[] = [];
  const answers = await inquirer.prompt([
    {
      name: "folders",
      type: "checkbox",
      message: "Select folders to initialize:",
      choices: subfolders.map((folder) => ({
        name: folder,
        value: folder,
      })),
    },
  ]);

  const folderConfigs: Record<string, FolderConfig> = {};

  for (const folder of answers.folders) {
    const { type, command } = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: `Select the type of directory "${folder}":`,
        choices: [FolderType.FRONTEND, FolderType.BACKEND],
      },
      {
        type: "input",
        name: "command",
        message: `Enter the command to run for the directory "${folder}":`,
        default: "",
      },
    ]);

    folderConfigs[folder] = {
      dirPath: path.join(absloutePath, folder),
      command,
      type,
    };
  }

  const config: WorkspaceConfig = {
    workspace: workspaceName,
    folders: folderConfigs,
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(chalk.green(`Initialized workspace: ${workspaceName}`));
}


