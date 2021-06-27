import { CanvasTexture } from '../../../build/three.module.js';

class HTMLTexture extends CanvasTexture {

	constructor( html, width, height, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		if ( html && typeof html !== 'string' ) {

			//If we accept HTML elements, users will expect listeners to be preserved.
			//But listeners transferred to the iframe still run document.querySelector in the listener's context.
			//Too confusing to use imho. :-/

			console.error( `Expected HTMLTexture( html: <string> ). Got html: <${ typeof html }>. Document will be blank.` );

			html = '';

		}

		const canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		defineHTMLTextureNode();

		this._createDocument();


		this._redrawing = false;
		this.redrawing = new Promise( ()=>{} );

		this._cache = {};
		this._urlcache = {};


		this._pointers = new WeakMap();
		this._queue = [];
		this._pointerId = 0;


		this._init( html );

		this.requestRedraw();

	}

	_createDocument() {

		this._node = document.body.appendChild( new ( customElements.get( 'htmltexture-node' ) )() );

		this.document = this._node.contentWindow.document;


		this._cssNode = this.document.head.appendChild( this.document.createElement( 'style' ) );

		this._proxyCanvas = document.createElement( 'canvas' );


		//TODO abbreviate this
		const unstyled = this.document.body.appendChild( new ( customElements.get( 'htmltexture-default' ) )() );

		const unstyle = getComputedStyle( unstyled );

		const _unstyle = this._unstyle = {};

		Array.from( unstyle ).forEach( name => _unstyle[ name ] = unstyle[ name ] );

		this.document.body.removeChild( unstyled );

	}

	_init( html ) {

		if ( this._redrawing === true ) return;

		if ( html ) {

			this.document.open();
			this.document.write( html );
			this.document.close();

			this._cssNode = this.document.head.appendChild( this.document.createElement( 'style' ) );
			this._cssNode.id = 'htmltexture-style';

		}

	}

