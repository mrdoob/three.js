import {
	FileLoader,
	Loader,
	CanvasTexture
} from "../../../build/three.module.js";

var LottieLoader = function ( manager ) {

	Loader.call( this, manager );

};

LottieLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: LottieLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		const texture = new CanvasTexture();

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( text ) {

			const data = JSON.parse( text );

			// bodymoving uses container.offetWidth and offsetHeight
			// to define width/height

			const container = document.createElement( 'div' );
			container.style.width = data.w + 'px';
			container.style.height = data.h + 'px';
			document.body.appendChild( container );

			const animation = bodymovin.loadAnimation( {
				container: container,
				animType: 'canvas',
				loop: true,
				autoplay: true,
				animationData: data,
				rendererSettings: { dpr: 1 }
			} );

			texture.animation = animation;
			texture.image = animation.container;

			animation.addEventListener( 'enterFrame', function () {

				texture.needsUpdate = true;

			} );

			container.style.display = 'none';

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	}

} );

export { LottieLoader };
