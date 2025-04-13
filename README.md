# Spacemanage

A simple manager for your workspace. Specifying commands and clean/build commands for your projects, i.e. fancy makeFiles. 

```json
{
  "dirPath": "/Users/batman/workspace",
  "directories": {
    "test_app": {
      "command": "mvn spring-boot:run",
      "cleanCommand": "mvn clean install -DskipTests",
      "type": "be"
    }
}
```

> [!WARNING]
> This is a personal project merely meant for learning TypeScript. If I actually wanted to make this more effiecient I would write it in a different programming language (or a fancy shell script, which is probably going to be on a different branch). But for now this is suffiecient to my day to day use.
> Unfortunately, Node always run in the background and without it, it's pretty hard to manage the child processes. But the CPU/RAM usage is pretty insignificant. 

## Build

```shell
pnpm build
```

## Globally link

```shell
pnpm link
```

## Usage

### Initializing a workspace

From the desired workspace directory run:

```shell
spacemanage init
```

or alternatively

```shell
spacemanage init -d path-to-dir
```

### Running an application

From the application directory run:

```shell
spacemanage run
```

### Cleaning/Building application

From the application directory run:

```shell
spacemanage clean
```

### Excluding directories (if using [tmux-sendall](https://github.com/Bakhomious/dotfiles/blob/main/.tmux-sendall.sh))

```shell
spacemanage [run|clean] --skip directory-name
```

### Nesting Commands

Commands can be nested if you want to run `clean` and `run` mode:

```shell
spacemanage clean run [--skip directorn-name]
```

> [!NOTE]
> Clean will always take precedence.

## TODO

- [x] Docker Support
- [ ] Edit Workspace config mode
- [ ] Create a bin for easier installation
- [ ] Migrate to a fancy shell script
- [ ] Nest lifecycles when needed