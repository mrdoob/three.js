/**
 * JSDoc plugin to generate markdown documentation files alongside HTML output.
 *
 * This plugin hooks into the JSDoc generation process to create markdown (.md) files
 * that mirror the HTML documentation structure. For every .html file generated,
 * a corresponding .md file is created with equivalent content in markdown format.
 *
 * @module markdown-plugin
 */

import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} ParamDoclet
 * @property {string} name - Parameter name
 * @property {Object} [type] - Type information
 * @property {Array<string>} [type.names] - Type names
 * @property {string} [description] - Parameter description
 * @property {boolean} [optional] - Whether the parameter is optional
 * @property {*} [defaultvalue] - Default value
 */

/**
 * @typedef {Object} ReturnDoclet
 * @property {Object} [type] - Type information
 * @property {Array<string>} [type.names] - Type names
 * @property {string} [description] - Return value description
 */

/**
 * @typedef {Object} Doclet
 * @property {string} [longname] - The fully qualified name
 * @property {string} [name] - The short name
 * @property {string} [kind] - The kind of symbol (class, function, member, constant, etc.)
 * @property {string} [description] - Description text
 * @property {string} [classdesc] - Class description (for classes)
 * @property {string} [memberof] - The longname of the parent
 * @property {string} [scope] - The scope (static, instance, inner, global)
 * @property {string} [access] - Access level (public, private, protected)
 * @property {boolean} [undocumented] - Whether this is undocumented
 * @property {Array<ParamDoclet>} [params] - Function/constructor parameters
 * @property {Array<ReturnDoclet>} [returns] - Return value documentation
 * @property {Array<string>} [examples] - Code examples
 * @property {Array<Object>} [customTags] - Custom JSDoc tags
 * @property {Object} [type] - Type information
 * @property {Array<string>} [type.names] - Type names
 * @property {*} [defaultvalue] - Default value
 * @property {Object} [meta] - Source file metadata
 * @property {string} [meta.filename] - Source filename
 * @property {string} [meta.path] - Source file path
 */

/**
 * Storage for all doclets collected during documentation generation.
 * @type {Array<Doclet>}
 */
let allData = [];

/**
 * JSDoc event handlers for the markdown generation plugin.
 */
export const handlers = {
    /**
     * Collects doclet data as JSDoc processes source files.
     * @param {Object} e - Event object containing the doclet
     * @param {Doclet} e.doclet - The doclet being processed
     */
    newDoclet: function(e) {
        allData.push(e.doclet);
    },

    /**
     * Generates markdown files after all HTML documentation has been created.
     * Reads the generated HTML files and creates corresponding markdown versions
     * by matching HTML filenames to doclets and transforming the content.
     */
    processingComplete: function() {
        console.log('=== Markdown plugin: Starting markdown generation ===');
        const outputDir = './docs/pages';

        if (!fs.existsSync(outputDir)) {
            console.log('Creating output directory:', outputDir);
            fs.mkdirSync(outputDir, { recursive: true});
        }

        const htmlFiles = fs.readdirSync(outputDir)
            .filter(f => f.endsWith('.html'))
            .map(f => path.basename(f, '.html'));

        console.log(`Found ${htmlFiles.length} HTML files to create markdown for`);

        let generatedCount = 0;

        for (const htmlBasename of htmlFiles) {
            const doclet = findDocletForHtmlFile(htmlBasename);

            if (!doclet) {
                console.log(`Warning: No doclet found for ${htmlBasename}.html`);
                continue;
            }

            const longname = doclet.longname || doclet.name;
            const members = allData.filter(item =>
                !item.undocumented &&
                item.access !== 'private' &&
                item.memberof === longname
            );

            const items = [doclet, ...members];
            const markdown = generateMarkdown(longname, items, doclet);

            if (markdown.trim()) {
                const outputPath = path.join(outputDir, `${htmlBasename}.md`);
                fs.writeFileSync(outputPath, markdown);
                console.log(`Generated: ${htmlBasename}.md`);
                generatedCount++;
            }
        }

        console.log(`Markdown generation complete! Generated ${generatedCount} markdown files for ${htmlFiles.length} HTML files.`);

        // Clean up
        allData = [];
    }
};

/**
 * Finds the doclet corresponding to an HTML filename.
 *
 * Matches HTML filenames to doclets by applying the same transformations
 * that JSDoc uses for generating filenames. Handles special cases like
 * module files and the global scope.
 *
 * @param {string} htmlBasename - The HTML filename without extension
 * @returns {Doclet|null} The matching doclet or null if not found
 */
