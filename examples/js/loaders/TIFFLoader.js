( function () {

	class TIFFLoader extends THREE.DataTextureLoader {

		constructor( manager ) {

			super( manager );

		}
		parse( buffer ) {

			const ifds = UTIF.decode( buffer );
			UTIF.decodeImage( buffer, ifds[ 0 ] );
			const rgba = UTIF.toRGBA8( ifds[ 0 ] );
			return {
				width: ifds[ 0 ].width,
				height: ifds[ 0 ].height,
				data: rgba,
				flipY: true,
				magFilter: THREE.LinearFilter,
				minFilter: THREE.LinearMipmapLinearFilter
			};

		}

	}

	THREE.TIFFLoader = TIFFLoader;

} )();
