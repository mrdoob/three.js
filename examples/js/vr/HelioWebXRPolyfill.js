/**
 * @author mvilledieu / http://github.com/mvilledieu
 */

if ( /(Helio)/g.test( navigator.userAgent ) && 'xr' in navigator ) {

	console.log( "Helio WebXR Polyfill (Lumin 0.98.0)" );

	if ( 'isSessionSupported' in navigator.xr ) {

		const tempIsSessionSupported = navigator.xr.isSessionSupported.bind( navigator.xr );

		navigator.xr.isSessionSupported = function ( /*sessionType*/ ) {

			// Force using immersive-ar
			return tempIsSessionSupported( 'immersive-ar' );

		};

	}

	if ( 'isSessionSupported' in navigator.xr && 'requestSession' in navigator.xr ) {

		const tempRequestSession = navigator.xr.requestSession.bind( navigator.xr );

		navigator.xr.requestSession = function ( /*sessionType*/ ) {

			return new Promise( function ( resolve, reject ) {

				var sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };

				tempRequestSession( 'immersive-ar', sessionInit ).then( function ( session ) {

					resolve( session );

				} ).catch( function ( error ) {

					return reject( error );

				} );

			} );

		};

	}

}
