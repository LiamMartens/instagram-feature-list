const globby = require('globby');
const { updateFollowersForFile } = require('./sync-followers');
const mdFiles = globby.sync(`${__dirname}/../**/*.md`);

mdFiles.forEach(file => {
    if (!file.endsWith('README.md')) {
        updateFollowersForFile(file);
    }
});