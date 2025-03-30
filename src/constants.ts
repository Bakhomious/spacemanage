import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const HOME: string = process.env.HOME as string;
export const CONFIG_FOLDER: string =
  process.env.SPACEMANAGE_CONFIG_FOLDER_PATH || HOME + "/.config/spacemanage";
export const CONFIG_PREFIX: string = "space_";
export const CONFIG_HASH_PLACEHOLDER: string = "{hash}";
export const CONFIG_EXTENSION: string = ".json";
export const CONFIG_FILE: string = path.join(
  CONFIG_FOLDER,
  CONFIG_PREFIX + CONFIG_HASH_PLACEHOLDER + CONFIG_EXTENSION
);

export const DOCKER_COMPOSE: string = "docker-compose up -d";

export const USAGE: string =
  "Usage: spacemanage [init|run|clean] [--except folder1 folder2]";
export const INIT: string = "init";
export const RUN: string = "run";
export const CLEAN: string = "clean";
export const SKIP: string = "--skip";
export const EDIT: string = "edit";
export const DIRECTORY_FLAG: string = "-d";