function findDocletForHtmlFile(htmlBasename) {
    // Try standard transformation matching
    let doclet = allData.find(item => {
        if (!item.longname && !item.name) return false;
        const transformed = (item.longname || item.name)
            .replace(/^module:/g, '')
            .replace(/:/g, '-')
            .replace(/[<>]/g, '')
            .replace(/~/g, '-')
            .replace(/#/g, '_');
        return transformed === htmlBasename;
    });

    // Handle special cases
    if (!doclet) {
        if (htmlBasename === 'global') {
            // Create a synthetic doclet for the global scope
            doclet = { longname: 'global', name: 'global', kind: 'globalobj' };
        } else if (htmlBasename.startsWith('module-')) {
            // Module files have 'module:' prefix in their longname
            const moduleName = 'module:' + htmlBasename.substring(7);
            doclet = allData.find(item => item.longname === moduleName);
        }
    }

    return doclet || null;
}

/**
 * Generates markdown documentation from doclet data.
 *
 * Creates a complete markdown document including title, description,
 * code examples, imports, constructor, properties, methods, events,
 * and source links.
 *
 * @param {string} moduleName - The longname of the module/class being documented
 * @param {Array<Doclet>} items - Array of doclets (main item + members)
 * @param {Doclet} mainItem - The primary doclet for this documentation page
 * @returns {string} The generated markdown content
 */
function generateMarkdown(moduleName, items, mainItem) {
    const lines = [];

    // Title
    const displayName = mainItem.name.replace(/^module:/, '');
    lines.push(`# ${displayName}`);
    lines.push('');

    // Description
    if (mainItem.classdesc) {
        lines.push(cleanDescription(mainItem.classdesc));
        lines.push('');
    } else if (mainItem.description && mainItem.kind !== 'class') {
        lines.push(cleanDescription(mainItem.description));
        lines.push('');
    }

    // Code Examples
    if (mainItem.examples && mainItem.examples.length > 0) {
        lines.push('## Code Example');
        lines.push('');
        for (const example of mainItem.examples) {
            lines.push('```js');
            lines.push(cleanDescription(example));
            lines.push('```');
            lines.push('');
        }
    }

    // Import statement
    const importTag = mainItem.customTags?.find(t => t.tag === 'three_import');
    if (importTag) {
        lines.push('## Import');
        lines.push('');
        lines.push('```js');
        lines.push(importTag.value);
        lines.push('```');
        lines.push('');
    }

    // Constructor (for classes only)
    if (mainItem.kind === 'class') {
        lines.push('## Constructor');
        lines.push('');
        const params = mainItem.params || [];
        const paramStr = formatParams(params);
        lines.push(`### new ${mainItem.name}(${paramStr})`);
        lines.push('');
        if (mainItem.description) {
            lines.push(cleanDescription(mainItem.description));
            lines.push('');
        }
        if (params.length) {
            lines.push(formatParamsTable(params));
            lines.push('');
        }
    }

    // Properties (includes both members and constants)
    const properties = items.filter(item =>
        (item.kind === 'member' || item.kind === 'constant') &&
        !item.undocumented
    );

    if (properties.length > 0) {
        lines.push('## Properties');
        lines.push('');
        for (const prop of properties) {
            const type = prop.type?.names?.join(' | ') || '';
            const isConstant = prop.kind === 'constant' ? ' (constant)' : '';
            lines.push(`### .${prop.name}${type ? ` : \`${type}\`` : ''}${isConstant}`);
            lines.push('');
            if (prop.description) {
                lines.push(cleanDescription(prop.description));
                lines.push('');
            }
            if (prop.defaultvalue !== undefined) {
                lines.push(`Default: \`${prop.defaultvalue}\``);
                lines.push('');
            }
        }
    }

    // Static Methods
    const staticMethods = items.filter(item =>
        item.kind === 'function' &&
        !item.undocumented &&
        item.scope === 'static'
    );

    if (staticMethods.length > 0) {
        lines.push('## Static Methods');
        lines.push('');
        for (const method of staticMethods) {
            const returnType = method.returns?.[0]?.type?.names?.join(' | ') || '';
            lines.push(`### .${method.name}(${formatParams(method.params)})${returnType ? ` → \`${returnType}\`` : ''}`);
            lines.push('');
            if (method.description) {
                lines.push(cleanDescription(method.description));
                lines.push('');
            }
            if (method.params?.length) {
                lines.push(formatParamsTable(method.params));
                lines.push('');
            }
            if (method.returns?.[0]?.description) {
                lines.push(`**Returns:** ${cleanDescription(method.returns[0].description)}`);
                lines.push('');
            }
        }
    }

    // Instance Methods
    const methods = items.filter(item =>
        item.kind === 'function' &&
        !item.undocumented &&
        item.scope !== 'static'
    );

    if (methods.length > 0) {
        lines.push('## Methods');
        lines.push('');
        for (const method of methods) {
            const returnType = method.returns?.[0]?.type?.names?.join(' | ') || '';
            lines.push(`### .${method.name}(${formatParams(method.params)})${returnType ? ` → \`${returnType}\`` : ''}`);
            lines.push('');
            if (method.description) {
                lines.push(cleanDescription(method.description));
                lines.push('');
            }
            if (method.params?.length) {
                lines.push(formatParamsTable(method.params));
                lines.push('');
            }
            if (method.returns?.[0]?.description) {
                lines.push(`**Returns:** ${cleanDescription(method.returns[0].description)}`);
                lines.push('');
            }
        }
    }

    // Events
    const events = items.filter(item =>
        item.kind === 'event' &&
        !item.undocumented
    );

    if (events.length > 0) {
        lines.push('## Events');
        lines.push('');
        for (const event of events) {
            lines.push(`### ${event.name}`);
            lines.push('');
            if (event.description) {
                lines.push(cleanDescription(event.description));
                lines.push('');
            }
        }
    }

    // Source
    if (mainItem.meta?.filename && mainItem.meta?.path) {
        const relativePath = mainItem.meta.path.replace(/.*?(src|examples)/, '$1') + '/' + mainItem.meta.filename;
        lines.push('## Source');
        lines.push('');
        lines.push(`[${relativePath}](https://github.com/mrdoob/three.js/blob/master/${relativePath})`);
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Formats function/constructor parameters as a comma-separated list.
 *
 * @param {Array<ParamDoclet>} [params] - Array of parameter doclets
 * @returns {string} Formatted parameter list (e.g., "name, [optional], value")
 */
function formatParams(params) {
    if (!params?.length) return '';
    return params
        .filter(p => !p.name.includes('.')) // Skip nested properties
        .map(p => p.optional ? `[${p.name}]` : p.name)
        .join(', ');
}

/**
 * Formats parameters as a markdown table.
 *
 * Creates a table with columns for parameter name, type, default value,
 * and description.
 *
 * @param {Array<ParamDoclet>} [params] - Array of parameter doclets
 * @returns {string} Markdown table of parameters
 */
function formatParamsTable(params) {
    if (!params?.length) return '';

    const lines = [];
    lines.push('| Parameter | Type | Default | Description |');
    lines.push('| --- | --- | --- | --- |');

    for (const param of params) {
        if (param.name.includes('.')) continue; // Skip nested properties
        const name = param.optional ? `[${param.name}]` : param.name;
        const type = param.type?.names?.join(' \\| ') || '';
        const defaultVal = param.defaultvalue ?? '';
        const desc = cleanDescription(param.description || '').replace(/\n/g, ' ');
        lines.push(`| ${name} | \`${type}\` | ${defaultVal} | ${desc} |`);
    }

    return lines.join('\n');
}

/**
 * Converts HTML text to markdown format.
 *
 * Performs comprehensive HTML-to-markdown conversion including:
 * - Links to markdown syntax
 * - Code blocks to backticks
 * - Lists to markdown lists
 * - Formatting tags (strong, em) to markdown equivalents
 * - Cleanup of excessive whitespace
 *
 * @param {string} text - HTML text to convert
 * @returns {string} Markdown-formatted text
 */
function cleanDescription(text) {
    if (!text) return '';
    return text
        // Convert links (must be before stripping tags)
        .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, '[$2]($1)')
        // Convert code blocks
        .replace(/<code>/g, '`')
        .replace(/<\/code>/g, '`')
        // Convert lists
        .replace(/<li>/g, '- ')
        .replace(/<\/li>/g, '\n')
        .replace(/<ul>/g, '\n')
        .replace(/<\/ul>/g, '\n')
        .replace(/<ol>/g, '\n')
        .replace(/<\/ol>/g, '\n')
        // Convert paragraphs
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        // Convert breaks
        .replace(/<br\s*\/?>/g, '\n')
        // Convert strong/em
        .replace(/<strong>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<em>/g, '_')
        .replace(/<\/em>/g, '_')
        .replace(/<b>/g, '**')
        .replace(/<\/b>/g, '**')
        .replace(/<i>/g, '_')
        .replace(/<\/i>/g, '_')
        // Remove remaining HTML tags
        .replace(/<[^>]+>/g, '')
        // Clean up excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}