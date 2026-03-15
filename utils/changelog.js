import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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

async function generateReport() {

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

	const githubToken = await askQuestion( 'Enter GitHub API Token (or press Enter to skip): ' );
	const geminiToken = await askQuestion( 'Enter Gemini API Token (or press Enter to skip AI summary): ' );
	let geminiModel = '';

	if ( geminiToken ) {

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

			geminiModel = familyModels[ mIndex - 1 ].id;

		} catch ( e ) {

			console.error( 'Error fetching models:', e.message );
			process.exit( 1 );

		}

	}

	const repo = 'mrdoob/three.js';

	console.error( `Fetching milestone for release r${releaseNumber} (ID: ${milestoneNumber})...` );

	const headers = {
		'User-Agent': 'NodeJS/ThreeJS-Report',
		'Accept': 'application/vnd.github.v3+json'
	};

	if ( githubToken ) {

		headers[ 'Authorization' ] = `token ${githubToken}`;

	}

	const milestoneRes = await fetch( `https://api.github.com/repos/${repo}/milestones/${milestoneNumber}`, { headers } );
	if ( ! milestoneRes.ok ) {

		console.error( 'Failed to fetch milestone. Check if the milestone exists or rate limit exceeded.' );
		process.exit( 1 );

	}

	const milestoneData = await milestoneRes.json();
	const milestoneName = milestoneData.title;

	console.error( `Fetching PRs for milestone: ${milestoneName}...` );

	let page = 1;
	let totalPages = '?';
	const cacheFiles = [];
	const categories = {};
	let prDescriptionsForAI = '';
	let totalPRs = 0;

	const changelogDir = path.join( __dirname, '../changelog' );
	if ( ! fs.existsSync( changelogDir ) ) {

		fs.mkdirSync( changelogDir );

	}

	while ( true ) {

		process.stdout.write( `\rFetching PR page ${page}/${totalPages}...` );

		const cacheFilename = path.join( changelogDir, `r${releaseNumber}_page_${page}.md` );
		let pageContent = '';
		let isLastPage = false;

		if ( fs.existsSync( cacheFilename ) ) {

			pageContent = fs.readFileSync( cacheFilename, 'utf8' );

		} else {

			const res = await fetch( `https://api.github.com/repos/${repo}/issues?milestone=${milestoneNumber}&state=closed&per_page=${perPage}&page=${page}`, { headers } );
			if ( ! res.ok ) {

				console.error( '\nFailed to fetch PRs.' );
				process.exit( 1 );

			}

			if ( totalPages === '?' ) {

				const linkHeader = res.headers.get( 'link' );
				if ( linkHeader ) {

					const lastPageMatch = linkHeader.match( /page=(\d+)>; rel="last"/ );
					if ( lastPageMatch ) {

						totalPages = lastPageMatch[ 1 ];
						process.stdout.write( `\rFetching PR page ${page}/${totalPages}...` );

					}

				}

			}

			const data = await res.json();
			if ( data.length === 0 ) break;

			const prsInData = data.filter( issue => issue.pull_request && issue.pull_request.merged_at );

			for ( const pr of prsInData ) {

				let title = pr.title;
				let category = 'Other';

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

				pageContent += `## ${category}: ${title} #${pr.number} (${authorsList})\n\n${pr.body || ''}\n\n---\n\n`;

			}

			fs.writeFileSync( cacheFilename, pageContent );

			if ( data.length < perPage ) isLastPage = true;

		}

		if ( pageContent.length > 0 ) {

			cacheFiles.push( cacheFilename );

			if ( geminiToken ) {

				prDescriptionsForAI += pageContent;

			}

			const prRegex = /^## (.*?):\s*(.*?)\s+#(\d+)\s+\((.*?)\)(?:\r?\n)([\s\S]*?)(?=\n---|$)/gm;
			let m;
			while ( ( m = prRegex.exec( pageContent ) ) !== null ) {

				const category = m[ 1 ].trim();
				const title = m[ 2 ].trim();
				const number = parseInt( m[ 3 ], 10 );
				const authorsList = m[ 4 ].trim();

				if ( ! categories[ category ] ) categories[ category ] = [];
				categories[ category ].push( { title: title + '.', number, authors: authorsList } );

				totalPRs ++;

			}

		} else if ( ! fs.existsSync( cacheFilename ) ) {

			break;

		}

		if ( isLastPage ) break;

		page ++;

	}

	console.error( `\nFound ${totalPRs} PRs.` );

	const sortedCategories = Object.keys( categories ).sort();

	let output = `## ${milestoneName}\n\n`;

	for ( let i = 0; i < sortedCategories.length; i ++ ) {

		const cat = sortedCategories[ i ];

		if ( i > 0 ) output += '\n'; // Add an empty line between categories

		output += `- ${cat}\n`;

		const sortedPRs = categories[ cat ].sort( ( a, b ) => a.number - b.number );

		for ( const pr of sortedPRs ) {

			output += `  - ${pr.title} #${pr.number} (${pr.authors})\n`;

		}

	}

	if ( geminiToken && prDescriptionsForAI ) {

		console.error( `Generating AI Summary with Gemini (${geminiModel})...` );

		const aiPrompt = `You are an assistant analyzing the changes of a new release of the Three.js library (release r${releaseNumber}).
Here are the descriptions of the Pull Requests merged in this release:

${prDescriptionsForAI}

Please provide the following information formatted in Markdown (ALL EXPLANATIONS MUST BE WRITTEN IN ENGLISH):
- A detailed and comprehensive summary focusing on the most important changes, including new features, major refactorings, API changes, and breaking changes. IMPORTANT: Add an extra blank line between each bullet point in your lists for better readability.
- Migration tips for users upgrading to this new version. Use the exact heading "### Migration Tips" (without any numbering). IMPORTANT: If a property or feature was created and then renamed or removed within this same release milestone, DO NOT include it as a migration tip (since it was never released to the public in the first place).

Output only the markdown content, without extra code block delimiters. Do not include a code examples section.`;

		try {

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
					output = `## AI Summary (r${releaseNumber})\n\n${aiText}${aiFooter}\n\n---\n\n` + output;

				}

			} else {

				console.error( 'Failed to generate AI summary:', await geminiRes.text() );

			}

		} catch ( e ) {

			console.error( 'Error generating AI summary:', e.message );

		}

	}

	const descriptionsFilePath = path.join( changelogDir, `r${releaseNumber}_descriptions.md` );
	const reportFilePath = path.join( changelogDir, `r${releaseNumber}.md` );

	fs.writeFileSync( descriptionsFilePath, prDescriptionsForAI );
	fs.writeFileSync( reportFilePath, output );

	for ( const cacheFile of cacheFiles ) {

		if ( fs.existsSync( cacheFile ) ) {

			fs.unlinkSync( cacheFile );

		}

	}

	console.log( `\n✅ Report for r${releaseNumber} generated successfully:` );
	console.log( `   📄 \x1b[36m${reportFilePath}\x1b[0m` );

	if ( geminiToken && prDescriptionsForAI ) {

		console.log( '\n✅ Descriptions for AI saved in:' );
		console.log( `   📄 \x1b[36m${descriptionsFilePath}\x1b[0m\n` );

	}

}

generateReport().catch( console.error );
