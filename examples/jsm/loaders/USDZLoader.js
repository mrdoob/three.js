import {
	BufferAttribute,
	BufferGeometry,
	FileLoader,
	Group,
	Loader,
	Mesh,
	MeshStandardMaterial,
	TextureLoader
} from 'three';

import * as fflate from '../libs/fflate.module.js';

class USDAParser {

	parse( text ) {

		const data = {};

		const lines = text.split( '\n' );
		const length = lines.length;

		let current = 0;
		let string = null;
		let target = data;

		const stack = [ data ];

		// debugger;

		function parseNextLine() {

			const line = lines[ current ];

			// console.log( line );

			if ( line.includes( '=' ) ) {

				const assignment = line.split( '=' );

				const lhs = assignment[ 0 ].trim();
				const rhs = assignment[ 1 ].trim();

				if ( rhs.endsWith( '{' ) ) {

					const group = {};
					stack.push( group );

					target[ lhs ] = group;
					target = group;

				} else {

					target[ lhs ] = rhs;

				}

			} else if ( line.endsWith( '{' ) ) {

				const group = target[ string ] || {};
				stack.push( group );

				target[ string ] = group;
				target = group;

			} else if ( line.endsWith( '}' ) ) {

				stack.pop();

				if ( stack.length === 0 ) return;

				target = stack[ stack.length - 1 ];

			} else if ( line.endsWith( '(' ) ) {

				const meta = {};
				stack.push( meta );

				string = line.split( '(' )[ 0 ].trim() || string;

				target[ string ] = meta;
				target = meta;

			} else if ( line.endsWith( ')' ) ) {

				stack.pop();

				target = stack[ stack.length - 1 ];

			} else {

				string = line.trim();

			}

			current ++;

			if ( current < length ) {

				parseNextLine();

			}

		}

		parseNextLine();

		return data;

	}

}

class USDZLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
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

	parse( buffer ) {

		const parser = new USDAParser();

		function parseAssets( zip ) {

			const data = {};
			const loader = new FileLoader();
			loader.setResponseType( 'arraybuffer' );

			for ( const filename in zip ) {

				if ( filename.endsWith( 'png' ) ) {

					const blob = new Blob( [ zip[ filename ] ], { type: { type: 'image/png' } } );
					data[ filename ] = URL.createObjectURL( blob );

				}

				if ( filename.endsWith( 'usd' ) ) {

					const text = fflate.strFromU8( zip[ filename ] );
					data[ filename ] = parser.parse( text );

				}

			}

			return data;

		}

		function findUSD( zip ) {

			for ( const filename in zip ) {

				if ( filename.endsWith( 'usda' ) ) {

					return zip[ filename ];

				}

			}

		}

		const zip = fflate.unzipSync( new Uint8Array( buffer ) ); // eslint-disable-line no-undef

		// console.log( zip );

		const assets = parseAssets( zip );

		// console.log( assets )

		const file = findUSD( zip );

		if ( file === undefined ) {

			console.warn( 'THREE.USDZLoader: No usda file found.', zip );

			return new Group();

		}


		// Parse file

		const text = fflate.strFromU8( file );
		const root = parser.parse( text );

		// Build scene

		function findMeshGeometry( data ) {

			if ( 'prepend references' in data ) {

				const reference = data[ 'prepend references' ];
				const parts = reference.split( '@' );
				const path = parts[ 1 ].replace( /^.\//, '' );
				const id = parts[ 2 ].replace( /^<\//, '' ).replace( />$/, '' );

				return findGeometry( assets[ path ], id );

			}

			return findGeometry( data );

		}

		function findGeometry( data, id ) {

			if ( id !== undefined ) {

				const def = `def "%{id}"`;

				if ( def in data ) {

					return data[ def ];

				}

			}

			for ( const name in data ) {

				const object = data[ name ];

				if ( name.startsWith( 'def Mesh' ) ) {

					// Move points to Mesh

					if ( data[ 'point3f[] points' ] ) {

						object[ 'point3f[] points' ] = data[ 'point3f[] points' ];

					}

					// Move st indices to Mesh

					if ( data[ 'int[] primvars:st:indices' ] ) {

						object[ 'int[] primvars:st:indices' ] = data[ 'int[] primvars:st:indices' ];

					}

					return object;

				}


				if ( typeof object === 'object' ) {

					const geometry = findGeometry( object );

					if ( geometry ) return geometry;

				}

			}

		}

		function buildGeometry( data ) {

			let geometry = new BufferGeometry();

			if ( 'int[] faceVertexIndices' in data ) {

				const indices = JSON.parse( data[ 'int[] faceVertexIndices' ] );
				geometry.setIndex( new BufferAttribute( new Uint16Array( indices ), 1 ) );

			}

			if ( 'point3f[] points' in data ) {

				const positions = JSON.parse( data[ 'point3f[] points' ].replace( /[()]*/g, '' ) );
				const attribute = new BufferAttribute( new Float32Array( positions ), 3 );
				geometry.setAttribute( 'position', attribute );

			}

			if ( 'normal3f[] normals' in data ) {

				const normals = JSON.parse( data[ 'normal3f[] normals' ].replace( /[()]*/g, '' ) );
				const attribute = new BufferAttribute( new Float32Array( normals ), 3 );
				geometry.setAttribute( 'normal', attribute );

			} else {

				geometry.computeVertexNormals();

			}

			if ( 'texCoord2f[] primvars:st' in data ) {

				const uvs = JSON.parse( data[ 'texCoord2f[] primvars:st' ].replace( /[()]*/g, '' ) );
				const attribute = new BufferAttribute( new Float32Array( uvs ), 2 );

				if ( 'int[] primvars:st:indices' in data ) {

					geometry = geometry.toNonIndexed();

					const indices = JSON.parse( data[ 'int[] primvars:st:indices' ] );
					geometry.setAttribute( 'uv', toFlatBufferAttribute( attribute, indices ) );

				} else {

					geometry.setAttribute( 'uv', attribute );

				}

			}
			
			return geometry;

		}

		function toFlatBufferAttribute( attribute, indices ) {

			const array = attribute.array;
			const itemSize = attribute.itemSize;

			const array2 = new array.constructor( indices.length * itemSize );

			let index = 0, index2 = 0;

			for ( let i = 0, l = indices.length; i < l; i ++ ) {

				index = indices[ i ] * itemSize;

				for ( let j = 0; j < itemSize; j ++ ) {

					array2[ index2 ++ ] = array[ index ++ ];

				}

			}

			return new BufferAttribute( array2, itemSize );

		}

		function findMeshMaterial( data ) {

			if ( 'rel material:binding' in data ) {

				const reference = data[ 'rel material:binding' ];
				const id = reference.replace( /^<\//, '' ).replace( />$/, '' );
				const parts = id.split( '/' );

				return findMaterial( root, ` "${ parts[ 1 ] }"` );

			}

			return findMaterial( data );

		}

		function findMaterial( data, id = '' ) {

			for ( const name in data ) {

				const object = data[ name ];

				if ( name.startsWith( 'def Material' + id ) ) {

					return object;

				}

				if ( typeof object === 'object' ) {

					const material = findMaterial( object, id );

					if ( material ) return material;

				}

			}

		}

		function buildMaterial( data ) {

			const material = new MeshStandardMaterial();

			if ( data !== undefined ) {

				if ( 'def Shader "PreviewSurface"' in data ) {

					const surface = data[ 'def Shader "PreviewSurface"' ];

					if ( 'color3f inputs:diffuseColor' in surface ) {

						const color = surface[ 'color3f inputs:diffuseColor' ].replace( /[()]*/g, '' );
						material.color.fromArray( JSON.parse( '[' + color + ']' ) );

					}

					if ( 'float inputs:roughness' in surface ) {

						material.roughness = surface[ 'float inputs:roughness' ];

					}

					if ( 'float inputs:metallic' in surface ) {

						material.metalness = surface[ 'float inputs:metallic' ];

					}

				}

				if ( 'def Shader "diffuseColor_texture"' in data ) {

					const texture = data[ 'def Shader "diffuseColor_texture"' ];
					const file = texture[ 'asset inputs:file' ].replace( /@*/g, '' );

					material.map = new TextureLoader().load( assets[ file ] );

				}

				if ( 'def Shader "normal_texture"' in data ) {

					const texture = data[ 'def Shader "normal_texture"' ];
					const file = texture[ 'asset inputs:file' ].replace( /@*/g, '' );

					material.normalMap = new TextureLoader().load( assets[ file ] );

				}

			}

			return material;

		}

		function buildMesh( data ) {

			const geometry = buildGeometry( findMeshGeometry( data ) );
			const material = buildMaterial( findMeshMaterial( data ) );

			const mesh = new Mesh( geometry, material );

			if ( 'matrix4d xformOp:transform' in data ) {

				const array = JSON.parse( '[' + data[ 'matrix4d xformOp:transform'  ].replace( /[()]*/g, '' ) + ']' );

				mesh.matrix.fromArray( array );
				mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

			}

			return mesh;

		}

		// console.log( data );

		const group = new Group();

		for ( const name in root ) {

			if ( name.startsWith( 'def Xform' ) ) {

				const mesh = buildMesh( root[ name ] );
				group.add( mesh );

			}

		}

		// console.log( group );

		return group;

	}

}

export { USDZLoader };
