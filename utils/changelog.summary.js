import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { execSync } from 'child_process';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

async function askQuestion( query ) {

	const rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout
	} );

	return new Promise( resolve => rl.question( query, ans => {

		rl.close();
		resolve( ans );

	} ) );

}

function getExamplesChanges( releaseNumber ) {

	const added = [];
	const modified = [];
	const removed = [];

	try {

		const diff = execSync( `git diff --name-status r${releaseNumber - 1}..HEAD -- examples/`, { cwd: path.join( __dirname, '..' ), encoding: 'utf8' } );
		const lines = diff.split( '\n' );

		for ( const line of lines ) {

			if ( ! line ) continue;

			if ( line.startsWith( 'R' ) ) {

				const parts = line.split( /\s+/ );
				if ( parts.length >= 3 ) {

					const remName = parts[ 1 ].replace( 'examples/', '' ).replace( '.html', '' );
					const addName = parts[ 2 ].replace( 'examples/', '' ).replace( '.html', '' );

					removed.push( `[${remName}](https://threejs.org/examples/#${remName})` );
					added.push( `[${addName}](https://threejs.org/examples/#${addName})` );

				}

				continue;

			}

			const parts = line.split( /\s+/ );
			if ( parts.length < 2 ) continue;

			const status = parts[ 0 ];
			const file = parts[ 1 ];

			if ( file.endsWith( '.html' ) ) {

				const name = file.replace( 'examples/', '' ).replace( '.html', '' );
				const link = `[${name}](https://threejs.org/examples/#${name})`;

				if ( status.startsWith( 'A' ) ) {

					added.push( link );

				} else if ( status.startsWith( 'D' ) ) {

					removed.push( link );

				} else if ( status.startsWith( 'M' ) ) {

					modified.push( link );

				}

			}

		}

	} catch ( e ) {

		console.error( 'Failed to get examples diff:', e.message );

	}

	let output = '';

	if ( added.length > 0 ) output += `**New Examples:**\n${added.join( ', ' )}\n\n`;
	if ( modified.length > 0 ) output += `**Modified Examples:**\n${modified.join( ', ' )}\n\n`;
	if ( removed.length > 0 ) output += `**Removed Examples:**\n${removed.join( ', ' )}\n\n`;

	return output;

}

