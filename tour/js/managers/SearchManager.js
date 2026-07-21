class SearchManager {

	constructor( tour ) {

		this.tour = tour;
		this.index = new Map(); // word -> Set of page IDs
		this.casedVocabulary = new Map(); // lowercase -> original case
		this.debounceTimeout = null;

	}

	buildIndex() {

		this.index.clear();
		this.casedVocabulary.clear();
		this.tour.pages.forEach( page => {

			const rawContent = [
				page.title || '',
				( page.path || [] ).join( ' ' ),
				this.getCleanText( page.description || '' )
			].join( ' ' );

			const casedWords = rawContent.split( /[^a-zA-Z0-9]+/ ).filter( w => w.length > 1 );
			casedWords.forEach( word => {

				const lower = word.toLowerCase();
				if ( ! this.casedVocabulary.has( lower ) || ( word !== lower && this.casedVocabulary.get( lower ) === lower ) ) {

					this.casedVocabulary.set( lower, word );

				}

			} );

			const content = rawContent.toLowerCase();

			const words = content.split( /[^a-z0-9]+/ ).filter( w => w.length > 1 );
			words.forEach( word => {

				if ( ! this.index.has( word ) ) {

					this.index.set( word, new Set() );

				}

				this.index.get( word ).add( page.id );

			} );

		} );

	}

	search( query ) {

		const trimmed = query.trim().toLowerCase();
		if ( ! trimmed ) return null;

		const terms = trimmed.split( /\s+/ ).filter( t => t.length > 0 );
		if ( terms.length === 0 ) return null;

		let results = null;

		terms.forEach( term => {

			const termMatches = new Set();
			for ( const [ word, ids ] of this.index.entries() ) {

				if ( word.startsWith( term ) ) {

					ids.forEach( id => termMatches.add( id ) );

				}

			}

			if ( results === null ) {

				results = termMatches;

			} else {

				results = new Set( [ ...results ].filter( id => termMatches.has( id ) ) );

			}

		} );

		return results || new Set();

	}

	performSearch( query ) {

		const trimmed = query.trim().toLowerCase();
		if ( trimmed.length === 0 ) {

			this.tour.dom.tocList.classList.remove( 'search-active' );

			const cleanTree = ( nodes ) => {

				nodes.forEach( n => {

					delete n.searchSnippet;
					if ( n.children ) cleanTree( n.children );

				} );

			};

			cleanTree( this.tour.pageTree );
			this.tour.setupTOC( this.tour.pageTree );

		} else {

			this.tour.dom.tocList.classList.add( 'search-active' );

			const queryLower = trimmed.toLowerCase();
			let featuredPage = null;

			// 1. Check exact match
			featuredPage = this.tour.pages.find( p => p.title.toLowerCase() === queryLower );

			// 2. Check if the query contains a page title (e.g. "normalview" contains "normal")
			if ( ! featuredPage ) {

				featuredPage = this.tour.pages.find( p => {

					const titleLower = p.title.toLowerCase();
					return titleLower.length >= 3 && queryLower.includes( titleLower );

				} );

			}

			// 3. Check if any page title contains the query (e.g. "normal" starts with "norm")
			if ( ! featuredPage ) {

				featuredPage = this.tour.pages.find( p => {

					const titleLower = p.title.toLowerCase();
					return queryLower.length >= 3 && titleLower.includes( queryLower );

				} );

			}

			const matchingPageIds = this.search( query ) || new Set();

			if ( featuredPage ) {

				matchingPageIds.add( featuredPage.id );

			}

			const otherMatchingPageIds = new Set( matchingPageIds );
			if ( featuredPage ) {

				otherMatchingPageIds.delete( featuredPage.id );

			}

			const queryTerms = trimmed.split( /\s+/ ).filter( t => t.length > 0 );
			let filteredTree = this.getFilteredTree( this.tour.pageTree, otherMatchingPageIds, queryTerms );

			let suggestion = null;
			if ( filteredTree.length === 0 && ! featuredPage ) {

				suggestion = this.getSpellingSuggestion( query );
				if ( suggestion ) {

					const suggTrimmed = suggestion.trim().toLowerCase();

					featuredPage = this.tour.pages.find( p => p.title.toLowerCase() === suggTrimmed );
					if ( ! featuredPage ) {

						featuredPage = this.tour.pages.find( p => {

							const titleLower = p.title.toLowerCase();
							return titleLower.length >= 3 && suggTrimmed.includes( titleLower );

						} );

					}
					if ( ! featuredPage ) {

						featuredPage = this.tour.pages.find( p => {

							const titleLower = p.title.toLowerCase();
							return suggTrimmed.length >= 3 && titleLower.includes( suggTrimmed );

						} );

					}

					const suggMatchingPageIds = this.search( suggestion ) || new Set();
					if ( featuredPage ) {

						suggMatchingPageIds.add( featuredPage.id );

					}

					const suggOtherMatchingPageIds = new Set( suggMatchingPageIds );
					if ( featuredPage ) {

						suggOtherMatchingPageIds.delete( featuredPage.id );

					}

					const suggQueryTerms = suggTrimmed.split( /\s+/ ).filter( t => t.length > 0 );
					filteredTree = this.getFilteredTree( this.tour.pageTree, suggOtherMatchingPageIds, suggQueryTerms );

				}

			}

			this.tour.setupTOC( filteredTree, featuredPage, suggestion );

		}

		const sidebarContent = this.tour.dom.sidebar.querySelector( '.sidebar-content' );
		if ( sidebarContent ) {

			sidebarContent.scrollTop = 0;

		}

	}

	getFilteredTree( tree, matchingPageIds, queryTerms ) {

		const filterNodes = ( nodes ) => {

			const result = [];

			for ( const node of nodes ) {

				const hasChildren = node.children && node.children.length > 0;
				let filteredChildren = [];

				if ( hasChildren ) {

					filteredChildren = filterNodes( node.children );

				}

				const matchesSelf = ! node.isFolder && matchingPageIds && matchingPageIds.has( node.id );

				if ( matchesSelf || filteredChildren.length > 0 ) {

					const copy = { ...node };
					if ( hasChildren ) {

						copy.children = filteredChildren;

					}

					if ( matchesSelf ) {

						const page = this.tour.pages.find( p => p.id === node.id );
						let snippet = '';
						if ( page && page.description ) {

							const cleanText = this.getCleanText( page.description );
							snippet = this.getSearchSnippet( cleanText, queryTerms, page.title );

						}

						copy.searchSnippet = snippet;

					} else {

						delete copy.searchSnippet;

					}

					result.push( copy );

				}

			}

			return result;

		};

		return filterNodes( tree );

	}

	scrollToSearchMatch() {

		const query = this.tour.dom.searchInput.value.trim();
		if ( query.length === 0 ) return;

		const queryTerms = query.toLowerCase().split( /\s+/ ).filter( t => t.length > 0 );
		if ( queryTerms.length === 0 ) return;

		const elements = this.tour.dom.contentArea.querySelectorAll( 'p, h1, h2, h3, li, td, code, blockquote, .tsl-api-table-row' );
		let targetElement = null;

		for ( const el of elements ) {

			const text = el.textContent.toLowerCase();
			const matches = queryTerms.every( term => text.includes( term ) );
			if ( matches ) {

				targetElement = el;
				break;

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
		return md
			.replace( /```tsl[\s\S]*?```/gi, '' ) // Remove code blocks
			.replace( /<[^>]*>/g, '' ) // Remove HTML tags
			.replace( /\[([^\]]+)\]\(([^)]+)\)/g, '$1' ) // Remove links keeping text
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

		if ( ! queryTerms || queryTerms.length === 0 ) return text;

		const escapeRegExp = ( string ) => string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

		const patterns = queryTerms.map( t => {

			const escaped = escapeRegExp( t );
			return `\\w*${escaped}\\w*|${escaped}`;

		} );

		const regex = new RegExp( `(${patterns.join( '|' )})`, 'gi' );
		return text.replace( regex, '<span style="color: var(--accent); font-weight: 600;">$1</span>' );

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
					matrix[ i ][ j - 1 ] + 1,     // insertion
					matrix[ i - 1 ][ j ] + 1      // deletion
				);

			}

		}

	}

	return matrix[ b.length ][ a.length ];

}

export { SearchManager };
