const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const fs = require('fs');
const path = require('path');
const { APP_ROOT_FOLDER, TODO_GROUP_HEADING_LEVEL, TODO_ANCHOR, TODO_ANCHOR_HEADING_LEVEL } = require('./userConfig').getUserConfig();

const model = {
    updateTodosFromReadme
}

module.exports = model;

function getFileTodoStr(src) {
    let start = src.indexOf(TODO_ANCHOR);
    let end;
    let todoStr = '';

    // File does not contain a TODO_ANCHOR header, return empty
    if (start === -1) {
        return todoStr;
    } else {
        end = src.substring(start + TODO_ANCHOR.length).indexOf(`\n${TODO_ANCHOR_HEADING_LEVEL} `) + start + TODO_ANCHOR.length;

        // If end is the same as start, assume the end of the file
        if (end === start + TODO_ANCHOR.length - 1) {
            end = src.length;
        }
    }

    return src.substring(start + TODO_ANCHOR.length, end).trim();
}

function getFileTodoGroups(src) {
    const todoStr = getFileTodoStr(src);
    const todoGroups = parseTodoStr(todoStr);

    return todoGroups;
}

function parseTodoStr(todoStr) {
    const pattern = new RegExp(`^${TODO_GROUP_HEADING_LEVEL} \\[(?<titlePath>[^\\]]+)\\]\\((?<filePath>[^\\)]+)\\)`, 'img')
    const matches = todoStr.matchAll(pattern);
    let groups = [];
    
    if (!matches) {
        return groups;
    }
    
    const matchesArr = matches.toArray();

    matchesArr.forEach((match, i) => {
        const [matchStr] = match;
        const { titlePath, filePath } = match.groups
        const title = titlePath.split('/').pop().trim();
        const start = todoStr.indexOf(matchStr) + matchStr.length;
        const next = matchesArr[i + 1];
        let end;

        if (next) {
            const [nextMatchStr] = next;
            end = todoStr.indexOf(nextMatchStr);
        }
        
        const group = todoStr.substring(start, end).trim();
        const items = group.split('\n');
        const completed = items.filter(item => item.startsWith('- [x]'));

        groups.push({
            title,
            titlePath,
            filePath: decodeURIComponent(filePath),
            items,
            completed
        });
    });

    return groups;
}

function updateFile(filePath, completed) {
    const src = fs.readFileSync(filePath, 'utf8');
    let updated = src;

    completed.forEach(complete => {
        const incomplete = complete.replace(/^- \[x\] /, '- [ ] ');
        updated = updated.replace(incomplete, complete);
    });

    fs.writeFileSync(filePath, updated);
}

function updateTodosFromReadme(readmePath) {
    const basePath = path.dirname(readmePath);
    const src = fs.readFileSync(readmePath, 'utf8');
    const todoGroups = getFileTodoGroups(src);

    todoGroups.forEach(({ filePath, completed }) => {
        if (completed.length) {
            updateFile(path.join(basePath, filePath), completed);
        }
    })
}
