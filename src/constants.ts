import os from 'os';

export const CONFIG_FILE: string = os.homedir + "/.config/spacemanage/space.json";
export const USAGE: string = "Usage: spacemanage [init|run] [--except folder1 folder2]";
export const INIT: string = "init";