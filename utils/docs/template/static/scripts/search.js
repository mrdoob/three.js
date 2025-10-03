// eslint-disable-next-line no-unused-vars
function hideSearch() {

	const nav = document.querySelector( 'nav' );
	const items = nav.querySelectorAll( 'li' );
	const headers = nav.querySelectorAll( 'h2, h3' );
	const lists = nav.querySelectorAll( 'ul' );

	items.forEach( item => item.style.display = '' );
	headers.forEach( header => header.style.display = '' );
	lists.forEach( list => list.style.display = '' );

}


// eslint-disable-next-line no-unused-vars
function search( value ) {

	const nav = document.querySelector( 'nav' );
	const items = nav.querySelectorAll( 'li' );

	// Update URL
	const url = new URL( window.location );

	if ( value === '' ) {

		url.searchParams.delete( 'q' );
		hideSearch();

	} else {

		url.searchParams.set( 'q', value );

		const searchLower = value.toLowerCase();

		items.forEach( item => {

			const text = item.textContent.toLowerCase();

			if ( text.includes( searchLower ) ) {

				item.style.display = '';

			} else {

				item.style.display = 'none';

			}

		} );

		// Show/hide h3 headers based on matches and visible items
		const h3Headers = nav.querySelectorAll( 'h3' );

		h3Headers.forEach( header => {

			const headerText = header.textContent.toLowerCase();
			const headerMatches = headerText.includes( searchLower );
			const nextElement = header.nextElementSibling;

			if ( nextElement && nextElement.tagName === 'UL' ) {

				const visibleItems = nextElement.querySelectorAll( 'li:not([style*="display: none"])' );

				// Show section if header matches OR has visible items
				if ( headerMatches || visibleItems.length > 0 ) {

					header.style.display = '';
					nextElement.style.display = '';

					// If header matches, show all items in this section
					if ( headerMatches ) {

						const allItems = nextElement.querySelectorAll( 'li' );
						allItems.forEach( item => item.style.display = '' );

					}

				} else {

					header.style.display = 'none';
					nextElement.style.display = 'none';

				}

			}

		} );

		// Show/hide h2 headers (main categories) if they have visible content
		const h2Headers = nav.querySelectorAll( 'h2' );

		h2Headers.forEach( header => {

			let hasVisibleContent = false;
			let currentElement = header.nextElementSibling;

			// Check all following elements until next h2 or end
			while ( currentElement && currentElement.tagName !== 'H2' ) {

				// Check for visible h3 sections OR visible ul with items
				if ( currentElement.tagName === 'H3' && currentElement.style.display !== 'none' ) {

					hasVisibleContent = true;
					break;

				} else if ( currentElement.tagName === 'UL' && currentElement.style.display !== 'none' ) {

					const visibleItems = currentElement.querySelectorAll( 'li:not([style*="display: none"])' );

					if ( visibleItems.length > 0 ) {

						hasVisibleContent = true;
						break;

					}

				}

				currentElement = currentElement.nextElementSibling;

			}

			header.style.display = hasVisibleContent ? '' : 'none';

		} );

	}

	window.history.replaceState( {}, '', url );

}
