class SearchManager {

	constructor( tour ) {

		this.tour = tour;
		this.index = new Map(); // word -> Set of page IDs / node references
		this.casedVocabulary = new Map(); // lowercase -> original case
		this.debounceTimeout = null;

	}

	buildIndex() {

		this.index.clear();
		this.casedVocabulary.clear();

		// Index words from all pages and category folders
		const collectAllNodes = ( nodes ) => {

			const all = [];
			for ( const n of nodes ) {

				all.push( n );
				if ( n.children && n.children.length > 0 ) {

					all.push( ...collectAllNodes( n.children ) );

				}

			}

			return all;

		};

		const allNodes = collectAllNodes( this.tour.pageTree || [] );

		allNodes.forEach( node => {

			const rawContent = [
				node.title || '',
				( node.path || [] ).join( ' ' ),
				this.getCleanText( node.description || '' )
			].join( ' ' );

			const casedWords = rawContent.split( /[^a-zA-Z0-9_]+/ ).filter( w => w.length > 1 );
			casedWords.forEach( word => {

				const lower = word.toLowerCase();
				if ( ! this.casedVocabulary.has( lower ) || ( word !== lower && this.casedVocabulary.get( lower ) === lower ) ) {

					this.casedVocabulary.set( lower, word );

				}

			} );

			const content = rawContent.toLowerCase();
			const words = content.split( /[^a-z0-9_]+/ ).filter( w => w.length > 1 );
			words.forEach( word => {

				if ( ! this.index.has( word ) ) {

					this.index.set( word, new Set() );

				}

				this.index.get( word ).add( node.id || node.title );

			} );

		} );

	}

	calculateScore( item, rawQuery, queryTerms ) {

		const title = item.title || '';
		const titleLower = title.toLowerCase();
		const queryLower = rawQuery.toLowerCase();
		const pathText = ( item.path || [] ).join( ' ' ).toLowerCase();
		const rawDesc = item.description || '';
		const cleanDesc = rawDesc ? this.getCleanText( rawDesc ).toLowerCase() : '';

		let score = 0;
		let matchedTermsCount = 0;

		// 1. Exact Match on Title
		if ( titleLower === queryLower ) {

			score += 10000;

		} else if ( titleLower.startsWith( queryLower ) ) {

			score += 6000;

		} else if ( titleLower.includes( queryLower ) ) {

			score += 4000;

		}

		// 2. Term-by-term Title Matching
		const titleWords = titleLower.split( /[^a-z0-9_]+/ ).filter( Boolean );
		let termsInTitleCount = 0;

		for ( const term of queryTerms ) {

			let termMatched = false;

			if ( titleWords.includes( term ) ) {

				score += 1500;
				termMatched = true;
				termsInTitleCount ++;

			} else if ( titleWords.some( w => w.startsWith( term ) ) ) {

				score += 1000;
				termMatched = true;
				termsInTitleCount ++;

			} else if ( titleLower.includes( term ) ) {

				score += 600;
				termMatched = true;
				termsInTitleCount ++;

			}

			// Path / Category matches
			if ( pathText.includes( term ) ) {

				score += 300;
				termMatched = true;

			}

			// API signatures match (::: api name or .name)
			if ( rawDesc ) {

				const apiRegex = new RegExp( `:::\\s*api\\s+\\.?${term}`, 'i' );
				if ( apiRegex.test( rawDesc ) ) {

					score += 2500;
					termMatched = true;

				} else if ( cleanDesc.includes( term ) ) {

					score += 150;
					termMatched = true;

					const freq = ( cleanDesc.split( term ).length - 1 );
					score += Math.min( freq * 15, 150 );

				}

			}

			if ( termMatched ) {

				matchedTermsCount ++;

			}

		}

		// All terms matched in title bonus
		if ( queryTerms.length > 1 && termsInTitleCount === queryTerms.length ) {

			score += 3500;

		}

		// Exact phrase in description
		if ( cleanDesc && queryLower.length > 3 && cleanDesc.includes( queryLower ) ) {

			score += 1000;

		}

		// Folder title boost: if a category/folder matches the query, rank it very high
		if ( item.isFolder && ( titleLower === queryLower || titleLower.includes( queryLower ) || termsInTitleCount > 0 ) ) {

			score += 5000;

		}

		// Coverage Multiplier:
		// Highly favor matches that cover ALL search terms vs only 1 term in multi-term queries
		if ( queryTerms.length > 1 ) {

			const ratio = matchedTermsCount / queryTerms.length;
			if ( ratio >= 1.0 ) {

				score *= 2.5;

			} else if ( ratio >= 0.5 ) {

				score *= 0.8;

			} else {

				score *= 0.2;

			}

		}

		return Math.round( score );

	}

