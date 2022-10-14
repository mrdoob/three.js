( function () {

	class XYZLoader extends THREE.Loader {

		load( url, onLoad, onProgress, onError ) {

			const scope = this;
			const loader = new THREE.FileLoader( this.manager );
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
		parse( text ) {

			const lines = text.split( '\n' );
			const vertices = [];
			const colors = [];
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
					colors.push( parseFloat( lineValues[ 3 ] ) / 255 );
					colors.push( parseFloat( lineValues[ 4 ] ) / 255 );
					colors.push( parseFloat( lineValues[ 5 ] ) / 255 );

				}

			}

			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
			if ( colors.length > 0 ) {

				geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

			}

			return geometry;

		}

	}

	THREE.XYZLoader = XYZLoader;

} )();
