import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const SHELL: string = process.env.SHELL as string;

export const CONFIG_FOLDER: string = process.env.SPACEMANAGE_CONFIG_FOLDER_PATH as string;
export const CONFIG_PREFIX: string = "space_";
export const CONFIG_HASH_PLACEHOLDER: string = "{hash}";
export const CONFIG_EXTENSION: string = ".json";
export const CONFIG_FILE: string = path.join(CONFIG_FOLDER, CONFIG_PREFIX + CONFIG_HASH_PLACEHOLDER + CONFIG_EXTENSION);

export const USAGE: string = "Usage: spacemanage [init|run|clean] [--except folder1 folder2]";
export const INIT: string = "init";
export const RUN: string = "run";
export const CLEAN: string = "clean";
export const EXCEPT: string = "--except"
