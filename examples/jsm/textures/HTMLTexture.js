import { CanvasTexture } from '../../../build/three.module.js';

class HTMLTexture extends CanvasTexture {

	constructor( html, width, height, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		const canvas = document.createElement( 'canvas' );


		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		defineHTMLTextureNode();

		this._createDocument();


		this.onFinishRedraw = null;


		this._cache = {};


		this._pointers = new WeakMap();

		this._pointerId = 0;


		this.redrawAsync( html, width, height );

	}

	_createDocument() {

		this._node = document.body.appendChild( new ( customElements.get( 'htmltexture-node' ) )() );

		this.document = this._node.contentWindow.document;


		const unstyled = this.document.body.appendChild( new ( customElements.get( 'htmltexture-default' ) )() );

		const unstyle = getComputedStyle( unstyled );

		const _unstyle = this._unstyle = {};

		Array.from( unstyle ).forEach( name => _unstyle[ name ] = unstyle[ name ] );

		this.document.body.removeChild( unstyled );

	}

	async redrawAsync( html, width, height ) {

		const scope = this;

		const sroot = scope.document;


		if ( html ) {

			sroot.open();
			sroot.write( html );
			sroot.close();

		}


		return new Promise( async resolve => {

			//enable css, simulate hover
			//TODO css url image, font
			const importedSheets = new Set();

			const C = ( r, t ) => {

				if ( typeof r === 'string' ) return ( /[^[=\s]\s*:hover/gmi ).test( r ) ? `${ r.replace( /([^[=\s])(\s*)(:hover)/gmi, '$1[vr-hover]' ) } { ${ t } }` : '';

				if ( r instanceof CSSImportRule ) return importedSheets.has( r.href ) ? '' : ( importedSheets.add( r.href ), C( r.styleSheet ) );

				if ( r instanceof CSSMediaRule ) return r.cssRules ? `@media ${r.media.mediaText} { ${ C( r.cssRules ) } }` : '';

				if ( r instanceof CSSSupportsRule ) return r.cssRules ? `@supports ${r.conditionText} { ${ C( r.cssRules ) } }` : '';

				if ( r instanceof CSSRule ) return r.cssText + '\n' + C( r.selectorText, r.style.cssText );

				if ( r instanceof CSSRuleList ) return Array.from( r ).map( C ).join( '\n' );

				if ( r instanceof CSSStyleSheet ) return C( r.cssRules );

				if ( r instanceof Document ) return Array.from( r.styleSheets ).map( C ).join( '\n' );

			};

			const css = C( sroot );


			//block for image load
			await Promise.all( Array.from( sroot.querySelectorAll( 'img' ) ).map( image => new Promise( load => image.complete ? load() : image.addEventListener( 'load', load ) ) ) );


			scope._node.style.width = ( width = scope.image.width = width || scope.image.width ) + 'px';

			scope._node.style.height = ( height = scope.image.height = height || scope.image.height ) + 'px';



			//collect CSS animations
			const styledElements = new Map();

			Array.from( sroot.querySelectorAll( '*' ) ).

				map( e => ( [ e, getComputedStyle( e ), Array.from( getComputedStyle( e ) ) ] ) ).

				map( ( [ e, style, names ] ) => ( [ e, names.map( name => ( style[ name ] !== this._unstyle[ name ] ) ? `${ name }:${ style[ name ] }; ` : '' ).join( '' ) ] ) ).

				forEach( ( [ e, cssText ] ) => cssText ? styledElements.set( e, [ cssText, e.style.cssText ] ) : null );



			//enable visuals
			const proxies = [];

			const _canvas = document.createElement( 'canvas' );

			const D = async ( i ) => {

				const [ style ] = styledElements.get( i ) || [ '' ];

				let d;

				if ( i instanceof HTMLImageElement && scope._cache[ i.src ] ) d = scope._cache[ i.src ];

				if ( i instanceof SVGElement ) {

					const src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent( new XMLSerializer().serializeToString( i ) );

					if ( scope._cache[ src ] ) d = scope._cache[ src ];

					else {

						const s = new Image(); s.src = src;

						await ( new Promise( load => s.onload = load ) );

						i = s;

					}

				}

				if ( ! d ) {

					_canvas.width = i.width;
					_canvas.height = i.height;

					_canvas.getContext( '2d' ).drawImage( i, 0, 0, i.width, i.height );

					d = new Image(); d.src = _canvas.toDataURL();

				}

				if ( i instanceof HTMLImageElement ) scope._cache[ i.src ] = d;

				d.setAttribute( 'style', style );

				return d;

			};

			await Promise.all( Array.from( sroot.querySelectorAll( 'img, canvas, video, svg' ) ).map( async v => proxies.push( [ v.parentNode, v, await D( v ) ] ) ) );


			//-------------BEGIN DO NOT REFLOW!-------------------

			//freeze CSS animations
			styledElements.forEach( ( [ cssText ], e ) => e.setAttribute( 'style', cssText ) );
			//install proxies
			proxies.forEach( ( [ p, e, r ] ) => ( p.insertBefore( r, e ), p.removeChild( e ) ) );


			const xml = new XMLSerializer().serializeToString( sroot );

			const browserBugScale = navigator.userAgent.indexOf( 'AppleWebKit/' ) > -1 ? 1.5 : 1;
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * browserBugScale}" height="${height * browserBugScale}"><style>${css}</style><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;


			//remove proxies
			proxies.forEach( ( [ p, e, r ] ) => ( p.insertBefore( e, r ), p.removeChild( r ) ) );
			//unfreeze CSS animations
			styledElements.forEach( ( [ , originalCssText ], e ) => e.setAttribute( 'style', originalCssText ) );

			//----------------end do not reflow-------------------


			const image = new Image();

			image.onload = () => {

				const context = scope.image.getContext( '2d' );

				context.clearRect( 0, 0, width, height );
				context.drawImage( image, 0, 0 );

				scope.needsUpdate = true;

				resolve();

				if ( scope.onFinishRedraw ) setTimeout( scope.onFinishRedraw, 1 );

			};

			image.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent( svg );

		} );

	}