	getRankedTree( tree, query, queryTerms ) {

		const processNodes = ( nodes ) => {

			const result = [];

			for ( const node of nodes ) {

				const copy = { ...node };
				const nodeScore = this.calculateScore( node, query, queryTerms );

				let filteredChildren = [];
				let childrenMaxScore = 0;

				if ( node.children && node.children.length > 0 ) {

					filteredChildren = processNodes( node.children );
					if ( filteredChildren.length > 0 ) {

						childrenMaxScore = Math.max( ...filteredChildren.map( c => c.searchScore || 0 ) );

					}

				}

				// If the folder itself matched strongly, but some children had 0 individual score,
				// include all children so the category contents are visible!
				if ( node.isFolder && nodeScore > 2000 && filteredChildren.length === 0 && node.children.length > 0 ) {

					filteredChildren = node.children.map( c => ( {
						...c,
						searchScore: nodeScore - 500
					} ) );

				}

				const isMatch = ( nodeScore > 0 ) || ( filteredChildren.length > 0 );

				if ( isMatch ) {

					copy.children = filteredChildren;
					copy.searchScore = Math.max( nodeScore, childrenMaxScore );

					// Generate snippet for leaf pages
					if ( ! copy.isFolder && copy.description ) {

						const cleanText = this.getCleanText( copy.description );
						copy.searchSnippet = this.getSearchSnippet( cleanText, queryTerms, copy.title );

					} else {

						delete copy.searchSnippet;

					}

					result.push( copy );

				}

			}

			// Sort by searchScore descending!
			result.sort( ( a, b ) => ( b.searchScore || 0 ) - ( a.searchScore || 0 ) );

			return result;

		};

		return processNodes( tree );

	}

	performSearch( query ) {

		const trimmed = query.trim();

		if ( trimmed.length === 0 ) {

			this.tour.dom.tocList.classList.remove( 'search-active' );

			const cleanTree = ( nodes ) => {

				nodes.forEach( n => {

					delete n.searchSnippet;
					delete n.searchScore;
					if ( n.children ) cleanTree( n.children );

				} );

			};

			cleanTree( this.tour.pageTree );
			this.tour.setupTOC( this.tour.pageTree );

		} else {

			this.tour.dom.tocList.classList.add( 'search-active' );

			const queryLower = trimmed.toLowerCase();
			const queryTerms = queryLower.split( /\s+/ ).map( t => t.replace( /^[^a-z0-9_]+|[^a-z0-9_]+$/g, '' ) ).filter( Boolean );

			let rankedTree = this.getRankedTree( this.tour.pageTree, trimmed, queryTerms );

			let suggestion = null;
			if ( rankedTree.length === 0 ) {

				suggestion = this.getSpellingSuggestion( query );
				if ( suggestion ) {

					const suggTrimmed = suggestion.trim().toLowerCase();
					const suggQueryTerms = suggTrimmed.split( /\s+/ ).map( t => t.replace( /^[^a-z0-9_]+|[^a-z0-9_]+$/g, '' ) ).filter( Boolean );
					rankedTree = this.getRankedTree( this.tour.pageTree, suggestion, suggQueryTerms );

				}

			}

			this.tour.setupTOC( rankedTree, null, suggestion );

		}

		const sidebarContent = this.tour.dom.sidebar.querySelector( '.sidebar-content' );
		if ( sidebarContent ) {

			sidebarContent.scrollTop = 0;

		}

	}

