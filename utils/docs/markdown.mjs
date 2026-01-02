import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { resolve, join, basename } from "path";
import jsdoc2md from 'jsdoc-to-markdown';

const scriptDir = import.meta.url.replace('file://', '').replace('/markdown.mjs', '');
const configPath = resolve(scriptDir, 'jsdoc.config.json');

generateDocs();

async function generateDocs() {
    try {
        const templateData = await jsdoc2md.getTemplateData({ configure: configPath });

        // Group by module/class
        const byModule = new Map();

        for (const item of templateData) {
            const moduleName = item.memberof?.split(/[#.~]/)[0] || item.name;
            if (!moduleName) continue;

            if (!byModule.has(moduleName)) {
                byModule.set(moduleName, []);
            }
            byModule.get(moduleName).push(item);
        }

        console.log(`Found ${byModule.size} top-level items`);

        const outputDir = './docs/pages';
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        let i = 0;
        for (const [name, data] of byModule) {
            if (data.length === 0) continue;
            if (i++ > 5000) break;

            const markdown = await jsdoc2md.render({ data, });
            const cleanedMarkdown = cleanMarkdown(markdown, data);
            if (cleanedMarkdown.trim()) {
                let outputName = name.replace(":", "-");
                const outputPath = join(outputDir, `${outputName}.md`);
                writeFileSync(outputPath, cleanedMarkdown);
                console.log(`Generated: ${outputName}.md`);
            }
        }

        console.log('Done!');

    } catch (err) {
        console.error('Error:', err);
    }
}



function cleanMarkdown(text, data) {
    if (!text) return '';

    let result = text;

    // Decode HTML entities FIRST
    result = result
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    // Remove HTML tags
    result = result
        .replace(/<a name="[^"]*"><\/a>\s*/g, '')
        .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, '[$2]($1)')
        .replace(/<\/?p>/g, '')
        .replace(/<code>/g, '`')
        .replace(/<\/code>/g, '`')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '');

    // Remove extends arrow from title line
    result = result.replace(/^(## \w+) ⇐ .+$/gm, '$1');

    // Remove TOC block - match all bullet lines at start after the metadata
    result = result.replace(/^\* \[.+\n(\s+\* \[.+\n)*/gm, '');

    // Remove metadata lines (must match the ** pattern exactly)
    result = result.replace(/^\*\*Kind\*\*:.*$/gm, '');
    result = result.replace(/^\*\*Extends\*\*:.*$/gm, '');
    result = result.replace(/^\*\*Default\*\*:.*$/gm, '');
    result = result.replace(/^\*\*Read only\*\*:.*$/gm, '');
    result = result.replace(/^\*\*Overrides\*\*:.*$/gm, '');
    result = result.replace(/^\*\*Returns\*\*:.*$/gm, '');

    // Remove return arrow from method signatures (keep just the method name and params)
    result = result.replace(/(### .+?\(.*?\)) ⇒ .+$/gm, '$1');

    // Remove empty anchor links like [.object](#)
    result = result.replace(/\[([^\]]+)\]\(#\)/g, '$1');

    // Format import section
    result = result.replace(
        /\*\*Three_import\*\*:\s*(.+?)(?=\s*\n)/g,
        '## Import\n\n```js\n$1\n```'
    );

    // Clean up extra blank lines
    result = result.replace(/\n{3,}/g, '\n\n');
    result = result.trim();

    // Add source link at the end
    const sourceFile = data[0]?.meta?.filename;
    const sourcePath = data[0]?.meta?.path;
    if (sourceFile && sourcePath) {
        const relativePath = sourcePath.replace(/.*?(src|examples)/, '$1') + '/' + sourceFile;
        result += `\n\n## Source\n\n[${relativePath}](https://github.com/mrdoob/three.js/blob/master/${relativePath})`;
    }

    return result;
}