import { execFileSync } from 'child_process';

// Path-based categories (used as fallback for non-JS files)
// Ordered from most specific to least specific
const categoryPaths = [
	// CI
	[ '.github', 'CI' ],

	// Specific renderer paths
	[ 'src/renderers/webgl', 'WebGLRenderer' ],
	[ 'src/renderers/webgpu', 'WebGPURenderer' ],
	[ 'src/renderers/common', 'Renderer' ],

	// Main sections
	[ 'utils/docs', 'Docs' ],
	[ 'docs', 'Docs' ],
	[ 'tsl', 'Docs' ],
	[ 'manual', 'Manual' ],
	[ 'devtools', 'Devtools' ],
	[ 'editor', 'Editor' ],
	[ 'test', 'Tests' ],
	[ 'eslint.config.js', 'Tests' ],
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
	/^(\w+:\s*)?Updated? (dev)?dep\w*enc(y|ies)\b/i, // Update dependencies, devDependencies, dependency X to Y (with typos)
	/^Update github\/codeql-action/i,
	/^Update actions\//i,
	/^Bump .* and /i,
	/^(\w+:\s*)?Updated? package(-lock)?\.json/i,
	/npm audit/i,
	/^Update copyright year/i,
	/^Update [\w.]+\.\w+\.?$/i, // Generic "Update File.js" commits
	/^Updated? docs\.?$/i,
	/^Update REVISION/i,
	/^r\d+(\s*\(bis\))*$/i
];

// Authors to skip (bots)
const skipAuthors = new Set( [ 'dependabot', 'app/renovate', 'renovate[bot]', 'github-advanced-security[bot]' ] );

// Category for generic changes in each group, listed first
const genericCategories = { core: 'Global', nodes: 'Nodes', addons: 'Addons', addonNodes: 'TSL' };

// Categories that map to sections
const sectionCategories = [ 'Docs', 'Manual', 'Examples', 'Devtools', 'Editor', 'Tests', 'Utils', 'Build', 'CI' ];

// Sections matched loosely against title prefixes (Doc, Exampler, e2e, DevTools, Examples/TSL, ...)
const sectionPrefixes = [
	[ /^doc/i, 'Docs' ],
	[ /^manual/i, 'Manual' ],
	[ /^exam/i, 'Examples' ],
	[ /^devtools/i, 'Devtools' ],
	[ /^editor/i, 'Editor' ],
	[ /^(test|e2e|puppeteer)/i, 'Tests' ],
	[ /^(utils|scripts)/i, 'Utils' ],
	[ /^build/i, 'Build' ],
	[ /^ci$/i, 'CI' ]
];

function exec( file, args ) {

	try {

		return execFileSync( file, args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, stdio: [ 'ignore', 'pipe', 'ignore' ] } ).trim();

	} catch ( error ) {

		return '';

	}

}

function getCommitsBetweenTags( fromTag, toTag ) {

	// Get commits between refs (exclusive fromTag, inclusive toTag), oldest first, excluding merge commits
	// --cherry-pick drops commits already released via cherry-pick onto a release branch (same patch, different hash)
	const log = exec( 'git', [ 'log', `${fromTag}...${toTag}`, '--right-only', '--cherry-pick', '--no-merges', '--reverse', '--format=%H|%s|%an' ] );

	if ( ! log ) return [];

	return log.split( '\n' ).filter( Boolean ).map( line => {

		const [ hash, subject, author ] = line.split( '|' );
		return { hash, subject, author };

	} );

}

function getChangedFiles( hash ) {

	const files = exec( 'git', [ 'diff-tree', '--no-commit-id', '--name-only', '-r', hash ] );
	return files ? files.split( '\n' ).filter( Boolean ) : [];

}