	scrollToSearchMatch() {

		const query = this.tour.dom.searchInput.value.trim();
		if ( query.length === 0 ) return;

		const queryTerms = query.toLowerCase().split( /\s+/ ).map( t => t.replace( /^[^a-z0-9_]+|[^a-z0-9_]+$/g, '' ) ).filter( t => t.length > 0 );
		if ( queryTerms.length === 0 ) return;

		let targetElement = null;

		// 1. Prioritize API classes, summaries, signatures, and rows
		const apiElements = this.tour.dom.contentArea.querySelectorAll( '.tsl-api-class-summary, .tsl-api-class-name, .tsl-api-class-extends-name, .tsl-api-table-row, .tsl-api-signature, .tsl-api-sig-name, .tsl-api-card, .tsl-api-param, .tsl-api-inherited-summary' );
		for ( const el of apiElements ) {

			const text = el.textContent.toLowerCase();
			const matches = queryTerms.every( term => text.includes( term ) );
			if ( matches ) {

				targetElement = el.closest( '.tsl-api-table-row' ) || el.closest( '.tsl-api-class-summary' ) || el.closest( '.tsl-api-inherited-summary' ) || el;

				let parent = targetElement.parentElement;
				while ( parent && parent !== this.tour.dom.contentArea ) {

					if ( parent.tagName === 'DETAILS' ) {

						parent.open = true;

					}

					parent = parent.parentElement;

				}

				break;

			}

		}

		// 2. If no API element matched, check general text elements
		if ( ! targetElement ) {

			const generalElements = this.tour.dom.contentArea.querySelectorAll( 'h1, h2, h3, p, li, td, code, blockquote, .tour-note-block, .tour-important-block, .tour-ai-accordion, .tour-ai-content' );
			for ( const el of generalElements ) {

				const text = el.textContent.toLowerCase();
				const matches = queryTerms.every( term => text.includes( term ) );
				if ( matches ) {

					targetElement = el;

					let parent = el.parentElement;
					while ( parent && parent !== this.tour.dom.contentArea ) {

						if ( parent.tagName === 'DETAILS' ) {

							parent.open = true;

						}

						parent = parent.parentElement;

					}

					break;

				}

			}

		}

		if ( ! targetElement && this.tour.readOnlyEditors ) {

			for ( const editor of this.tour.readOnlyEditors ) {

				const codeText = ( editor.getValue() || '' ).toLowerCase();
				const matches = queryTerms.every( term => codeText.includes( term ) );
				if ( matches && editor.container ) {

					targetElement = editor.container.closest( '.tsl-embed-container' ) || editor.container;
					break;

				}

			}

		}

		if ( targetElement ) {

			const previousFlashes = this.tour.dom.contentArea.querySelectorAll( '.search-match-flash' );
			previousFlashes.forEach( el => el.classList.remove( 'search-match-flash' ) );

			const observer = new IntersectionObserver( ( entries ) => {

				entries.forEach( entry => {

					if ( entry.isIntersecting ) {

						observer.unobserve( targetElement );
						targetElement.classList.add( 'search-match-flash' );

					}

				} );

			}, {
				root: this.tour.dom.contentArea,
				threshold: 0.1
			} );

			observer.observe( targetElement );
			targetElement.scrollIntoView( { behavior: 'smooth', block: 'center' } );

		}

	}

