import * as THREE from '../../../build/three.module.js';

class HTMLMesh extends THREE.Mesh {

	constructor( dom ) {

		const texture = new HTMLTexture( dom );

		const geometry = new THREE.PlaneGeometry( texture.image.width * 0.002, texture.image.height * 0.002 );
		const material = new THREE.MeshBasicMaterial( { map: texture, toneMapped: false } );

		super( geometry, material );

	}

}

class HTMLTexture extends THREE.CanvasTexture {

	constructor( dom ) {

		super( html2canvas( dom ) );

		this.dom = dom;

		this.anisotropy = 16;
		this.encoding = THREE.sRGBEncoding;
		this.minFilter = THREE.LinearFilter;
		this.magFilter = THREE.LinearFilter;

	}

	click( x, y ) {

		htmlclick( this.dom, x, y );

		this.update();

	}

	update() {

		this.image = html2canvas( this.dom );
		this.needsUpdate = true;

	}

}

//

function html2canvas( element ) {

	var range = document.createRange();

	function Clipper( context ) {

		var clips = [];
		var isClipping = false;

		function doClip() {

			if ( isClipping ) {

				isClipping = false;
				context.restore();

			}

			if ( clips.length === 0 ) return;

			var minX = - Infinity, minY = - Infinity;
			var maxX = Infinity, maxY = Infinity;

			for ( var i = 0; i < clips.length; i ++ ) {

				var clip = clips[ i ];

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

			context.font = style.fontSize + ' ' + style.fontFamily;
			context.textBaseline = 'top';
			context.fillStyle = style.color;
			context.fillText( string, x, y );

		}

	}

	function drawBorder( style, which, x, y, width, height ) {

		var borderWidth = style[ which + 'Width' ];
		var borderStyle = style[ which + 'Style' ];
		var borderColor = style[ which + 'Color' ];

		if ( borderWidth !== '0px' && borderStyle !== 'none' && borderColor !== 'transparent' && borderColor !== 'rgba(0, 0, 0, 0)' ) {

			context.strokeStyle = borderColor;
			context.beginPath();
			context.moveTo( x, y );
			context.lineTo( x + width, y + height );
			context.stroke();

		}

	}

	function drawElement( element, style ) {

		var x = 0, y = 0, width = 0, height = 0;

		if ( element.nodeType === 3 ) {

			// text

			range.selectNode( element );

			var rect = range.getBoundingClientRect();

			x = rect.left - offset.left - 0.5;
			y = rect.top - offset.top - 0.5;
			width = rect.width;
			height = rect.height;

			drawText( style, x, y, element.nodeValue.trim() );

		} else {

			if ( element.style.display === 'none' ) return;

			var rect = element.getBoundingClientRect();

			x = rect.left - offset.left - 0.5;
			y = rect.top - offset.top - 0.5;
			width = rect.width;
			height = rect.height;

			style = window.getComputedStyle( element );

			var backgroundColor = style.backgroundColor;

			if ( backgroundColor !== 'transparent' && backgroundColor !== 'rgba(0, 0, 0, 0)' ) {

				context.fillStyle = backgroundColor;
				context.fillRect( x, y, width, height );

			}

			drawBorder( style, 'borderTop', x, y, width, 0 );
			drawBorder( style, 'borderLeft', x, y, 0, height );
			drawBorder( style, 'borderBottom', x, y + height, width, 0 );
			drawBorder( style, 'borderRight', x + width, y, 0, height );

			if ( element.type === 'color' || element.type === 'text' ) {

				clipper.add( { x: x, y: y, width: width, height: height } );

				drawText( style, x + parseInt( style.paddingLeft ), y + parseInt( style.paddingTop ), element.value );

				clipper.remove();

			}

		}

		/*
		// debug
		context.strokeStyle = '#' + Math.random().toString( 16 ).slice( - 3 );
		context.strokeRect( x - 0.5, y - 0.5, width + 1, height + 1 );
		*/

		var isClipping = style.overflow === 'auto' || style.overflow === 'hidden';

		if ( isClipping ) clipper.add( { x: x, y: y, width: width, height: height } );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			drawElement( element.childNodes[ i ], style );

		}

		if ( isClipping ) clipper.remove();

	}

	var offset = element.getBoundingClientRect();

	var canvas = document.createElement( 'canvas' );
	canvas.width = offset.width;
	canvas.height = offset.height;

	var context = canvas.getContext( '2d'/*, { alpha: false }*/ );

	var clipper = new Clipper( context );

	console.time( 'drawElement' );

	drawElement( element );

	console.timeEnd( 'drawElement' );

	return canvas;

}

function htmlclick( element, x, y ) {

	/*
	const mouseEventInit = {
		clientX: ( x * element.offsetWidth ) + element.offsetLeft,
		clientY: ( y * element.offsetHeight ) + element.offsetTop,
		view: element.ownerDocument.defaultView
	};
	element.dispatchEvent( new MouseEvent( 'click', mouseEventInit ) );
	*/

	const rect = element.getBoundingClientRect();

	x = x * rect.width + rect.left;
	y = y * rect.height + rect.top;

	function traverse( element ) {

		if ( element.nodeType !== 3 ) {

			const rect = element.getBoundingClientRect();

			if ( x > rect.left && x < rect.right && y > rect.top && y < rect.bottom ) {

				element.click();

			}

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				traverse( element.childNodes[ i ] );

			}

		}

	}

	traverse( element );

}

export { HTMLMesh, HTMLTexture };
