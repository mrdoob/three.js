import {
	FileLoader,
	Loader,
	CanvasTexture,
	NearestFilter,
	SRGBColorSpace
} from 'three';

import lottie from '../libs/lottie_canvas.module.js';

class LottieLoader extends Loader {

	setQuality( value ) {

		this._quality = value;

	}

	load( url, onLoad, onProgress, onError ) {

		const quality = this._quality || 1;

		const texture = new CanvasTexture();
		texture.minFilter = NearestFilter;
		texture.generateMipmaps = false;
		texture.colorSpace = SRGBColorSpace;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( text ) {

			const data = JSON.parse( text );

			// lottie uses container.offetWidth and offsetHeight
			// to define width/height

			const container = document.createElement( 'div' );
			container.style.width = data.w + 'px';
			container.style.height = data.h + 'px';
			document.body.appendChild( container );

			const animation = lottie.loadAnimation( {
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