function getLandedPRs( ref ) {

	// PR numbers squash-merged into the history, e.g. "Fix ssl error (#27163)"
	const subjects = exec( 'git', [ 'log', '--format=%s', ref ] );
	return new Set( [ ...subjects.matchAll( /\(#(\d+)\)$/gm ) ].map( match => match[ 1 ] ) );

}

function isUpstreamCommit( headline, prNumber, landedPRs ) {

	// Dev merged into the PR branch, or another PR that already landed on dev
	if ( /^Merge /.test( headline ) ) return true;

	const match = headline.match( /\(#(\d+)\)$/ );
	return match !== null && match[ 1 ] !== prNumber && landedPRs.has( match[ 1 ] );

}

function getCommitAuthor( hash ) {

	// GitHub login of the commit author, also works when the PR was deleted
	return exec( 'gh', [ 'api', `repos/{owner}/{repo}/commits/${hash}`, '--jq', '.author.login // empty' ] );

}

function isCommentOnly( hash ) {

	// Every changed line is a comment or blank, e.g. JSDoc-only changes
	const lines = exec( 'git', [ 'show', '-U0', '--format=', hash ] ).split( '\n' ).filter( line => /^[+-]/.test( line ) && ! /^(\+\+\+|---) /.test( line ) );
	return lines.length > 0 && lines.every( line => /^[+-]\s*(\*|\/\*|\/\/|$)/.test( line ) );

}

function getCoAuthorsFromCommit( hash ) {

	const body = exec( 'git', [ 'log', '-1', '--format=%b', hash ] );
	const regex = /Co-authored-by:\s*([^<]+)\s*<[^>]+>/gi;
	return [ ...body.matchAll( regex ) ].map( m => normalizeAuthor( m[ 1 ].trim() ) );

}

function extractPRNumber( subject ) {

	// Match patterns like "(#12345)" or "#12345" at end
	const match = subject.match( /\(#(\d+)\)|\s#(\d+)$/ );
	return match ? ( match[ 1 ] || match[ 2 ] ) : null;

}

function getPRInfo( prNumber ) {

	const result = exec( 'gh', [ 'pr', 'view', prNumber, '--json', 'author,title,files,commits', '--jq', '{author: .author.login, title: .title, files: [.files[].path], commits: [.commits[] | {headline: .messageHeadline, logins: [.authors[].login]}]}' ] );

	try {

		return result ? JSON.parse( result ) : null;

	} catch ( e ) {

		return null;

	}

}

function categorizeFile( file ) {

	// Extract category from JS filename in src/ or examples/jsm/
	if ( file.endsWith( '.js' ) && ( file.startsWith( 'src/' ) || file.startsWith( 'examples/jsm/' ) ) ) {

		// Skip barrel/index files
		if ( /\/Three(\.\w+)?\.js$/.test( file ) ) return { category: 'Global' };

		// Third-party libraries and shader chunks are grouped by folder
		if ( file.startsWith( 'examples/jsm/libs/' ) ) return { category: 'Libs' };
		if ( file.endsWith( '.glsl.js' ) ) return { category: file.split( '/' ).at( - 2 ) };

		const match = file.match( /\/([^/.]+)[^/]*\.js$/ );
		if ( match ) return { category: match[ 1 ] };

	}

	// Check path-based categories for non-JS files or other paths
	for ( const [ pathPrefix, category ] of categoryPaths ) {

		if ( file.startsWith( pathPrefix ) ) {

			return { category, section: sectionCategories.includes( category ) ? category : null };

		}

	}

	return { category: 'Global' };

}

function getGroup( file ) {

	// Library groups: core and nodes in src/, addons and node addons in examples/jsm/
	if ( file.startsWith( 'examples/jsm/' ) ) return file.startsWith( 'examples/jsm/tsl/' ) || /Node[^/]*\.js$/.test( file ) ? 'addonNodes' : 'addons';
	if ( file.startsWith( 'src/' ) ) return file.includes( '/nodes/' ) ? 'nodes' : 'core';

	return null;

}

function countBy( items ) {

	const counts = {};

	for ( const item of items ) {

		if ( item ) counts[ item ] = ( counts[ item ] || 0 ) + 1;

	}

	return counts;

}

function maxKey( counts ) {

	let best = null;
	let bestCount = 0;

	for ( const [ key, count ] of Object.entries( counts ) ) {

		if ( count > bestCount ) {

			bestCount = count;
			best = key;

		}

	}

	return best;

}

function categorizeCommit( files ) {

	files = files.filter( f => ! f.startsWith( 'examples/screenshots/' ) );

	// Library files win over sections, category from the most touched group only
	const group = maxKey( countBy( files.map( getGroup ) ) );

	if ( group ) {

		const categories = files.filter( file => getGroup( file ) === group ).map( file => categorizeFile( file ).category );
		return { category: maxKey( countBy( categories ) ), group, section: null };

	}

	const results = files.map( categorizeFile );

	return {
		category: maxKey( countBy( results.map( r => r.category ) ) ) || 'Global',
		group: null,
		section: maxKey( countBy( results.map( r => r.section ) ) )
	};

}

function shouldSkipCommit( subject ) {

	return skipPatterns.some( pattern => pattern.test( subject ) );

}

function extractCategoryFromTitle( title ) {

	// Extract category from title prefix like "Object3D: Added pivot"
	const match = title.match( /^([A-Za-z0-9_/]+):\s/ );

	// Conventional commit types like "chore:" aren't categories
	if ( ! match || /^(chore|feat|fix|refactor)$/i.test( match[ 1 ] ) ) return null;

	return match[ 1 ];

}

function normalizeTitle( title ) {

	// "Examples - Clean up" and "Utils : Clean up" become "Examples: Clean up", double spaces collapse
	return title.replace( /\s+/g, ' ' ).replace( /^([A-Za-z0-9_/]+) [-:] /, '$1: ' );

}

function sectionFromPrefix( prefix ) {

	const match = sectionPrefixes.find( ( [ pattern ] ) => pattern.test( prefix ) );
	return match ? match[ 1 ] : null;

}

function cleanSubject( subject, category ) {

	// Remove PR number from subject
	let cleaned = subject.replace( /\s*\(#\d+\)\s*$/, '' ).replace( /\s*#\d+\s*$/, '' ).trim();

	// Remove title prefix if it matches the category, including section typos like "Exampler:"
	const prefix = extractCategoryFromTitle( cleaned );

	if ( prefix && ( prefix.toLowerCase() === category.toLowerCase() || sectionFromPrefix( prefix ) === category ) ) {

		cleaned = cleaned.replace( /^[A-Za-z0-9_/]+:\s*/, '' );

	}

	// Also remove common prefixes
	cleaned = normalizeTitle( cleaned.replace( /^(Examples|Docs|Manual|Editor|Tests|Build|CI|Global|Src|Addons|Nodes|TSL|WebGLRenderer|WebGPURenderer|Renderer|Scripts|Utils|Chore|Feat|Fix|Refactor):\s*/i, '' ) );

	// Remove trailing period if present, we'll add it back
	cleaned = cleaned.replace( /\.\s*$/, '' );

	// Capitalize a lowercase first word like "add", but not identifiers like "mergeVertices()"
	cleaned = cleaned.replace( /^[a-z]+(?=[\s,])/, word => word[ 0 ].toUpperCase() + word.slice( 1 ) );

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

function formatEntry( title, prNumber, hash, author, coAuthors ) {

	let entry = `${title}.`;

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

	if ( ! exec( 'gh', [ '--version' ] ) ) {

		console.error( 'GitHub CLI (gh) is required but not installed.' );
		console.error( 'Install from: https://cli.github.com/' );
		process.exit( 1 );

	}

	if ( ! tag ) {

		console.error( 'Usage: node utils/changelog.js <tag|branch>' );
		console.error( 'Example: node utils/changelog.js r185' );
		console.error( 'Example: node utils/changelog.js dev' );
		process.exit( 1 );

	}

	// Verify the ref exists
	const resolved = exec( 'git', [ 'rev-parse', '--verify', tag ] );

	if ( ! resolved ) {

		console.error( `Invalid tag or branch: ${tag}` );
		process.exit( 1 );

	}

	let previousTag, version;

	if ( /^r\d+$/.test( tag ) ) {

		// Release tag: changes since the previous release
		version = parseInt( tag.slice( 1 ) );
		previousTag = `r${version - 1}`;

	} else {

		// Branch or commit: changes since the latest release
		previousTag = exec( 'git', [ 'tag', '--list', 'r[0-9]*', '--sort=-v:refname' ] ).split( '\n' )[ 0 ];
		version = parseInt( previousTag.slice( 1 ) ) + 1;

	}

	const previousResolved = previousTag && exec( 'git', [ 'rev-parse', '--verify', previousTag ] );

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

function processCommit( commit, revertedTitles, landedPRs ) {

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
	let coAuthors = null;

	if ( prNumber ) {

		const prInfo = getPRInfo( prNumber );

		if ( prInfo ) {

			// Skip commits from bots
			if ( skipAuthors.has( prInfo.author ) ) return null;

			author = prInfo.author;
			if ( prInfo.title ) subject = prInfo.title;
			if ( prInfo.files && prInfo.files.length > 0 ) files = prInfo.files;
			// Co-authors only from the PR's own commits
			const logins = prInfo.commits.filter( ( { headline } ) => ! isUpstreamCommit( headline, prNumber, landedPRs ) ).flatMap( ( { logins } ) => logins );
			coAuthors = [ ...new Set( logins ) ].sort();

		}

	}

	subject = normalizeTitle( subject );

	// Fall back to git data
	if ( ! files ) files = getChangedFiles( commit.hash );
	if ( ! author ) author = getCommitAuthor( commit.hash ) || commit.author;

	// package.json-only commits are dependency and npm maintenance
	if ( files.length > 0 && files.every( file => /^package(-lock)?\.json$/.test( file ) ) ) return null;

	// Skip commits from bots (check normalized name for git author fallback)
	if ( skipAuthors.has( normalizeAuthor( author ) ) ) return null;

	let { category, group, section } = categorizeCommit( files );

	// Use title prefix as category only if file-based didn't assign a section
	if ( ! section ) {

		const titleCategory = extractCategoryFromTitle( subject );

		if ( titleCategory ) {

			section = sectionFromPrefix( titleCategory );
			category = section || titleCategory;

			// A title naming a changed file belongs to that file's group
			const titleFile = files.find( file => file.endsWith( `/${category}.js` ) );

			if ( titleFile && getGroup( titleFile ) ) {

				group = getGroup( titleFile );

			} else if ( group === 'core' || group === 'nodes' ) {

				// Generic src titles: node system names go to Nodes, the rest stays in core
				group = /Node|^TSL$/.test( category ) ? 'nodes' : 'core';

			}

			// Generic prefixes like "Src:" or "Addons:" use the group's generic category
			if ( group && /^(global|src|addons|nodes)$/i.test( category ) ) category = genericCategories[ group ];

		}

	}

	// Route jsdoc/typo/docs-related commits, and library commits that only change comments, to Docs section
	if ( /\b(jsdoc|typo|spelling|documentation)\b/i.test( subject ) || ( ! section && isCommentOnly( commit.hash ) ) ) {

		section = 'Docs';

	}

	// Section entries are flat, so the section is what a title prefix is matched against
	if ( section ) category = section;

	if ( ! coAuthors ) coAuthors = getCoAuthorsFromCommit( commit.hash );
	coAuthors = coAuthors.filter( login => login && login !== author && ! skipAuthors.has( login ) );
	const title = cleanSubject( subject, category );

	return {
		entry: {
			hash: commit.hash,
			subject,
			title,
			prNumber,
			author,
			category,
			formatted: formatEntry( title, prNumber, commit.hash, author, coAuthors )
		},
		category,
		group,
		section
	};

}

function formatGroups( groups, first ) {

	// Categories alphabetically, with one pinned first
	const sorted = Object.keys( groups ).sort( ( a, b ) => {

		if ( a === first ) return - 1;
		if ( b === first ) return 1;
		return a.localeCompare( b );

	} );

	let output = '';

	for ( const category of sorted ) {

		output += `- ${category}\n`;

		for ( const entry of groups[ category ] ) {

			output += `  - ${entry.formatted}\n`;

		}

	}

	return output;

}

function formatOutput( version, groups, sections ) {

	let output = '';

	const previousVersion = version - 1;
	output += `https://github.com/mrdoob/three.js/wiki/Migration-Guide#${previousVersion}--${version}\n`;
	output += `https://github.com/mrdoob/three.js/milestone/${version - 87}?closed=1\n\n`;

	// Core changes
	output += formatGroups( groups.core, genericCategories.core );

	// Node system changes in src/
	if ( Object.keys( groups.nodes ).length > 0 ) {

		output += '\n**Nodes**\n\n';
		output += formatGroups( groups.nodes, genericCategories.nodes );

	}

	// Addons in examples/jsm/
	if ( Object.keys( groups.addons ).length > 0 ) {

		output += '\n**Addons**\n\n';
		output += formatGroups( groups.addons, genericCategories.addons );

	}

	// Node system addons in examples/jsm/
	if ( Object.keys( groups.addonNodes ).length > 0 ) {

		output += '\n**Addons / Nodes**\n\n';
		output += formatGroups( groups.addonNodes, genericCategories.addonNodes );

	}

	// Output sections in order
	const sectionOrder = [ 'Docs', 'Manual', 'Examples', 'Devtools', 'Editor', 'Tests', 'Utils', 'Build', 'CI' ];

	for ( const sectionName of sectionOrder ) {

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
	const landedPRs = getLandedPRs( tag );

	// Group commits by category
	const groups = { core: {}, nodes: {}, addons: {}, addonNodes: {} };
	const sections = {
		Docs: [],
		Manual: [],
		Examples: [],
		Devtools: [],
		Editor: [],
		Tests: [],
		Utils: [],
		Build: [],
		CI: []
	};

	const results = [];
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

		const result = processCommit( commit, revertedTitles, landedPRs );

		if ( result ) {

			results.push( result );

		} else {

			skipped ++;

		}

	}

	process.stderr.write( '\n\n' );

	// Direct commits whose PR was merged afterwards as an empty commit with the same title
	const getKey = ( { entry, group, section } ) => `${section || group}/${entry.category}/${entry.title}`;
	const prKeys = new Set( results.filter( result => result.entry.prNumber && getChangedFiles( result.entry.hash ).length === 0 ).map( getKey ) );

	for ( const result of results ) {

		if ( ! result.entry.prNumber && prKeys.has( getKey( result ) ) ) {

			skipped ++;
			continue;

		}

		const { entry, category, group, section } = result;

		if ( section && sections[ section ] ) {

			sections[ section ].push( entry );

		} else {

			addToGroup( groups[ group || 'core' ], category, entry );

		}

	}

	if ( skipped > 0 ) {

		console.error( `Skipped ${skipped} commits (builds, dependency updates, etc.)\n` );

	}

	console.log( formatOutput( version, groups, sections ) );

}

generateChangelog();
