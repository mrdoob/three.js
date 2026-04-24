import { execSync } from 'child_process';

// Path-based categories (used as fallback for non-JS files)
// Ordered from most specific to least specific
const categoryPaths = [
	// Specific renderer paths
	[ 'src/renderers/webgl', 'WebGLRenderer' ],
	[ 'src/renderers/webgpu', 'WebGPURenderer' ],
	[ 'src/renderers/common', 'Renderer' ],

	// Main sections
	[ 'utils/docs', 'Docs' ],
	[ 'docs', 'Docs' ],
	[ 'manual', 'Manual' ],
	[ 'devtools', 'Devtools' ],
	[ 'editor', 'Editor' ],
	[ 'test', 'Tests' ],
	[ 'playground', 'Playground' ],
	[ 'utils', 'Utils' ],
	[ 'build', 'Build' ],
	[ 'examples/jsm', 'Addons' ],
	[ 'examples', 'Examples' ],
	[ 'src', 'Global' ]
];

// Skip patterns - commits matching these will be excluded
const skipPatterns = [
	/^Updated? builds?\.?$/i,
	/^Merge /i,
	/^Update dependency .* to /i,
	/^Update devDependencies/i,
	/^Update github\/codeql-action/i,
	/^Update actions\//i,
	/^Bump .* and /i,
	/^Updated package-lock\.json/i,
	/^Update copyright year/i,
	/^Update \w+\.js\.?$/i, // Generic "Update File.js" commits
	/^Updated? docs\.?$/i,
	/^Update REVISION/i,
	/^r\d+(\s*\(bis\))*$/i
];

// Authors to skip (bots)
const skipAuthors = new Set( [ 'dependabot', 'app/renovate', 'renovate[bot]' ] );

// Categories that map to sections
const sectionCategories = [ 'Docs', 'Manual', 'Examples', 'Devtools', 'Editor', 'Tests', 'Utils', 'Build' ];

function exec( command ) {

	try {

		return execSync( command, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 } ).trim();

	} catch ( error ) {

		return '';

	}

}

function getCommitsBetweenTags( fromTag, toTag ) {

	// Get commits between tags (exclusive fromTag, inclusive toTag), oldest first, excluding merge commits
	const log = exec( `git log ${fromTag}..${toTag} --no-merges --reverse --format="%H|%s|%an"` );

	if ( ! log ) return [];

	return log.split( '\n' ).filter( Boolean ).map( line => {

		const [ hash, subject, author ] = line.split( '|' );
		return { hash, subject, author };

	} );

}

function getChangedFiles( hash ) {

	const files = exec( `git diff-tree --no-commit-id --name-only -r ${hash}` );
	return files ? files.split( '\n' ).filter( Boolean ) : [];

}

function getCoAuthorsFromPR( prNumber ) {

	const result = exec( `gh pr view ${prNumber} --json commits --jq '[.commits[].authors[].login] | unique | .[]' 2>/dev/null` );
	return result ? result.split( '\n' ).filter( Boolean ) : [];

}

function getCoAuthorsFromCommit( hash ) {

	const body = exec( `git log -1 --format="%b" ${hash}` );
	const regex = /Co-authored-by:\s*([^<]+)\s*<[^>]+>/gi;
	return [ ...body.matchAll( regex ) ].map( m => normalizeAuthor( m[ 1 ].trim() ) );

}

