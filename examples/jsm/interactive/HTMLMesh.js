import {
	CanvasTexture,
	LinearFilter,
	Mesh,
	MeshBasicMaterial,
	PlaneGeometry,
	sRGBEncoding,
	Color
} from 'three';

class HTMLMesh extends Mesh {

	constructor( dom ) {

		const texture = new HTMLTexture( dom );

		const geometry = new PlaneGeometry( texture.image.width * 0.001, texture.image.height * 0.001 );
		const material = new MeshBasicMaterial( { map: texture, toneMapped: false, transparent: true } );

		super( geometry, material );

		function onEvent( event ) {

			material.map.dispatchDOMEvent( event );

		}

		this.addEventListener( 'mousedown', onEvent );
		this.addEventListener( 'mousemove', onEvent );
		this.addEventListener( 'mouseup', onEvent );
		this.addEventListener( 'click', onEvent );

		this.dispose = function () {

			geometry.dispose();
			material.dispose();

			material.map.dispose();

			this.removeEventListener( 'mousedown', onEvent );
			this.removeEventListener( 'mousemove', onEvent );
			this.removeEventListener( 'mouseup', onEvent );
			this.removeEventListener( 'click', onEvent );

		};

	}

}

class HTMLTexture extends CanvasTexture {

	constructor( dom ) {

		super( html2canvas( dom ) );

		this.dom = dom;

		this.anisotropy = 16;
		this.encoding = sRGBEncoding;
		this.minFilter = LinearFilter;
		this.magFilter = LinearFilter;

		// Create an observer on the DOM, and run html2canvas update in the next loop
		const observer = new MutationObserver( () => {

			if ( ! this.scheduleUpdate ) {

				// ideally should use xr.requestAnimationFrame, here setTimeout to avoid passing the renderer
				this.scheduleUpdate = setTimeout( () => this.update(), 16 );

			}

		} );

		const config = { attributes: true, childList: true, subtree: true, characterData: true };
		observer.observe( dom, config );

		this.observer = observer;

	}

	dispatchDOMEvent( event ) {

		if ( event.data ) {

			htmlevent( this.dom, event.type, event.data.x, event.data.y );

		}

	}

	update() {

		this.image = html2canvas( this.dom );
		this.needsUpdate = true;

		this.scheduleUpdate = null;

	}

	dispose() {

		if ( this.observer ) {

			this.observer.disconnect();

		}

		this.scheduleUpdate = clearTimeout( this.scheduleUpdate );

		super.dispose();

	}

}


//

const canvases = new WeakMap();