	//click event per https://www.w3.org/TR/uievents/#event-type-click
	//pointers per https://w3c.github.io/pointerevents/#pointerevent-interface
	//mouse events per https://w3c.github.io/uievents/#dom-mouseevent-mouseevent
	//except no hover, no focus, no pointercapture, no pointercancel, no dblclick

	addPointer( vec2, down ) {

		const { x, y } = vec2;

		down = !! down;


		const target = this.elementFromPoint( x, y );

		this._pointers.set( vec2, Object.freeze( { x, y, target, down, pointerId: this._pointerId ++ } ) );

		this.updatePointer( vec2, down, true );

	}

	updatePointer( vec2, down, start = false ) {

		const pointer = this._pointers.get( vec2 );

		if ( ! pointer ) return;


		const { x, y } = vec2;

		down = !! down;


		const event = { pointerId: pointer.pointerId, clientX: x, clientY: y, screenX: x, screenY: y, button: 1 * down };

		const dispatch = ( key, target, relatedTarget = null, bubble = true ) => {

			do {

				if ( ! target.dispatchEvent( key === 'click' ? new Event( '' ) : new PointerEvent( 'pointer' + key, { relatedTarget, ...event } ) ) ) return false;

				if ( ! target.dispatchEvent( new MouseEvent( ( key === 'click' ) ? key : ( 'mouse' + key ), { relatedTarget, ...event } ) ) ) return false;

			} while ( bubble && ( target = target.parentNode ) );

			return true;

		};


		const target = this.elementFromPoint( x, y );

		if ( target !== pointer.target || start ) {

			if ( pointer.target ) {

				dispatch( 'out', pointer.target, target );

				pointer.target.removeAttribute( 'vr-hover' );

				if ( ! pointer.target.contains( target ) ) dispatch( 'leave', pointer.target, target, false );

			}

			if ( target ) {

				dispatch( 'over', target, pointer.target );

				target.setAttributeNode( document.createAttribute( 'vr-hover' ) );

				if ( ! target.contains( pointer.target ) ) dispatch( 'enter', target, pointer.target, false );

				dispatch( 'move', target );

			}

		}

		if ( target && ( ( down !== pointer.down ) || start ) ) {

			if ( down ) dispatch( 'down', target );

			if ( ! down ) {

				dispatch( 'up', target );

				if ( ! start ) {

					//No support for :focus
					//if ( typeof target.focus === 'function' ) target.focus();

					if ( typeof target.click === 'function' ) target.click();

					else dispatch( 'click', target );

				}

			}

		}

		this._pointers.set( vec2, Object.freeze( { x, y, target, down, pointerId: pointer.pointerId } ) );

	}

	elementFromPoint( x, y ) {

		const style = this._node.style;

		style.pointerEvents = 'auto';

		style.zIndex = '1000000';

		if ( x > innerWidth ) style.left = ( innerWidth / 2 ) - x;
		if ( y > innerHeight ) style.top = ( innerHeight / 2 ) - y;

		const element = this.document.elementFromPoint( x, y );

		style.left = 0;
		style.top = 0;

		style.pointerEvents = 'none';

		style.zIndex = '-1000000';


		return element;

	}

}

function defineHTMLTextureNode() {

	if ( ! customElements.get( 'htmltexture-node' ) ) {

		class HTMLTextureNode extends HTMLIFrameElement {

			constructor() {

				super();

				this.style.cssText = 'contain:layout; pointer-events:none; display:block; position:absolute; left:0; top:0; opacity:0.0; z-index:-1000000';

			}

		}

		customElements.define( 'htmltexture-node', HTMLTextureNode, { is: 'htmltexture-node', extends: 'iframe' } );

	}

	if ( ! customElements.get( 'htmltexture-default' ) ) {

		class HTMLTextureDefault extends HTMLElement {

			constructor() {

				super();

				this.style.cssText = 'all:unset !important;';

			}

		}

		customElements.define( 'htmltexture-default', HTMLTextureDefault, { is: 'htmltexture-default' } );

	}

}

HTMLTexture.prototype.isHTMLTexture = true;

export { HTMLTexture };
