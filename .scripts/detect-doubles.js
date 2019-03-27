const globby = require('globby');
const fs = require('fs');
const mdFiles = globby.sync(`${__dirname}/../**/*.md`);

const foundAccounts = {};

mdFiles.forEach(mdFile => {
    if (!mdFile.endsWith('README.md')) {
        const mdFileLines = fs.readFileSync(mdFile, {
            encoding: 'utf-8'
        }).split(/\r?\n/);
        mdFileLines.forEach(line => {
            const account = line.match(/@[a-zA-Z\._]+/);
            if (account) {
                const username = account[0];
                if (!foundAccounts[username]) {
                    foundAccounts[username] = [];
                }
                foundAccounts[username].push(mdFile);
            }
        });
    }
});

Object.keys(foundAccounts).forEach(account => {
    if (foundAccounts[account].length > 1) {
        console.log(`${account} found in ${foundAccounts[account].length} files`);
        foundAccounts[account].forEach(file => {
            console.log(`\t${file}`);
        })
    }
});