	updateHashWithSearch( query ) {

		const hash = window.location.hash.substring( 1 );
		if ( hash.startsWith( 'playground=' ) || hash.startsWith( 'playground/' ) ) return;

		const hashParts = hash.split( '&' );
		const pageId = hashParts[ 0 ] || ( this.tour.pages[ this.tour.currentPageIndex ] ? this.tour.pages[ this.tour.currentPageIndex ].id : '' );
		if ( ! pageId ) return;

		let selectedNode = '';
		for ( let i = 1; i < hashParts.length; i ++ ) {

			const part = hashParts[ i ];
			if ( ! part.startsWith( 'q=' ) ) {

				selectedNode = part;

			}

		}

		let newHash = pageId;
		if ( selectedNode ) {

			newHash += '&' + selectedNode;

		}

		if ( query.trim().length > 0 ) {

			newHash += '&q=' + encodeURIComponent( query.trim() );

		}

		history.replaceState( null, null, '#' + newHash );
		this.tour.lastTourPageHash = newHash;

	}

	restoreSearchFromHash( hash ) {

		const hashParts = hash.split( '&' );
		let searchQuery = '';

		for ( let i = 1; i < hashParts.length; i ++ ) {

			const part = hashParts[ i ];
			if ( part.startsWith( 'q=' ) ) {

				searchQuery = decodeURIComponent( part.substring( 2 ) );

			}

		}

		if ( searchQuery ) {

			this.tour.dom.searchInput.value = searchQuery;
			this.tour.dom.searchClear.style.display = 'flex';
			this.tour.dom.searchContainer.classList.add( 'focused' );
			this.performSearch( searchQuery );

		} else {

			if ( this.tour.dom.searchInput.value ) {

				this.tour.dom.searchInput.value = '';
				this.tour.dom.searchClear.style.display = 'none';
				this.tour.dom.searchContainer.classList.remove( 'focused' );
				this.performSearch( '' );

			}

		}

	}

	handleSearchInput( query, updateSearchFocus ) {

		if ( this.debounceTimeout ) {

			clearTimeout( this.debounceTimeout );

		}

		this.debounceTimeout = setTimeout( () => {

			this.performSearch( query );
			this.updateHashWithSearch( query );
			updateSearchFocus();

		}, 250 );

	}

