import { CanvasTexture } from '../../../build/three.module.js';

class HTMLTexture extends CanvasTexture {

	constructor( html, css, width, height, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		const canvas = document.createElement( 'canvas' );


		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );


		this.document = document.implementation.createHTMLDocument( 'xmlns' );

		this.css = css;

		this._cache = {};

		this.onRedraw = null;


		this.redrawAsync( html, css, width, height );

	}

	redrawAsync( html, css = '', width, height ) {

		const scope = this;

		return new Promise( async resolve => {

			if ( ! html ) html = scope.document.documentElement.innerHTML;

			else {

				scope.document = document.implementation.createHTMLDocument( 'xmlns' );

				scope.document.write( html );

			}


			if ( ! css ) css = scope.css;



			//enable css sizing

			const body = scope.document.documentElement.querySelector( 'body' );

			body.style.width = width + 'px';

			body.style.height = height + 'px';



			//enable in-line css

			const styles = Array.from( scope.document.querySelectorAll( 'style' ) );

			css += '\n' + styles.map( style => style.innerText ).join( '\n' );



			//use fetch to enable linked css? seems out-of-scope. maybe add css loader

			//const links = Array.from( scope.document.querySelectorAll( "link[rel=stylesheet]" ) );

			//await Promise.all( links.map( link => css += '\n' + await ( await fetch( link.href ) ).text() ) );



			//enable images
			{

				const _canvas = document.createElement( 'canvas' );

				const images = Array.from( scope.document.querySelectorAll( 'img' ) );

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



			const xml = new XMLSerializer().serializeToString( scope.document.documentElement.querySelector( 'body' ) );

			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>${css}</style><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;

			const src = URL.createObjectURL( new Blob( [ svg ], { type: 'image/svg+xml;charset=utf-8' } ) );



			const image = new Image();

			image.onload = () => {

				canvas.getContext( '2d' ).drawImage( image, 0, 0 );

				URL.revokeObjectURL( src );

				scope.needsUpdate = true;

				resolve();

			};

			image.src = src;

		} );

	}

}

HTMLTexture.prototype.isHTMLTexture = true;

export { HTMLTexture };
