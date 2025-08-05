import {
	BufferGeometry,
	Color,
	FileLoader,
	Float32BufferAttribute,
	Loader,
	SRGBColorSpace
} from 'three';

/**
 * A loader for the XYZ format.
 *
 * XYZ is a very simple format for storing point clouds. The layouts
 * `XYZ` (points) and `XYZRGB` (points + colors) are supported.
 *
 * ```js
 * const loader = new XYZLoader();
 * const geometry = await loader.loadAsync( 'models/xyz/helix_201.xyz' );
 * geometry.center();
 *
 * const vertexColors = ( geometry.hasAttribute( 'color' ) === true );
 * const material = new THREE.PointsMaterial( { size: 0.1, vertexColors: vertexColors } );
 *
 * const points = new THREE.Points( geometry, material );
 * scene.add( points );
 * ```
 *
 * @augments Loader
 * @three_import import { XYZLoader } from 'three/addons/loaders/XYZLoader.js';
 */
class XYZLoader extends Loader {

	/**
	 * Starts loading from the given URL and passes the loaded XYZ asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(BufferGeometry)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

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

	/**
	 * Parses the given XYZ data and returns the resulting geometry.
	 *
	 * @param {string} text - The raw XYZ data as a string.
	 * @return {BufferGeometry} The geometry representing the point cloud.
	 */
	parse( text ) {

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

				vertices.push( parseFloat( lineValues[ 0 ] ) );
				vertices.push( parseFloat( lineValues[ 1 ] ) );
				vertices.push( parseFloat( lineValues[ 2 ] ) );

			}

			if ( lineValues.length === 6 ) {

				// XYZRGB

				vertices.push( parseFloat( lineValues[ 0 ] ) );
				vertices.push( parseFloat( lineValues[ 1 ] ) );
				vertices.push( parseFloat( lineValues[ 2 ] ) );

				const r = parseFloat( lineValues[ 3 ] ) / 255;
				const g = parseFloat( lineValues[ 4 ] ) / 255;
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