	requestRedraw( html = '', width = this.image.width, height = this.image.height ) {

		if ( this._redrawing === true ) return;

		if ( html ) this._init( html );

		const scope = this;

		const doc = this.document;

		this._redrawing = true;

		this.redrawing = new Promise( async resolve => {

			//The document may change at any point during the async process.
			//The draw must not fail on in-process changes, but its behavior is undefined.

			//block for image load
			await Promise.all( Array.from( doc.querySelectorAll( 'img' ) ).map( image => new Promise( load => image.complete ? load() : image.addEventListener( 'load', load ) ) ) );


			//simulate hover
			const importedSheets = new Set();

			const C = ( r, t ) => {

				if ( typeof r === 'string' ) return ( /[^[=\s]\s*:hover/gmi ).test( r ) ? `${ r.replace( /([^[=\s])(\s*)(:hover)/gmi, '$1[vr-hover]' ) } { ${ t } }` : '';

				if ( r instanceof CSSImportRule ) return importedSheets.has( r.href ) ? '' : ( importedSheets.add( r.href ), C( r.styleSheet ) );

				if ( r instanceof CSSMediaRule ) return r.cssRules ? `@media ${r.media.mediaText} { ${ C( r.cssRules ) } }` : '';

				if ( r instanceof CSSSupportsRule ) return r.cssRules ? `@supports ${r.conditionText} { ${ C( r.cssRules ) } }` : '';

				if ( r instanceof CSSRule ) return r.cssText + '\n' + C( r.selectorText, r.style.cssText );

				if ( r instanceof CSSRuleList ) return Array.from( r ).map( C ).join( '\n' );

				if ( r instanceof CSSStyleSheet ) return ( r.ownerNode === scope._cssNode ) ? '\n' : C( r.cssRules );

				if ( r instanceof Document ) return Array.from( r.styleSheets ).map( C ).join( '\n' );

			};

			const css = C( doc );

			if ( scope._cssNode.textContent !== css ) scope._cssNode.textContent = css;



			scope._node.style.width = width + 'px';

			scope._node.style.height = height + 'px';


			//collect css urls
			const urls = [];

			const urlid = ( s, e ) => {

				if ( ( ! ( /^url\("/ ).test( s ) ) ) return s;

				let id;
				do id = Math.random().toString().substring( 2 );
				while ( urls[ id ] );

				urls.push( [ e, id, s ] );

				return `{{url${ id }}}`;

			};


			//collect CSS animations
			const styledElements = new Map();

			Array.from( doc.querySelectorAll( '*' ) ).

				map( e => ( [ e, getComputedStyle( e ), Array.from( getComputedStyle( e ) ) ] ) ).

				map( ( [ e, style, names ] ) => ( [ e, names.map( name => ( style[ name ] !== scope._unstyle[ name ] ) ? `${ name }:${ ( urlid( style[ name ], e ) ) }; ` : '' ).join( '' ) ] ) ).

				forEach( ( [ e, cssText ] ) => cssText ? styledElements.set( e, [ cssText, e.style.cssText ] ) : null );


			//fetch css urls
			await Promise.all( urls.map( async ( [ e, id, s ] ) => {

				const [ css, ocss ] = styledElements.get( e );

				let rs = s;
				let i = 0, j = 0;
				while ( true ) {

					//getComputedStyle()'s URLs never have illegal characters. Easy parsing.
					i = s.indexOf( 'url("', j ); j = s.indexOf( '")', i );

					if ( i === - 1 || j === - 1 ) break;

					const u = s.substring( i + 5, j );

					if ( ( /^data:/ ).test( u ) ) continue;

					if ( scope._urlcache[ u ] ) {

						rs = rs.replace( u, scope._urlcache[ u ] );

						continue;

					}

					const r = new FileReader();

					const fetched = await ( new Promise( async load => {

						r.addEventListener( 'load', () => load( true ) );

						let f;

						try {

							f = await fetch( u );

						} catch ( e ) {

							load( false );

						}

						if ( ! f ) load( false );

						r.readAsDataURL( await f.blob() );

					} ) );

					if ( ! fetched ) continue;

					scope._urlcache[ u ] = `${ r.result }`;

					rs = rs.replace( u, scope._urlcache[ u ] );

				}

				styledElements.set( e, [ css.replace( `{{url${ id }}}`, rs ), ocss ] );

			} ) );


			//enable visuals
			const proxies = [];

			const _canvas = scope._proxyCanvas;

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

					_canvas.width = i.width || 0;
					_canvas.height = i.height || 0;

					if ( i instanceof HTMLImageElement || i instanceof HTMLVideoElement || i instanceof HTMLCanvasElement )
						_canvas.getContext( '2d' ).drawImage( i, 0, 0, i.width, i.height );

					d = new Image(); d.src = _canvas.toDataURL();

				}

				if ( i instanceof HTMLImageElement && i.src ) scope._cache[ i.src ] = d;

				d.setAttribute( 'style', style );

				return d;

			};

			await Promise.all( Array.from( doc.querySelectorAll( 'img, canvas, video, svg' ) ).map( async v => ( ( v, d ) => proxies.push( [ v.parentNode, v, d ] ) )( await D( v ) ) ) );


			//-----------------BEGIN SYNC!------------------------
			//-------------BEGIN DO NOT REFLOW!-------------------

			//Proxied elements may have become disconnected or moved during proxy construction
			proxies.forEach( p => p[ 0 ] = p[ 1 ].parentNode );

			//freeze CSS animations
			styledElements.forEach( ( [ cssText ], e ) => ( e instanceof HTMLElement ) ? e.setAttribute( 'style', cssText ) : null );
			//install proxies
			proxies.forEach( ( [ p, e, r ] ) => ( p instanceof HTMLElement && e instanceof HTMLElement && p.contains( e ) ) ? ( p.insertBefore( r, e ), p.removeChild( e ) ) : null );


			const xml = new XMLSerializer().serializeToString( doc );

			const browserBugScale = navigator.userAgent.indexOf( 'AppleWebKit/' ) > - 1 ? 1.5 : 1;
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * browserBugScale}" height="${height * browserBugScale}"><style>${css}</style><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;


			//remove proxies
			proxies.forEach( ( [ p, e, r ] ) => ( p instanceof HTMLElement && e instanceof HTMLElement ) ? ( p.insertBefore( e, r ), p.removeChild( r ) ) : null );
			//unfreeze CSS animations
			styledElements.forEach( ( [ , originalCssText ], e ) => ( e instanceof HTMLElement ) ? e.setAttribute( 'style', originalCssText ) : null );

			//----------------end do not reflow-------------------
			//---------------------end sync-----------------------


			const image = new Image();

			image.onload = () => {

				scope.image.width = width;
				scope.image.height = height;

				const context = scope.image.getContext( '2d' );

				context.drawImage( image, 0, 0, width, height );

				scope.needsUpdate = true;

				this._redrawing = false;

				for ( let i = 0; i < scope._queue.length; i ++ ) {

					const [ action, ...parameters ] = scope._queue[ i ];

					scope[ action ]( ...parameters );

				}

				resolve();

			};

			image.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent( svg );

		} );

		return this.redrawing;

	}

	//click event per https://www.w3.org/TR/uievents/#event-type-click
	//pointers per https://w3c.github.io/pointerevents/#pointerevent-interface
	//mouse events per https://w3c.github.io/uievents/#dom-mouseevent-mouseevent
	//except no hover, no focus, no pointercapture, no pointercancel, no dblclick

	addPointer( vec2, down ) {

		if ( this._redrawing ) this._queue.push( [ '_addPointer', vec2, { x: vec2.x, y: vec2.y }, down ] );

		else this._addPointer( vec2, vec2, down );

	}

	_addPointer( key, vec2, down ) {

		const { x, y } = vec2;

		down = !! down;


		const target = this.elementFromPoint( x, y );

		this._pointers.set( key, Object.freeze( { x, y, target, down, pointerId: this._pointerId ++ } ) );

		this._updatePointer( key, vec2, down, true );

	}

	updatePointer( vec2, down ) {

		if ( this._redrawing ) this._queue.push( [ '_updatePointer', vec2, { x: vec2.x, y: vec2.y }, down ] );

		else this._updatePointer( vec2, vec2, down );

	}

	_updatePointer( key, vec2, down, start = false ) {

		const pointer = this._pointers.get( key );

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

		this._pointers.set( key, Object.freeze( { x, y, target, down, pointerId: pointer.pointerId } ) );

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
