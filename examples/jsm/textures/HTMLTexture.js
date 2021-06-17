import { CanvasTexture } from '../../../build/three.module.js';

class HTMLTexture extends CanvasTexture {

	constructor( html, css, width, height, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		const canvas = document.createElement( 'canvas' );


		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );


		let htmlTextureNode = customElements.get( 'htmltexture-node' );

		if( ! htmlTextureNode ) htmlTextureNode = this._defineNode();


		this._node = document.body.appendChild( new htmlTextureNode() );

		this.document = this._node.shadowRoot;


		this.onFinishRedraw = null;


		this._css = css;

		this._cache = {};


		this.redrawAsync( html, css, width, height );

	}

	redrawAsync( html, css, width, height ) {

		const scope = this;

		const sroot = scope.document;

		let rootStyle = null;


		if ( html ) {

			while( sroot.firstChild ) sroot.removeChild( sroot.firstChild );

			sroot.appendChild( new DOMParser().parseFromString( html , 'text/html' ).documentElement );

		}


		if ( ! css ) css = scope._css;

		else {

			scope._css = css;

			sroot.appendChild( rootStyle = document.createElement( 'style' ) ).textContent = css;

		}


		return new Promise( async resolve => {

			//enable in-line css

			const styles = Array.from( sroot.querySelectorAll( 'style' ) );

			css += '\n' + styles.map( style => (style === rootStyle) ? '' : style.textContent ).join( '\n' );



			//use fetch to enable linked css? seems out-of-scope. maybe add css loader

			//const links = Array.from( sroot.querySelectorAll( "link[rel=stylesheet]" ) );

			//await Promise.all( links.map( link => css += '\n' + await ( await fetch( link.href ) ).text() ) );



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

							urlImage.crossOrigin = "anonymous";

							urlImage.onload = () => {

								_canvas.width = urlImage.width;
								_canvas.height = urlImage.height;

								_canvas.getContext( '2d' ).drawImage( urlImage, 0, 0 );

								scope._cache[ image.src ] = _canvas.toDataURL();

								image.src = scope._cache[ image.src ];

								load();

							};


							urlImage.src = image.src;

						}

					} )

				) );

			}


			const canvas = scope.image;

			if ( width === undefined ) width = canvas.width;

			else canvas.width = width;

			if ( height === undefined ) height = canvas.height;

			else canvas.height = height;


			scope._node.style.left = '-' + ( scope._node.style.width = width + 'px' );

			scope._node.style.top = '-' + ( scope._node.style.height = width + 'px' );



			const xml = new XMLSerializer().serializeToString( sroot );

			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>${css}</style><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;


			
			const image = new Image();

			image.onload = () => {

				canvas.getContext( '2d' ).drawImage( image , 0 , 0 );

				scope.needsUpdate = true;

				resolve();

				if( scope.onFinishRedraw ) scope.onFinishRedraw();
			}

			image.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent( svg );

		} );

	}

	elementFromPoint( x , y ) {
		
		const style = this._node.style;

		style.left = 0;

		style.top = 0;


		const element = this.document.elementFromPoint( x , y );


		style.left = '-' + style.width;

		style.top = '-' + style.height;


		return element;

	}

	_defineNode() {

		class HTMLTextureNode extends HTMLElement {

			constructor() {

				super();

				this.attachShadow( { mode: 'open' } );

				this.style.cssText = 'contain:layout; display:block; position:absolute; left:0; top:0; opacity:0.1; overflow:hidden;';

			}

		}

		customElements.define( 'htmltexture-node' , HTMLTextureNode , { is: "htmltexture-node" } );

		return HTMLTextureNode;

	}

}

HTMLTexture.prototype.isHTMLTexture = true;

export { HTMLTexture };
