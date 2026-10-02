/**
 * ColorWheel.js - DaVinci Resolve style interactive Color Wheel control widget
 */

export class ColorWheel {

	constructor( title, initialValues = { r: 0, g: 0, b: 0 }, onChange, onRemove = null ) {

		this.title = title;
		this.values = { r: initialValues.r || 0, g: initialValues.g || 0, b: initialValues.b || 0 };
		this.onChange = onChange;
		this.onRemove = onRemove;

		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'lut-card';

		this._buildUI();
		this._initEvents();

		// Deferred initial draw
		requestAnimationFrame( () => this.draw() );

	}

	_buildUI() {

		// Header title + reset + remove
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

		const resetBtn = document.createElement( 'button' );
		resetBtn.className = 'card-reset-btn lut-card-reset-btn';
		resetBtn.appendChild( _createSvgIcon( '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>', 13, 13, 2.5 ) );
		resetBtn.title = 'Reset Wheel';
		resetBtn.onclick = ( e ) => {

			e.stopPropagation();
			this.setValues( 0, 0, 0 );
			if ( typeof this.onChange === 'function' ) this.onChange( this.values );

		};

		dragHandle.appendChild( resetBtn );
		header.appendChild( dragHandle );

		const titleLabel = document.createElement( 'span' );
		titleLabel.className = 'lut-card-title';
		titleLabel.textContent = this.title;
		header.appendChild( titleLabel );

		// Right Remove Button (where reset button was)
		if ( this.onRemove ) {

			const removeBtn = document.createElement( 'button' );
			removeBtn.className = 'lut-card-remove-btn';
			removeBtn.appendChild( _createSvgIcon( '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 13, 13, 2.5 ) );
			removeBtn.title = 'Remove Wheel Card';
			removeBtn.onclick = ( e ) => {

				e.stopPropagation();
				this.onRemove();

			};

			header.appendChild( removeBtn );

		}

		this.domElement.appendChild( header );

		// Wheel Canvas
		this.canvas = document.createElement( 'canvas' );
		this.canvas.width = 110;
		this.canvas.height = 110;
		this.canvas.className = 'lut-wheel-canvas';
		this.ctx = this.canvas.getContext( '2d' );
		this.domElement.appendChild( this.canvas );

		// Master Y (Luminance) Slider directly below canvas wheel
		const ySlider = document.createElement( 'input' );
		ySlider.type = 'range';
		ySlider.className = 'inspector-slider';
		ySlider.style.cssText = 'width: 100%; margin: 4px 0 2px 0 !important;';
		ySlider.min = '-0.5';
		ySlider.max = '0.5';
		ySlider.step = '0.01';
		ySlider.value = ( this.values && typeof this.values.y === 'number' ) ? this.values.y : 0;
		this.ySlider = ySlider;

		ySlider.oninput = () => {

			const val = parseFloat( ySlider.value );
			if ( this.inputs.y ) this.inputs.y.value = val.toFixed( 2 );
			this.values.y = val;
			if ( typeof this.onChange === 'function' ) this.onChange( this.values );

		};

		this.domElement.appendChild( ySlider );

		// Bottom Inputs Row (Y, R, G, B)
		const inputsRow = document.createElement( 'div' );
		inputsRow.className = 'lut-wheel-inputs-row';

		this.inputs = {};

		[
			{ key: 'y', label: 'Y' },
			{ key: 'r', label: 'R' },
			{ key: 'g', label: 'G' },
			{ key: 'b', label: 'B' }
		].forEach( ch => {

			const box = document.createElement( 'div' );
			box.className = 'lut-wheel-input-box';

			const input = document.createElement( 'input' );
			input.type = 'number';
			input.step = '0.01';
			input.min = '-0.5';
			input.max = '0.5';
			const valNum = ( this.values && typeof this.values[ ch.key ] === 'number' ) ? this.values[ ch.key ] : 0;
			input.value = valNum.toFixed( 2 );
			input.className = `lut-rgb-input lut-rgb-input-${ch.key}`;

			input.onchange = () => {

				const val = Math.max( - 0.5, Math.min( 0.5, parseFloat( input.value ) || 0 ) );
				this.values[ ch.key ] = val;
				input.value = val.toFixed( 2 );
				if ( ch.key === 'y' && this.ySlider ) {

					this.ySlider.value = val;

				} else {

					this.draw();

				}

				if ( typeof this.onChange === 'function' ) this.onChange( this.values );

			};

			this.inputs[ ch.key ] = input;
			box.appendChild( input );
			inputsRow.appendChild( box );

		} );

		this.domElement.appendChild( inputsRow );

	}

	setValues( r, g, b, y = undefined ) {

		this.values.r = r;
		this.values.g = g;
		this.values.b = b;

		if ( y !== undefined ) {

			this.values.y = y;
			if ( this.inputs.y ) this.inputs.y.value = y.toFixed( 2 );
			if ( this.ySlider ) this.ySlider.value = y;

		}

		if ( this.inputs.r ) this.inputs.r.value = r.toFixed( 2 );
		if ( this.inputs.g ) this.inputs.g.value = g.toFixed( 2 );
		if ( this.inputs.b ) this.inputs.b.value = b.toFixed( 2 );

		this.draw();

	}

	draw() {

		if ( ! this.ctx ) return;

		const ctx = this.ctx;
		const w = this.canvas.width;
		const h = this.canvas.height;
		const cx = w / 2;
		const cy = h / 2;
		const outerR = w / 2 - 2;
		const innerR = outerR - 12;

		ctx.clearRect( 0, 0, w, h );

		// 1. Draw outer hue spectrum ring
		for ( let angle = 0; angle < 360; angle += 2 ) {

			const startAngle = ( angle - 1 ) * Math.PI / 180;
			const endAngle = ( angle + 2 ) * Math.PI / 180;

			ctx.beginPath();
			ctx.arc( cx, cy, outerR, startAngle, endAngle );
			ctx.arc( cx, cy, innerR, endAngle, startAngle, true );
			ctx.closePath();

			ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
			ctx.fill();

		}

		// 2. Inner disc background
		ctx.beginPath();
		ctx.arc( cx, cy, innerR - 1, 0, Math.PI * 2 );
		ctx.fillStyle = '#101014';
		ctx.fill();
		ctx.strokeStyle = '#2a2a36';
		ctx.lineWidth = 1;
		ctx.stroke();

		// 3. Crosshairs
		ctx.strokeStyle = '#252530';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo( cx - innerR + 4, cy );
		ctx.lineTo( cx + innerR - 4, cy );
		ctx.moveTo( cx, cy - innerR + 4 );
		ctx.lineTo( cx, cy + innerR - 4 );
		ctx.stroke();

		// 4. Calculate handle position from RGB offset values
		// R at 0 rad (right), G at 2.094 rad (120 deg down-left), B at 4.188 rad (240 deg up-left)
		const rx = this.values.r;
		const gx = this.values.g;
		const bx = this.values.b;

		// Convert RGB balance to 2D displacement vector (Canvas space: X right, Y down)
		const vx = rx - 0.5 * gx - 0.5 * bx;
		const vy = 0.866025 * ( gx - bx );

		const maxDist = innerR - 6;
		const hx = cx + Math.max( - maxDist, Math.min( maxDist, vx * maxDist * 2 ) );
		const hy = cy + Math.max( - maxDist, Math.min( maxDist, vy * maxDist * 2 ) );

		// 5. Draw handle
		ctx.beginPath();
		ctx.arc( hx, hy, 5, 0, Math.PI * 2 );
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		ctx.strokeStyle = '#00aaff';
		ctx.lineWidth = 2;
		ctx.stroke();

	}

	_initEvents() {

		let isDragging = false;

		const handlePointer = ( e ) => {

			const rect = this.canvas.getBoundingClientRect();
			const clientX = e.touches ? e.touches[ 0 ].clientX : e.clientX;
			const clientY = e.touches ? e.touches[ 0 ].clientY : e.clientY;

			const cx = rect.width / 2;
			const cy = rect.height / 2;
			const dx = ( clientX - rect.left ) - cx;
			const dy = ( clientY - rect.top ) - cy;

			const innerR = ( rect.width / 2 ) - 14;
			const dist = Math.sqrt( dx * dx + dy * dy );
			const clampedDist = Math.min( dist, innerR );
			const normDist = clampedDist / innerR;

			let angle = Math.atan2( dy, dx );
			if ( angle < 0 ) angle += Math.PI * 2;

			// Convert polar position to RGB balance offsets (-0.5 .. 0.5)
			const magnitude = normDist * 0.5;

			// Project angle onto R (0 deg), G (120 deg), B (240 deg)
			const rVal = Math.cos( angle ) * magnitude;
			const gVal = Math.cos( angle - 2.094395 ) * magnitude;
			const bVal = Math.cos( angle - 4.18879 ) * magnitude;

			this.setValues( rVal, gVal, bVal );

			if ( typeof this.onChange === 'function' ) {

				this.onChange( this.values );

			}

		};

		this.canvas.addEventListener( 'pointerdown', ( e ) => {

			isDragging = true;
			this.canvas.setPointerCapture( e.pointerId );
			handlePointer( e );

		} );

		this.canvas.addEventListener( 'pointermove', ( e ) => {

			if ( isDragging ) {

				handlePointer( e );

			}

		} );

		const stopDrag = ( e ) => {

			if ( isDragging ) {

				isDragging = false;
				try {

					this.canvas.releasePointerCapture( e.pointerId );

				} catch ( _err ) { /* ignore */ }

			}

		};

		this.canvas.addEventListener( 'pointerup', stopDrag );
		this.canvas.addEventListener( 'pointercancel', stopDrag );

	}

}
