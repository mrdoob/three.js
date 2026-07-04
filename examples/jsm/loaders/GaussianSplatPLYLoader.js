import {
	FileLoader,
	Loader
} from 'three';

import { GaussianSplatData } from '../objects/GaussianSplatData.js';
import { sigmoid, writeColorBytesFromSH0, writeCovariance } from '../utils/GaussianSplatUtils.js';

const PLY_TYPES = {
	char: { size: 1, getter: 'getInt8' },
	int8: { size: 1, getter: 'getInt8' },
	uchar: { size: 1, getter: 'getUint8' },
	uint8: { size: 1, getter: 'getUint8' },
	short: { size: 2, getter: 'getInt16' },
	int16: { size: 2, getter: 'getInt16' },
	ushort: { size: 2, getter: 'getUint16' },
	uint16: { size: 2, getter: 'getUint16' },
	int: { size: 4, getter: 'getInt32' },
	int32: { size: 4, getter: 'getInt32' },
	uint: { size: 4, getter: 'getUint32' },
	uint32: { size: 4, getter: 'getUint32' },
	float: { size: 4, getter: 'getFloat32' },
	float32: { size: 4, getter: 'getFloat32' },
	double: { size: 8, getter: 'getFloat64' },
	float64: { size: 8, getter: 'getFloat64' }
};

/**
 * A loader for standard 3D Gaussian Splatting PLY files.
 *
 * The loader supports the binary little-endian INRIA/GraphDECO layout with
 * `x`, `y`, `z`, `scale_0..2`, `rot_0..3`, `f_dc_0..2` and `opacity` vertex
 * properties. Spherical harmonics beyond degree 0 are ignored by this minimal
 * loader.
 *
 * ```js
 * const loader = new GaussianSplatPLYLoader();
 * const data = await loader.loadAsync( './models/gsplat/example.ply' );
 * scene.add( new GaussianSplatMesh( data ) );
 * ```
 *
 * @augments Loader
 * @three_import import { GaussianSplatPLYLoader } from 'three/addons/loaders/GaussianSplatPLYLoader.js';
 */
class GaussianSplatPLYLoader extends Loader {

	/**
	 * Constructs a new Gaussian splat PLY loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded splat data to
	 * the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(GaussianSplatData)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

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
	 * Parses the given binary little-endian 3DGS PLY data.
	 *
	 * @param {ArrayBuffer} buffer - The raw PLY file as an array buffer.
	 * @return {GaussianSplatData} The parsed splat data.
	 */
	parse( buffer ) {

		const header = parseHeader( buffer );

		if ( header.format !== 'binary_little_endian' ) {

			throw new Error( 'THREE.GaussianSplatPLYLoader: Only binary little-endian PLY files are supported.' );

		}

		const vertexElement = header.elements.find( ( element ) => element.name === 'vertex' );

		if ( vertexElement === undefined ) {

			throw new Error( 'THREE.GaussianSplatPLYLoader: PLY does not contain a vertex element.' );

		}

		const requiredFields = [
			'x', 'y', 'z',
			'scale_0', 'scale_1', 'scale_2',
			'rot_0', 'rot_1', 'rot_2', 'rot_3',
			'f_dc_0', 'f_dc_1', 'f_dc_2',
			'opacity'
		];

		for ( const field of requiredFields ) {

			if ( vertexElement.propertyMap[ field ] === undefined ) {

				throw new Error( `THREE.GaussianSplatPLYLoader: Missing required PLY property "${ field }".` );

			}

		}

		const count = vertexElement.count;
		const centers = new Float32Array( count * 3 );
		const covariances = new Float32Array( count * 6 );
		const colors = new Uint8Array( count * 4 );
		const view = new DataView( buffer );

		let offset = header.headerLength;

		for ( const element of header.elements ) {

			if ( element.name !== 'vertex' ) {

				offset = skipElement( view, offset, element );
				continue;

			}

			for ( let i = 0; i < count; i ++ ) {

				const rowOffset = offset + i * vertexElement.stride;
				const x = readProperty( view, rowOffset, vertexElement.propertyMap.x );
				const y = readProperty( view, rowOffset, vertexElement.propertyMap.y );
				const z = readProperty( view, rowOffset, vertexElement.propertyMap.z );

				const i3 = i * 3;
				centers[ i3 ] = x;
				centers[ i3 + 1 ] = y;
				centers[ i3 + 2 ] = z;

				const sx = Math.exp( readProperty( view, rowOffset, vertexElement.propertyMap.scale_0 ) );
				const sy = Math.exp( readProperty( view, rowOffset, vertexElement.propertyMap.scale_1 ) );
				const sz = Math.exp( readProperty( view, rowOffset, vertexElement.propertyMap.scale_2 ) );

				// GraphDECO/INRIA PLY stores quaternions as rot_0=w, rot_1=x, rot_2=y, rot_3=z.
				const qw = readProperty( view, rowOffset, vertexElement.propertyMap.rot_0 );
				const qx = readProperty( view, rowOffset, vertexElement.propertyMap.rot_1 );
				const qy = readProperty( view, rowOffset, vertexElement.propertyMap.rot_2 );
				const qz = readProperty( view, rowOffset, vertexElement.propertyMap.rot_3 );

				writeCovariance( covariances, i * 6, sx, sy, sz, qx, qy, qz, qw );

				writeColorBytesFromSH0(
					colors,
					i * 4,
					readProperty( view, rowOffset, vertexElement.propertyMap.f_dc_0 ),
					readProperty( view, rowOffset, vertexElement.propertyMap.f_dc_1 ),
					readProperty( view, rowOffset, vertexElement.propertyMap.f_dc_2 ),
					sigmoid( readProperty( view, rowOffset, vertexElement.propertyMap.opacity ) )
				);

			}

			offset += vertexElement.count * vertexElement.stride;

		}

		return new GaussianSplatData( { centers, covariances, colors, count } );

	}

}

