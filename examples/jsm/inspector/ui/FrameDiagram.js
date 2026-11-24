const ROW_HEIGHT = 18;

/**
 * Stacks sibling spans in rows. The spans are placed in the order they start, each one in the first row
 * where it doesn't overlap the spans already there, so only overlapping spans are raised. A span is as
 * tall as the row of its label plus the rows of the spans nested in it, and a row is as tall as its
 * tallest span.
 *
 * Sets the `row` of every span, and its `offset` and `height` in rows.
 *
 * @param {Array<{start: number, end: number, children: Array}>} spans - The sibling spans.
 * @return {number} The height of the stack in rows.
 */
function stackSpans( spans ) {

	const rowEnds = [];
	const rowHeights = [];

	for ( const span of [ ...spans ].sort( ( a, b ) => a.start - b.start ) ) {

		span.height = 1 + stackSpans( span.children );

		let row = rowEnds.findIndex( ( end ) => end <= span.start + 1e-6 );

		if ( row === - 1 ) row = rowEnds.length;

		rowEnds[ row ] = span.end;
		rowHeights[ row ] = Math.max( rowHeights[ row ] || 0, span.height );

		span.row = row;

	}

	let height = 0;

	const offsets = [];

	for ( const rowHeight of rowHeights ) {

		offsets.push( height );
		height += rowHeight;

	}

	for ( const span of spans ) span.offset = offsets[ span.row ];

	return height;

}

/**
 * Draws the spans of a frame as boxes over time, in one track per timeline. The spans nested in a span
 * are drawn inside its box, and the spans which overlap are stacked, see {@link stackSpans}.
 */
export class FrameDiagram {

	constructor() {

		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'frame-diagram';

		// the time since the start of the frame

		this.axis = document.createElement( 'div' );
		this.axis.className = 'frame-diagram-axis';
		this.domElement.appendChild( this.axis );

		this.tracks = new Map();
		this.boxes = new Map();
		this.onToggle = null;

		this.domElement.addEventListener( 'click', ( event ) => {

			const box = event.target.closest( '.frame-diagram-span' );

			if ( box === null || box.classList.contains( 'frame-diagram-group' ) === false ) return;

			if ( this.onToggle !== null ) this.onToggle( box.dataset.key );

		} );

		this.tooltip = document.createElement( 'div' );
		this.tooltip.className = 'info-tooltip frame-diagram-tooltip';
		this.tooltip.setAttribute( 'role', 'tooltip' );
		this.hoveredBox = null;
		this.tooltipSize = { width: 0, height: 0 };
		this.tooltipViewportWidth = 0;

		this.domElement.addEventListener( 'pointermove', ( event ) => {

			const box = event.target.closest( '.frame-diagram-span' );
			this.hoveredBox = box;

			if ( box === null ) {

				this.tooltip.remove();
				return;

			}

			const container = this.domElement.closest( '.three-inspector' ) || this.domElement;
			if ( this.tooltip.parentNode !== container ) container.appendChild( this.tooltip );

			this._updateTooltip( box.dataset.tooltip );

			const { width, height } = this.tooltipSize;
			const view = this.domElement.ownerDocument.defaultView;

			this.tooltip.style.left = Math.max( 8, Math.min( event.clientX + 12, view.innerWidth - width - 8 ) ) + 'px';
			this.tooltip.style.top = Math.max( 8, Math.min( event.clientY + 12, view.innerHeight - height - 8 ) ) + 'px';

		} );

		this.domElement.addEventListener( 'pointerleave', () => {

			this.hoveredBox = null;
			this.tooltip.remove();

		} );

	}

