( function () {

	// https://wwwimages2.adobe.com/content/dam/acom/en/products/speedgrade/cc/pdfs/cube-lut-specification-1.0.pdf
	class LUTCubeLoader extends THREE.Loader {

		load( url, onLoad, onProgress, onError ) {

			const loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setResponseType( 'text' );
			loader.load( url, text => {

				try {

					onLoad( this.parse( text ) );

				} catch ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						console.error( e );

					}

					this.manager.itemError( url );

				}

			}, onProgress, onError );

		}
		parse( str ) {

			// Remove empty lines and comments
			str = str.replace( /^#.*?(\n|\r)/gm, '' ).replace( /^\s*?(\n|\r)/gm, '' ).trim();
			let title = null;
			let size = null;
			const domainMin = new THREE.Vector3( 0, 0, 0 );
			const domainMax = new THREE.Vector3( 1, 1, 1 );
			const lines = str.split( /[\n\r]+/g );
			let data = null;
			let currIndex = 0;
			for ( let i = 0, l = lines.length; i < l; i ++ ) {

				const line = lines[ i ].trim();
				const split = line.split( /\s/g );
				switch ( split[ 0 ] ) {

					case 'TITLE':
						title = line.substring( 7, line.length - 1 );
						break;
					case 'LUT_3D_SIZE':
						// TODO: A .CUBE LUT file specifies floating point values and could be represented with
						// more precision than can be captured with Uint8Array.
						const sizeToken = split[ 1 ];
						size = parseFloat( sizeToken );
						data = new Uint8Array( size * size * size * 4 );
						break;
					case 'DOMAIN_MIN':
						domainMin.x = parseFloat( split[ 1 ] );
						domainMin.y = parseFloat( split[ 2 ] );
						domainMin.z = parseFloat( split[ 3 ] );
						break;
					case 'DOMAIN_MAX':
						domainMax.x = parseFloat( split[ 1 ] );
						domainMax.y = parseFloat( split[ 2 ] );
						domainMax.z = parseFloat( split[ 3 ] );
						break;
					default:
						const r = parseFloat( split[ 0 ] );
						const g = parseFloat( split[ 1 ] );
						const b = parseFloat( split[ 2 ] );
						if ( r > 1.0 || r < 0.0 || g > 1.0 || g < 0.0 || b > 1.0 || b < 0.0 ) {

							throw new Error( 'LUTCubeLoader : Non normalized values not supported.' );

						}

						data[ currIndex + 0 ] = r * 255;
						data[ currIndex + 1 ] = g * 255;
						data[ currIndex + 2 ] = b * 255;
						data[ currIndex + 3 ] = 255;
						currIndex += 4;

				}

			}

			const texture = new THREE.DataTexture();
			texture.image.data = data;
			texture.image.width = size;
			texture.image.height = size * size;
			texture.type = THREE.UnsignedByteType;
			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
			texture.wrapS = THREE.ClampToEdgeWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.generateMipmaps = false;
			texture.needsUpdate = true;
			const texture3D = new THREE.Data3DTexture();
			texture3D.image.data = data;
			texture3D.image.width = size;
			texture3D.image.height = size;
			texture3D.image.depth = size;
			texture3D.type = THREE.UnsignedByteType;
			texture3D.magFilter = THREE.LinearFilter;
			texture3D.minFilter = THREE.LinearFilter;
			texture3D.wrapS = THREE.ClampToEdgeWrapping;
			texture3D.wrapT = THREE.ClampToEdgeWrapping;
			texture3D.wrapR = THREE.ClampToEdgeWrapping;
			texture3D.generateMipmaps = false;
			texture3D.needsUpdate = true;
			return {
				title,
				size,
				domainMin,
				domainMax,
				texture,
				texture3D
			};

		}

	}

	THREE.LUTCubeLoader = LUTCubeLoader;

} )();
