/**
 * @author finnbear / https://github.com/finnbear
 */

const { createWriteStream, readFileSync } = require('fs');
const { resolve } = require('path');
const { runInThisContext } = require('vm');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');

// Hack to load the list.js file without it exporting the list variable
const include = function() {
    let listFile = readFileSync('./list.js', 'utf8');
    runInThisContext(listFile);
}.bind(this);

include();

const baseUrl = 'https://threejs.org/docs/';

const steam = new SitemapStream({ hostname: baseUrl });
const pipeline = steam.pipe(createWriteStream(resolve('sitemap.xml')));

steam.write({ url: baseUrl, changefreq: 'weekly', priority: 1 });

for (const languageId in list) {
    const language = list[languageId];
    for (const groupId in language) {
        const group = language[groupId];
        for (const headingId in group) {
            const heading = group[headingId];
            for (const pageId in heading) {
                const page = heading[pageId];
                //console.log(page);
                steam.write({ url: `${baseUrl}#${page}`, changefreq: 'monthly', priority: 0.8 });
            }
        }
    }
}

steam.end()