function getReleaseAndCacheArgs() {

	let arg = process.argv[ 2 ];

	if ( ! arg || arg === '-cache' ) {

		// Fallback to reading REVISION from src/constants.js
		try {

			const constantsPath = path.join( __dirname, '../src/constants.js' );
			const constantsContent = fs.readFileSync( constantsPath, 'utf8' );
			const revisionMatch = constantsContent.match( /export\s+const\s+REVISION\s*=\s*['"](.*?)['"]/ );

			if ( revisionMatch && revisionMatch[ 1 ] ) {

				arg = revisionMatch[ 1 ].replace( /dev$/, '' );
				console.log( `No release specified. Using current REVISION: ${arg}` );

				// Adjust argv indexing if the first argument was actually the -cache flag
				if ( process.argv[ 2 ] === '-cache' ) {

					process.argv.splice( 2, 0, arg ); // Shift everything over by acting as if arg was passed

				}

			} else {

				console.error( 'Usage: npm run changelog [milestone-url-or-number] [-cache <per_page>]' );
				console.error( 'Example: npm run changelog https://github.com/mrdoob/three.js/milestone/97 -cache 50' );
				console.error( 'Could not find REVISION in src/constants.js.' );
				process.exit( 1 );

			}

		} catch ( e ) {

			console.error( 'Usage: npm run changelog [milestone-url-or-number] [-cache <per_page>]' );
			console.error( 'Example: npm run changelog https://github.com/mrdoob/three.js/milestone/97 -cache 50' );
			console.error( 'Error reading src/constants.js:', e.message );
			process.exit( 1 );

		}

	}

	let perPage = 100;

	for ( let i = 2; i < process.argv.length; i ++ ) { // start from 2, just in case -cache is the first arg now

		const param = process.argv[ i ];

		if ( param === '-cache' && i + 1 < process.argv.length ) {

			perPage = parseInt( process.argv[ i + 1 ], 10 );
			// skip the value

			if ( isNaN( perPage ) || perPage <= 0 || perPage > 100 ) {

				console.error( 'Invalid -cache value. It must be a number between 1 and 100.' );
				process.exit( 1 );

			}

		}

	}

	const match = arg.match( /(\d+)$/ );
	if ( ! match ) {

		console.error( 'Invalid format. Please provide a release number (e.g. 184 or r184).' );
		process.exit( 1 );

	}

	const releaseNumber = parseInt( match[ 1 ], 10 );
	const milestoneNumber = releaseNumber - 87;

	return { releaseNumber, milestoneNumber, perPage };

}

async function selectGeminiModel( geminiToken ) {

	console.error( '\nFetching available Gemini models...' );

	try {

		const modelsRes = await fetch( `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiToken}` );
		if ( ! modelsRes.ok ) {

			console.error( 'Failed to fetch Gemini models. Please check your API token.' );
			process.exit( 1 );

		}

		const modelsData = await modelsRes.json();
		const rawModels = modelsData.models
			.filter( m => m.name.includes( 'gemini' ) && m.supportedGenerationMethods && m.supportedGenerationMethods.includes( 'generateContent' ) )
			.filter( m => ! m.name.includes( 'vision' ) )
			.map( m => {

				return {
					id: m.name.replace( 'models/', '' ),
					displayName: m.displayName || m.name.replace( 'models/', '' )
				};

			} );

		// Filter out unwanted and noisy models
		const filteredModels = rawModels.filter( m => {

			const id = m.id.toLowerCase();
			const name = m.displayName.toLowerCase();
			if ( name.includes( 'nano' ) || name.includes( 'banana' ) || id.includes( 'nano' ) || id.includes( 'banana' ) ) return false;
			if ( id.includes( '-latest' ) || id.includes( 'computer-use' ) || id.includes( 'robotics' ) || id.includes( '-tts' ) ) return false;
			// Filter out very specific preview builds if they are too noisy, but we'll leave most previews as per the example.
			return true;

		} );

		// Group by version
		const groups = {};
		filteredModels.forEach( m => {

			// Try to extract version like "2.5", "3.1", "2.0", "3"
			const versionMatch = m.id.match( /gemini-(\d+(?:\.\d+)?)/ );
			if ( versionMatch ) {

				const version = versionMatch[ 1 ];
				if ( ! groups[ version ] ) groups[ version ] = [];
				groups[ version ].push( m );

			}

		} );

		const sortedVersions = Object.keys( groups ).sort( ( a, b ) => parseFloat( b ) - parseFloat( a ) );

		if ( sortedVersions.length === 0 ) {

			console.error( 'No suitable Gemini models found after filtering.' );
			process.exit( 1 );

		}

		console.log( '\nSelect Gemini Version Family:' );
		sortedVersions.forEach( ( v, i ) => {

			console.log( `${i + 1}: Gemini ${v}` );

		} );

		const versionChoice = await askQuestion( `Enter choice (1-${sortedVersions.length}) [1]: ` );
		let vIndex = parseInt( versionChoice, 10 );
		if ( isNaN( vIndex ) || vIndex < 1 || vIndex > sortedVersions.length ) {

			vIndex = 1;

		}

		const selectedVersion = sortedVersions[ vIndex - 1 ];
		const familyModels = groups[ selectedVersion ].reverse(); // latest variants first

		console.log( `\nSelect Model for Gemini ${selectedVersion}:` );
		familyModels.forEach( ( m, i ) => {

			console.log( `${i + 1}: ${m.displayName} (${m.id})` );

		} );

		const modelChoice = await askQuestion( `Enter choice (1-${familyModels.length}) [1]: ` );
		let mIndex = parseInt( modelChoice, 10 );
		if ( isNaN( mIndex ) || mIndex < 1 || mIndex > familyModels.length ) {

			mIndex = 1;

		}

		return familyModels[ mIndex - 1 ].id;

	} catch ( e ) {

		console.error( 'Error fetching models:', e.message );
		process.exit( 1 );

	}

}

async function fetchMilestoneData( repo, milestoneNumber, headers ) {

	const milestoneRes = await fetch( `https://api.github.com/repos/${repo}/milestones/${milestoneNumber}`, { headers } );
	if ( ! milestoneRes.ok ) {

		console.error( 'Failed to fetch milestone. Check if the milestone exists or rate limit exceeded.' );
		process.exit( 1 );

	}

	const milestoneData = await milestoneRes.json();
	return { title: milestoneData.title, closed_issues: milestoneData.closed_issues };

}

async function fetchAndParsePRs( repo, milestoneNumber, perPage, headers, totalExpectedPRs ) {

	let page = 1;
	let totalPages = '?';
	let totalPRs = 0;
	let processedPRs = 0;

	let prDescriptionsForAI = '';

	const barWidth = 40;

	function updateProgress() {

		if ( totalExpectedPRs > 0 ) {

			const done = processedPRs;
			const total = totalExpectedPRs;
			const filled = Math.min( barWidth, Math.round( barWidth * done / total ) );
			const bar = '█'.repeat( filled ) + '░'.repeat( Math.max( 0, barWidth - filled ) );
			const pct = Math.min( 100, Math.round( 100 * done / total ) );
			process.stderr.write( `\r  ${bar} ${pct}% (${done}/${total})` );

		} else {

			process.stderr.write( `\rFetching PR page ${page}/${totalPages}...` );

		}

	}

	// We no longer need the initial 1-page fetch because we have totalExpectedPRs
	while ( true ) {

		if ( totalExpectedPRs === 0 ) {

			process.stdout.write( `\rFetching PR page ${page}/${totalPages}...` );

		}

		let pageContent = '';
		let isLastPage = false;

		const res = await fetch( `https://api.github.com/repos/${repo}/issues?milestone=${milestoneNumber}&state=closed&per_page=${perPage}&page=${page}`, { headers } );
		if ( ! res.ok ) {

			console.error( '\nFailed to fetch PRs.' );
			process.exit( 1 );

		}

		if ( totalPages === '?' || totalExpectedPRs === 0 ) {

			const linkHeader = res.headers.get( 'link' );
			if ( linkHeader ) {

				const lastPageMatch = linkHeader.match( /page=(\d+)>; rel="last"/ );
				if ( lastPageMatch ) {

					totalPages = lastPageMatch[ 1 ];
					if ( totalExpectedPRs === 0 ) process.stdout.write( `\rFetching PR page ${page}/${totalPages}...` );

				}

			}

		}

		const data = await res.json();
		if ( data.length === 0 ) break;

		const prsInData = data.filter( issue => issue.pull_request && issue.pull_request.merged_at );

		for ( const pr of prsInData ) {

			let title = pr.title;
			let category = 'Others';

			const catMatch = title.match( /^([^:]+):\s*(.*)$/ );
			if ( catMatch ) {

				category = catMatch[ 1 ].trim();
				title = catMatch[ 2 ].trim();

			}

			title = title.replace( /\s*\(#\d+\)\s*$/, '' ).trim();
			title = title.replace( /\.\s*$/, '' );

			const authors = new Set();
			if ( pr.user && pr.user.login ) authors.add( pr.user.login );

			if ( pr.body ) {

				const coAuthRegex1 = /Co-authored-by:\s*(?:@)?([a-zA-Z0-9-]+)/gi;
				let m;
				while ( ( m = coAuthRegex1.exec( pr.body ) ) !== null ) {

					authors.add( m[ 1 ] );

				}

			}

			const authorsList = Array.from( authors ).map( a => `@${a}` ).join( ', ' );

			pageContent += `## ${category}: ${title} #${pr.number} (${authorsList})\n\n${pr.body || ''}\n\n`;

			processedPRs ++;

			if ( totalExpectedPRs > 0 ) updateProgress();

		}

		if ( data.length < perPage ) isLastPage = true;

		prDescriptionsForAI += pageContent;

		const prRegex = /^## (.*?):\s*(.*?)\s+#(\d+)\s+\((.*?)\)(?:\r?\n)([\s\S]*?)(?=\n## |$)/gm;
		while ( prRegex.exec( pageContent ) !== null ) {

			totalPRs ++;

		}

		if ( isLastPage ) break;

		page ++;

	}

	if ( totalExpectedPRs > 0 ) {

		const bar = '█'.repeat( barWidth );
		process.stderr.write( `\r  ${bar} 100% (${totalPRs}/${totalPRs})` );
		process.stderr.write( '\n\n' );

	}

	return { prDescriptionsForAI };

}

async function fetchAISummary( releaseNumber, prDescriptionsForAI, geminiModel, geminiToken ) {

	console.error( `Generating AI Summary with Gemini (${geminiModel})...` );

	const promptTemplatePath = path.join( __dirname, 'changelog.summary.md' );
	const promptTemplate = fs.readFileSync( promptTemplatePath, 'utf8' );

	const examplesChanges = getExamplesChanges( releaseNumber );

	const aiPrompt = promptTemplate
		.replace( '{RELEASE}', releaseNumber )
		.replace( '{DESCRIPTION}', prDescriptionsForAI )
		.replace( '{EXAMPLES_CHANGES}', examplesChanges );

	try {

		// codeql[js/file-access-to-http] - False Positive: The prompt template file is intentionally sent to the LLM API.
		const geminiRes = await fetch( `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiToken}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( {
				contents: [ { parts: [ { text: aiPrompt } ] } ]
			} )
		} );

		if ( geminiRes.ok ) {

			const geminiData = await geminiRes.json();
			if ( geminiData.candidates && geminiData.candidates[ 0 ] && geminiData.candidates[ 0 ].content ) {

				const aiText = geminiData.candidates[ 0 ].content.parts[ 0 ].text;
				const aiFooter = `\n\n*Generated by ${geminiModel}*`;
				return `## AI Summary (r${releaseNumber})\n\n${aiText}${aiFooter}`;

			}

		} else {

			console.error( 'Failed to generate AI summary:', await geminiRes.text() );

		}

	} catch ( e ) {

		console.error( 'Error generating AI summary:', e.message );

	}

	return '';

}

async function generateChangelog() {

	const { releaseNumber, milestoneNumber, perPage } = getReleaseAndCacheArgs();

	const githubToken = await askQuestion( 'Enter GitHub API Token (or press Enter to skip): ' );
	const geminiToken = await askQuestion( 'Enter Gemini API Token (or press Enter to skip AI summary): ' );

	let geminiModel = '';
	if ( geminiToken ) {

		geminiModel = await selectGeminiModel( geminiToken );

	}

	const repo = 'mrdoob/three.js';

	console.error( `Fetching milestone for release r${releaseNumber} (ID: ${milestoneNumber})...` );

	const headers = {
		'User-Agent': 'NodeJS/ThreeJS-Changelog',
		'Accept': 'application/vnd.github.v3+json'
	};

	if ( githubToken ) {

		headers[ 'Authorization' ] = `token ${githubToken}`;

	}

	const milestoneData = await fetchMilestoneData( repo, milestoneNumber, headers );
	const milestoneName = milestoneData.title;

	console.error( `Fetching PRs for milestone: ${milestoneName}...` );

	const { prDescriptionsForAI } = await fetchAndParsePRs( repo, milestoneNumber, perPage, headers, milestoneData.closed_issues );

	let summary = '';

	if ( geminiToken && prDescriptionsForAI ) {

		summary = await fetchAISummary( releaseNumber, prDescriptionsForAI, geminiModel, geminiToken );

	} else if ( prDescriptionsForAI ) {

		summary = prDescriptionsForAI;

	}

	console.log( '\n' + '-'.repeat( 100 ) + '\n' );
	console.log( summary );
	console.log( '\n' );

}

generateChangelog().catch( console.error );
