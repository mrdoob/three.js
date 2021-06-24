import { CanvasTexture } from '../../../build/three.module.js';

class HTMLTexture extends CanvasTexture {

	constructor( html, width, height, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		const canvas = document.createElement( 'canvas' );


		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );


		let htmlTextureNode = customElements.get( 'htmltexture-node' );

		if ( ! htmlTextureNode ) htmlTextureNode = this._defineNode();


		this._node = document.body.appendChild( new htmlTextureNode() );

		this.document = this._node.shadowRoot;


		this.onFinishRedraw = null;


		this._cache = {};


		this._pointers = new WeakMap();

		this._pointerId = 0;


		this.redrawAsync( html, width, height );

	}

	redrawAsync( html, width, height ) {

		const scope = this;

		const sroot = scope.document;


		if ( html ) {

			while ( sroot.firstChild ) sroot.removeChild( sroot.firstChild );

			sroot.appendChild( new DOMParser().parseFromString( html, 'text/html' ).documentElement );


			//enable javascript

			const scripts = Array.from( sroot.querySelectorAll( 'script' ) );

			scripts.map( script => {

				const { parentNode } = script;

				const newScript = document.createElement( 'script' );
				newScript.textContent = script.textContent;

				parentNode.insertBefore( newScript, script );

				parentNode.removeChild( script );

			} );

		}


		return new Promise( async resolve => {

			//enable css

			const importedSheets = new Set();

			const C = ( r, t ) => {

				if ( typeof r === 'string' ) return ( /:hover/gmi ).test( r ) ? `${ r.replace( /:hover/gmi, '.vr-hover' ) } { ${ t } }` : '';

				if ( r instanceof CSSImportRule ) return importedSheets.has( r.href ) ? '' : ( importedSheets.add( r.href ), C( r.styleSheet ) );

				if ( r instanceof CSSMediaRule ) return r.cssRules ? `@media ${r.media.mediaText} { ${ C( r.cssRules ) } }` : '';

				if ( r instanceof CSSSupportsRule ) return r.cssRules ? `@supports ${r.conditionText} { ${ C( r.cssRules ) } }` : '';

				if ( r instanceof CSSRule ) return r.cssText + '\n' + C( r.selectorText, r.style.cssText );

				if ( r instanceof CSSRuleList ) return Array.from( r ).map( C ).join( '\n' );

				if ( r instanceof CSSStyleSheet ) return C( r.cssRules );

				if ( r instanceof Document ) return Array.from( r.styleSheets ).map( C ).join( '\n' );

			};

			const css = C( sroot );



			//enable images
			{

				const _canvas = document.createElement( 'canvas' );

				const images = Array.from( sroot.querySelectorAll( 'img' ) );

				await Promise.all( images.map(

					image => new Promise( async load => {

						if ( image.src.indexOf( 'data:' ) === 0 ) {

							load();

						} else if ( scope._cache[ image.src ] ) {

							image.src = scope._cache[ image.src ];

							load();

						} else {

							const urlImage = new Image();

							urlImage.onload = () => {

								const rect = image.getClientRects()[ 0 ];

								_canvas.width = Math.max( 1, Math.min( rect.width, image.width ) );
								_canvas.height = Math.max( 1, Math.min( rect.height, image.height ) );

								_canvas.getContext( '2d' ).drawImage( urlImage, 0, 0, _canvas.width, _canvas.height );

								scope._cache[ image.src ] = _canvas.toDataURL();

								image.src = scope._cache[ image.src ];

								load();

							};


							urlImage.src = image.src;

						}

					} )

				) );

			}


			//simulate hover

			const undoAddClasses = [];

			Array.from( sroot.querySelectorAll( '*' ) ).forEach(

				e => {

					if ( ( ! e?.classList?.contains( 'vr-hover' ) ) && e?._isVRHovering ) {

						e.classList.add( 'vr-hover' );

						undoAddClasses.push( e );

					}

				}

			);


			const canvas = scope.image;

			if ( width === undefined ) width = canvas.width;

			else canvas.width = width;

			if ( height === undefined ) height = canvas.height;

			else canvas.height = height;


			scope._node.style.width = width + 'px';

			scope._node.style.height = width + 'px';


			const xml = new XMLSerializer().serializeToString( sroot );

			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>${css}</style><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;


			for ( const e of undoAddClasses ) e.classList.remove( 'vr-hover' );


			const image = new Image();

			image.onload = () => {

				canvas.getContext( '2d' ).drawImage( image, 0, 0 );

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

				pointer.target._isVRHovering = false;

				if ( ! pointer.target.contains( target ) ) dispatch( 'leave', pointer.target, target, false );

			}

			if ( target ) {

				dispatch( 'over', target, pointer.target );

				target._isVRHovering = true;

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


		const element = this.document.elementFromPoint( x, y );


		style.pointerEvents = 'none';

		style.zIndex = '-1000000';


		return element;

	}

	_defineNode() {

		class HTMLTextureNode extends HTMLElement {

			constructor() {

				super();

				this.attachShadow( { mode: 'open' } );

				this.style.cssText = 'contain:layout; pointer-events:none; display:block; position:absolute; left:0; top:0; opacity:0.0; overflow:hidden; z-index:-1000000';

			}

		}

		customElements.define( 'htmltexture-node', HTMLTextureNode, { is: 'htmltexture-node' } );

		return HTMLTextureNode;

	}

}

HTMLTexture.prototype.isHTMLTexture = true;

export { HTMLTexture };
