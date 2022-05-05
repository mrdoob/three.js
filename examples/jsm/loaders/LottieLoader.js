import {
	FileLoader,
	Loader,
	CanvasTexture,
	NearestFilter
} from 'three';

class LottieLoader extends Loader {

	setQuality( value ) {

		this._quality = value;

	}

	load( url, onLoad, onProgress, onError ) {

		const quality = this._quality || 1;

		const texture = new CanvasTexture();
		texture.minFilter = NearestFilter;

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
				rendererSettings: { dpr: quality }
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

}

export { LottieLoader };
