import { execSync } from 'child_process';

// Path-based categories (used as fallback for non-JS files)
// Ordered from most specific to least specific
const categoryPaths = [
	// Specific renderer paths
	[ 'src/renderers/webgl', 'WebGLRenderer' ],
	[ 'src/renderers/webgpu', 'WebGPURenderer' ],
	[ 'src/renderers/common', 'Renderer' ],

	// Main sections
	[ 'docs', 'Docs' ],
	[ 'manual', 'Manual' ],
	[ 'editor', 'Editor' ],
	[ 'test', 'Tests' ],
	[ 'playground', 'Playground' ],
	[ 'utils', 'Scripts' ],
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
	/^Update REVISION/i
];

// Categories that map to sections
const sectionCategories = [ 'Docs', 'Manual', 'Examples', 'Editor', 'Tests', 'Scripts', 'Build' ];

// Author name to GitHub username mapping (for commits without PR numbers)
const authorMap = {
	'Mr.doob': 'mrdoob',
	'Michael Herzog': 'Mugen87',
	'Claude': 'claude',
	'Claude Opus 4.5': 'claude',
	'Copilot': 'copilot',
	'copilot-swe-agent[bot]': 'copilot'
};

function exec( command ) {

	try {

		return execSync( command, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 } ).trim();

	} catch ( error ) {

		return '';

	}

}

function getLastTag() {

	return exec( 'git describe --tags --abbrev=0' );

}

function getCommitsSinceTag( tag ) {

	// Get commits since tag, oldest first, excluding merge commits
	const log = exec( `git log ${tag}..HEAD --no-merges --reverse --format="%H|%s|%an"` );

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

function getCoAuthors( hash ) {

	const body = exec( `git log -1 --format="%b" ${hash}` );
	const regex = /Co-authored-by:\s*([^<]+)\s*<[^>]+>/gi;
	return [ ...body.matchAll( regex ) ].map( m => m[ 1 ].trim() );

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

	const categoryCounts = {};
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
		if ( file.startsWith( 'src/' ) ) srcCount ++;

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

	// Find the most common section (excluding Tests unless it's dominant)
	let maxSection = null;
	let maxSectionCount = 0;
	const totalFiles = files.length;

	for ( const [ sec, count ] of Object.entries( sectionCounts ) ) {

		// Only use Tests/Build section if it's the majority of files
		if ( ( sec === 'Tests' || sec === 'Build' ) && count < totalFiles * 0.5 ) continue;

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
	cleaned = cleaned.replace( /^(Examples|Docs|Manual|Editor|Tests|Build|Global|TSL|WebGLRenderer|WebGPURenderer|Renderer):\s*/i, '' );

	// Remove trailing period if present, we'll add it back
	cleaned = cleaned.replace( /\.\s*$/, '' );

	return cleaned;

}

function normalizeAuthor( author ) {

	return authorMap[ author ] || author;

}

function formatEntry( subject, prNumber, hash, author, coAuthors, category ) {

	let entry = `${cleanSubject( subject, category )}.`;

	if ( prNumber ) {

		entry += ` #${prNumber}`;

	} else if ( hash ) {

		entry += ` ${hash.slice( 0, 7 )}`;

	}

	if ( author ) {

		const authors = [ author, ...( coAuthors || [] ) ].map( normalizeAuthor );
		entry += ` (@${authors.join( ', @' )})`;

	}

	return entry;

}

function addToGroup( groups, key, value ) {

	if ( ! groups[ key ] ) groups[ key ] = [];
	groups[ key ].push( value );

}

function validateEnvironment() {

	if ( ! exec( 'gh --version 2>/dev/null' ) ) {

		console.error( 'GitHub CLI (gh) is required but not installed.' );
		console.error( 'Install from: https://cli.github.com/' );
		process.exit( 1 );

	}

	const lastTag = getLastTag();

	if ( ! lastTag ) {

		console.error( 'No tags found in repository' );
		process.exit( 1 );

	}

	return lastTag;

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

			author = prInfo.author;
			if ( prInfo.title ) subject = prInfo.title;
			if ( prInfo.files && prInfo.files.length > 0 ) files = prInfo.files;

		}

	}

	// Fall back to git data
	if ( ! files ) files = getChangedFiles( commit.hash );
	if ( ! author ) author = commit.author;

	const result = categorizeCommit( files );
	let { category, section } = result;
	const { isAddon } = result;

	// Override category if title has a clear prefix
	const titleCategory = extractCategoryFromTitle( subject );

	if ( titleCategory ) {

		category = titleCategory;
		if ( category === 'Puppeteer' ) category = 'Tests';
		section = sectionCategories.includes( category ) ? category : null;

	}

	// Route jsdoc/typo/docs-related commits to Docs section
	if ( /\b(jsdoc|typo|spelling|documentation)\b/i.test( subject ) ) {

		section = 'Docs';

	}

	const coAuthors = getCoAuthors( commit.hash );

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

function formatOutput( lastTag, coreChanges, addonChanges, sections ) {

	let output = '';

	// Migration guide and milestone links
	const version = lastTag.replace( 'r', '' );
	const nextVersion = parseInt( version ) + 1;
	output += `https://github.com/mrdoob/three.js/wiki/Migration-Guide#${version}--${nextVersion}\n`;
	output += 'https://github.com/mrdoob/three.js/milestone/XX?closed=1\n\n';

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
	const sectionOrder = [ 'Docs', 'Manual', 'Examples', 'Addons', 'Editor', 'Tests', 'Scripts', 'Build' ];

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

	const lastTag = validateEnvironment();

	console.error( `Generating changelog since ${lastTag}...\n` );

	const commits = getCommitsSinceTag( lastTag );

	if ( commits.length === 0 ) {

		console.error( 'No commits found since last tag' );
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
		Editor: [],
		Tests: [],
		Scripts: [],
		Build: []
	};

	let skipped = 0;

	for ( const commit of commits ) {

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

	if ( skipped > 0 ) {

		console.error( `Skipped ${skipped} commits (builds, dependency updates, etc.)\n` );

	}

	console.log( formatOutput( lastTag, coreChanges, addonChanges, sections ) );

}

generateChangelog();