	/**
	 * Updates the diagram.
	 *
	 * @param {Object<string, Array<{key: string, name: string, isSpan: boolean, color: string, start: number, end: number, collapsed: boolean|undefined, children: Array}>>} tracks - The spans of each track, by its name. The times are in milliseconds since the start of the track. Only the hue of the color is used, except for Render Pipeline spans.
	 * @param {number} duration - The time the width of the diagram stands for.
	 * @param {number} period - The frame period, marked in the tracks.
	 */
	update( tracks, duration, period ) {

		duration = Math.max( duration, 1e-6 );

		const used = new Set();

		for ( const name in tracks ) {

			let track = this.tracks.get( name );

			if ( track === undefined ) {

				const element = document.createElement( 'div' );
				element.className = 'frame-diagram-track';

				const label = document.createElement( 'div' );
				label.className = 'frame-diagram-label';
				label.textContent = name;
				label.title = 'CPU and GPU clocks are separate. The GPU track is shifted so matching groups start at or after their CPU groups.';

				track = document.createElement( 'div' );
				track.className = 'frame-diagram-content';

				const marker = document.createElement( 'div' );
				marker.className = 'frame-diagram-period';
				marker.title = 'Frame period';
				track.appendChild( marker );

				element.append( label, track );
				this.domElement.insertBefore( element, this.axis );

				this.tracks.set( name, track );

			}

			const spans = tracks[ name ];

			track.style.height = Math.max( stackSpans( spans ), 1 ) * ROW_HEIGHT + 'px';
			track.firstChild.style.left = ( period / duration ) * 100 + '%';

			this._updateSpans( spans, track, 0, duration, name, used );

		}

		// about ten ticks, at a multiple of 1, 2 or 5

		const magnitude = 10 ** Math.floor( Math.log10( duration / 10 ) );
		const step = magnitude * [ 1, 2, 5, 10 ].find( ( multiple ) => duration / ( magnitude * multiple ) <= 10 );

		const ticks = [];

		for ( let time = 0; time < duration; time += step ) {

			const tick = document.createElement( 'div' );
			tick.className = 'frame-diagram-tick';
			tick.textContent = parseFloat( time.toFixed( 3 ) ) + ( time === 0 ? ' ms' : '' );
			tick.style.left = ( time / duration ) * 100 + '%';

			ticks.push( tick );

		}

		this.axis.replaceChildren( ...ticks );

		for ( const [ key, box ] of this.boxes ) {

			if ( used.has( key ) === false ) {

				if ( this.hoveredBox === box ) {

					this.hoveredBox = null;
					this.tooltip.remove();

				}

				box.remove();
				this.boxes.delete( key );

			}

		}

	}

	_updateTooltip( text ) {

		const width = this.domElement.ownerDocument.defaultView.innerWidth;

		if ( this.tooltip.textContent !== text || this.tooltipViewportWidth !== width ) {

			this.tooltip.textContent = text;
			this.tooltipSize = this.tooltip.getBoundingClientRect();
			this.tooltipViewportWidth = width;

		}

	}

	_updateSpans( spans, parent, start, duration, track, used ) {

		for ( const span of spans ) {

			// reuse the boxes so hovering remains stable while the diagram updates

			const key = track + ':' + span.key;

			let box = this.boxes.get( key );

			if ( box === undefined ) {

				box = document.createElement( 'div' );
				box.className = 'frame-diagram-span';
				box.appendChild( document.createTextNode( '' ) );

				this.boxes.set( key, box );

			}

			if ( box.parentNode !== parent ) parent.appendChild( box );

			used.add( key );

			const spanDuration = span.end - span.start;
			const tooltip = `${ span.name }\n${ spanDuration.toFixed( 3 ) } ms`;

			let name = span.name;

			if ( span.collapsed !== undefined ) name = ( span.collapsed ? '+ ' : '- ' ) + name;

			box.dataset.key = span.key;
			box.dataset.tooltip = tooltip;
			if ( this.hoveredBox === box ) this._updateTooltip( tooltip );
			if ( box.firstChild.nodeValue !== name ) box.firstChild.nodeValue = name;

			box.classList.toggle( 'frame-diagram-group', span.collapsed !== undefined );
			box.classList.toggle( 'frame-diagram-pipeline', span.name === 'Render Pipeline' );
			box.classList.toggle( 'aggregate-timing', span.isSpan );
			box.style.setProperty( '--span-color', span.color );
			box.style.left = ( ( span.start - start ) / ( duration || 1 ) ) * 100 + '%';
			box.style.width = ( spanDuration / ( duration || 1 ) ) * 100 + '%';
			box.style.bottom = span.offset * ROW_HEIGHT + 'px';
			box.style.height = span.height * ROW_HEIGHT - 1 + 'px';

			this._updateSpans( span.children, box, span.start, spanDuration, track, used );

		}

	}

}
