import { marked } from 'marked';
import * as THREE from 'three';
import * as TSL from 'three/tsl';

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

		if ( ! node.isFolder ) {

			let finalDescription = description;
			if ( ! finalDescription.startsWith( '# ' ) ) {

				finalDescription = `# ${node.title}\n\n${finalDescription}`;

			}

			node.description = finalDescription;
			node.code = code;
			node.defaultNode = defaultNode;
			node.level = level;
			node.category = node.category || parentCategory;

			const fullPath = [ ...path ];

			if ( node.category && fullPath.length === 0 ) {

				fullPath.push( node.category );

			}

			node.path = fullPath;

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

	// Group consecutive > Important: callout blocks
	const importantRegex = /(?:^|\n)[ \t]*>[ \t]*Important:[ \t]*([^\n]+(?:\n[ \t]*[^\n<>:|]+)*)/gi;
	const impMatches = [];
	let impMatch;
	while ( ( impMatch = importantRegex.exec( html ) ) !== null ) {

		impMatches.push( {
			index: impMatch.index,
			length: impMatch[ 0 ].length,
			content: impMatch[ 1 ].trim()
		} );

	}

	const impGroups = [];
	let currentImpGroup = [];
	for ( let i = 0; i < impMatches.length; i ++ ) {

		const m = impMatches[ i ];
		if ( currentImpGroup.length === 0 ) {

			currentImpGroup.push( m );

		} else {

			const prev = currentImpGroup[ currentImpGroup.length - 1 ];
			const between = html.substring( prev.index + prev.length, m.index );
			if ( /^\s*$/.test( between ) ) {

				currentImpGroup.push( m );

			} else {

				impGroups.push( currentImpGroup );
				currentImpGroup = [ m ];

			}

		}

	}

	if ( currentImpGroup.length > 0 ) {

		impGroups.push( currentImpGroup );

	}

	for ( let g = impGroups.length - 1; g >= 0; g -- ) {

		const group = impGroups[ g ];
		const first = group[ 0 ];
		const last = group[ group.length - 1 ];

		const itemsHtml = group.map( item => `<div class="tour-important-item">${marked.parseInline( item.content )}</div>` ).join( '<div class="tour-important-divider"></div>' );

		const groupHtml = `\n\n<div class="tour-important-block"><div class="tour-important-header"><span class="tour-important-icon">⚠️</span> Important</div><div class="tour-important-content">${itemsHtml}</div></div>\n\n`;

		html = html.substring( 0, first.index ) + groupHtml + html.substring( last.index + last.length );

	}

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

	let parsedHtml = marked.parse( html );

	// Tokenize and style inline code tags to match Monaco editor colors
	parsedHtml = parsedHtml.replace( /<code>([\s\S]*?)<\/code>/gi, ( match, codeContent ) => {

		return `<code>${tokenizeInlineCode( codeContent )}</code>`;

	} );

	return parsedHtml;

}

