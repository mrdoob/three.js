const _tempRgb = [ 0, 0, 0 ];

/**
 * Module.js - Base class for LUT 3D Generator Card Modules
 */
export class Module {

	constructor( id, name, params = {} ) {

		this.id = id;
		this.name = name;
		this.params = params;
		this.enabled = true;
		this.domElement = null;
		this.onChange = null;
		this.dragAndDrop = true;

	}

	/**
	 * Applies module transformation directly onto a Float32Array 3D LUT buffer.
	 * @param {Float32Array} buffer - Buffer of size x size x size x 4 RGBA elements
	 * @param {number} size - LUT grid dimension
	 * @returns {Float32Array}
	 */
	apply( buffer ) {

		if ( ! this.enabled ) return buffer;

		const len = buffer.length;
		const target = _tempRgb;

		for ( let i = 0; i < len; i += 4 ) {

			this.applyPixel( buffer[ i ], buffer[ i + 1 ], buffer[ i + 2 ], target );
			buffer[ i ] = target[ 0 ];
			buffer[ i + 1 ] = target[ 1 ];
			buffer[ i + 2 ] = target[ 2 ];

		}

		return buffer;

	}

	/**
	 * Transforms a single RGB color pixel (0..1 range) into a reusable target array.
	 * Virtual method to be overridden by sub-classes.
	 */
	applyPixel( r, g, b, target = _tempRgb ) {

		target[ 0 ] = r;
		target[ 1 ] = g;
		target[ 2 ] = b;
		return target;

	}

	/**
	 * Helper to create standard card header with title, reset button, and optional remove button.
	 */
	createCardHeader( titleText, onReset, onRemove = null ) {

		const header = document.createElement( 'div' );
		header.className = 'lut-card-header';

		const _createSvgIcon = ( svgPath, width = 11, height = 11, strokeWidth = 2.5 ) => {

			const ns = 'http://www.w3.org/2000/svg';
			const svg = document.createElementNS( ns, 'svg' );
			svg.setAttribute( 'width', String( width ) );
			svg.setAttribute( 'height', String( height ) );
			svg.setAttribute( 'viewBox', '0 0 24 24' );
			svg.setAttribute( 'fill', 'none' );
			svg.setAttribute( 'stroke', 'currentColor' );
			svg.setAttribute( 'stroke-width', String( strokeWidth ) );
			svg.setAttribute( 'stroke-linecap', 'round' );
			svg.setAttribute( 'stroke-linejoin', 'round' );
			svg.style.display = 'block';
			svg.innerHTML = svgPath;
			return svg;

		};

		// Left Drag Handle + Reset Button
		const dragHandle = document.createElement( 'div' );
		dragHandle.className = 'lut-card-drag-handle';

		if ( typeof onReset === 'function' ) {

			const resetBtn = document.createElement( 'button' );
			resetBtn.className = 'card-reset-btn lut-card-reset-btn';
			resetBtn.appendChild( _createSvgIcon( '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>', 13, 13, 2.5 ) );
			resetBtn.title = 'Reset Card';
			resetBtn.onclick = ( e ) => {

				e.stopPropagation();
				onReset();

			};

			dragHandle.appendChild( resetBtn );

		}

		header.appendChild( dragHandle );

		const titleLabel = document.createElement( 'span' );
		titleLabel.className = 'lut-card-title';
		titleLabel.textContent = titleText;
		header.appendChild( titleLabel );

		// Right Remove Button (where reset button was)
		if ( onRemove ) {

			const removeBtn = document.createElement( 'button' );
			removeBtn.className = 'lut-card-remove-btn';
			removeBtn.appendChild( _createSvgIcon( '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 13, 13, 2.5 ) );
			removeBtn.title = 'Remove Card';
			removeBtn.onclick = ( e ) => {

				e.stopPropagation();
				onRemove();

			};

			header.appendChild( removeBtn );

		}

		return header;

	}

	/**
	 * Helper to create parameter box with label, draggable number input, and range slider.
	 */
	createSliderControl( { key, label, min, max, step, def } ) {

		const paramBox = document.createElement( 'div' );
		paramBox.className = 'param-control value-slider lut-param-box';

		const top = document.createElement( 'div' );
		top.className = 'lut-param-top';

		const lbl = document.createElement( 'span' );
		lbl.className = 'lut-param-label';
		lbl.textContent = label;

		const numInput = document.createElement( 'input' );
		numInput.type = 'number';
		numInput.min = min;
		numInput.max = max;
		numInput.step = step;
		const initialVal = Number( this.params[ key ] !== undefined ? this.params[ key ] : def );
		numInput.value = initialVal.toFixed( step < 0.1 ? 2 : 1 );
		numInput.className = 'lut-num-input';

		const slider = document.createElement( 'input' );
		slider.type = 'range';
		slider.className = 'inspector-slider';
		slider.min = min;
		slider.max = max;
		slider.step = step;
		slider.value = initialVal;

		const updateVal = ( val ) => {

			const clamped = Math.max( min, Math.min( max, val ) );
			this.params[ key ] = clamped;
			slider.value = clamped;
			numInput.value = clamped.toFixed( step < 0.1 ? 2 : 1 );
			this.onParamChange();

		};

		slider.oninput = () => {

			updateVal( parseFloat( slider.value ) );

		};

		numInput.onchange = () => {

			const val = parseFloat( numInput.value );
			updateVal( isNaN( val ) ? def : val );

		};

		let isDragging = false;
		let startY = 0;
		let startVal = 0;

		numInput.onpointerdown = ( e ) => {

			isDragging = true;
			startY = e.clientY;
			startVal = parseFloat( numInput.value ) || def;
			numInput.setPointerCapture( e.pointerId );

		};

		numInput.onpointermove = ( e ) => {

			if ( isDragging ) {

				const delta = ( startY - e.clientY ) * step;
				updateVal( startVal + delta );

			}

		};

		const stopDrag = ( e ) => {

			if ( isDragging ) {

				isDragging = false;
				try {

					numInput.releasePointerCapture( e.pointerId );

				} catch ( _err ) { /* ignore */ }

			}

		};

		numInput.onpointerup = stopDrag;
		numInput.onpointercancel = stopDrag;

		top.appendChild( lbl );
		top.appendChild( numInput );
		paramBox.appendChild( top );
		paramBox.appendChild( slider );

		paramBox._setValue = ( v ) => {

			const formatted = Number( v ).toFixed( step < 0.1 ? 2 : 1 );
			slider.value = v;
			numInput.value = formatted;

		};

		return paramBox;

	}

	onParamChange() {

		if ( this.onChange ) this.onChange( this );

	}

	reset() {

		this.onParamChange();

	}

	updateUI() {

	}

	toJSON() {

		return {
			id: this.id,
			params: JSON.parse( JSON.stringify( this.params ) )
		};

	}

	fromJSON( json ) {

		if ( json && json.params ) {

			Object.assign( this.params, json.params );
			this.updateUI();

		}

	}

}
