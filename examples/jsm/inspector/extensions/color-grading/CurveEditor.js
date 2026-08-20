import { evaluateSpline } from './LUTMath.js';

export class CurveEditor {

	constructor( options = {} ) {

		this.curves = options.curves || {
			rgb: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0 }, { x: 1, y: 1 } ]
		};

		this.activeChannel = options.activeChannel || 'rgb';
		this.onChange = options.onChange || null;

		this.selectedIndex = - 1;
		this.isDragging = false;
		this.pointRadius = 4;

		this.domElement = document.createElement( 'div' );
		this.domElement.className = 'curve-editor-container';
		this.domElement.style.cssText = 'display: flex; flex-direction: column; gap: 4px; width: 100%; user-select: none; background: transparent; border: none; padding: 0; box-sizing: border-box;';

		this._buildUI();
		this._initEvents();

		if ( typeof ResizeObserver !== 'undefined' ) {

			const ro = new ResizeObserver( () => this._onResize() );
			ro.observe( this.domElement );

		}

		requestAnimationFrame( () => {

			this._onResize();

		} );

	}

	_buildUI() {

		// Header toolbar (Channel selector)
		const toolbar = document.createElement( 'div' );
		toolbar.style.cssText = 'display: flex; justify-content: center; align-items: center; width: 100%; gap: 4px;';

		// Channel selector tabs
		const channelGroup = document.createElement( 'div' );
		channelGroup.style.cssText = 'display: flex; gap: 3px; background: #0a0a0f; padding: 2px; border-radius: 4px; border: 1px solid #222230;';

		const channels = [
			{ id: 'rgb', label: 'RGB', color: '#e0e0e0' },
			{ id: 'red', label: 'R', color: '#ff4d4d' },
			{ id: 'green', label: 'G', color: '#4dff4d' },
			{ id: 'blue', label: 'B', color: '#4d88ff' }
		];

		this.channelBtns = {};

		channels.forEach( ch => {

			const btn = document.createElement( 'button' );
			btn.textContent = ch.label;
			btn.style.cssText = `padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 3px; border: 1px solid transparent; cursor: pointer; color: ${ch.color}; background: transparent; transition: all 0.15s;`;
			btn.onclick = () => this.setChannel( ch.id );

			this.channelBtns[ ch.id ] = btn;
			channelGroup.appendChild( btn );

		} );

		toolbar.appendChild( channelGroup );
		this.domElement.appendChild( toolbar );

		// Canvas Container
		this.canvasContainer = document.createElement( 'div' );
		this.canvasContainer.style.cssText = 'width: 100%; height: 130px; position: relative; background: #0c0c12; border-radius: 6px; overflow: hidden;';

		this.canvas = document.createElement( 'canvas' );
		this.canvas.setAttribute( 'tabindex', '0' );
		this.canvas.style.cssText = 'width: 100%; height: 100%; display: block; cursor: crosshair; touch-action: none; outline: none;';
		this.ctx = this.canvas.getContext( '2d' );

		this.canvasContainer.appendChild( this.canvas );
		this.domElement.appendChild( this.canvasContainer );

		this.setChannel( this.activeChannel );

	}

	_onResize() {

		if ( ! this.canvasContainer || ! this.canvas ) return;

		const rect = this.canvasContainer.getBoundingClientRect();
		if ( rect.width === 0 || rect.height === 0 ) return;

		const dpr = window.devicePixelRatio || 1;
		const newW = Math.round( rect.width * dpr );
		const newH = Math.round( rect.height * dpr );

		if ( this.canvas.width !== newW || this.canvas.height !== newH ) {

			this.canvas.width = newW;
			this.canvas.height = newH;
			this.render();

		}

	}

	setChannel( channelId ) {

		this.activeChannel = channelId;
		this.selectedIndex = - 1;

		Object.keys( this.channelBtns ).forEach( id => {

			const btn = this.channelBtns[ id ];
			if ( id === channelId ) {

				btn.style.background = 'rgba(255, 255, 255, 0.12)';
				btn.style.borderColor = 'rgba(74, 74, 90, 0.6)';

			} else {

				btn.style.background = 'transparent';
				btn.style.borderColor = 'transparent';

			}

		} );

		this.render();

	}

	setCurves( curves ) {

		if ( curves.rgb ) this.curves.rgb = curves.rgb.map( p => ( { ...p } ) );
		if ( curves.red ) this.curves.red = curves.red.map( p => ( { ...p } ) );
		if ( curves.green ) this.curves.green = curves.green.map( p => ( { ...p } ) );
		if ( curves.blue ) this.curves.blue = curves.blue.map( p => ( { ...p } ) );

		this.selectedIndex = - 1;
		this.render();

	}

	getCurves() {

		return {
			rgb: this.curves.rgb.map( p => ( { ...p } ) ),
			red: this.curves.red.map( p => ( { ...p } ) ),
			green: this.curves.green.map( p => ( { ...p } ) ),
			blue: this.curves.blue.map( p => ( { ...p } ) )
		};

	}

	_getChannelColor( channelId = this.activeChannel ) {

		switch ( channelId ) {

			case 'red': return '#ff3344';
			case 'green': return '#22dd55';
			case 'blue': return '#3388ff';
			default: return '#e0e0e0';

		}

	}

	_normToCanvas( point ) {

		const padL = 28;
		const padR = 10;
		const padT = 10;
		const padB = 16;

		const w = this.canvas.width - padL - padR;
		const h = this.canvas.height - padT - padB;

		return {
			x: padL + point.x * w,
			y: padT + ( 1 - point.y ) * h
		};

	}

	_canvasToNorm( px, py ) {

		const padL = 28;
		const padR = 10;
		const padT = 10;
		const padB = 16;

		const w = this.canvas.width - padL - padR;
		const h = this.canvas.height - padT - padB;

		return {
			x: Math.max( 0, Math.min( 1, ( px - padL ) / w ) ),
			y: Math.max( 0, Math.min( 1, 1 - ( py - padT ) / h ) )
		};

	}

	_initEvents() {

		const getPointerPos = ( e ) => {

			const rect = this.canvas.getBoundingClientRect();
			const clientX = e.touches ? e.touches[ 0 ].clientX : e.clientX;
			const clientY = e.touches ? e.touches[ 0 ].clientY : e.clientY;

			const scaleX = this.canvas.width / rect.width;
			const scaleY = this.canvas.height / rect.height;

			return {
				x: ( clientX - rect.left ) * scaleX,
				y: ( clientY - rect.top ) * scaleY
			};

		};

		const findPointIndex = ( cPos ) => {

			const pts = this.curves[ this.activeChannel ];
			const dpr = window.devicePixelRatio || 1;
			const hitRadius = 16 * dpr;

			let closestIdx = - 1;
			let minDist = hitRadius;

			for ( let i = 0; i < pts.length; i ++ ) {

				const ptPos = this._normToCanvas( pts[ i ] );
				const dx = cPos.x - ptPos.x;
				const dy = cPos.y - ptPos.y;
				const dist = Math.sqrt( dx * dx + dy * dy );

				if ( dist <= minDist ) {

					minDist = dist;
					closestIdx = i;

				}

			}

			return closestIdx;

		};

		const onDown = ( e ) => {

			e.preventDefault();
			if ( this.canvas && typeof this.canvas.focus === 'function' ) {

				this.canvas.focus();

			}

			const pos = getPointerPos( e );
			const idx = findPointIndex( pos );
			const pts = this.curves[ this.activeChannel ];

			// Store snapshot for ESC cancel/revert
			this._dragStartSnapshot = JSON.parse( JSON.stringify( this.curves ) );

			if ( idx !== - 1 ) {

				this.selectedIndex = idx;
				this.isDragging = true;

			} else {

				// Single click on empty canvas area adds a new point and selects it
				const norm = this._canvasToNorm( pos.x, pos.y );
				pts.push( norm );
				pts.sort( ( a, b ) => a.x - b.x );
				this.selectedIndex = pts.findIndex( p => p === norm );
				this.isDragging = true;
				this.notifyChange();

			}

			this.render();

		};

		const onMove = ( e ) => {

			if ( ! this.isDragging || this.selectedIndex === - 1 ) return;

			e.preventDefault();
			const pos = getPointerPos( e );
			const norm = this._canvasToNorm( pos.x, pos.y );
			const pts = this.curves[ this.activeChannel ];

			if ( this.selectedIndex === 0 ) {

				pts[ 0 ].y = norm.y;

			} else if ( this.selectedIndex === pts.length - 1 ) {

				pts[ pts.length - 1 ].y = norm.y;

			} else {

				pts[ this.selectedIndex ].x = norm.x;
				pts[ this.selectedIndex ].y = norm.y;
				pts.sort( ( a, b ) => a.x - b.x );
				this.selectedIndex = pts.findIndex( p => p.x === norm.x && p.y === norm.y );

			}

			this.render();
			this.notifyChange();

		};

		const onUp = () => {

			if ( this.isDragging ) {

				this.isDragging = false;

			}

		};

		const onDblClick = ( e ) => {

			const pos = getPointerPos( e );
			const idx = findPointIndex( pos );
			const pts = this.curves[ this.activeChannel ];

			if ( idx > 0 && idx < pts.length - 1 ) {

				// Double click on point deletes it
				pts.splice( idx, 1 );
				this.selectedIndex = - 1;
				this.render();
				this.notifyChange();

			}

		};

		const onOutsidePointer = ( e ) => {

			if ( this.domElement && ! this.domElement.contains( e.target ) ) {

				if ( this.selectedIndex !== - 1 ) {

					this.selectedIndex = - 1;
					this.render();

				}

			}

		};

		const onKeyDown = ( e ) => {

			const key = e.key;
			const isCanvasFocused = document.activeElement === this.canvas || ( this.domElement && this.domElement.contains( document.activeElement ) );
			const hasSelection = this.selectedIndex !== - 1 || this.isDragging || !! this._dragStartSnapshot;

			if ( ! isCanvasFocused && ! hasSelection ) return;

			const pts = this.curves[ this.activeChannel ];

			if ( key === 'Delete' || key === 'Backspace' || key === 'Del' ) {

				if ( this.selectedIndex > 0 && this.selectedIndex < pts.length - 1 ) {

					e.preventDefault();
					e.stopPropagation();
					pts.splice( this.selectedIndex, 1 );
					this.selectedIndex = - 1;
					this.isDragging = false;
					this._dragStartSnapshot = null;
					this.render();
					this.notifyChange();

				}

			} else if ( key === 'Escape' || key === 'Esc' ) {

				if ( this._dragStartSnapshot ) {

					e.preventDefault();
					e.stopPropagation();
					this.curves = JSON.parse( JSON.stringify( this._dragStartSnapshot ) );
					this.selectedIndex = - 1;
					this.isDragging = false;
					this._dragStartSnapshot = null;
					this.render();
					this.notifyChange();

				} else if ( this.selectedIndex !== - 1 ) {

					e.preventDefault();
					e.stopPropagation();
					this.selectedIndex = - 1;
					this.isDragging = false;
					this.render();

				}

			}

		};

		this.canvas.addEventListener( 'pointerdown', onDown );
		this.canvas.addEventListener( 'keydown', onKeyDown );
		window.addEventListener( 'pointermove', onMove );
		window.addEventListener( 'pointerup', onUp );
		window.addEventListener( 'pointerdown', onOutsidePointer );
		window.addEventListener( 'keydown', onKeyDown );
		this.canvas.addEventListener( 'dblclick', onDblClick );

	}

	notifyChange() {

		if ( typeof this.onChange === 'function' ) {

			this.onChange( this.getCurves() );

		}

	}

	render() {

		if ( ! this.canvas || ! this.ctx ) return;

		const ctx = this.ctx;
		const w = this.canvas.width;
		const h = this.canvas.height;

		const padL = 28;
		const padR = 10;
		const padT = 10;
		const padB = 16;

		const graphW = w - padL - padR;
		const graphH = h - padT - padB;

		// 1. Dark Background Fill
		ctx.fillStyle = '#0a0a0e';
		ctx.fillRect( 0, 0, w, h );

		// 2. Normalized Axis Labels (1.0, 0.5, 0.0)
		ctx.fillStyle = '#66667a';
		ctx.font = '9px monospace';
		ctx.textAlign = 'left';
		ctx.fillText( '1.0', 4, padT + 6 );
		ctx.fillText( '0.5', 4, padT + graphH / 2 + 3 );
		ctx.fillText( '0.0', 4, padT + graphH - 1 );

		// 3. Fine Grid Mesh Lines (8x8)
		ctx.strokeStyle = '#1a1a24';
		ctx.lineWidth = 1;

		const gridDivs = 8;
		for ( let i = 0; i <= gridDivs; i ++ ) {

			const gx = padL + ( i / gridDivs ) * graphW;
			const gy = padT + ( i / gridDivs ) * graphH;

			ctx.beginPath();
			ctx.moveTo( gx, padT );
			ctx.lineTo( gx, padT + graphH );
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo( padL, gy );
			ctx.lineTo( padL + graphW, gy );
			ctx.stroke();

		}

		// 4. Diagonal Reference Line (y = x)
		ctx.strokeStyle = '#2d2d3c';
		ctx.setLineDash( [ 3, 3 ] );
		ctx.beginPath();
		ctx.moveTo( padL, padT + graphH );
		ctx.lineTo( padL + graphW, padT );
		ctx.stroke();
		ctx.setLineDash( [] );

		// 5. Theme Gray Border Frame
		ctx.strokeStyle = 'rgba(74, 74, 90, 0.5)';
		ctx.lineWidth = 1;
		ctx.strokeRect( padL, padT, graphW, graphH );

		// 6. Draw Inactive Channel Curves & Points (VSDC Overlay Style)
		const otherChannels = [ 'rgb', 'red', 'green', 'blue' ].filter( c => c !== this.activeChannel );
		otherChannels.forEach( ch => {

			const pts = this.curves[ ch ];
			const color = this._getChannelColor( ch );

			ctx.strokeStyle = color;
			ctx.globalAlpha = 0.5;
			ctx.lineWidth = 1.2;

			ctx.beginPath();
			for ( let px = 0; px <= graphW; px += 2 ) {

				const normX = px / graphW;
				const normY = evaluateSpline( normX, pts );
				const canvasY = padT + ( 1 - normY ) * graphH;

				if ( px === 0 ) ctx.moveTo( padL + px, canvasY );
				else ctx.lineTo( padL + px, canvasY );

			}

			ctx.stroke();

			// Inactive channel control points
			pts.forEach( pt => {

				const cPos = this._normToCanvas( pt );
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc( cPos.x, cPos.y, 2.5, 0, Math.PI * 2 );
				ctx.fill();
				ctx.strokeStyle = '#0a0a0e';
				ctx.lineWidth = 1;
				ctx.stroke();

			} );

		} );

		ctx.globalAlpha = 1.0;

		// 7. Draw Active Channel Curve (Thin & Crisp, No Glow)
		const activePts = this.curves[ this.activeChannel ];
		const activeColor = this._getChannelColor( this.activeChannel );

		ctx.strokeStyle = activeColor;
		ctx.lineWidth = 1.5;

		ctx.beginPath();
		for ( let px = 0; px <= graphW; px += 2 ) {

			const normX = px / graphW;
			const normY = evaluateSpline( normX, activePts );
			const canvasY = padT + ( 1 - normY ) * graphH;

			if ( px === 0 ) ctx.moveTo( padL + px, canvasY );
			else ctx.lineTo( padL + px, canvasY );

		}

		ctx.stroke();

		// 8. Draw Active Channel Control Points (Elegant Dots)
		activePts.forEach( ( pt, idx ) => {

			const cPos = this._normToCanvas( pt );
			const isSelected = idx === this.selectedIndex;

			// Draw outer halo ring if selected
			if ( isSelected ) {

				ctx.beginPath();
				ctx.arc( cPos.x, cPos.y, 5.5, 0, Math.PI * 2 );
				ctx.strokeStyle = '#00aaff';
				ctx.lineWidth = 1.0;
				ctx.stroke();

			}

			// Point body - uniform clean size
			ctx.fillStyle = activeColor;
			ctx.beginPath();
			ctx.arc( cPos.x, cPos.y, 3.2, 0, Math.PI * 2 );
			ctx.fill();

			ctx.strokeStyle = isSelected ? '#ffffff' : '#0a0a0e';
			ctx.lineWidth = 1.2;
			ctx.stroke();

		} );

	}

}
