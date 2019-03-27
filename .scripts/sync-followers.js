const fs = require('fs');
const https = require('https');
const hmr = require('human-readable-numbers');

async function fetch_page(username) {
    return await new Promise((res, rej) => {
        let data = '';
        https.get(`https://www.instagram.com/${username}/`, response => {
            response.on('data', chunk => {
                data += chunk;
            });

            response.on('end', () => {
                res(data);
            });
        });
    });
}

async function updateFollowersForFile(mdFile) {
    const mdFileLines = fs.readFileSync(mdFile, {
        encoding: 'utf-8'
    }).split(/\r?\n/);
    await Promise.all(mdFileLines.map(async (line, index) => {
        const account = line.match(/@[a-zA-Z\._]+/);
        if (account) {
            const username = account[0].replace(/^@/, '');
            const html = await fetch_page(username);
            const sharedData = html.match(/window\._sharedData\s*=\s*{.+}/);
            if (sharedData) {
                const parsedInfo = JSON.parse(sharedData[0].replace(/^window\._sharedData\s*=\s*/, ''));
                const followCount = parsedInfo.entry_data.ProfilePage[0].graphql.user.edge_followed_by.count;
                const humanCount = hmr.toHumanString(followCount);
                const pipeIndex = line.replace(/\|\s*$/, '').lastIndexOf('|');
                mdFileLines[index] = line.substring(0, pipeIndex + 1) + humanCount + '|';
            }
        }
    }));
    fs.writeFileSync(mdFile, mdFileLines.join('\n'), {
        encoding: 'utf-8'
    });
}

if (require.main === module) {
    (async () => {
        if (process.argv.length > 2) {
            updateFollowersForFile(process.argv[2]);
        } else {
            throw new Error('No .md file passed');
        }
    })();
}

module.exports = {
    updateFollowersForFile,
};