function formatSignatureArgs( argsText ) {

	if ( ! argsText || ! argsText.trim() ) return '';

	const args = argsText.split( ',' ).map( a => a.trim() );
	const formattedArgs = [];

	for ( const arg of args ) {

		let cleanArg = arg;
		let isOptional = false;

		// Check if parameter name has `?` (e.g. `adjustment?` or `adjustment? = 1`)
		if ( cleanArg.includes( '?' ) ) {

			isOptional = true;
			cleanArg = cleanArg.replace( '?', '' );

		}

		const optionalHtml = isOptional ? `<span class="tsl-sig-param-optional">?</span>` : '';

		// Check if it has a colon (typed argument like `callback: Function`)
		const colonMatch = cleanArg.match( /^(\.*)?([a-zA-Z0-9_]+)\s*:\s*(.+)$/ );
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
	if ( dotIndex !== -1 ) {

		const prefix = funcName.substring( 0, dotIndex ).trim();
		const name = funcName.substring( dotIndex + 1 ).trim();

		let prefixHtml = '';
		if ( prefix ) {

			prefixHtml = `<span class="tsl-sig-param-val">${prefix}</span>`;

		}

		return `${prefixHtml}<span class="tsl-sig-dot">.</span><span class="tsl-sig-func-name">${name}</span>`;

	}

	return `<span class="tsl-sig-func-name">${funcName}</span>`;

}

function renderSingleApiCard( signature, body ) {

	let sigText = signature;
	let rowDesc = '';
	let returnTypeHtml = '';

	const sigMatch = sigText.match( /^([^\s:\-—–]+(?:\([^\)]*\))?)(?:\s*(?::|->)\s*([a-zA-Z0-9_|]+))?\s*[\-—–]\s*(.+)$/ );
	if ( sigMatch ) {

		sigText = sigMatch[ 1 ].trim();
		const retType = sigMatch[ 2 ] ? sigMatch[ 2 ].trim() : '';
		const rawDesc = sigMatch[ 3 ] ? sigMatch[ 3 ].trim() : '';
		rowDesc = rawDesc.replace( /^[\-\u2014\u2013\s]*/, '' ).trim();
		rowDesc = rowDesc.replace( /`([^`]+)`/g, '<code>$1</code>' );

		if ( retType ) {

			const retTypeTokens = retType.split( '|' ).map( t => t.trim() );
			let retHtml = '';
			for ( let i = 0; i < retTypeTokens.length; i ++ ) {

				if ( i > 0 ) retHtml += ' <span class="tsl-param-type-separator">|</span> ';
				retHtml += `<span class="tsl-param-type">${retTypeTokens[ i ]}</span>`;

			}

			returnTypeHtml = `<div class="tsl-api-sig-right"><span class="tsl-api-return-arrow">:</span> ${retHtml}</div>`;

		}

	}

	let sigHtml = '';
	let paramsHtml = '';

	const parenMatch = sigText.match( /^(.*?)\((.*?)\)$/ );
	if ( parenMatch ) {

		const funcName = parenMatch[ 1 ].trim();
		const argsText = parenMatch[ 2 ].trim();

		const argsHtml = formatSignatureArgs( argsText );
		const funcNameHtml = formatApiFunctionName( funcName );
		sigHtml = `<div class="tsl-api-sig-left"><code>${funcNameHtml}<span class="tsl-sig-paren">(</span></code>${argsHtml}<code><span class="tsl-sig-paren">)</span></code></div>`;

		// Auto-generate single parameter descriptor for single-argument typed signatures
		const typedArgMatch = argsText.match( /^(\.*)?([a-zA-Z0-9_]+)\s*:\s*(.+)$/ );
		if ( typedArgMatch ) {

			const dots = typedArgMatch[ 1 ] || '';
			const paramName = typedArgMatch[ 2 ].trim();
			const typesText = typedArgMatch[ 3 ].trim();
			const fullName = dots + paramName;

			const typeTokens = typesText.split( '|' ).map( t => t.trim() );
			let typeHtml = '';
			for ( let i = 0; i < typeTokens.length; i ++ ) {

				if ( i > 0 ) typeHtml += ' <span class="tsl-param-type-separator">|</span> ';

				const token = typeTokens[ i ];
				const isString = ( token.startsWith( '\'' ) && token.endsWith( '\'' ) ) || ( token.startsWith( '"' ) && token.endsWith( '"' ) );
				const isKeyword = token === 'null' || token === 'true' || token === 'false';

				let className = 'tsl-param-type';
				if ( isString ) className += ' tsl-param-type-string';
				else if ( isKeyword ) className += ' tsl-param-type-keyword';

				typeHtml += `<span class="${className}">${token}</span>`;

			}

			paramsHtml = `
		<div class="tsl-param">
			<div class="tsl-param-header">
				<span class="tsl-param-name">${fullName}</span>
				${typeHtml}
			</div>
		</div>`;

		}

	} else {

		const constNameHtml = `<span class="tsl-sig-const-name">${sigText}</span>`;
		sigHtml = `<div class="tsl-api-sig-left"><code>${constNameHtml}</code></div>`;

	}

	if ( body ) {

		const paramLines = body.split( '\n' );
		for ( let line of paramLines ) {

			line = line.trim();
			if ( ! line ) continue;

			const paramMatch = line.match( /^[\-\*]\s+\*\*([a-zA-Z0-9_.]+)\*\*\s*:\s*`([^`]+)`\s*(?:[\u2014\-]\s*)?([\s\S]*)$/ );
			if ( paramMatch ) {

				const name = paramMatch[ 1 ].trim();
				const type = paramMatch[ 2 ].trim();
				const desc = paramMatch[ 3 ].trim();

				const parsedDesc = marked.parseInline( desc ).replace( /<code>([^<]+)<\/code>/g, ( m, content ) => {

					const trimmed = content.trim();
					const isQuoted = /^(&#39;|&apos;|&quot;|&#34;|['"])([\s\S]+)\1$/.test( trimmed );
					if ( isQuoted ) return `<code><span class="tsl-param-type-string">${content}</span></code>`;
					const isKeyword = trimmed === 'null' || trimmed === 'true' || trimmed === 'false';
					if ( isKeyword ) return `<code><span class="tsl-param-type-keyword">${content}</span></code>`;
					return m;

				} );

				const typeTokens = type.split( '|' ).map( t => t.trim() );
				let typeHtml = '';
				for ( let i = 0; i < typeTokens.length; i ++ ) {

					if ( i > 0 ) typeHtml += ' <span class="tsl-param-type-separator">|</span> ';

					const token = typeTokens[ i ];
					const isString = ( token.startsWith( '\'' ) && token.endsWith( '\'' ) ) || ( token.startsWith( '"' ) && token.endsWith( '"' ) );
					const isKeyword = token === 'null' || token === 'true' || token === 'false';

					let className = 'tsl-param-type';
					if ( isString ) className += ' tsl-param-type-string';
					else if ( isKeyword ) className += ' tsl-param-type-keyword';

					typeHtml += `<span class="${className}">${token}</span>`;

				}

				paramsHtml += `
		<div class="tsl-param">
			<div class="tsl-param-header">
				<span class="tsl-param-name">${name}</span>
				${typeHtml}
			</div>
			<div class="tsl-param-desc">${parsedDesc}</div>
		</div>`;

			}

		}

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

		let sigText = block.signature;
		let rowDesc = '';
		let returnTypeHtml = '';

		const sigMatch = sigText.match( /^([^\s:\-—–]+(?:\([^\)]*\))?)(?:\s*(?::|->)\s*([a-zA-Z0-9_|]+))?\s*[\-—–]\s*(.+)$/ );
		if ( sigMatch ) {

			sigText = sigMatch[ 1 ].trim();
			const retType = sigMatch[ 2 ] ? sigMatch[ 2 ].trim() : '';
			const rawDesc = sigMatch[ 3 ] ? sigMatch[ 3 ].trim() : '';
			rowDesc = rawDesc.replace( /^[\-\u2014\u2013\s]*/, '' ).trim();
			rowDesc = rowDesc.replace( /`([^`]+)`/g, '<code>$1</code>' );

			if ( retType ) {

				const retTypeTokens = retType.split( '|' ).map( t => t.trim() );
				let retHtml = '';
				for ( let i = 0; i < retTypeTokens.length; i ++ ) {

					if ( i > 0 ) retHtml += ' <span class="tsl-param-type-separator">|</span> ';
					retHtml += `<span class="tsl-param-type">${retTypeTokens[ i ]}</span>`;

				}

				returnTypeHtml = `<div class="tsl-api-sig-right"><span class="tsl-api-return-arrow">:</span> ${retHtml}</div>`;

			}

		}

		let sigHtml = '';
		let paramsHtml = '';

		const parenMatch = sigText.match( /^(.*?)\((.*?)\)$/ );
		if ( parenMatch ) {

			const funcName = parenMatch[ 1 ].trim();
			const argsText = parenMatch[ 2 ].trim();

			const argsHtml = formatSignatureArgs( argsText );
			const funcNameHtml = formatApiFunctionName( funcName );
			sigHtml = `<div class="tsl-api-sig-left"><code>${funcNameHtml}<span class="tsl-sig-paren">(</span></code>${argsHtml}<code><span class="tsl-sig-paren">)</span></code></div>`;

			// Auto-generate single parameter descriptor for single-argument typed signatures
			const typedArgMatch = argsText.match( /^(\.*)?([a-zA-Z0-9_]+)\s*:\s*(.+)$/ );
			if ( typedArgMatch ) {

				const dots = typedArgMatch[ 1 ] || '';
				const paramName = typedArgMatch[ 2 ].trim();
				const typesText = typedArgMatch[ 3 ].trim();
				const fullName = dots + paramName;

				const typeTokens = typesText.split( '|' ).map( t => t.trim() );
				let typeHtml = '';
				for ( let i = 0; i < typeTokens.length; i ++ ) {

					if ( i > 0 ) typeHtml += ' <span class="tsl-param-type-separator">|</span> ';

					const token = typeTokens[ i ];
					const isString = ( token.startsWith( '\'' ) && token.endsWith( '\'' ) ) || ( token.startsWith( '"' ) && token.endsWith( '"' ) );
					const isKeyword = token === 'null' || token === 'true' || token === 'false';

					let className = 'tsl-param-type';
					if ( isString ) className += ' tsl-param-type-string';
					else if ( isKeyword ) className += ' tsl-param-type-keyword';

					typeHtml += `<span class="${className}">${token}</span>`;

				}

				paramsHtml = `
			<div class="tsl-param">
				<div class="tsl-param-header">
					<span class="tsl-param-name">${fullName}</span>
					${typeHtml}
				</div>
			</div>`;

			}

		} else {

			const constNameHtml = `<span class="tsl-sig-const-name">${sigText}</span>`;
			sigHtml = `<div class="tsl-api-sig-left"><code>${constNameHtml}</code></div>`;

		}

		if ( block.body ) {

			const paramLines = block.body.split( '\n' );
			for ( let line of paramLines ) {

				line = line.trim();
				if ( ! line ) continue;

				const paramMatch = line.match( /^[\-\*]\s+\*\*([a-zA-Z0-9_.]+)\*\*\s*:\s*`([^`]+)`\s*(?:[\u2014\-]\s*)?([\s\S]*)$/ );
				if ( paramMatch ) {

					const name = paramMatch[ 1 ].trim();
					const type = paramMatch[ 2 ].trim();
					const desc = paramMatch[ 3 ].trim();

					const parsedDesc = marked.parseInline( desc ).replace( /<code>([^<]+)<\/code>/g, ( m, content ) => {

						const trimmed = content.trim();
						const isQuoted = /^(&#39;|&apos;|&quot;|&#34;|['"])([\s\S]+)\1$/.test( trimmed );
						if ( isQuoted ) return `<code><span class="tsl-param-type-string">${content}</span></code>`;
						const isKeyword = trimmed === 'null' || trimmed === 'true' || trimmed === 'false';
						if ( isKeyword ) return `<code><span class="tsl-param-type-keyword">${content}</span></code>`;
						return m;

					} );

					const typeTokens = type.split( '|' ).map( t => t.trim() );
					let typeHtml = '';
					for ( let i = 0; i < typeTokens.length; i ++ ) {

						if ( i > 0 ) typeHtml += ' <span class="tsl-param-type-separator">|</span> ';

						const token = typeTokens[ i ];
						const isString = ( token.startsWith( '\'' ) && token.endsWith( '\'' ) ) || ( token.startsWith( '"' ) && token.endsWith( '"' ) );
						const isKeyword = token === 'null' || token === 'true' || token === 'false';

						let className = 'tsl-param-type';
						if ( isString ) className += ' tsl-param-type-string';
						else if ( isKeyword ) className += ' tsl-param-type-keyword';

						typeHtml += `<span class="${className}">${token}</span>`;

					}

					paramsHtml += `
			<div class="tsl-param">
				<div class="tsl-param-header">
					<span class="tsl-param-name">${name}</span>
					${typeHtml}
				</div>
				<div class="tsl-param-desc">${parsedDesc}</div>
			</div>`;

				}

			}

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

		tweetsHtml += `
		<div class="x-tweet-card">
			<blockquote class="twitter-tweet" data-theme="dark" ${shortAttributes}>
				<div class="x-tweet-fallback">
					<div class="x-tweet-fallback-header">
						<span class="x-tweet-author">@${tweet.username}</span>
						<span class="x-tweet-platform-icon">𝕏</span>
					</div>
					<div class="x-tweet-fallback-body">
						<a href="${tweet.url}" target="_blank" rel="noopener noreferrer">View post on X</a>
					</div>
				</div>
			</blockquote>
		</div>`;

	}

	const gridClass = tweets.length > 1 ? 'x-tweets-grid' : 'x-tweet-single';

	return `\n\n<div class="${gridClass}">${tweetsHtml}</div>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>\n\n`;

}

function tokenizeInlineCode( codeContent ) {

	if ( codeContent.includes( 'class="tsl-' ) ) return codeContent;

	// Decode HTML entities so we can parse actual operators like > or <
	const decoded = codeContent
		.replace( /&gt;/g, '>' )
		.replace( /&lt;/g, '<' )
		.replace( /&amp;/g, '&' )
		.replace( /&quot;/g, '"' )
		.replace( /&#39;/g, "'" )
		.replace( /&apos;/g, "'" );

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

export { parseTour, parse };
