[![Actions Status](https://github.com/kynatro/notepack-cli/workflows/Tests/badge.svg)](https://github.com/kynatro/notepack-cli/actions)

# NotePack CLI

Local note taking with intelligent todo collation.

## About

NotePack CLI project started out as a simple set of scripts to keep my own note taking sane. I got tired of switching between note taking apps depending on my job, the whims of IT, and the fickleness of my WiFi connection. So, I decided to start taking all my notes locally in Markdown. Since my notes were just files, and Markdown is a structured format, I figured I'd make my notes work for me.

NotePack will collate all todos found in any Markdown file in your notes folder, order and group them, and then place them in `README.md` files anywhere you place them among your notes (with todos kept in context to the location of said `README.md` file).

NotePack also understands the concept of teams and will make distinctions between todos you have assigned for yourself, and todos you expect others to accomplish to help you keep them accountable (or bug them to make sure they're actually delivering what you expect on time). NotePack will assume any todo that doesn't start with an `@mention` syntax is assigned to you and place all your open todos in your note project's root `README.md` file. Create a team folder for your team members with `README.md` files in each team member folder and NotePack will place corresponding todo lists for each team member in their `README.md` file - great for people managers!

## Roadmap

Still lots to do to make this into a tool that others will truly enjoy. See the [Roadmap Project](../../projects/1) for what's coming next.

## Installation

> Prerequisite: As this is an npm package, you must have Node installed on your machine for notepack-cli to work

Simply install this package as a global module:

```sh
> npm install -g notepack-cli
```

### Configuration

Once you have installed NotePack you will need to configure your project. This only needs to be done once:

```sh
> notepack configure
```

You will be asked a series of questions:

**Application root folder location**  
This is the location of your notes project. By default, it is the root folder of your notes project. All file paths in subsequent questions should be considered relative to this location. Your project owner `README.md` should reside in this location.

**Folder paths to collate todos (comma delimited)**  
You can specify specific folders in your notes project to ensure you aren't scraping any other non-notes folders. You can specify multiple folders with a comma delimited list.

**Folder path for team notes**  
The folder where your team member notes are kept; default is `Team`. The expectation is that sub-folders exist named after each team member within this folder and each team member sub-folder has a `README.md` file.

**Anchor title for todos section**  
The title of the todos section of the `README.md` file. If this section does not exist yet in the file it will be appended to the end of the file. If this section already exists it will be replaced bracketing the start and end of the section between the heading levels specifed in the next question...

**Anchor heading level for todos section**  
The heading level for the todos section; default is `##` (an H2). This is used for bracketing where the todos section begins and ends (before the next `##` for example).

**Todo group heading level (should be less than anchor heading)**  
The heading level for grouping todos in the todos section of `README.md` files. Notepack will group todos by folder and filename and display that grouping above those todos (with the grouping heading linked to the file housing the todos).

## Using NotePack

NotePack will work with any file naming schema or folder organization, however it will work best for you if you follow a consistent convention.

### Folder structure

NotePack will read any folder organization, but team folder structuring is expected to follow a specific pattern. See [Team member management / Folder organization](#folder-organization) for more details. See the [example](./example) folder for a possible organization of notes.

### File creation

As file creation meta isn't reliable for noting when a note was taken and how fresh or stale the todos associated with it are, it is recommended that all note files in your note project start with the date of the note:

```
2020-05-10 Project Planning Session.md
2020-07-06 Weekly Backlog Grooming.md
```

This will allow ordering in directory listings to act in a consistent and predictable manner and NotePack will read the `YYYY-MM-DD` prefix on the file to determine the order in which to display the todos in `README.md` files. Noting file dates in this way also allows note dating to remain consistent across machines when syncing your note project using git across devices.

### File structure

NotePack will read todos from anywhere within a Markdown file and attempt to assign them to an individual and collate them to folder level `README.md` files. However, it is recommended to keep your notes file structure standardized so it is easy to quickly locate follow-up items and check things off. The recommended structure would look something like:

```md
# Project Planning Session

## Follow-up
- [ ] @John to write project plan
- [ ] Follow-up with @John later

## Notes
Notes go here

* Important item 1
* Important item 2
* etc.
```

NotePack would find the two todos here, add the one starting with `@John` to John's team folder `README.md` file and add the other todo to the project owner `README.md` file. Those todos would each be grouped under a heading linking to this file. When taking notes using an IDE like VSCode, those links can be followed to open the associated file they were originally scraped from. When following this file structure the todos are easy to find and mark off. Viewing this file structure when rendered in a git repository like GitHub will also make it easy to read through and find any outstanding todos from a single note.

## Team Management

### Folder organization

To manage team member notes and collate todos, you must create a specific folder structure.  Assuming you have configured NotePack with the team folder as `Team`, that folder should look like:

```
Team
  Jane Doe
    README.md
  John Doe
    README.md
```

The `README.md` file in the `Jane Doe` folder will update with any todos assigned to Jane by prefixing a todo with her `@mention`:

```md
- [ ] @Jane.Doe to organize strategy session
```

By default you can concatenate given and sur names with `.`. You can also specify other aliases for ease of mentioning. See the [Customizing team members / aliases](#aliases) section for more details.

### Customizing team members

Team members can be customized using [front-matter](https://www.npmjs.com/package/front-matter) at the head of each team member folder's `README.md` file. Example for the `Johnathan Doe` team member:

```md
---
aliases:
- John
- John Doe
- Johnathan
---
```

#### aliases
An Array of alternate names to refer to a team member by. NotePack will automatically assign an alias for given and sur name concatenation with `.` characters instead of spaces. In the example above, Johnathan Doe can be referenced by `@Johnathan.Doe`, `@John`, `@John.Doe`, or `@Johnathan` in any todo assigned to him.

## CLI

### notepack configure

Configure NotePack

```sh
> notepack configure
```

### notepack

By default, executing `notepack` will simply return a list of all the open todos ordered by file date. Same as running `notepack todos`

```sh
> notepack
```

### notepack todos mine

Display open todos assigned to the project owner.

```sh
> notepack todos mine
```

### notepack todos [TEAM_MEMBER]

Display open todos assigned to a team member.

```sh
> notepack todos "Jane Doe"
```

### notepack update

Update all `README.md` files (folders and team).

```sh
> notepack update
```

### notepack watch

Watch file changes in the background and automatically update `README.md` files with new open todos or closed todos. Watch will begin running in the background detatched from the current terminal and not provide any output. This will allow watching to happen without having to keep terminal open.

```sh
> notepack watch
```

### notepack status

Display the status of the watcher.

```sh
> notepack status
```

### notepack stop

Stop watching for file changes.

```sh
> notepack stop
```
