const globby = require('globby');
const https = require('https');
const fs = require('fs');
const mdFiles = globby.sync(`${__dirname}/../**/*.md`);

(async () => {
    await Promise.all(mdFiles.map(async mdFile => {
        if (!mdFile.endsWith('README.md')) {
            const mdFileLines = fs.readFileSync(mdFile, {
                encoding: 'utf-8'
            }).split(/\r?\n/);
            await Promise.all(mdFileLines.map(async line => {
                const account = line.match(/@[a-zA-Z\._]+/);
                if (account) {
                    const username = account[0].replace(/^@/, '');
                    await https.get(`https://www.instagram.com/${username}/`, response => {
                        if (response.statusCode === 404) {
                            console.log(`${username} does not exist [${mdFile}]`);
                        }
                    });
                }
            }));
        }
    }));
})();