function html2canvas( element ) {

	const range = document.createRange();
	const color = new Color();

	function Clipper( context ) {

		const clips = [];
		let isClipping = false;

		function doClip() {

			if ( isClipping ) {

				isClipping = false;
				context.restore();

			}

			if ( clips.length === 0 ) return;

			let minX = - Infinity, minY = - Infinity;
			let maxX = Infinity, maxY = Infinity;

			for ( let i = 0; i < clips.length; i ++ ) {

				const clip = clips[ i ];

				minX = Math.max( minX, clip.x );
				minY = Math.max( minY, clip.y );
				maxX = Math.min( maxX, clip.x + clip.width );
				maxY = Math.min( maxY, clip.y + clip.height );

			}

			context.save();
			context.beginPath();
			context.rect( minX, minY, maxX - minX, maxY - minY );
			context.clip();

			isClipping = true;

		}

		return {

			add: function ( clip ) {

				clips.push( clip );
				doClip();

			},

			remove: function () {

				clips.pop();
				doClip();

			}

		};

	}

	function drawText( style, x, y, string ) {

		if ( string !== '' ) {

			if ( style.textTransform === 'uppercase' ) {

				string = string.toUpperCase();

			}

			context.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
			context.textBaseline = 'top';
			context.fillStyle = style.color;
			context.fillText( string, x, y + parseFloat(style.fontSize)*0.1 );

		}

	}

	function roundRectPath(x, y, w, h, r) {
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;
		context.beginPath();
		context.moveTo(x+r, y);
		context.arcTo(x+w, y,   x+w, y+h, r);
		context.arcTo(x+w, y+h, x,   y+h, r);
		context.arcTo(x,   y+h, x,   y,   r);
		context.arcTo(x,   y,   x+w, y,   r);
		context.closePath();
	}

	function drawBorder( style, which, x, y, width, height ) {

		const borderWidth = style[ which + 'Width' ];
		const borderStyle = style[ which + 'Style' ];
		const borderColor = style[ which + 'Color' ];

		if ( borderWidth !== '0px' && borderStyle !== 'none' && borderColor !== 'transparent' && borderColor !== 'rgba(0, 0, 0, 0)' ) {

			context.strokeStyle = borderColor;
			context.lineWidth = parseFloat(borderWidth);
			context.beginPath();
			context.moveTo( x, y );
			context.lineTo( x + width, y + height );
			context.stroke();

		}

	}

	function drawElement( element, style ) {

		let x = 0, y = 0, width = 0, height = 0;

		if ( element.nodeType === Node.TEXT_NODE ) {

			// text

			range.selectNode( element );

			const rect = range.getBoundingClientRect();

			x = rect.left - offset.left - 0.5;
			y = rect.top - offset.top - 0.5;
			width = rect.width;
			height = rect.height;

			drawText( style, x, y, element.nodeValue.trim() );

		} else if ( element.nodeType === Node.COMMENT_NODE ) {

			return;

		} else if ( element instanceof HTMLCanvasElement ) {

			// Canvas element
			if ( element.style.display === 'none' ) return;

			context.save();
			const dpr = window.devicePixelRatio;
			context.scale(1/dpr, 1/dpr);
			context.drawImage(element, 0, 0 );
			context.restore();

		} else {

			if ( element.style.display === 'none' ) return;

			const rect = element.getBoundingClientRect();

			x = rect.left - offset.left - 0.5;
			y = rect.top - offset.top - 0.5;
			width = rect.width;
			height = rect.height;

			style = window.getComputedStyle( element );

			const backgroundColor = style.backgroundColor;

			// Get the border of the element used for fill and border
			roundRectPath(x, y, width, height, parseFloat(style.borderRadius) );
			if ( backgroundColor !== 'transparent' && backgroundColor !== 'rgba(0, 0, 0, 0)' ) {

				context.fillStyle = backgroundColor;
				context.fill();
			}

			// If all the borders match then stroke the round rectangle
			const borders = ['borderTop', 'borderLeft', 'borderBottom', 'borderRight'];
			let match = true;
			let prevBorder = null;
			for (const border of borders) {
				if (prevBorder) {
					match = match && style[ border + 'Width' ] && style[ border + 'Color' ] && style[ border + 'Style'];
				}
				if (!match) break;
				prevBorder = border;
			}

			// they all match so stroke the rectangle from before
			if (match) {
				const width = parseFloat(style.borderTopWidth);
				if ( style.borderTopWidth !== '0px' && style.borderTopStyle !== 'none' && style.borderTopColor !== 'transparent' && style.borderTopColor !== 'rgba(0, 0, 0, 0)' ) {
					context.strokeStyle = style.borderTopColor;
					context.lineWidth = width;
					context.stroke();
				}
			} else {

				// Otherwise draw individual borders
				drawBorder( style, 'borderTop', x, y, width, 0 );
				drawBorder( style, 'borderLeft', x, y, 0, height );
				drawBorder( style, 'borderBottom', x, y + height, width, 0 );
				drawBorder( style, 'borderRight', x + width, y, 0, height );
			}

			if ( element instanceof HTMLInputElement) {

				let accentColor = style.accentColor;
				if (accentColor === undefined || accentColor === 'auto') accentColor = style.color;
				color.set(accentColor);
				const luminance = Math.sqrt( 0.299*color.r**2 + 0.587*color.g**2 + 0.114*color.b**2 );
				const accentTextColor = luminance < 0.5 ? 'white' : '#111111';

				if (element.type  === 'radio') {
					roundRectPath(x,y,width,height,height);
					context.fillStyle = 'white';
					context.strokeStyle = accentColor;
					context.lineWidth = 1;
					context.fill();
					context.stroke();

					if (element.checked) {
						const border = 2;
						roundRectPath(x+border,y+border,width-border*2,height-border*2, height);
						context.fillStyle = accentColor;
						context.strokeStyle = accentTextColor;
						context.lineWidth = border;
						context.fill();
						context.stroke();
					}
				}

				if (element.type  === 'checkbox') {
					roundRectPath(x,y,width,height,2);
					context.fillStyle = element.checked ? accentColor : 'white';
					context.strokeStyle = element.checked ? accentTextColor : accentColor;
					context.lineWidth = 1;
					context.stroke();
					context.fill();

					if (element.checked) {
						const oldTextAlign = context.textAlign;
						context.textAlign = 'center';
						drawText( {
							color: accentTextColor,
							fontFamily: style.fontFamily,
							fontSize: height + 'px',
							fontWeight: 'bold'
						}, x + width/2, y, '✔' );
						context.textAlign = oldTextAlign;
					}
				}

				if (element.type  === 'range') {
					const [min,max,value] = ['min','max','value'].map(property => parseFloat(element[property]));
					const position = ((value-min)/(max-min)) * (width - height);

					roundRectPath(x,y + height*0.25,width, height*0.5, height*0.25);
					context.fillStyle = accentTextColor;
					context.strokeStyle = accentColor;
					context.lineWidth = 1;
					context.fill();
					context.stroke();

					roundRectPath(x,y + height*0.25,position+height*0.5, height*0.5, height*0.25);
					context.fillStyle = accentColor;
					context.fill();

					roundRectPath(x + position,y,height, height, height*0.5);
					context.fillStyle = accentColor;
					context.fill();
				}

				if (element.type === 'color' || element.type === 'text' || element.type === 'number' ) {

					clipper.add( { x: x, y: y, width: width, height: height } );

					drawText( style, x + parseInt( style.paddingLeft ), y + parseInt( style.paddingTop ), element.value );

					clipper.remove();

				}

			}

		}

		/*
		// debug
		context.strokeStyle = '#' + Math.random().toString( 16 ).slice( - 3 );
		context.strokeRect( x - 0.5, y - 0.5, width + 1, height + 1 );
		*/

		const isClipping = style.overflow === 'auto' || style.overflow === 'hidden';

		if ( isClipping ) clipper.add( { x: x, y: y, width: width, height: height } );

		for ( let i = 0; i < element.childNodes.length; i ++ ) {

			drawElement( element.childNodes[ i ], style );

		}

		if ( isClipping ) clipper.remove();

	}

	const offset = element.getBoundingClientRect();

	let canvas;

	if ( canvases.has( element ) ) {

		canvas = canvases.get( element );

	} else {

		canvas = document.createElement( 'canvas' );
		canvas.width = offset.width;
		canvas.height = offset.height;

	}

	const context = canvas.getContext( '2d'/*, { alpha: false }*/ );

	const clipper = new Clipper( context );

	// console.time( 'drawElement' );

	drawElement( element );

	// console.timeEnd( 'drawElement' );

	return canvas;

}

function htmlevent( element, event, x, y ) {

	const mouseEventInit = {
		clientX: ( x * element.offsetWidth ) + element.offsetLeft,
		clientY: ( y * element.offsetHeight ) + element.offsetTop,
		view: element.ownerDocument.defaultView
	};

	window.dispatchEvent( new MouseEvent( event, mouseEventInit ) );

	const rect = element.getBoundingClientRect();

	x = x * rect.width + rect.left;
	y = y * rect.height + rect.top;

	function traverse( element ) {

		if ( element.nodeType !== Node.TEXT_NODE && element.nodeType !== Node.COMMENT_NODE ) {

			const rect = element.getBoundingClientRect();

			if ( x > rect.left && x < rect.right && y > rect.top && y < rect.bottom ) {

				element.dispatchEvent( new MouseEvent( event, mouseEventInit ) );

			}

			for ( let i = 0; i < element.childNodes.length; i ++ ) {

				traverse( element.childNodes[ i ] );

			}

		}

	}

	traverse( element );

}

export { HTMLMesh };
