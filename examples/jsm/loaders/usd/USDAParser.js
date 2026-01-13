import {
	BufferAttribute,
	BufferGeometry,
	ClampToEdgeWrapping,
	Euler,
	Group,
	Matrix4,
	NoColorSpace,
	Mesh,
	MeshPhysicalMaterial,
	MirroredRepeatWrapping,
	RepeatWrapping,
	SRGBColorSpace,
	TextureLoader,
	Object3D,
	Vector2
} from 'three';

import { USDCParser } from './USDCParser.js';

class USDAParser {

	parseText( text ) {

		const root = {};

		const lines = text.split( '\n' );

		let string = null;
		let target = root;

		const stack = [ root ];

		// Parse USDA file

		for ( const line of lines ) {

			if ( line.includes( '=' ) ) {

				const assignment = line.split( '=' );

				const lhs = assignment[ 0 ].trim();
				const rhs = assignment[ 1 ].trim();

				if ( rhs.endsWith( '{' ) ) {

					const group = {};
					stack.push( group );

					target[ lhs ] = group;
					target = group;

				} else if ( rhs.endsWith( '(' ) ) {

					// see #28631

					const values = rhs.slice( 0, - 1 );
					target[ lhs ] = values;

					const meta = {};
					stack.push( meta );

					target = meta;

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

				if ( stack.length === 0 ) continue;

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

		}

		return root;

	}

	parse( text, assets, basePath = '' ) {

		const root = this.parseText( text );

		// Store references to parsers for re-parsing with variant selections
		const usdc = new USDCParser();

		function resolvePath( refPath, currentBasePath ) {

			if ( refPath.startsWith( './' ) ) {

				refPath = refPath.slice( 2 );

			}

			if ( currentBasePath ) {

				return currentBasePath + '/' + refPath;

			}

			return refPath;

		}

		function getBasePath( filePath ) {

			const lastSlash = filePath.lastIndexOf( '/' );
			return lastSlash >= 0 ? filePath.slice( 0, lastSlash ) : '';

		}

		function findMainDef( data ) {

			for ( const key in data ) {

				if ( key.startsWith( 'def ' ) ) {

					return data[ key ];

				}

			}

			return null;

		}

		function getVariantSelections( data ) {

			const variants = {};

			if ( ! data || ! data.variants ) return variants;

			for ( const key in data.variants ) {

				// Parse "string modelingVariant" = "\"ChairB\""
				const match = key.match( /string\s+(\w+)/ );
				if ( match ) {

					const variantSetName = match[ 1 ];
					const value = data.variants[ key ];
					// Remove quotes from value
					const cleanValue = value.replace( /"/g, '' );
					variants[ variantSetName ] = cleanValue;

				}

			}

			return variants;

		}

		function resolveReference( data, currentBasePath, variantSelections = {} ) {

			if ( ! data ) return { asset: undefined, basePath: currentBasePath };

			// If data is a Three.js object, return it directly
			if ( data.isGroup || data.isObject3D ) {

				return { asset: data, basePath: currentBasePath };

			}

			// Extract variant selections from this level
			// External (referencing) variant selections have HIGHER priority per USD spec
			const localVariants = getVariantSelections( data );
			const mergedVariants = { ...localVariants, ...variantSelections };

			// Check for references or payload
			const refValue = data[ 'prepend references' ] || data[ 'payload' ];

			if ( refValue ) {

				const parts = refValue.split( '@' );
				const refPath = parts[ 1 ];
				const resolvedPath = resolvePath( refPath, currentBasePath );
				const newBasePath = getBasePath( resolvedPath );

				// Check if we need to re-parse with variant selections
				if ( Object.keys( mergedVariants ).length > 0 ) {

					const bufferKey = resolvedPath + ':buffer';
					if ( assets[ bufferKey ] ) {

						const reparse = usdc.parse( assets[ bufferKey ], assets, mergedVariants );
						return { asset: reparse, basePath: newBasePath };

					}

				}

				const asset = assets[ resolvedPath ];
				if ( asset ) {

					return resolveReference( asset, newBasePath, mergedVariants );

				}

				return { asset, basePath: newBasePath };

			}

			// If this is a standalone parsed USDA file (has header), look inside the main def
			if ( '#usda 1.0' in data ) {

				const mainDef = findMainDef( data );
				if ( mainDef ) {

					return resolveReference( mainDef, currentBasePath, mergedVariants );

				}

			}

			return { asset: data, basePath: currentBasePath };

		}

		function findMeshGeometry( data, currentBasePath ) {

			if ( ! data ) return undefined;

			const { asset } = resolveReference( data, currentBasePath );

			if ( ! asset ) return undefined;

			if ( asset.isGroup || asset.isObject3D ) {

				return asset;

			}

			return findGeometry( asset );

		}

		function findGeometry( data ) {

			if ( ! data ) return undefined;

			for ( const name in data ) {

				const object = data[ name ];

				if ( name.startsWith( 'def Mesh' ) ) {

					return object;

				}

				if ( typeof object === 'object' ) {

					const geometry = findGeometry( object );

					if ( geometry ) return geometry;

				}

			}

		}

		function buildGeometry( data ) {

			if ( ! data ) return undefined;

			const geometry = new BufferGeometry();
			let indices = null;
			let counts = null;
			let uvs = null;

			let positionsLength = - 1;

			// index

			if ( 'int[] faceVertexIndices' in data ) {

				indices = JSON.parse( data[ 'int[] faceVertexIndices' ] );

			}

			// face count

			if ( 'int[] faceVertexCounts' in data ) {

				counts = JSON.parse( data[ 'int[] faceVertexCounts' ] );
				indices = toTriangleIndices( indices, counts );

			}

			// position

			if ( 'point3f[] points' in data ) {

				const positions = JSON.parse( data[ 'point3f[] points' ].replace( /[()]*/g, '' ) );
				positionsLength = positions.length;
				let attribute = new BufferAttribute( new Float32Array( positions ), 3 );

				if ( indices !== null ) attribute = toFlatBufferAttribute( attribute, indices );

				geometry.setAttribute( 'position', attribute );

			}

			// uv

			if ( 'float2[] primvars:st' in data ) {

				data[ 'texCoord2f[] primvars:st' ] = data[ 'float2[] primvars:st' ];

			}

			if ( 'texCoord2f[] primvars:st' in data ) {

				uvs = JSON.parse( data[ 'texCoord2f[] primvars:st' ].replace( /[()]*/g, '' ) );
				let attribute = new BufferAttribute( new Float32Array( uvs ), 2 );

				if ( indices !== null ) attribute = toFlatBufferAttribute( attribute, indices );

				geometry.setAttribute( 'uv', attribute );

			}

			if ( 'int[] primvars:st:indices' in data && uvs !== null ) {

				// custom uv index, overwrite uvs with new data

				const attribute = new BufferAttribute( new Float32Array( uvs ), 2 );
				let indices = JSON.parse( data[ 'int[] primvars:st:indices' ] );
				indices = toTriangleIndices( indices, counts );
				geometry.setAttribute( 'uv', toFlatBufferAttribute( attribute, indices ) );

			}

			// normal

			if ( 'normal3f[] normals' in data ) {

				const normals = JSON.parse( data[ 'normal3f[] normals' ].replace( /[()]*/g, '' ) );
				let attribute = new BufferAttribute( new Float32Array( normals ), 3 );

				// normals require a special treatment in USD

				if ( normals.length === positionsLength ) {

					// raw normal and position data have equal length (like produced by USDZExporter)

					if ( indices !== null ) attribute = toFlatBufferAttribute( attribute, indices );

				} else {

					// unequal length, normals are independent of faceVertexIndices

					let indices = Array.from( Array( normals.length / 3 ).keys() ); // [ 0, 1, 2, 3 ... ]
					indices = toTriangleIndices( indices, counts );
					attribute = toFlatBufferAttribute( attribute, indices );

				}

				geometry.setAttribute( 'normal', attribute );

			} else {

				// compute flat vertex normals

				geometry.computeVertexNormals();

			}

			return geometry;

		}

		function toTriangleIndices( rawIndices, counts ) {

			const indices = [];

			for ( let i = 0; i < counts.length; i ++ ) {

				const count = counts[ i ];

				const stride = i * count;

				if ( count === 3 ) {

					const a = rawIndices[ stride + 0 ];
					const b = rawIndices[ stride + 1 ];
					const c = rawIndices[ stride + 2 ];

					indices.push( a, b, c );

				} else if ( count === 4 ) {

					const a = rawIndices[ stride + 0 ];
					const b = rawIndices[ stride + 1 ];
					const c = rawIndices[ stride + 2 ];
					const d = rawIndices[ stride + 3 ];

					indices.push( a, b, c );
					indices.push( a, c, d );

				} else {

					console.warn( 'THREE.USDZLoader: Face vertex count of %s unsupported.', count );

				}

			}

			return indices;

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

			if ( ! data ) return undefined;

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

		function setTextureParams( map, data_value ) {

			// rotation, scale and translation

			if ( data_value[ 'float inputs:rotation' ] ) {

				map.rotation = parseFloat( data_value[ 'float inputs:rotation' ] );

			}

			if ( data_value[ 'float2 inputs:scale' ] ) {

				map.repeat = new Vector2().fromArray( JSON.parse( '[' + data_value[ 'float2 inputs:scale' ].replace( /[()]*/g, '' ) + ']' ) );

			}

			if ( data_value[ 'float2 inputs:translation' ] ) {

				map.offset = new Vector2().fromArray( JSON.parse( '[' + data_value[ 'float2 inputs:translation' ].replace( /[()]*/g, '' ) + ']' ) );

			}

		}

		function buildMaterial( data ) {

			const material = new MeshPhysicalMaterial();

			if ( data !== undefined ) {

				let surface = undefined;

				const surfaceConnection = data[ 'token outputs:surface.connect' ];

				if ( surfaceConnection ) {

					const match = /(\w+)\.output/.exec( surfaceConnection );

					if ( match ) {

						const surfaceName = match[ 1 ];
						surface = data[ `def Shader "${surfaceName}"` ];

					}

				}

				if ( surface !== undefined ) {

					if ( 'color3f inputs:diffuseColor.connect' in surface ) {

						const path = surface[ 'color3f inputs:diffuseColor.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.map = buildTexture( sampler );
						material.map.colorSpace = SRGBColorSpace;

						if ( 'def Shader "Transform2d_diffuse"' in data ) {

							setTextureParams( material.map, data[ 'def Shader "Transform2d_diffuse"' ] );

						}

					} else if ( 'color3f inputs:diffuseColor' in surface ) {

						const color = surface[ 'color3f inputs:diffuseColor' ].replace( /[()]*/g, '' );
						material.color.fromArray( JSON.parse( '[' + color + ']' ) );

					}

					if ( 'color3f inputs:emissiveColor.connect' in surface ) {

						const path = surface[ 'color3f inputs:emissiveColor.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.emissiveMap = buildTexture( sampler );
						material.emissiveMap.colorSpace = SRGBColorSpace;
						material.emissive.set( 0xffffff );

						if ( 'def Shader "Transform2d_emissive"' in data ) {

							setTextureParams( material.emissiveMap, data[ 'def Shader "Transform2d_emissive"' ] );

						}

					} else if ( 'color3f inputs:emissiveColor' in surface ) {

						const color = surface[ 'color3f inputs:emissiveColor' ].replace( /[()]*/g, '' );
						material.emissive.fromArray( JSON.parse( '[' + color + ']' ) );

					}

					if ( 'normal3f inputs:normal.connect' in surface ) {

						const path = surface[ 'normal3f inputs:normal.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.normalMap = buildTexture( sampler );
						material.normalMap.colorSpace = NoColorSpace;

						if ( 'def Shader "Transform2d_normal"' in data ) {

							setTextureParams( material.normalMap, data[ 'def Shader "Transform2d_normal"' ] );

						}

					}

					if ( 'float inputs:roughness.connect' in surface ) {

						const path = surface[ 'float inputs:roughness.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.roughness = 1.0;
						material.roughnessMap = buildTexture( sampler );
						material.roughnessMap.colorSpace = NoColorSpace;

						if ( 'def Shader "Transform2d_roughness"' in data ) {

							setTextureParams( material.roughnessMap, data[ 'def Shader "Transform2d_roughness"' ] );

						}

					} else if ( 'float inputs:roughness' in surface ) {

						material.roughness = parseFloat( surface[ 'float inputs:roughness' ] );

					}

					if ( 'float inputs:metallic.connect' in surface ) {

						const path = surface[ 'float inputs:metallic.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.metalness = 1.0;
						material.metalnessMap = buildTexture( sampler );
						material.metalnessMap.colorSpace = NoColorSpace;

						if ( 'def Shader "Transform2d_metallic"' in data ) {

							setTextureParams( material.metalnessMap, data[ 'def Shader "Transform2d_metallic"' ] );

						}

					} else if ( 'float inputs:metallic' in surface ) {

						material.metalness = parseFloat( surface[ 'float inputs:metallic' ] );

					}

					if ( 'float inputs:clearcoat.connect' in surface ) {

						const path = surface[ 'float inputs:clearcoat.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.clearcoat = 1.0;
						material.clearcoatMap = buildTexture( sampler );
						material.clearcoatMap.colorSpace = NoColorSpace;

						if ( 'def Shader "Transform2d_clearcoat"' in data ) {

							setTextureParams( material.clearcoatMap, data[ 'def Shader "Transform2d_clearcoat"' ] );

						}

					} else if ( 'float inputs:clearcoat' in surface ) {

						material.clearcoat = parseFloat( surface[ 'float inputs:clearcoat' ] );

					}

					if ( 'float inputs:clearcoatRoughness.connect' in surface ) {

						const path = surface[ 'float inputs:clearcoatRoughness.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.clearcoatRoughness = 1.0;
						material.clearcoatRoughnessMap = buildTexture( sampler );
						material.clearcoatRoughnessMap.colorSpace = NoColorSpace;

						if ( 'def Shader "Transform2d_clearcoatRoughness"' in data ) {

							setTextureParams( material.clearcoatRoughnessMap, data[ 'def Shader "Transform2d_clearcoatRoughness"' ] );

						}

					} else if ( 'float inputs:clearcoatRoughness' in surface ) {

						material.clearcoatRoughness = parseFloat( surface[ 'float inputs:clearcoatRoughness' ] );

					}

					if ( 'float inputs:ior' in surface ) {

						material.ior = parseFloat( surface[ 'float inputs:ior' ] );

					}

					if ( 'float inputs:occlusion.connect' in surface ) {

						const path = surface[ 'float inputs:occlusion.connect' ];
						const sampler = findTexture( root, /(\w+).output/.exec( path )[ 1 ] );

						material.aoMap = buildTexture( sampler );
						material.aoMap.colorSpace = NoColorSpace;

						if ( 'def Shader "Transform2d_occlusion"' in data ) {

							setTextureParams( material.aoMap, data[ 'def Shader "Transform2d_occlusion"' ] );

						}

					}

				}

			}

			return material;

		}

		function findTexture( data, id ) {

			for ( const name in data ) {

				const object = data[ name ];

				if ( name.startsWith( `def Shader "${ id }"` ) ) {

					return object;

				}

				if ( typeof object === 'object' ) {

					const texture = findTexture( object, id );

					if ( texture ) return texture;

				}

			}

		}

		function buildTexture( data ) {

			if ( 'asset inputs:file' in data ) {

				const path = data[ 'asset inputs:file' ].replace( /@*/g, '' ).trim();

				const loader = new TextureLoader();

				const texture = loader.load( assets[ path ] );

				const map = {
					'"clamp"': ClampToEdgeWrapping,
					'"mirror"': MirroredRepeatWrapping,
					'"repeat"': RepeatWrapping
				};

				if ( 'token inputs:wrapS' in data ) {

					texture.wrapS = map[ data[ 'token inputs:wrapS' ] ];

				}

				if ( 'token inputs:wrapT' in data ) {

					texture.wrapT = map[ data[ 'token inputs:wrapT' ] ];

				}

				return texture;

			}

			return null;

		}

		function findXformKey( data, suffix ) {

			for ( const key in data ) {

				if ( key.endsWith( suffix ) ) return key;

			}

			return null;

		}

		function parseXformVec3( str ) {

			return JSON.parse( '[' + str.replace( /[()]*/g, '' ) + ']' );

		}

		function applyTransform( obj, data ) {

			// Handle matrix transform
			if ( 'matrix4d xformOp:transform' in data ) {

				const array = JSON.parse( '[' + data[ 'matrix4d xformOp:transform' ].replace( /[()]*/g, '' ) + ']' );
				obj.matrix.fromArray( array );
				obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );
				return;

			}

			// Check for xformOpOrder - if present, use matrix composition
			const xformOpOrderKey = findXformKey( data, 'xformOpOrder' );

			if ( xformOpOrderKey ) {

				// Parse xformOpOrder: ["xformOp:translate", "xformOp:rotateZ"]
				const xformOpOrder = data[ xformOpOrderKey ];
				const ops = xformOpOrder
					.replace( /[\[\]]/g, '' )
					.split( ',' )
					.map( s => s.trim().replace( /"/g, '' ) );

				const matrix = new Matrix4();
				const tempMatrix = new Matrix4();

				// USD uses row-vector (p' = p * M), Three.js uses column-vector (p' = M * p)
				// Iterate FORWARD for Three.js column-vector convention
				for ( let i = 0; i < ops.length; i ++ ) {

					const op = ops[ i ];
					const isInverse = op.startsWith( '!invert!' );
					const opName = isInverse ? op.slice( 8 ) : op;

					if ( opName === 'xformOp:translate' ) {

						const key = findXformKey( data, 'xformOp:translate' );
						if ( key && ! key.includes( ':pivot' ) ) {

							const t = parseXformVec3( data[ key ] );
							tempMatrix.makeTranslation( t[ 0 ], t[ 1 ], t[ 2 ] );
							if ( isInverse ) tempMatrix.invert();
							matrix.multiply( tempMatrix );

						}

					} else if ( opName === 'xformOp:translate:pivot' ) {

						const key = findXformKey( data, 'xformOp:translate:pivot' );
						if ( key ) {

							const t = parseXformVec3( data[ key ] );
							tempMatrix.makeTranslation( t[ 0 ], t[ 1 ], t[ 2 ] );
							if ( isInverse ) tempMatrix.invert();
							matrix.multiply( tempMatrix );

						}

					} else if ( opName === 'xformOp:scale' ) {

						const key = findXformKey( data, 'xformOp:scale' );
						if ( key ) {

							const s = parseXformVec3( data[ key ] );
							tempMatrix.makeScale( s[ 0 ], s[ 1 ], s[ 2 ] );
							if ( isInverse ) tempMatrix.invert();
							matrix.multiply( tempMatrix );

						}

					} else if ( opName === 'xformOp:rotateXYZ' ) {

						const key = findXformKey( data, 'xformOp:rotateXYZ' );
						if ( key ) {

							const r = parseXformVec3( data[ key ] );
							// USD rotateXYZ: matrix = Rx * Ry * Rz
							// Three.js Euler 'ZYX' produces Rx * Ry * Rz
							const euler = new Euler(
								r[ 0 ] * Math.PI / 180,
								r[ 1 ] * Math.PI / 180,
								r[ 2 ] * Math.PI / 180,
								'ZYX'
							);
							tempMatrix.makeRotationFromEuler( euler );
							if ( isInverse ) tempMatrix.invert();
							matrix.multiply( tempMatrix );

						}

					} else if ( opName === 'xformOp:rotateX' ) {

						const key = findXformKey( data, 'xformOp:rotateX' );
						if ( key ) {

							const r = parseFloat( data[ key ] );
							tempMatrix.makeRotationX( r * Math.PI / 180 );
							if ( isInverse ) tempMatrix.invert();
							matrix.multiply( tempMatrix );

						}

					} else if ( opName === 'xformOp:rotateY' ) {

						const key = findXformKey( data, 'xformOp:rotateY' );
						if ( key ) {

							const r = parseFloat( data[ key ] );
							tempMatrix.makeRotationY( r * Math.PI / 180 );
							if ( isInverse ) tempMatrix.invert();
							matrix.multiply( tempMatrix );

						}

					} else if ( opName === 'xformOp:rotateZ' ) {

						const key = findXformKey( data, 'xformOp:rotateZ' );
						if ( key ) {

							const r = parseFloat( data[ key ] );
							tempMatrix.makeRotationZ( r * Math.PI / 180 );
							if ( isInverse ) tempMatrix.invert();
							matrix.multiply( tempMatrix );

						}

					}

				}

				obj.matrix.copy( matrix );
				obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );
				return;

			}

			// Fallback: simple handling for files without xformOpOrder
			const translateKey = findXformKey( data, 'xformOp:translate' );
			if ( translateKey && ! translateKey.includes( ':pivot' ) ) {

				const values = parseXformVec3( data[ translateKey ] );
				obj.position.set( values[ 0 ], values[ 1 ], values[ 2 ] );

			}

			const scaleKey = findXformKey( data, 'xformOp:scale' );
			if ( scaleKey ) {

				const values = parseXformVec3( data[ scaleKey ] );
				obj.scale.set( values[ 0 ], values[ 1 ], values[ 2 ] );

			}

			// Handle rotation
			const rotateXYZKey = findXformKey( data, 'xformOp:rotateXYZ' );
			if ( rotateXYZKey ) {

				const values = parseXformVec3( data[ rotateXYZKey ] );
				obj.rotation.set(
					values[ 0 ] * Math.PI / 180,
					values[ 1 ] * Math.PI / 180,
					values[ 2 ] * Math.PI / 180
				);

			} else {

				const rotateXKey = findXformKey( data, 'xformOp:rotateX' );
				if ( rotateXKey ) {

					obj.rotation.x = parseFloat( data[ rotateXKey ] ) * Math.PI / 180;

				}

				const rotateYKey = findXformKey( data, 'xformOp:rotateY' );
				if ( rotateYKey ) {

					obj.rotation.y = parseFloat( data[ rotateYKey ] ) * Math.PI / 180;

				}

				const rotateZKey = findXformKey( data, 'xformOp:rotateZ' );
				if ( rotateZKey ) {

					obj.rotation.z = parseFloat( data[ rotateZKey ] ) * Math.PI / 180;

				}

			}

		}

		function buildObject( data, currentBasePath ) {

			const meshData = findMeshGeometry( data, currentBasePath );

			let obj;

			if ( meshData && ( meshData.isGroup || meshData.isObject3D ) ) {

				obj = meshData.clone();

			} else {

				const geometry = buildGeometry( meshData );
				const material = buildMaterial( findMeshMaterial( data ) );
				obj = geometry ? new Mesh( geometry, material ) : new Object3D();

			}

			applyTransform( obj, data );

			return obj;

		}

		function buildHierarchy( data, group, currentBasePath ) {

			for ( const name in data ) {

				if ( name.startsWith( 'def Scope' ) ) {

					buildHierarchy( data[ name ], group, currentBasePath );

				} else if ( name.startsWith( 'def Xform' ) || /^def "\w+"/.test( name ) ) {

					const mesh = buildObject( data[ name ], currentBasePath );

					const match = /def (?:Xform )?"(\w+)"/.exec( name );

					if ( match ) {

						mesh.name = match[ 1 ];

					}

					group.add( mesh );

					buildHierarchy( data[ name ], mesh, currentBasePath );

				}

			}

		}

		function buildGroup( data, currentBasePath ) {

			const group = new Group();

			buildHierarchy( data, group, currentBasePath );

			return group;

		}

		const group = buildGroup( root, basePath );

		// Handle Z-up to Y-up conversion
		const header = root[ '#usda 1.0' ];
		if ( header && header.upAxis === '"Z"' ) {

			group.rotation.x = - Math.PI / 2;

		}

		return group;

	}

}

export { USDAParser };
