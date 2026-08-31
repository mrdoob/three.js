import { marked } from 'marked';
import * as THREE from 'three';
import * as TSL from 'three/tsl';

marked.use( {
	renderer: {
		code( code, infostring ) {

			if ( infostring === 'mermaid' ) {

				return `<pre class="mermaid">${code}</pre>`;

			}

			return false;

		}
	}
} );


function parseTour( rawMarkdown ) {

	const pageTree = [];

	// Regex to match <page ...> opening tag, or </page> closing tag
	const tokenRegex = /<page([^>]*?)>|<\/page>/gi;
	let match;
	let lastIndex = 0;
	const stack = [];

	while ( ( match = tokenRegex.exec( rawMarkdown ) ) !== null ) {

		const index = match.index;
		const textSegment = rawMarkdown.substring( lastIndex, index );

		if ( stack.length > 0 ) {

			stack[ stack.length - 1 ].content += textSegment;

		}

		if ( match[ 0 ].toLowerCase().startsWith( '</page>' ) ) {

			// Closing tag
			if ( stack.length > 0 ) {

				const finishedPage = stack.pop();

				if ( stack.length > 0 ) {

					stack[ stack.length - 1 ].children.push( finishedPage );

				} else {

					pageTree.push( finishedPage );

				}

			}

		} else {

			// Opening tag
			const attrString = match[ 1 ] || '';
			const attrs = {};
			const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;
			let attrMatch;
			while ( ( attrMatch = attrRegex.exec( attrString ) ) !== null ) {

				const key = attrMatch[ 1 ].toLowerCase();
				const val = attrMatch[ 2 ] || attrMatch[ 3 ] || attrMatch[ 4 ];
				attrs[ key ] = val;

			}

			const title = ( attrs.name || attrs.title || 'Untitled' ).trim();
			const category = ( attrs.category || '' ).trim();
			const id = ( attrs.id || title.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /(^-|-$)/g, '' ) ).trim();

			const newPage = {
				id,
				title,
				category,
				content: '',
				children: []
			};

			stack.push( newPage );

		}

		lastIndex = tokenRegex.lastIndex;

	}

	// Add any remaining text
	if ( lastIndex < rawMarkdown.length && stack.length > 0 ) {

		stack[ stack.length - 1 ].content += rawMarkdown.substring( lastIndex );

	}

	// Clean up any unclosed pages
	while ( stack.length > 0 ) {

		const finishedPage = stack.pop();

		if ( stack.length > 0 ) {

			stack[ stack.length - 1 ].children.push( finishedPage );

		} else {

			pageTree.push( finishedPage );

		}

	}

	// Flatten pageTree to pages
	const pages = [];
	function flatten( node, parentCategory = '', level = 0, path = [] ) {

		const cleanContent = node.content.trim();

		let defaultNode = '';
		const codeTagRegex = /<code\s+([^>]*?)>/gi;
		let codeTagMatch;
		while ( ( codeTagMatch = codeTagRegex.exec( cleanContent ) ) !== null ) {

			const codeAttrString = codeTagMatch[ 1 ];
			const codeAttrs = {};
			const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;
			let attrMatch;
			while ( ( attrMatch = attrRegex.exec( codeAttrString ) ) !== null ) {

				const key = attrMatch[ 1 ].toLowerCase();
				const val = attrMatch[ 2 ] || attrMatch[ 3 ] || attrMatch[ 4 ];
				codeAttrs[ key ] = val;

			}

			if ( codeAttrs.default === 'true' && codeAttrs.name ) {

				defaultNode = codeAttrs.name;
				break;

			}

		}

		const hasCodeModifier = /<code\s+name=/i.test( cleanContent );

		// Parse tsl:embed blocks
		const embeds = [];
		let embedIndex = 0;
		let processedContent = cleanContent;
		const hasEmbed = /```tsl:embed/i.test( cleanContent );
		if ( hasEmbed ) {

			processedContent = cleanContent.replace( /```tsl:embed\s*\r?\n([\s\S]*?)```/gi, ( match, embedCode ) => {

				embeds.push( embedCode.trim() );
				const currentIdx = embedIndex ++;
				return `\n\n<div class="tsl-embed-container" data-index="${currentIdx}"></div>\n\n`;

			} );

		}

		node.embeds = embeds;
		node.hasEmbed = embeds.length > 0;

		const codeBlocks = {};
		const blockRegex = /```tsl\s*([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/gi;
		let blockMatch;
		let primaryCode = '';
		let hasCodeBlocks = false;

		while ( ( blockMatch = blockRegex.exec( processedContent ) ) !== null ) {

			const modifier = ( blockMatch[ 1 ] || '' ).trim();
			const codeText = blockMatch[ 2 ].trim();
			codeBlocks[ modifier ] = codeText;
			hasCodeBlocks = true;
			if ( ! primaryCode || modifier === '' ) {

				primaryCode = codeText;

			}

		}

		node.codes = codeBlocks;
		node.hasCode = hasCodeBlocks || hasCodeModifier;

		let code = '';
		if ( primaryCode ) {

			code = primaryCode;

		} else if ( defaultNode && codeBlocks[ defaultNode ] ) {

			code = codeBlocks[ defaultNode ];

		} else {

			const keys = Object.keys( codeBlocks );
			if ( keys.length > 0 ) {

				code = codeBlocks[ keys[ 0 ] ];

			} else {

				code = '// No example available.';

			}

		}

		let description = processedContent.replace( /```tsl(?:\s+[a-zA-Z0-9_-]*)?\r?\n[\s\S]*?```/gi, '' ).trim();
		description = description.replace( /\r\n/g, '\n' ).replace( /\n{3,}/g, '\n\n' );

		// Check if it has no content of its own (no description and no code)
		node.isFolder = description.length === 0 && ! node.hasCode;
		node.level = level;
		node.category = node.category || parentCategory;

		const fullPath = [ ...path ];

		if ( node.category && fullPath.length === 0 ) {

			fullPath.push( node.category );

		}

		node.path = fullPath;

		if ( ! node.isFolder ) {

			let finalDescription = description;
			if ( ! finalDescription.startsWith( '# ' ) ) {

				finalDescription = `# ${node.title}\n\n${finalDescription}`;

			}

			node.description = finalDescription;
			node.code = code;
			node.defaultNode = defaultNode;

			pages.push( node );

		}

		node.children.forEach( child => {

			flatten( child, node.category || parentCategory || node.title, level + 1, [ ...path, node.title ] );

		} );

	}

	pageTree.forEach( rootNode => {

		flatten( rootNode, '', 0, [] );

	} );

	return { pages, pageTree };

}

function parse( md ) {

	let html = md;

	// Replace double underscores __TEXT__ with underline tags, skipping code blocks (enclosed in backticks)
	const parts = html.split( '`' );
	for ( let i = 0; i < parts.length; i += 2 ) {

		parts[ i ] = parts[ i ].replace( /__([^\_]+?)__/g, '<u>$1</u>' );

	}

	html = parts.join( '`' );

	// Helper to parse callout blocks (Important, Note, etc.)
	const parseCallouts = ( tag, title, icon, className ) => {

		const regex = new RegExp( `(?:^|\\n)[ \\t]*>[ \\t]*${tag}:[ \\t]*([^\\n]+(?:\\n[ \\t]*[^\\n<>:|]+)*)`, 'gi' );
		const matches = [];
		let match;
		while ( ( match = regex.exec( html ) ) !== null ) {

			matches.push( {
				index: match.index,
				length: match[ 0 ].length,
				content: match[ 1 ].trim()
			} );

		}

		const groups = [];
		let currentGroup = [];
		for ( let i = 0; i < matches.length; i ++ ) {

			const m = matches[ i ];
			if ( currentGroup.length === 0 ) {

				currentGroup.push( m );

			} else {

				const prev = currentGroup[ currentGroup.length - 1 ];
				const between = html.substring( prev.index + prev.length, m.index );
				if ( /^\s*$/.test( between ) ) {

					currentGroup.push( m );

				} else {

					groups.push( currentGroup );
					currentGroup = [ m ];

				}

			}

		}

		if ( currentGroup.length > 0 ) {

			groups.push( currentGroup );

		}

		for ( let g = groups.length - 1; g >= 0; g -- ) {

			const group = groups[ g ];
			const first = group[ 0 ];
			const last = group[ group.length - 1 ];

			const itemsHtml = group.map( item => `<div class="${className}-item">${marked.parseInline( item.content )}</div>` ).join( `<div class="${className}-divider"></div>` );

			const groupHtml = `\n\n<div class="${className}-block"><div class="${className}-header"><span class="${className}-icon">${icon}</span> ${title}</div><div class="${className}-content">${itemsHtml}</div></div>\n\n`;

			html = html.substring( 0, first.index ) + groupHtml + html.substring( last.index + last.length );

		}

	};

	parseCallouts( 'Important', 'Important', '⚠️', 'tour-important' );
	parseCallouts( 'Note', 'Note', '📌', 'tour-note' );

	// Helper to parse collapsible accordion callout blocks for AI / LLM (> IA: or > AI: or > LLM:)
	const parseAccordionCallouts = ( tag, title, icon, className ) => {

		const regex = new RegExp( `(?:^|\\n)[ \\t]*>[ \\t]*${tag}:[ \\t]*([^\\n]+(?:\\n[ \\t]*(?:>[ \\t]*)?[^\\n<>:|]+)*)`, 'gi' );
		const matches = [];
		let match;
		while ( ( match = regex.exec( html ) ) !== null ) {

			const cleanedContent = match[ 1 ]
				.split( '\n' )
				.map( line => line.replace( /^[ \t]*>[ \t]?/, '' ).trim() )
				.filter( Boolean )
				.join( '\n' );

			matches.push( {
				index: match.index,
				length: match[ 0 ].length,
				content: cleanedContent
			} );

		}

		for ( let i = matches.length - 1; i >= 0; i -- ) {

			const m = matches[ i ];
			const lines = m.content.split( '\n' );
			const itemsHtml = lines.map( l => `<div class="${className}-item">${marked.parseInline( l )}</div>` ).join( '' );

			const accordionHtml = `\n\n<details class="${className}-accordion"><summary class="${className}-summary"><div class="${className}-summary-left"><span class="${className}-icon"><i data-icon="${icon}" style="width: 1.1rem; height: 1.1rem;"></i></span> <span class="${className}-badge">${title}</span> <span class="${className}-hint">Click to expand</span></div><span class="${className}-chevron"><i data-icon="chevron-down" style="width: 1rem; height: 1rem;"></i></span></summary><div class="${className}-content">${itemsHtml}</div></details>\n\n`;

			html = html.substring( 0, m.index ) + accordionHtml + html.substring( m.index + m.length );

		}

	};

	parseAccordionCallouts( '(?:IA|AI|LLM)', 'AI / LLM Guide', 'sparkles', 'tour-ai' );

	// Group consecutive API blocks
	const apiBlockRegex = /::: api\s+([^\n]+?)(?:\s*:::\s*(?=\n|$)|(?:\r?\n([\s\S]*?):::))/gi;
	const matches = [];
	let match;
	while ( ( match = apiBlockRegex.exec( html ) ) !== null ) {

		matches.push( {
			index: match.index,
			length: match[ 0 ].length,
			raw: match[ 0 ],
			signature: match[ 1 ].trim(),
			body: match[ 2 ] ? match[ 2 ].trim() : ''
		} );

	}

	const groups = [];
	let currentGroup = [];
	for ( let i = 0; i < matches.length; i ++ ) {

		const m = matches[ i ];
		if ( currentGroup.length === 0 ) {

			currentGroup.push( m );

		} else {

			const prev = currentGroup[ currentGroup.length - 1 ];
			const between = html.substring( prev.index + prev.length, m.index );
			if ( /^\s*$/.test( between ) ) {

				currentGroup.push( m );

			} else {

				groups.push( currentGroup );
				currentGroup = [ m ];

			}

		}

	}

	if ( currentGroup.length > 0 ) {

		groups.push( currentGroup );

	}

	for ( let g = groups.length - 1; g >= 0; g -- ) {

		const group = groups[ g ];
		const first = group[ 0 ];
		const last = group[ group.length - 1 ];

		let groupHtml = '';
		if ( group.length === 1 ) {

			groupHtml = renderSingleApiCard( first.signature, first.body );

		} else {

			groupHtml = renderApiTableCard( group );

		}

		html = html.substring( 0, first.index ) + groupHtml + html.substring( last.index + last.length );

	}

	// Helper to parse hierarchical class API accordion containers (::: api-class or ::: api-group)
	// Example: ::: api-class MeshPhysicalNodeMaterial extends MeshStandardNodeMaterial [open] ... :::
	const apiClassContainerRegex = /(?:^|\n)[ \t]*:::\s*(?:api-class|api-group)\s+([^\n]+?)\r?\n([\s\S]*?)\r?\n[ \t]*:::[ \t]*(?=\n|$)/gi;
	const classBlocks = [];
	const classMap = new Map();
	let classMatch;

	while ( ( classMatch = apiClassContainerRegex.exec( html ) ) !== null ) {

		let headerText = classMatch[ 1 ].trim();
		const isOpen = /\[open\]|\bopen\b/i.test( headerText );
		headerText = headerText.replace( /\[open\]/gi, '' ).replace( /\bopen\b/gi, '' ).trim();

		const extendsMatch = headerText.match( /^(.*?)\s+(?:extends|:)\s+(.*)$/i );
		let className = headerText;
		let extendsClass = null;

		if ( extendsMatch ) {

			className = extendsMatch[ 1 ].trim();
			extendsClass = extendsMatch[ 2 ].trim();

		}

		const bodyContent = classMatch[ 2 ];
		const countMatches = ( bodyContent.match( /class='tsl-api-table-row'/g ) || bodyContent.match( /class="tsl-api-table-row"/g ) || [] ).length +
			( bodyContent.match( /class='tsl-api-card'/g ) || bodyContent.match( /class="tsl-api-card"/g ) || [] ).length;

		const blockData = {
			index: classMatch.index,
			length: classMatch[ 0 ].length,
			className,
			extendsClass,
			isOpen,
			bodyContent,
			count: countMatches
		};

		classBlocks.push( blockData );
		classMap.set( className, blockData );

	}

	for ( let i = classBlocks.length - 1; i >= 0; i -- ) {

		const block = classBlocks[ i ];
		const openAttr = block.isOpen ? ' open' : '';
		const extendsHtml = block.extendsClass ? ` <span class='tsl-api-class-extends'><span class='tsl-api-class-extends-keyword'>extends</span> <span class='tsl-api-class-extends-name'>${block.extendsClass}</span></span>` : '';
		const countBadgeHtml = block.count > 0 ? `<span class='tsl-api-class-count'>${block.count} ${block.count === 1 ? 'property' : 'properties'}</span>` : '';

		// Build inherited accordion blocks from parent chain
		let inheritedHtml = '';
		let currParent = block.extendsClass;
		const visited = new Set( [ block.className ] );

		while ( currParent && classMap.has( currParent ) && ! visited.has( currParent ) ) {

			visited.add( currParent );
			const parentObj = classMap.get( currParent );
			const parentContent = parentObj.bodyContent.trim();
			const parentCount = parentObj.count;

			if ( parentContent ) {

				const pCountBadge = parentCount > 0 ? `<span class='tsl-api-class-count'>${parentCount} ${parentCount === 1 ? 'property' : 'properties'}</span>` : '';

				inheritedHtml += `\n<details class='tsl-api-inherited-accordion'><summary class='tsl-api-inherited-summary'><div class='tsl-api-inherited-summary-left'><span class='tsl-api-inherited-icon'><i data-icon='layers' style='width: 1rem; height: 1rem;'></i></span><span class='tsl-api-inherited-label'>Inherited from</span> <span class='tsl-api-class-extends-name'>${currParent}</span></div><div class='tsl-api-inherited-summary-right'>${pCountBadge}<span class='tsl-api-class-chevron'><i data-icon='chevron-down' style='width: 0.9rem; height: 0.9rem;'></i></span></div></summary><div class='tsl-api-inherited-content'>\n\n${parentContent}\n\n</div></details>`;

			}

			currParent = parentObj.extendsClass;

		}

		const inheritedGroupHtml = inheritedHtml ? `\n<div class='tsl-api-inherited-group'>${inheritedHtml}</div>` : '';
		const fullContent = block.bodyContent.trim() + inheritedGroupHtml;

		const accordionHtml = `\n\n<details class='tsl-api-class-accordion'${openAttr}><summary class='tsl-api-class-summary'><div class='tsl-api-class-summary-left'><span class='tsl-api-class-icon'><i data-icon='box' style='width: 1.15rem; height: 1.15rem;'></i></span><span class='tsl-api-class-name'>${block.className}</span>${extendsHtml}</div><div class='tsl-api-class-summary-right'>${countBadgeHtml}<span class='tsl-api-class-chevron'><i data-icon='chevron-down' style='width: 1rem; height: 1rem;'></i></span></div></summary><div class='tsl-api-class-content'>\n\n${fullContent}\n\n</div></details>\n\n`;

		html = html.substring( 0, block.index ) + accordionHtml + html.substring( block.index + block.length );

	}

	// Replace standalone YouTube watch URLs
	html = html.replace( /(?:^|\n)[ \t]*(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&\S*)?[ \t]*(?=\n|$)/gi, ( match, videoId ) => {

		return `\n<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>\n`;

	} );

	// Replace standalone YouTube short URLs
	html = html.replace( /(?:^|\n)[ \t]*(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)(?:&\S*)?[ \t]*(?=\n|$)/gi, ( match, videoId ) => {

		return `\n<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>\n`;

	} );

	// Group and replace consecutive X/Twitter status URLs
	const lines = html.split( /\r?\n/ );
	const newLines = [];
	let currentTweetGroup = [];

	const parseTweetUrl = ( line ) => {

		const match = line.trim().match( /^(?:https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([a-zA-Z0-9_-]+)\/status\/([0-9]+))([\?&]\S*)?$/i );
		if ( match ) {

			const queryString = match[ 3 ] || '';
			const isShort = queryString.toLowerCase().includes( 'short' );
			return {
				url: line.trim(),
				username: match[ 1 ],
				id: match[ 2 ],
				isShort: isShort
			};

		}

		return null;

	};

	for ( let i = 0; i < lines.length; i ++ ) {

		const line = lines[ i ];
		const tweet = parseTweetUrl( line );

		if ( tweet ) {

			currentTweetGroup.push( tweet );

		} else {

			if ( currentTweetGroup.length > 0 ) {

				newLines.push( renderTweetGroup( currentTweetGroup ) );
				currentTweetGroup = [];

			}

			newLines.push( line );

		}

	}

	if ( currentTweetGroup.length > 0 ) {

		newLines.push( renderTweetGroup( currentTweetGroup ) );

	}

	html = newLines.join( '\n' );

	// Protect tabs inside code fences so marked doesn't convert them to spaces
	html = html.replace( /(```[\s\S]*?```)/g, match => match.replace( /\t/g, '\uE000' ) );

	let parsedHtml = marked.parse( html );

	// Restore tabs
	parsedHtml = parsedHtml.replace( /\uE000/g, '\t' );

	// Tokenize and style inline code tags to match Monaco editor colors
	parsedHtml = parsedHtml.replace( /<code>([\s\S]*?)<\/code>/gi, ( match, codeContent ) => {

		return `<code>${tokenizeInlineCode( codeContent )}</code>`;

	} );

	return parsedHtml;

}

function splitArguments( argsText ) {

	if ( ! argsText || ! argsText.trim() ) return [];

	const args = [];
	let current = '';
	let angleDepth = 0;
	let bracketDepth = 0;
	let parenDepth = 0;
	let braceDepth = 0;

	for ( let i = 0; i < argsText.length; i ++ ) {

		const char = argsText[ i ];

		if ( char === '<' ) angleDepth ++;
		else if ( char === '>' && angleDepth > 0 ) angleDepth --;
		else if ( char === '[' ) bracketDepth ++;
		else if ( char === ']' && bracketDepth > 0 ) bracketDepth --;
		else if ( char === '(' ) parenDepth ++;
		else if ( char === ')' && parenDepth > 0 ) parenDepth --;
		else if ( char === '{' ) braceDepth ++;
		else if ( char === '}' && braceDepth > 0 ) braceDepth --;

		if ( char === ',' && angleDepth === 0 && bracketDepth === 0 && parenDepth === 0 && braceDepth === 0 ) {

			if ( current.trim() ) args.push( current.trim() );
			current = '';

		} else {

			current += char;

		}

	}

	if ( current.trim() ) args.push( current.trim() );

	return args;

}

function splitTypeTokens( typeStr ) {

	if ( ! typeStr ) return [];

	const tokens = [];
	let current = '';
	let angleDepth = 0;
	let bracketDepth = 0;
	let parenDepth = 0;
	let braceDepth = 0;

	for ( let i = 0; i < typeStr.length; i ++ ) {

		const char = typeStr[ i ];

		if ( char === '<' ) angleDepth ++;
		else if ( char === '>' && angleDepth > 0 ) angleDepth --;
		else if ( char === '[' ) bracketDepth ++;
		else if ( char === ']' && bracketDepth > 0 ) bracketDepth --;
		else if ( char === '(' ) parenDepth ++;
		else if ( char === ')' && parenDepth > 0 ) parenDepth --;
		else if ( char === '{' ) braceDepth ++;
		else if ( char === '}' && braceDepth > 0 ) braceDepth --;

		if ( char === '|' && angleDepth === 0 && bracketDepth === 0 && parenDepth === 0 && braceDepth === 0 ) {

			if ( current.trim() ) tokens.push( current.trim() );
			current = '';

		} else {

			current += char;

		}

	}

	if ( current.trim() ) tokens.push( current.trim() );

	return tokens;

}

function formatTypeHtml( typeStr ) {

	if ( ! typeStr ) return '';

	const cleanType = typeStr.replace( /`/g, '' ).trim();
	const typeTokens = splitTypeTokens( cleanType );
	let typeHtml = '';

	for ( let i = 0; i < typeTokens.length; i ++ ) {

		if ( i > 0 ) typeHtml += ' <span class="tsl-param-type-separator">|</span> ';

		const token = typeTokens[ i ];
		const isString = ( token.startsWith( '\'' ) && token.endsWith( '\'' ) ) || ( token.startsWith( '"' ) && token.endsWith( '"' ) );
		const isKeyword = token === 'null' || token === 'true' || token === 'false';

		const escapedToken = token.replace( /</g, '&lt;' ).replace( />/g, '&gt;' );

		let className = 'tsl-param-type';
		if ( isString ) className += ' tsl-param-type-string';
		else if ( isKeyword ) className += ' tsl-param-type-keyword';

		typeHtml += `<span class="${className}">${escapedToken}</span>`;

	}

	return typeHtml;

}

function formatSignatureArgs( argsText ) {

	if ( ! argsText || ! argsText.trim() ) return '';

	const args = splitArguments( argsText );
	const formattedArgs = [];

	for ( const arg of args ) {

		let cleanArg = arg;
		let isOptional = false;

		// Check if parameter has `?` or default value `= ...`
		if ( cleanArg.includes( '?' ) || cleanArg.includes( '=' ) ) {

			isOptional = true;
			cleanArg = cleanArg.replace( '?', '' );

		}

		const optionalHtml = isOptional ? '<span class="tsl-sig-param-optional">?</span>' : '';

		// Check if it has a colon (typed argument like `callback: Function` or `type: string = null`)
		const colonMatch = cleanArg.match( /^(\.*)?([a-zA-Z0-9_./-]+)\s*:\s*(.+)$/ );
		if ( colonMatch ) {

			const dots = colonMatch[ 1 ] || '';
			const paramName = colonMatch[ 2 ].trim();
			const fullName = dots + paramName;

			formattedArgs.push( `<span class="tsl-sig-param-name">${fullName}</span>${optionalHtml}` );

		} else if ( cleanArg.includes( '=' ) ) {

			// Parameter with default value like `name = null`
			const eqIndex = cleanArg.indexOf( '=' );
			const paramName = cleanArg.substring( 0, eqIndex ).trim();
			const paramVal = cleanArg.substring( eqIndex + 1 ).trim();

			let valHtml = '';
			const isString = ( paramVal.startsWith( '\'' ) && paramVal.endsWith( '\'' ) ) || ( paramVal.startsWith( '"' ) && paramVal.endsWith( '"' ) );
			const isKeyword = paramVal === 'null' || paramVal === 'true' || paramVal === 'false';
			const isNumber = ! isNaN( Number( paramVal ) ) && ! isKeyword;

			if ( isString ) {

				valHtml = `<span class="tsl-param-type-string">${paramVal}</span>`;

			} else if ( isKeyword ) {

				valHtml = `<span class="tsl-param-type-keyword">${paramVal}</span>`;

			} else if ( isNumber ) {

				valHtml = `<span class="tsl-param-type-number">${paramVal}</span>`;

			} else {

				valHtml = `<span class="tsl-sig-param-val">${paramVal}</span>`;

			}

			formattedArgs.push( `<span class="tsl-sig-param-name">${paramName}</span>${optionalHtml} <span class="tsl-sig-param-op">=</span> ${valHtml}` );

		} else {

			// Just a plain parameter name
			formattedArgs.push( `<span class="tsl-sig-param-name">${cleanArg}</span>${optionalHtml}` );

		}

	}

	return formattedArgs.join( ', ' );

}

function formatApiFunctionName( funcName ) {

	const dotIndex = funcName.lastIndexOf( '.' );
	if ( dotIndex !== - 1 ) {

		const prefix = funcName.substring( 0, dotIndex ).trim();
		const name = funcName.substring( dotIndex + 1 ).trim();

		let prefixHtml = '';
		if ( prefix ) {

			if ( prefix.endsWith( '()' ) ) {

				const base = prefix.substring( 0, prefix.length - 2 );
				prefixHtml = `<span class="tsl-sig-func-name">${base}</span><span class="tsl-sig-paren">()</span>`;

			} else {

				prefixHtml = `<span class="tsl-sig-param-val">${prefix}</span>`;

			}

		}

		return `${prefixHtml}<span class="tsl-sig-dot">.</span><span class="tsl-sig-func-name">${name}</span>`;

	}

	return `<span class="tsl-sig-func-name">${funcName}</span>`;

}

function formatApiParameters( argsText ) {

	if ( ! argsText || ! argsText.trim() ) return '';

	const args = splitArguments( argsText );
	let paramsHtml = '';

	for ( const arg of args ) {

		let cleanArg = arg;
		let isOptional = false;

		if ( cleanArg.includes( '?' ) || cleanArg.includes( '=' ) ) {

			isOptional = true;
			cleanArg = cleanArg.replace( '?', '' );

		}

		const optionalHtml = isOptional ? '<span class="tsl-sig-param-optional">?</span>' : '';

		const typedArgMatch = cleanArg.match( /^(\.*)?([a-zA-Z0-9_./-]+)\s*:\s*(.+)$/ );
		if ( typedArgMatch ) {

			const dots = typedArgMatch[ 1 ] || '';
			const paramName = typedArgMatch[ 2 ].trim();
			const typesAndDefault = typedArgMatch[ 3 ].trim();
			const fullName = dots + paramName;

			let typesText = typesAndDefault;
			let defaultVal = '';
			if ( typesAndDefault.includes( '=' ) ) {

				const eqIdx = typesAndDefault.indexOf( '=' );
				typesText = typesAndDefault.substring( 0, eqIdx ).trim();
				defaultVal = typesAndDefault.substring( eqIdx + 1 ).trim();

			}

			let typeHtml = formatTypeHtml( typesText );

			if ( defaultVal ) {

				const isString = ( defaultVal.startsWith( '\'' ) && defaultVal.endsWith( '\'' ) ) || ( defaultVal.startsWith( '"' ) && defaultVal.endsWith( '"' ) );
				const isKeyword = defaultVal === 'null' || defaultVal === 'true' || defaultVal === 'false';
				const isNumber = ! isNaN( Number( defaultVal ) ) && ! isKeyword;

				let className = 'tsl-param-type';
				if ( isString ) className = 'tsl-param-type-string';
				else if ( isKeyword ) className = 'tsl-param-type-keyword';
				else if ( isNumber ) className = 'tsl-param-type-number';

				typeHtml += ` <span class="tsl-sig-param-op">=</span> <span class="${className}">${defaultVal}</span>`;

			}

			paramsHtml += `
		<div class="tsl-param">
			<div class="tsl-param-header">
				<span class="tsl-param-name">${fullName}</span>${optionalHtml}
				${typeHtml}
			</div>
		</div>`;

		}

	}

	return paramsHtml;

}

function parseApiSignature( rawSigText ) {

	const sigText = rawSigText.trim();
	let funcName = '';
	let argsText = '';
	let constName = '';
	let retType = '';
	let rowDesc = '';

	const firstParen = sigText.indexOf( '(' );
	const lastParen = sigText.lastIndexOf( ')' );

	const prefixBeforeParen = firstParen !== - 1 ? sigText.substring( 0, firstParen ).trim() : '';
	const isFunction = firstParen !== - 1 && lastParen > firstParen && /^[\.\w$]+$/i.test( prefixBeforeParen );

	if ( isFunction ) {

		funcName = prefixBeforeParen;
		argsText = sigText.substring( firstParen + 1, lastParen ).trim();

		const remainder = sigText.substring( lastParen + 1 ).trim();
		if ( remainder ) {

			const afterMatch = remainder.match( /^(?:\s*(?::|->)\s*([^—–\-]+?))?(?:\s*[\-—–]\s*([\s\S]*))?$/ );
			if ( afterMatch ) {

				retType = afterMatch[ 1 ] ? afterMatch[ 1 ].trim() : '';
				rowDesc = afterMatch[ 2 ] ? afterMatch[ 2 ].trim() : '';

			}

		}

	} else {

		const match = sigText.match( /^([^:—–\-]+?)(?:\s*(?::|->)\s*([^—–\-]+?))?(?:\s*[\-—–]\s*([\s\S]*))?$/ );
		if ( match ) {

			constName = match[ 1 ] ? match[ 1 ].trim() : sigText;
			retType = match[ 2 ] ? match[ 2 ].trim() : '';
			rowDesc = match[ 3 ] ? match[ 3 ].trim() : '';

		} else {

			constName = sigText;

		}

	}

	return { funcName, argsText, constName, retType, rowDesc };

}

function renderSingleApiCard( signature, body ) {

	const parsedSig = parseApiSignature( signature );
	let returnTypeHtml = '';

	if ( parsedSig.retType ) {

		returnTypeHtml = `<div class="tsl-api-sig-right"><span class="tsl-api-return-arrow">:</span> ${formatTypeHtml( parsedSig.retType )}</div>`;

	}

	let sigHtml = '';
	let paramsHtml = '';

	if ( parsedSig.funcName ) {

		const argsHtml = formatSignatureArgs( parsedSig.argsText );
		const funcNameHtml = formatApiFunctionName( parsedSig.funcName );

		if ( argsHtml ) {

			sigHtml = `<div class="tsl-api-sig-left"><code>${funcNameHtml}<span class="tsl-sig-paren">( </span>${argsHtml}<span class="tsl-sig-paren"> )</span></code></div>`;

		} else {

			sigHtml = `<div class="tsl-api-sig-left"><code>${funcNameHtml}<span class="tsl-sig-paren">()</span></code></div>`;

		}

		if ( ! body || ! body.trim() ) {

			paramsHtml = formatApiParameters( parsedSig.argsText );

		}

	} else {

		const constNameHtml = `<span class="tsl-sig-const-name">${parsedSig.constName}</span>`;
		sigHtml = `<div class="tsl-api-sig-left"><code>${constNameHtml}</code></div>`;

	}

	if ( body ) {

		const paramLines = body.split( '\n' );
		for ( let line of paramLines ) {

			line = line.trim();
			if ( ! line ) continue;

			const paramMatch = line.match( /^[\-\*]\s+\*\*([a-zA-Z0-9_./-]+)\*\*\s*:\s*(?:`([^`]+)`|([^\-—–\n]+?))\s*(?:(?:[\u2014\-–]\s*)([\s\S]*))?$/ );
			if ( paramMatch ) {

				let name = paramMatch[ 1 ].trim();
				const type = ( paramMatch[ 2 ] !== undefined ? paramMatch[ 2 ] : ( paramMatch[ 3 ] || '' ) ).trim();
				const desc = paramMatch[ 4 ] ? paramMatch[ 4 ].trim() : '';
				let isOptional = false;

				if ( name.includes( '?' ) || desc.toLowerCase().startsWith( '(optional)' ) || type.includes( '=' ) ) {

					isOptional = true;
					name = name.replace( '?', '' );

				}

				const optionalHtml = isOptional ? '<span class="tsl-sig-param-optional">?</span>' : '';

				const parsedDesc = marked.parseInline( desc ).replace( /<code>([^<]+)<\/code>/g, ( m, content ) => {

					const trimmed = content.trim();
					const isQuoted = /^(&#39;|&apos;|&quot;|&#34;|['"])([\s\S]+)\1$/.test( trimmed );
					if ( isQuoted ) return `<code><span class="tsl-param-type-string">${content}</span></code>`;
					const isKeyword = trimmed === 'null' || trimmed === 'true' || trimmed === 'false';
					if ( isKeyword ) return `<code><span class="tsl-param-type-keyword">${content}</span></code>`;
					return m;

				} );

				const typeHtml = formatTypeHtml( type );

				paramsHtml += `
		<div class="tsl-param">
			<div class="tsl-param-header">
				<span class="tsl-param-name">${name}</span>${optionalHtml}
				${typeHtml}
			</div>
			${desc ? `<div class="tsl-param-desc">${parsedDesc}</div>` : ''}
		</div>`;

			}

		}

	}

	let rowDesc = parsedSig.rowDesc;
	if ( rowDesc ) {

		rowDesc = rowDesc.replace( /^[\-\u2014\u2013\s]*/, '' ).trim();
		rowDesc = rowDesc.replace( /`([^`]+)`/g, '<code>$1</code>' );

	}

	const isInline = ! body.trim();
	const cardClass = isInline ? 'tsl-api-card tsl-api-card-inline' : 'tsl-api-card';

	const rawCardHtml = `
<div class="${cardClass}">
	<div class="tsl-api-signature">
		${sigHtml}
		${returnTypeHtml}
		${rowDesc ? `<div class="tsl-api-sig-desc">${rowDesc}</div>` : ''}
	</div>
	${paramsHtml ? `<div class="tsl-params">${paramsHtml}</div>` : ''}
</div>`;

	return `\n\n${rawCardHtml.replace( /^\s+/gm, '' )}\n\n`;

}

function renderApiTableCard( group ) {

	let rowsHtml = '';
	const isRobustGroup = group.some( block => block.body.trim().length > 0 );
	const rowClass = isRobustGroup ? 'tsl-api-table-row tsl-api-table-row-robust' : 'tsl-api-table-row';

	for ( const block of group ) {

		const parsedSig = parseApiSignature( block.signature );
		let returnTypeHtml = '';

		if ( parsedSig.retType ) {

			returnTypeHtml = `<div class="tsl-api-sig-right"><span class="tsl-api-return-arrow">:</span> ${formatTypeHtml( parsedSig.retType )}</div>`;

		}

		let sigHtml = '';
		let paramsHtml = '';

		if ( parsedSig.funcName ) {

			const argsHtml = formatSignatureArgs( parsedSig.argsText );
			const funcNameHtml = formatApiFunctionName( parsedSig.funcName );

			if ( argsHtml ) {

				sigHtml = `<div class="tsl-api-sig-left"><code>${funcNameHtml}<span class="tsl-sig-paren">( </span>${argsHtml}<span class="tsl-sig-paren"> )</span></code></div>`;

			} else {

				sigHtml = `<div class="tsl-api-sig-left"><code>${funcNameHtml}<span class="tsl-sig-paren">()</span></code></div>`;

			}

			if ( ! block.body || ! block.body.trim() ) {

				paramsHtml = formatApiParameters( parsedSig.argsText );

			}

		} else {

			const constNameHtml = `<span class="tsl-sig-const-name">${parsedSig.constName}</span>`;
			sigHtml = `<div class="tsl-api-sig-left"><code>${constNameHtml}</code></div>`;

		}

		if ( block.body ) {

			const paramLines = block.body.split( '\n' );
			for ( let line of paramLines ) {

				line = line.trim();
				if ( ! line ) continue;

				const paramMatch = line.match( /^[\-\*]\s+\*\*([a-zA-Z0-9_./-]+)\*\*\s*:\s*(?:`([^`]+)`|([^\-—–\n]+?))\s*(?:(?:[\u2014\-–]\s*)([\s\S]*))?$/ );
				if ( paramMatch ) {

					const name = paramMatch[ 1 ].trim();
					const type = ( paramMatch[ 2 ] !== undefined ? paramMatch[ 2 ] : ( paramMatch[ 3 ] || '' ) ).trim();
					const desc = paramMatch[ 4 ] ? paramMatch[ 4 ].trim() : '';

					const parsedDesc = marked.parseInline( desc ).replace( /<code>([^<]+)<\/code>/g, ( m, content ) => {

						const trimmed = content.trim();
						const isQuoted = /^(&#39;|&apos;|&quot;|&#34;|['"])([\s\S]+)\1$/.test( trimmed );
						if ( isQuoted ) return `<code><span class="tsl-param-type-string">${content}</span></code>`;
						const isKeyword = trimmed === 'null' || trimmed === 'true' || trimmed === 'false';
						if ( isKeyword ) return `<code><span class="tsl-param-type-keyword">${content}</span></code>`;
						return m;

					} );

					const typeHtml = formatTypeHtml( type );

					paramsHtml += `
			<div class="tsl-param">
				<div class="tsl-param-header">
					<span class="tsl-param-name">${name}</span>
					${typeHtml}
				</div>
				${desc ? `<div class="tsl-param-desc">${parsedDesc}</div>` : ''}
			</div>`;

				}

			}

		}

		let rowDesc = parsedSig.rowDesc;
		if ( rowDesc ) {

			rowDesc = rowDesc.replace( /^[\-\u2014\u2013\s]*/, '' ).trim();
			rowDesc = rowDesc.replace( /`([^`]+)`/g, '<code>$1</code>' );

		}

		rowsHtml += `
		<div class="${rowClass}">
			<div class="tsl-api-signature">
				${sigHtml}
				${returnTypeHtml}
				${rowDesc ? `<div class="tsl-api-sig-desc">${rowDesc}</div>` : ''}
			</div>
			${paramsHtml ? `<div class="tsl-params">${paramsHtml}</div>` : ''}
		</div>`;

	}

	const rawCardHtml = `
<div class="tsl-api-table-card">
${rowsHtml}
</div>`;

	return `\n\n${rawCardHtml.replace( /^\s+/gm, '' )}\n\n`;

}

function renderTweetGroup( tweets ) {

	if ( tweets.length === 0 ) return '';

	let tweetsHtml = '';
	for ( const tweet of tweets ) {

		const shortAttributes = tweet.isShort ? 'data-cards="hidden" data-conversation="none"' : '';
		const safeUrl = `https://x.com/${encodeURIComponent( tweet.username )}/status/${encodeURIComponent( tweet.id )}`;
		const safeUsername = encodeURIComponent( tweet.username );

		tweetsHtml += `
		<div class="x-tweet-card">
			<blockquote class="twitter-tweet" data-theme="dark" ${shortAttributes}>
				<div class="x-tweet-fallback">
					<div class="x-tweet-fallback-header">
						<span class="x-tweet-author">@${safeUsername}</span>
						<span class="x-tweet-platform-icon">𝕏</span>
					</div>
					<div class="x-tweet-fallback-body">
						<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">View post on X</a>
					</div>
				</div>
			</blockquote>
		</div>`;

	}

	const gridClass = tweets.length > 1 ? 'x-tweets-grid' : 'x-tweet-single';

	return `\n\n<div class="${gridClass}">${tweetsHtml}</div>\n\n`;

}

