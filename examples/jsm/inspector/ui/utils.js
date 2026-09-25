export function createValueSpan() {

	const span = document.createElement( 'span' );
	span.className = 'value';

	return span;

}

export function setText( element, text ) {

	if ( element && element.textContent !== text ) {

		element.textContent = text;

	}

}

export function getText( element ) {

	return element ? element.textContent : null;

}

export function splitPath( fullPath ) {

	const lastSlash = fullPath.lastIndexOf( '/' );

	if ( lastSlash === - 1 ) {

		return {
			path: '',
			name: fullPath.trim()
		};

	}

	const path = fullPath.substring( 0, lastSlash ).trim();
	const name = fullPath.substring( lastSlash + 1 ).trim();

	return { path, name };

}

export function splitCamelCase( str ) {

	return str.replace( /([a-z0-9])([A-Z])/g, '$1 $2' ).trim();

}

export function formatBytes( bytes, decimals = 2 ) {

	if ( bytes === 0 ) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
	const i = Math.floor( Math.log( bytes ) / Math.log( k ) );

	return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( dm ) ) + ' ' + sizes[ i ];

}

export function info( parentNode, text ) {

	let infoIcon = parentNode.querySelector( '.info-icon' );

	if ( ! infoIcon ) {

		infoIcon = document.createElement( 'span' );
		infoIcon.className = 'info-icon';
		infoIcon.textContent = 'i';
		parentNode.appendChild( infoIcon );

	} else {

		const newInfoIcon = infoIcon.cloneNode( true );
		infoIcon.replaceWith( newInfoIcon );
		infoIcon = newInfoIcon;

	}

	const showTooltip = () => {

		const container = infoIcon.closest( '.three-inspector' ) || document.body;
		let tooltip = container.querySelector( '.three-inspector-info-tooltip' );

		if ( ! tooltip ) {

			tooltip = document.createElement( 'div' );
			tooltip.className = 'info-tooltip three-inspector-info-tooltip';
			container.appendChild( tooltip );

		}

		const html = text.trim().replace( /### (.*?)(?:\r?\n|$)/g, '<h3>$1</h3>' )
					   .replace( /\*\*(.*?)\*\*/g, '<strong>$1</strong>' )
					   .replace( /\n/g, '<br/>' );

		tooltip.innerHTML = html;

		const rect = infoIcon.getBoundingClientRect();
		const tooltipWidth = tooltip.getBoundingClientRect().width;

		// keep the centered tooltip within the viewport so it isn't clipped near an edge

		const margin = 8;
		const half = tooltipWidth / 2;
		const center = Math.max( margin + half, Math.min( window.innerWidth - margin - half, rect.left + rect.width / 2 ) );

		tooltip.style.left = center + 'px';
		tooltip.style.top = ( rect.top - 8 ) + 'px';

		tooltip.style.opacity = '1';
		tooltip.style.visibility = 'visible';

	};

	const hideTooltip = () => {

		const container = infoIcon.closest( '.three-inspector' ) || document.body;
		const tooltip = container.querySelector( '.three-inspector-info-tooltip' );
		if ( tooltip ) {

			tooltip.style.opacity = '0';
			tooltip.style.visibility = 'hidden';

		}

	};

	let isClickedOpen = false;

	const onDocumentPointerDown = ( e ) => {

		if ( ! infoIcon.contains( e.target ) ) {

			isClickedOpen = false;
			infoIcon.classList.remove( 'active' );
			hideTooltip();
			document.removeEventListener( 'pointerdown', onDocumentPointerDown );

		}

	};

	infoIcon.addEventListener( 'pointerenter', () => {

		showTooltip();

	} );

	infoIcon.addEventListener( 'pointerleave', () => {

		if ( ! isClickedOpen ) {

			hideTooltip();

		}

	} );

	infoIcon.addEventListener( 'click', ( e ) => {

		e.stopPropagation();

		isClickedOpen = ! isClickedOpen;

		if ( isClickedOpen ) {

			infoIcon.classList.add( 'active' );
			showTooltip();
			document.addEventListener( 'pointerdown', onDocumentPointerDown );

		} else {

			infoIcon.classList.remove( 'active' );
			hideTooltip();
			document.removeEventListener( 'pointerdown', onDocumentPointerDown );

		}

	} );

	return infoIcon;

}

