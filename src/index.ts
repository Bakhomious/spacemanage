#!/usr/bin/env node
import path from 'path';
import { USAGE, INIT } from './constants'
import { FolderType, WorkspaceConfig } from './types'

const args: string[] = process.argv.slice(2);
const command: string = args[0];

switch(command) {
  case INIT:
    const dirPath = args[1] 
      ? path.resolve(args[1]) 
      : process.cwd();
    console.log(dirPath);
    break;
  default:
    console.log(USAGE);
}