function tokenizeInlineCode( codeContent ) {

	if ( codeContent.includes( 'class="tsl-' ) ) return codeContent;

	// Decode HTML entities so we can parse actual operators like > or < (&amp; must be unescaped last to avoid double unescaping)
	const decoded = codeContent
		.replace( /&gt;/g, '>' )
		.replace( /&lt;/g, '<' )
		.replace( /&quot;/g, '"' )
		.replace( /&#34;/g, '"' )
		.replace( /&#39;/g, '\'' )
		.replace( /&apos;/g, '\'' )
		.replace( /&amp;/g, '&' );

	// Helper to escape characters back to HTML entities safely
	const escapeHtml = ( str ) => {

		return str
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );

	};

	const tokenRegex = new RegExp(
		'(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)|' +
		'(\'[^\']*\'|\"[^\"]*\")|' +
		'(\\b\\d+(?:\\.\\d+)?\\b)|' +
		'(\\b(?:const|let|var|function|return|true|false|null|if|else|for|while|new)\\b)|' +
		'(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b(?=\\s*\\())|' +
		'(\\bTSL\\b)|' +
		'(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b)|' +
		'([\\(\\)])|' +
		'([\\{\\}])|' +
		'([\\[\\]\\.\\+\\-\\*\\/=,;:<>!&|~^%?])',
		'g'
	);

	return decoded.replace( tokenRegex, ( match, comment, str, num, keyword, func, namespace, ident, paren, brace, op ) => {

		if ( comment ) {

			return `<span class="tsl-comment">${escapeHtml( comment )}</span>`;

		} else if ( str ) {

			return `<span class="tsl-param-type-string">${escapeHtml( str )}</span>`;

		} else if ( num ) {

			return `<span class="tsl-param-type-number">${escapeHtml( num )}</span>`;

		} else if ( keyword ) {

			return `<span class="tsl-param-type-keyword">${escapeHtml( keyword )}</span>`;

		} else if ( func ) {

			const className = isTslBuiltIn( func ) ? 'tsl-function-builtin' : 'tsl-function';
			return `<span class="${className}">${escapeHtml( func )}</span>`;

		} else if ( namespace ) {

			return `<span class="tsl-namespace">${escapeHtml( namespace )}</span>`;

		} else if ( ident ) {

			if ( isTslBuiltIn( ident ) ) {

				return `<span class="tsl-function-builtin">${escapeHtml( ident )}</span>`;

			}

			return `<span class="tsl-identifier">${escapeHtml( ident )}</span>`;

		} else if ( paren ) {

			return `<span class="tsl-bracket">${escapeHtml( paren )}</span>`;

		} else if ( brace ) {

			return `<span class="tsl-brace">${escapeHtml( brace )}</span>`;

		} else if ( op ) {

			return `<span class="tsl-operator">${escapeHtml( op )}</span>`;

		}

		return escapeHtml( match );

	} );

}

let tslKeys = null;
const TSL_EXCEPTIONS = new Set( [ 'Case', 'Default', 'ElseIf', 'Else' ] );

function isTslBuiltIn( name ) {

	if ( ! tslKeys ) {

		tslKeys = new Set( [
			...Object.keys( TSL ),
			...Object.keys( THREE )
		] );

	}

	return tslKeys.has( name ) || TSL_EXCEPTIONS.has( name );

}

function tokenizeCodeToElement( codeContent, targetElement ) {

	targetElement.textContent = '';

	// Decode HTML entities so we can parse actual operators like > or < (&amp; must be unescaped last to avoid double unescaping)
	const decoded = codeContent
		.replace( /&gt;/g, '>' )
		.replace( /&lt;/g, '<' )
		.replace( /&quot;/g, '"' )
		.replace( /&#34;/g, '"' )
		.replace( /&#39;/g, '\'' )
		.replace( /&apos;/g, '\'' )
		.replace( /&amp;/g, '&' );

	const tokenRegex = new RegExp(
		'(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)|' +
		'(\'[^\']*\'|\"[^\"]*\")|' +
		'(\\b\\d+(?:\\.\\d+)?\\b)|' +
		'(\\b(?:const|let|var|function|return|true|false|null|if|else|for|while|new)\\b)|' +
		'(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b(?=\\s*\\())|' +
		'(\\bTSL\\b)|' +
		'(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b)|' +
		'([\\(\\)])|' +
		'([\\{\\}])|' +
		'([\\[\\]\\.\\+\\-\\*\\/=,;:<>!&|~^%?])',
		'g'
	);

	let lastIndex = 0;
	let match;

	while ( ( match = tokenRegex.exec( decoded ) ) !== null ) {

		const index = match.index;
		if ( index > lastIndex ) {

			targetElement.appendChild( document.createTextNode( decoded.substring( lastIndex, index ) ) );

		}

		const [ fullMatch, comment, str, num, keyword, func, namespace, ident, paren, brace, op ] = match;

		let className = '';
		if ( comment ) className = 'tsl-comment';
		else if ( str ) className = 'tsl-param-type-string';
		else if ( num ) className = 'tsl-param-type-number';
		else if ( keyword ) className = 'tsl-param-type-keyword';
		else if ( func ) className = isTslBuiltIn( func ) ? 'tsl-function-builtin' : 'tsl-function';
		else if ( namespace ) className = 'tsl-namespace';
		else if ( ident ) className = isTslBuiltIn( ident ) ? 'tsl-function-builtin' : 'tsl-identifier';
		else if ( paren ) className = 'tsl-bracket';
		else if ( brace ) className = 'tsl-brace';
		else if ( op ) className = 'tsl-operator';

		if ( className ) {

			const span = document.createElement( 'span' );
			span.className = className;
			span.textContent = fullMatch;
			targetElement.appendChild( span );

		} else {

			targetElement.appendChild( document.createTextNode( fullMatch ) );

		}

		lastIndex = tokenRegex.lastIndex;

	}

	if ( lastIndex < decoded.length ) {

		targetElement.appendChild( document.createTextNode( decoded.substring( lastIndex ) ) );

	}

}

export { parseTour, parse, tokenizeInlineCode, tokenizeCodeToElement };