	getCleanText( md ) {

		if ( ! md ) return '';

		let text = md.replace( /```[\s\S]*?```/gi, '' ); // Remove code blocks

		// Strip API container headers and preserve class names & inheritance
		// e.g. "::: api-class MeshStandardNodeMaterial extends NodeMaterial [open]" -> "MeshStandardNodeMaterial extends NodeMaterial"
		text = text.replace( /:::\s*(?:api-class|api-group)\s+([^\n]+)/gi, '$1\n' );
		text = text.replace( /:::\s*api\s+([^\n]+)/gi, '$1\n' );
		text = text.replace( /:::/g, ' ' );
		text = text.replace( /\[open\]/gi, '' );

		// Strip HTML tags repeatedly until no more tags remain
		let prev;
		do {

			prev = text;
			text = text.replace( /<[^<>]*>/g, '' );

		} while ( text !== prev );

		// Strip remaining standalone angle brackets
		text = text.replace( /[<>]/g, ' ' );

		return text
			.replace( /\[([^\]]+)\]\([^)]+\)/g, '$1' ) // Remove links keeping text
			.replace( /\*\*([^*]+)\*\*/g, '$1' ) // Remove bold
			.replace( /__([^_]+)__/g, '$1' )
			.replace( /\*([^*]+)\*/g, '$1' ) // Remove italic
			.replace( /_([^_]+)_/g, '$1' )
			.replace( /`([^`]+)`/g, '$1' ) // Remove inline code
			.replace( /#{1,6}\s+/g, '' ) // Remove headers
			.replace( />\s+/g, '' ) // Remove blockquotes
			.replace( /\|\s*/g, ' ' ) // Replace table pipe with space
			.replace( /\s+/g, ' ' ) // Normalize spaces
			.trim();

	}

	highlightSearchTerms( text, queryTerms ) {

		if ( ! text ) return '';

		const escapeHtml = ( str ) => str
			.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );

		const safeText = escapeHtml( text );

		if ( ! queryTerms || queryTerms.length === 0 ) return safeText;

		const escapeRegExp = ( string ) => string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

		const patterns = queryTerms.map( t => {

			const escaped = escapeRegExp( escapeHtml( t ) );
			return `\\w*${escaped}\\w*|${escaped}`;

		} );

		const regex = new RegExp( `(${patterns.join( '|' )})`, 'gi' );
		return safeText.replace( regex, '<span style="color: var(--accent); font-weight: 600;">$1</span>' );

	}

	getSearchSnippet( cleanText, queryTerms, title = '' ) {

		if ( ! cleanText ) return '';

		if ( title ) {

			const titleLower = title.toLowerCase();
			if ( cleanText.toLowerCase().startsWith( titleLower ) ) {

				const nextChar = cleanText.charAt( titleLower.length );
				if ( ! nextChar || /[^a-z0-9]/i.test( nextChar ) ) {

					cleanText = cleanText.substring( titleLower.length ).trim();

				}

			}

		}

		const textLower = cleanText.toLowerCase();
		// Find the first term that matches in cleanText
		let startIndex = - 1;

		for ( const term of queryTerms ) {

			const idx = textLower.indexOf( term );
			if ( idx !== - 1 && ( startIndex === - 1 || idx < startIndex ) ) {

				startIndex = idx;

			}

		}

		if ( startIndex === - 1 ) {

			// If no term matched in description (e.g. they all matched in title only), show start of description
			const snippet = cleanText.substring( 0, 80 );
			return this.highlightSearchTerms( snippet, queryTerms ) + ( cleanText.length > 80 ? '...' : '' );

		}

		// We have a match in the description. Extract a window around the match.
		const windowStart = Math.max( 0, startIndex - 40 );
		const windowEnd = Math.min( cleanText.length, startIndex + 80 );

		let snippet = cleanText.substring( windowStart, windowEnd );

		if ( windowStart > 0 ) {

			snippet = '...' + snippet;

		}

		if ( windowEnd < cleanText.length ) {

			snippet = snippet + '...';

		}

		return this.highlightSearchTerms( snippet, queryTerms );

	}

	getSpellingSuggestion( query ) {

		const trimmed = query.trim().toLowerCase();
		if ( ! trimmed ) return null;

		const terms = trimmed.split( /\s+/ ).filter( t => t.length > 0 );
		let hasCorrection = false;

		const correctedTerms = terms.map( term => {

			if ( this.index.has( term ) ) return term;

			let bestWord = term;
			let minDistance = 3;

			for ( const indexedWord of this.index.keys() ) {

				if ( Math.abs( indexedWord.length - term.length ) >= minDistance ) continue;

				const dist = getLevenshteinDistance( term, indexedWord );
				if ( dist < minDistance ) {

					minDistance = dist;
					bestWord = indexedWord;

				}

			}

			if ( bestWord !== term ) {

				hasCorrection = true;
				return this.casedVocabulary.get( bestWord ) || bestWord;

			}

			return term;

		} );

		return hasCorrection ? correctedTerms.join( ' ' ) : null;

	}

}

function getLevenshteinDistance( a, b ) {

	const matrix = [];

	for ( let i = 0; i <= b.length; i ++ ) matrix[ i ] = [ i ];
	for ( let j = 0; j <= a.length; j ++ ) matrix[ 0 ][ j ] = j;

	for ( let i = 1; i <= b.length; i ++ ) {

		for ( let j = 1; j <= a.length; j ++ ) {

			if ( b.charAt( i - 1 ) === a.charAt( j - 1 ) ) {

				matrix[ i ][ j ] = matrix[ i - 1 ][ j - 1 ];

			} else {

				matrix[ i ][ j ] = Math.min(
					matrix[ i - 1 ][ j - 1 ] + 1, // substitution
					matrix[ i ][ j - 1 ] + 1, // insertion
					matrix[ i - 1 ][ j ] + 1 // deletion
				);

			}

		}

	}

	return matrix[ b.length ][ a.length ];

}

export { SearchManager };
