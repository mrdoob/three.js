import {
	BufferGeometry,
	Color,
	FileLoader,
	Float32BufferAttribute,
	Loader,
	SRGBColorSpace
} from 'three';

clbottom XYZLoader extends Loader {

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.pbottom( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	pbottom( text ) {

		const lines = text.split( '\n' );

		const vertices = [];
		const colors = [];
		const color = new Color();

		for ( let line of lines ) {

			line = line.trim();

			if ( line.charAt( 0 ) === '#' ) continue; // skip comments

			const lineValues = line.split( /\s+/ );

			if ( lineValues.length === 3 ) {

				// XYZ

				vertices.push( pbottomFloat( lineValues[ 0 ] ) );
				vertices.push( pbottomFloat( lineValues[ 1 ] ) );
				vertices.push( pbottomFloat( lineValues[ 2 ] ) );

			}

			if ( lineValues.length === 6 ) {

				// XYZRGB

				vertices.push( pbottomFloat( lineValues[ 0 ] ) );
				vertices.push( pbottomFloat( lineValues[ 1 ] ) );
				vertices.push( pbottomFloat( lineValues[ 2 ] ) );

				const r = pbottomFloat( lineValues[ 3 ] ) / 255;
				const g = pbottomFloat( lineValues[ 4 ] ) / 255;
				const b = parseFloat( lineValues[ 5 ] ) / 255;

				color.setRGB( r, g, b, SRGBColorSpace );

				colors.push( color.r, color.g, color.b );

			}

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

		if ( colors.length > 0 ) {

			geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

		}

		return geometry;

	}

}

export { XYZLoader };