function extractPRNumber( subject ) {

	// Match patterns like "(#12345)" or "#12345" at end
	const match = subject.match( /\(#(\d+)\)|\s#(\d+)$/ );
	return match ? ( match[ 1 ] || match[ 2 ] ) : null;

}

function getPRInfo( prNumber ) {

	const result = exec( `gh pr view ${prNumber} --json author,title,files --jq '{author: .author.login, title: .title, files: [.files[].path]}' 2>/dev/null` );

	try {

		return result ? JSON.parse( result ) : null;

	} catch ( e ) {

		return null;

	}

}

function categorizeFile( file ) {

	// Extract category from JS filename in src/ or examples/jsm/
	if ( file.endsWith( '.js' ) ) {

		const isAddon = file.startsWith( 'examples/jsm/' );

		if ( file.startsWith( 'src/' ) || isAddon ) {

			// Skip barrel/index files
			if ( /\/Three(\.\w+)?\.js$/.test( file ) ) return { category: 'Global', isAddon: false };

			const match = file.match( /\/([^/]+)\.js$/ );
			if ( match ) return { category: match[ 1 ], isAddon };

		}

	}

	// Check path-based categories for non-JS files or other paths
	for ( const [ pathPrefix, category ] of categoryPaths ) {

		if ( file.startsWith( pathPrefix ) ) {

			return {
				category,
				isAddon: file.startsWith( 'examples/jsm/' ),
				section: sectionCategories.includes( category ) ? category : null
			};

		}

	}

	return { category: 'Global', isAddon: false };

}

function categorizeCommit( files ) {

	files = files.filter( f => ! f.startsWith( 'examples/screenshots/' ) );

	const categoryCounts = {};
	const srcCategoryCounts = {};
	const sectionCounts = {};
	let hasAddon = false;
	let addonCategory = null;
	let addonCount = 0;
	let srcCount = 0;

	for ( const file of files ) {

		const result = categorizeFile( file );
		const cat = result.category;

		categoryCounts[ cat ] = ( categoryCounts[ cat ] || 0 ) + 1;

		// Track src files vs addon files
		if ( file.startsWith( 'src/' ) ) {

			srcCount ++;
			srcCategoryCounts[ cat ] = ( srcCategoryCounts[ cat ] || 0 ) + 1;

		}

		if ( result.isAddon ) {

			hasAddon = true;
			addonCount ++;

			// Track addon category separately (ignore generic ones)
			if ( cat !== 'Examples' && cat !== 'Loaders' && cat !== 'Exporters' ) {

				if ( ! addonCategory || categoryCounts[ cat ] > categoryCounts[ addonCategory ] ) {

					addonCategory = cat;

				}

			} else if ( ! addonCategory ) {

				addonCategory = cat;

			}

		}

		if ( result.section ) {

			sectionCounts[ result.section ] = ( sectionCounts[ result.section ] || 0 ) + 1;

		}

	}

	// If commit primarily touches src/ files, don't treat as addon even if it has some addon files
	if ( srcCount > addonCount ) {

		hasAddon = false;

	}

	// If this commit has addon files and a specific addon category, use it
	if ( hasAddon && addonCategory && addonCategory !== 'Examples' ) {

		return { category: addonCategory, isAddon: true, section: null };

	}

	// If commit touches src/, treat as core change — category from src/ files only
	if ( srcCount > 0 ) {

		const srcCategory = Object.entries( srcCategoryCounts ).sort( ( a, b ) => b[ 1 ] - a[ 1 ] )[ 0 ][ 0 ];
		return { category: srcCategory, isAddon: false, section: null };

	}

	// Find the most common section
	let maxSection = null;
	let maxSectionCount = 0;

	for ( const [ sec, count ] of Object.entries( sectionCounts ) ) {

		if ( count > maxSectionCount ) {

			maxSectionCount = count;
			maxSection = sec;

		}

	}

	// Return the category with the most files changed
	let maxCategory = 'Global';
	let maxCount = 0;

	for ( const [ cat, count ] of Object.entries( categoryCounts ) ) {

		if ( count > maxCount ) {

			maxCount = count;
			maxCategory = cat;

		}

	}

	return { category: maxCategory, isAddon: false, section: maxSection };

}

function shouldSkipCommit( subject ) {

	return skipPatterns.some( pattern => pattern.test( subject ) );

}

function extractCategoryFromTitle( title ) {

	// Extract category from title prefix like "Object3D: Added pivot"
	const match = title.match( /^([A-Za-z0-9_/]+):\s/ );
	return match ? match[ 1 ] : null;

}

function cleanSubject( subject, category ) {

	// Remove PR number from subject
	let cleaned = subject.replace( /\s*\(#\d+\)\s*$/, '' ).replace( /\s*#\d+\s*$/, '' ).trim();

	// Remove category prefix if it matches (e.g., "Editor: " when category is "Editor")
	const prefixPattern = new RegExp( `^${category}:\\s*`, 'i' );
	cleaned = cleaned.replace( prefixPattern, '' );

	// Also remove common prefixes
	cleaned = cleaned.replace( /^(Examples|Docs|Manual|Editor|Tests|Build|Global|TSL|WebGLRenderer|WebGPURenderer|Renderer|Scripts|Utils):\s*/i, '' );

	// Remove trailing period if present, we'll add it back
	cleaned = cleaned.replace( /\.\s*$/, '' );

	return cleaned;

}

function normalizeAuthor( author ) {

	const lower = author.toLowerCase();
	if ( lower === 'mr.doob' ) return 'mrdoob';
	if ( lower === 'michael herzog' ) return 'Mugen87';
	if ( lower === 'garrett johnson' ) return 'gkjohnson';
	if ( lower.startsWith( 'claude' ) ) return 'claude';
	if ( lower.startsWith( 'copilot' ) ) return 'microsoftcopilot';
	if ( lower.includes( 'dependabot' ) ) return 'dependabot';

	return author;

}

function formatEntry( subject, prNumber, hash, author, coAuthors, category ) {

	let entry = `${cleanSubject( subject, category )}.`;

	if ( prNumber ) {

		entry += ` #${prNumber}`;

	} else if ( hash ) {

		entry += ` ${hash}`;

	}

	if ( author ) {

		const authors = [ ...new Set( [ author, ...( coAuthors || [] ) ].map( normalizeAuthor ) ) ];
		entry += ` (@${authors.join( ', @' )})`;

	}

	return entry;

}

function addToGroup( groups, key, value ) {

	if ( ! groups[ key ] ) groups[ key ] = [];
	groups[ key ].push( value );

}

function validateEnvironment( tag ) {

	if ( ! exec( 'gh --version 2>/dev/null' ) ) {

		console.error( 'GitHub CLI (gh) is required but not installed.' );
		console.error( 'Install from: https://cli.github.com/' );
		process.exit( 1 );

	}

	if ( ! tag ) {

		console.error( 'Usage: node utils/changelog.js <tag>' );
		console.error( 'Example: node utils/changelog.js r185' );
		process.exit( 1 );

	}

	// Verify the tag exists
	const resolved = exec( `git rev-parse --verify ${tag}` );

	if ( ! resolved ) {

		console.error( `Invalid tag: ${tag}` );
		process.exit( 1 );

	}

	// Get the previous tag
	const version = parseInt( tag.replace( 'r', '' ) );
	const previousTag = `r${version - 1}`;

	const previousResolved = exec( `git rev-parse --verify ${previousTag}` );

	if ( ! previousResolved ) {

		console.error( `Previous tag not found: ${previousTag}` );
		process.exit( 1 );

	}

	return { tag, previousTag, version };

}

function collectRevertedTitles( commits ) {

	const reverted = new Set();

	for ( const { subject } of commits ) {

		const match = subject.match( /^Revert "(.+)"/ );
		if ( match ) reverted.add( match[ 1 ] );

	}

	return reverted;

}

function processCommit( commit, revertedTitles ) {

	// Skip reverts
	if ( /^Revert "/.test( commit.subject ) ) return null;

	// Check if this commit was reverted
	const subjectWithoutPR = commit.subject.replace( /\s*\(#\d+\)\s*$/, '' );
	if ( revertedTitles.has( subjectWithoutPR ) ) return null;

	// Skip certain commits
	if ( shouldSkipCommit( commit.subject ) ) return null;

	const prNumber = extractPRNumber( commit.subject );

	// Try to get PR info for better title and author
	let author = null;
	let subject = commit.subject;
	let files = null;

	if ( prNumber ) {

		const prInfo = getPRInfo( prNumber );

		if ( prInfo ) {

			// Skip commits from bots
			if ( skipAuthors.has( prInfo.author ) ) return null;

			author = prInfo.author;
			if ( prInfo.title ) subject = prInfo.title;
			if ( prInfo.files && prInfo.files.length > 0 ) files = prInfo.files;

		}

	}

	// Fall back to git data
	if ( ! files ) files = getChangedFiles( commit.hash );
	if ( ! author ) author = commit.author;

	// Skip commits from bots (check normalized name for git author fallback)
	if ( skipAuthors.has( normalizeAuthor( author ) ) ) return null;

	const result = categorizeCommit( files );
	let { category, section } = result;
	const { isAddon } = result;

	// Use title prefix as category only if file-based didn't assign a section
	if ( ! section ) {

		const titleCategory = extractCategoryFromTitle( subject );

		if ( titleCategory ) {

			category = titleCategory;
			if ( category === 'Scripts' ) category = 'Utils';
			if ( category === 'Puppeteer' || category === 'E2E' ) category = 'Tests';
			section = sectionCategories.includes( category ) ? category : null;

		}

	}

	// Route jsdoc/typo/docs-related commits to Docs section
	if ( /\b(jsdoc|typo|spelling|documentation)\b/i.test( subject ) ) {

		section = 'Docs';

	}

	const coAuthors = ( prNumber ? getCoAuthorsFromPR( prNumber ) : getCoAuthorsFromCommit( commit.hash ) ).filter( login => login !== author );

	return {
		entry: {
			subject,
			prNumber,
			author,
			category,
			formatted: formatEntry( subject, prNumber, commit.hash, author, coAuthors, category )
		},
		category,
		section,
		isAddon
	};

}

function formatOutput( version, coreChanges, addonChanges, sections ) {

	let output = '';

	const previousVersion = version - 1;
	output += `https://github.com/mrdoob/three.js/wiki/Migration-Guide#${previousVersion}--${version}\n`;
	output += `https://github.com/mrdoob/three.js/milestone/${version - 87}?closed=1\n\n`;

	// Core changes (Global first, then alphabetically)
	const sortedCore = Object.keys( coreChanges ).sort( ( a, b ) => {

		if ( a === 'Global' ) return - 1;
		if ( b === 'Global' ) return 1;
		return a.localeCompare( b );

	} );

	for ( const category of sortedCore ) {

		output += `- ${category}\n`;

		for ( const entry of coreChanges[ category ] ) {

			output += `  - ${entry.formatted}\n`;

		}

	}

	// Output sections in order
	const sectionOrder = [ 'Docs', 'Manual', 'Examples', 'Addons', 'Devtools', 'Editor', 'Tests', 'Utils', 'Build' ];

	for ( const sectionName of sectionOrder ) {

		// Addons section has nested categories
		if ( sectionName === 'Addons' ) {

			const sortedAddons = Object.keys( addonChanges ).sort();

			if ( sortedAddons.length > 0 ) {

				output += '\n**Addons**\n\n';

				for ( const category of sortedAddons ) {

					output += `- ${category}\n`;

					for ( const entry of addonChanges[ category ] ) {

						output += `  - ${entry.formatted}\n`;

					}

					output += '\n';

				}

			}

			continue;

		}

		if ( sections[ sectionName ].length > 0 ) {

			output += `\n**${sectionName}**\n\n`;

			for ( const entry of sections[ sectionName ] ) {

				output += `- ${entry.formatted}\n`;

			}

		}

	}

	return output;

}

function generateChangelog() {

	const { tag, previousTag, version } = validateEnvironment( process.argv[ 2 ] );

	console.error( `Generating changelog ${previousTag}..${tag}\n` );

	const commits = getCommitsBetweenTags( previousTag, tag );

	if ( commits.length === 0 ) {

		console.error( `No commits found between ${previousTag} and ${tag}` );
		process.exit( 1 );

	}

	console.error( `Found ${commits.length} commits\n` );

	const revertedTitles = collectRevertedTitles( commits );

	// Group commits by category
	const coreChanges = {};
	const addonChanges = {};
	const sections = {
		Docs: [],
		Manual: [],
		Examples: [],
		Devtools: [],
		Editor: [],
		Tests: [],
		Utils: [],
		Build: []
	};

	let skipped = 0;
	const total = commits.length;
	const barWidth = 40;

	for ( let i = 0; i < total; i ++ ) {

		const commit = commits[ i ];
		const done = i + 1;
		const filled = Math.round( barWidth * done / total );
		const bar = '█'.repeat( filled ) + '░'.repeat( barWidth - filled );
		const pct = Math.round( 100 * done / total );
		process.stderr.write( `\r  ${bar} ${pct}% (${done}/${total})` );

		const result = processCommit( commit, revertedTitles );

		if ( ! result ) {

			skipped ++;
			continue;

		}

		const { entry, category, section, isAddon } = result;

		if ( section && sections[ section ] ) {

			sections[ section ].push( entry );

		} else if ( isAddon ) {

			addToGroup( addonChanges, category, entry );

		} else {

			addToGroup( coreChanges, category, entry );

		}

	}

	process.stderr.write( '\n\n' );

	if ( skipped > 0 ) {

		console.error( `Skipped ${skipped} commits (builds, dependency updates, etc.)\n` );

	}

	console.log( formatOutput( version, coreChanges, addonChanges, sections ) );

}

generateChangelog();