function parseHeader( buffer ) {

	const bytes = new Uint8Array( buffer );
	let headerLength = - 1;

	for ( let i = 0, l = bytes.length - 10; i < l; i ++ ) {

		if (
			bytes[ i ] === 101 && bytes[ i + 1 ] === 110 && bytes[ i + 2 ] === 100 && bytes[ i + 3 ] === 95 &&
			bytes[ i + 4 ] === 104 && bytes[ i + 5 ] === 101 && bytes[ i + 6 ] === 97 && bytes[ i + 7 ] === 100 &&
			bytes[ i + 8 ] === 101 && bytes[ i + 9 ] === 114
		) {

			headerLength = i + 10;

			if ( bytes[ headerLength ] === 13 && bytes[ headerLength + 1 ] === 10 ) {

				headerLength += 2;

			} else if ( bytes[ headerLength ] === 10 || bytes[ headerLength ] === 13 ) {

				headerLength += 1;

			}

			break;

		}

	}

	if ( headerLength === - 1 ) {

		throw new Error( 'THREE.GaussianSplatPLYLoader: Invalid PLY header.' );

	}

	const decoder = new TextDecoder();
	const headerText = decoder.decode( bytes.subarray( 0, headerLength ) );
	const lines = headerText.split( /\r\n|\r|\n/ );
	const header = {
		format: null,
		version: null,
		elements: [],
		headerLength
	};
	let currentElement = null;

	for ( let i = 0; i < lines.length; i ++ ) {

		const line = lines[ i ].trim();
		if ( line === '' ) continue;

		const values = line.split( /\s+/ );
		const type = values.shift();

		if ( type === 'format' ) {

			header.format = values[ 0 ];
			header.version = values[ 1 ];

		} else if ( type === 'element' ) {

			currentElement = {
				name: values[ 0 ],
				count: parseInt( values[ 1 ] ),
				properties: [],
				propertyMap: {},
				stride: 0
			};
			header.elements.push( currentElement );

		} else if ( type === 'property' && currentElement !== null ) {

			if ( values[ 0 ] === 'list' ) {

				currentElement.properties.push( {
					isList: true,
					countType: values[ 1 ],
					itemType: values[ 2 ],
					name: values[ 3 ]
				} );

			} else {

				const propertyType = PLY_TYPES[ values[ 0 ] ];

				if ( propertyType === undefined ) {

					throw new Error( `THREE.GaussianSplatPLYLoader: Unsupported PLY property type "${ values[ 0 ] }".` );

				}

				const property = {
					isList: false,
					type: values[ 0 ],
					name: values[ 1 ],
					offset: currentElement.stride,
					size: propertyType.size,
					getter: propertyType.getter
				};

				currentElement.properties.push( property );
				currentElement.propertyMap[ property.name ] = property;
				currentElement.stride += property.size;

			}

		}

	}

	return header;

}

function skipElement( view, offset, element ) {

	for ( let i = 0; i < element.count; i ++ ) {

		for ( const property of element.properties ) {

			if ( property.isList === true ) {

				const countType = PLY_TYPES[ property.countType ];
				const itemType = PLY_TYPES[ property.itemType ];

				if ( countType === undefined || itemType === undefined ) {

					throw new Error( 'THREE.GaussianSplatPLYLoader: Unsupported PLY list property type.' );

				}

				const listCount = view[ countType.getter ]( offset, true );
				offset += countType.size + listCount * itemType.size;

			} else {

				offset += property.size;

			}

		}

	}

	return offset;

}

function readProperty( view, rowOffset, property ) {

	return view[ property.getter ]( rowOffset + property.offset, true );

}

export { GaussianSplatPLYLoader };
