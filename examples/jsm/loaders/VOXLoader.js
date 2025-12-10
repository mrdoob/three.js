import {
	BufferGeometry,
	Color,
	Data3DTexture,
	FileLoader,
	Float32BufferAttribute,
	Group,
	Loader,
	LinearFilter,
	Matrix4,
	Mesh,
	MeshStandardMaterial,
	NearestFilter,
	RedFormat,
	SRGBColorSpace
} from 'three';

// Helper function to read a STRING from the data view
function readString( data, offset ) {

	const size = data.getUint32( offset, true );
	offset += 4;

	let str = '';
	for ( let i = 0; i < size; i ++ ) {

		str += String.fromCharCode( data.getUint8( offset ++ ) );

	}

	return { value: str, size: 4 + size };

}

// Helper function to read a DICT from the data view
function readDict( data, offset ) {

	const dict = {};
	const count = data.getUint32( offset, true );
	offset += 4;

	let totalSize = 4;

	for ( let i = 0; i < count; i ++ ) {

		const key = readString( data, offset );
		offset += key.size;
		totalSize += key.size;

		const value = readString( data, offset );
		offset += value.size;
		totalSize += value.size;

		dict[ key.value ] = value.value;

	}

	return { value: dict, size: totalSize };

}

// Helper function to decode ROTATION byte into a rotation matrix
function decodeRotation( byte ) {

	// The rotation is stored as a row-major 3x3 matrix encoded in a single byte
	// Bits 0-1: index of the non-zero entry in the first row
	// Bits 2-3: index of the non-zero entry in the second row
	// Bit 4: sign of the first row entry (0 = positive, 1 = negative)
	// Bit 5: sign of the second row entry
	// Bit 6: sign of the third row entry
	// The third row index is determined by the remaining column

	const index1 = byte & 0x3;
	const index2 = ( byte >> 2 ) & 0x3;
	const sign1 = ( byte >> 4 ) & 0x1 ? - 1 : 1;
	const sign2 = ( byte >> 5 ) & 0x1 ? - 1 : 1;
	const sign3 = ( byte >> 6 ) & 0x1 ? - 1 : 1;

	// Find the third row index (the one not used by row 0 or row 1)
	const index3 = 3 - index1 - index2;

	// Build the VOX rotation matrix (row-major 3x3)
	// r[row][col] - each row has one non-zero entry
	const r = [
		[ 0, 0, 0 ],
		[ 0, 0, 0 ],
		[ 0, 0, 0 ]
	];

	r[ 0 ][ index1 ] = sign1;
	r[ 1 ][ index2 ] = sign2;
	r[ 2 ][ index3 ] = sign3;

	// Convert from VOX coordinate system (Z-up) to Three.js (Y-up)
	// VOX: X-right, Y-forward, Z-up
	// Three.js: X-right, Y-up, Z-backward
	// Transformation: x' = x, y' = z, z' = -y
	//
	// To convert rotation matrix R_vox to R_three:
	// R_three = C * R_vox * C^-1
	// where C converts VOX coords to Three.js coords

	// Apply coordinate change: swap Y and Z, negate new Z
	// This is equivalent to: C * R * C^-1
	const m = new Matrix4();
	m.set(
		r[ 0 ][ 0 ], r[ 0 ][ 2 ], - r[ 0 ][ 1 ], 0,
		r[ 2 ][ 0 ], r[ 2 ][ 2 ], - r[ 2 ][ 1 ], 0,
		- r[ 1 ][ 0 ], - r[ 1 ][ 2 ], r[ 1 ][ 1 ], 0,
		0, 0, 0, 1
	);

	return m;

}

// Apply VOX transform to a Three.js object
function applyTransform( object, node ) {

	if ( node.attributes._name ) {

		object.name = node.attributes._name;

	}

	if ( node.frames.length > 0 ) {

		const frame = node.frames[ 0 ];

		if ( frame.rotation ) {

			object.applyMatrix4( frame.rotation );

		}

		if ( frame.translation ) {

			// VOX uses Z-up, Three.js uses Y-up
			object.position.set(
				frame.translation.x,
				frame.translation.z,
				- frame.translation.y
			);

		}

	}

}

// Recursively build Three.js object graph from VOX nodes
function buildObject( nodeId, nodes, chunks ) {

	const node = nodes[ nodeId ];

	if ( node.type === 'transform' ) {

		const childNode = nodes[ node.childNodeId ];

		// Check if this transform has actual transformation data
		const frame = node.frames[ 0 ];
		const hasTransform = frame && ( frame.rotation || frame.translation );

		// Flatten: if child is a single-model shape, apply transform directly to mesh
		if ( childNode.type === 'shape' && childNode.models.length === 1 ) {

			const chunk = chunks[ childNode.models[ 0 ].modelId ];
			const mesh = buildMesh( chunk );
			applyTransform( mesh, node );
			return mesh;

		}

		// If no transform, just return the child directly (avoid unnecessary group)
		if ( ! hasTransform ) {

			const child = buildObject( node.childNodeId, nodes, chunks );
			if ( child && node.attributes._name ) child.name = node.attributes._name;
			return child;

		}

		// Otherwise create a group
		const group = new Group();
		applyTransform( group, node );

		const child = buildObject( node.childNodeId, nodes, chunks );
		if ( child ) group.add( child );

		return group;

	} else if ( node.type === 'group' ) {

		const group = new Group();

		for ( const childId of node.childIds ) {

			const child = buildObject( childId, nodes, chunks );
			if ( child ) group.add( child );

		}

		return group;

	} else if ( node.type === 'shape' ) {

		// Shape reached directly (shouldn't happen in well-formed files, but handle it)
		if ( node.models.length === 1 ) {

			const chunk = chunks[ node.models[ 0 ].modelId ];
			return buildMesh( chunk );

		}

		const group = new Group();

		for ( const model of node.models ) {

			const chunk = chunks[ model.modelId ];
			group.add( buildMesh( chunk ) );

		}

		return group;

	}

	return null;

}

/**
 * A loader for the VOX format.
 *
 * ```js
 * const loader = new VOXLoader();
 * const result = await loader.loadAsync( 'models/vox/monu10.vox' );
 *
 * scene.add( result.scene.children[ 0 ] );
 * ```
 * @augments Loader
 * @three_import import { VOXLoader } from 'three/addons/loaders/VOXLoader.js';
 */
class VOXLoader extends Loader {

	/**
	 * Starts loading from the given URL and passes the loaded VOX asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Object)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
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
	 * Parses the given VOX data and returns the result object.
	 *
	 * @param {ArrayBuffer} buffer - The raw VOX data as an array buffer.
	 * @return {Object} The parsed VOX data with properties: chunks, scene.
	 */
	parse( buffer ) {

		const data = new DataView( buffer );

		const id = data.getUint32( 0, true );
		const version = data.getUint32( 4, true );

		if ( id !== 542658390 ) {

			console.error( 'THREE.VOXLoader: Invalid VOX file.' );
			return;

		}

		if ( version !== 150 && version !== 200 ) {

			console.error( 'THREE.VOXLoader: Invalid VOX file. Unsupported version:', version );
			return;

		}

		const DEFAULT_PALETTE = [
			0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff, 0xff00ffff, 0xffffccff,
			0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff, 0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff,
			0xff6699ff, 0xff3399ff, 0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff,
			0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff, 0xff0033ff, 0xffff00ff,
			0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff, 0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc,
			0xff66ffcc, 0xff33ffcc, 0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc,
			0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc, 0xff0099cc, 0xffff66cc,
			0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc, 0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc,
			0xff6633cc, 0xff3333cc, 0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc,
			0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99, 0xff00ff99, 0xffffcc99,
			0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99, 0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999,
			0xff669999, 0xff339999, 0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699,
			0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399, 0xff003399, 0xffff0099,
			0xffcc0099, 0xff990099, 0xff660099, 0xff330099, 0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66,
			0xff66ff66, 0xff33ff66, 0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66,
			0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966, 0xff009966, 0xffff6666,
			0xffcc6666, 0xff996666, 0xff666666, 0xff336666, 0xff006666, 0xffff3366, 0xffcc3366, 0xff993366,
			0xff663366, 0xff333366, 0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066,
			0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33, 0xff00ff33, 0xffffcc33,
			0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33, 0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933,
			0xff669933, 0xff339933, 0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633,
			0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333, 0xff003333, 0xffff0033,
			0xffcc0033, 0xff990033, 0xff660033, 0xff330033, 0xff000033, 0xffffff00, 0xffccff00, 0xff99ff00,
			0xff66ff00, 0xff33ff00, 0xff00ff00, 0xffffcc00, 0xffcccc00, 0xff99cc00, 0xff66cc00, 0xff33cc00,
			0xff00cc00, 0xffff9900, 0xffcc9900, 0xff999900, 0xff669900, 0xff339900, 0xff009900, 0xffff6600,
			0xffcc6600, 0xff996600, 0xff666600, 0xff336600, 0xff006600, 0xffff3300, 0xffcc3300, 0xff993300,
			0xff663300, 0xff333300, 0xff003300, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000,
			0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077, 0xff000055, 0xff000044,
			0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00, 0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700,
			0xff005500, 0xff004400, 0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000,
			0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000, 0xffeeeeee, 0xffdddddd,
			0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777, 0xff555555, 0xff444444, 0xff222222, 0xff111111
		];

		let i = 8;

		let chunk;
		const chunks = [];

		// Extension data
		const nodes = {};
		let palette = DEFAULT_PALETTE;

		while ( i < data.byteLength ) {

			let id = '';

			for ( let j = 0; j < 4; j ++ ) {

				id += String.fromCharCode( data.getUint8( i ++ ) );

			}

			const chunkSize = data.getUint32( i, true ); i += 4;
			i += 4; // childChunks

			if ( id === 'SIZE' ) {

				const x = data.getUint32( i, true ); i += 4;
				const y = data.getUint32( i, true ); i += 4;
				const z = data.getUint32( i, true ); i += 4;

				chunk = {
					palette: DEFAULT_PALETTE,
					size: { x: x, y: y, z: z },
				};

				chunks.push( chunk );

				i += chunkSize - ( 3 * 4 );

			} else if ( id === 'XYZI' ) {

				const numVoxels = data.getUint32( i, true ); i += 4;
				chunk.data = new Uint8Array( buffer, i, numVoxels * 4 );

				i += numVoxels * 4;

			} else if ( id === 'RGBA' ) {

				palette = [ 0 ];

				for ( let j = 0; j < 256; j ++ ) {

					palette[ j + 1 ] = data.getUint32( i, true ); i += 4;

				}

				chunk.palette = palette;

			} else if ( id === 'nTRN' ) {

				// Transform Node
				const nodeId = data.getUint32( i, true ); i += 4;
				const attributes = readDict( data, i );
				i += attributes.size;

				const childNodeId = data.getUint32( i, true ); i += 4;
				i += 4; // reserved (-1)
				const layerId = data.getInt32( i, true ); i += 4;
				const numFrames = data.getUint32( i, true ); i += 4;

				const frames = [];

				for ( let f = 0; f < numFrames; f ++ ) {

					const frameDict = readDict( data, i );
					i += frameDict.size;

					const frame = { rotation: null, translation: null };

					if ( frameDict.value._r !== undefined ) {

						frame.rotation = decodeRotation( parseInt( frameDict.value._r ) );

					}

					if ( frameDict.value._t !== undefined ) {

						const parts = frameDict.value._t.split( ' ' ).map( Number );
						frame.translation = { x: parts[ 0 ], y: parts[ 1 ], z: parts[ 2 ] };

					}

					frames.push( frame );

				}

				nodes[ nodeId ] = {
					type: 'transform',
					id: nodeId,
					attributes: attributes.value,
					childNodeId: childNodeId,
					layerId: layerId,
					frames: frames
				};

			} else if ( id === 'nGRP' ) {

				// Group Node
				const nodeId = data.getUint32( i, true ); i += 4;
				const attributes = readDict( data, i );
				i += attributes.size;

				const numChildren = data.getUint32( i, true ); i += 4;
				const childIds = [];

				for ( let c = 0; c < numChildren; c ++ ) {

					childIds.push( data.getUint32( i, true ) ); i += 4;

				}

				nodes[ nodeId ] = {
					type: 'group',
					id: nodeId,
					attributes: attributes.value,
					childIds: childIds
				};

			} else if ( id === 'nSHP' ) {

				// Shape Node
				const nodeId = data.getUint32( i, true ); i += 4;
				const attributes = readDict( data, i );
				i += attributes.size;

				const numModels = data.getUint32( i, true ); i += 4;
				const models = [];

				for ( let m = 0; m < numModels; m ++ ) {

					const modelId = data.getUint32( i, true ); i += 4;
					const modelAttributes = readDict( data, i );
					i += modelAttributes.size;

					models.push( {
						modelId: modelId,
						attributes: modelAttributes.value
					} );

				}

				nodes[ nodeId ] = {
					type: 'shape',
					id: nodeId,
					attributes: attributes.value,
					models: models
				};

			} else {

				// Skip unknown chunks
				i += chunkSize;

			}

		}

		// Apply palette to all chunks
		for ( let c = 0; c < chunks.length; c ++ ) {

			chunks[ c ].palette = palette;

		}

		// Build Three.js scene graph from nodes
		let scene = null;

		if ( Object.keys( nodes ).length > 0 ) {

			scene = buildObject( 0, nodes, chunks );

		}

		// Build result object
		const result = {
			chunks: chunks,
			scene: scene
		};

		// @deprecated, r182
		// Proxy for backwards compatibility with array-like access
		let warned = false;

		return new Proxy( result, {

			get( target, prop ) {

				// Handle numeric indices
				if ( typeof prop === 'string' && /^\d+$/.test( prop ) ) {

					if ( ! warned ) {

						console.warn( 'THREE.VOXLoader: Accessing result as an array is deprecated. Use result.chunks[] instead.' );
						warned = true;

					}

					return target.chunks[ parseInt( prop ) ];

				}

				// Handle array properties/methods
				if ( prop === 'length' ) {

					if ( ! warned ) {

						console.warn( 'THREE.VOXLoader: Accessing result as an array is deprecated. Use result.chunks instead.' );
						warned = true;

					}

					return target.chunks.length;

				}

				// Handle iteration
				if ( prop === Symbol.iterator ) {

					if ( ! warned ) {

						console.warn( 'THREE.VOXLoader: Iterating result as an array is deprecated. Use result.chunks instead.' );
						warned = true;

					}

					return target.chunks[ Symbol.iterator ].bind( target.chunks );

				}

				return target[ prop ];

			}

		} );

	}

}

/**
 * Builds a mesh from a VOX chunk.
 *
 * @param {Object} chunk - A VOX chunk loaded via {@link VOXLoader}.
 * @return {Mesh} The generated mesh.
 */
function buildMesh( chunk ) {

	const data = chunk.data;
	const size = chunk.size;
	const palette = chunk.palette;

	const sx = size.x;
	const sy = size.y;
	const sz = size.z;

	// Build volume with color indices

	const volume = new Uint8Array( sx * sy * sz );

	for ( let j = 0; j < data.length; j += 4 ) {

		const x = data[ j + 0 ];
		const y = data[ j + 1 ];
		const z = data[ j + 2 ];
		const c = data[ j + 3 ];

		volume[ x + y * sx + z * sx * sy ] = c;

	}

	// Greedy meshing

	const vertices = [];
	const indices = [];
	const colors = [];

	const _color = new Color();
	let hasColors = false;

	// Process each of the 6 face directions
	// dims: the 3 axis sizes, d: which axis is normal to the face
	const dims = [ sx, sy, sz ];

	for ( let d = 0; d < 3; d ++ ) {

		const u = ( d + 1 ) % 3;
		const v = ( d + 2 ) % 3;

		const dimsD = dims[ d ];
		const dimsU = dims[ u ];
		const dimsV = dims[ v ];

		const q = [ 0, 0, 0 ];
		const mask = new Int16Array( dimsU * dimsV );

		q[ d ] = 1;

		// Sweep through slices
		for ( let slice = 0; slice <= dimsD; slice ++ ) {

			// Build mask for this slice
			let n = 0;

			for ( let vv = 0; vv < dimsV; vv ++ ) {

				for ( let uu = 0; uu < dimsU; uu ++ ) {

					const pos = [ 0, 0, 0 ];
					pos[ d ] = slice;
					pos[ u ] = uu;
					pos[ v ] = vv;

					const x0 = pos[ 0 ], y0 = pos[ 1 ], z0 = pos[ 2 ];

					// Get voxel behind and in front of this face
					const behind = ( slice > 0 ) ? volume[ ( x0 - q[ 0 ] ) + ( y0 - q[ 1 ] ) * sx + ( z0 - q[ 2 ] ) * sx * sy ] : 0;
					const infront = ( slice < dimsD ) ? volume[ x0 + y0 * sx + z0 * sx * sy ] : 0;

					// Face exists if exactly one side is solid
					if ( behind > 0 && infront === 0 ) {

						mask[ n ] = behind; // positive face

					} else if ( infront > 0 && behind === 0 ) {

						mask[ n ] = - infront; // negative face

					} else {

						mask[ n ] = 0;

					}

					n ++;

				}

			}

			// Greedy merge mask into quads
			n = 0;

			for ( let vv = 0; vv < dimsV; vv ++ ) {

				for ( let uu = 0; uu < dimsU; ) {

					const c = mask[ n ];

					if ( c !== 0 ) {

						// Find width
						let w = 1;

						while ( uu + w < dimsU && mask[ n + w ] === c ) {

							w ++;

						}

						// Find height
						let h = 1;
						let done = false;

						while ( vv + h < dimsV && ! done ) {

							for ( let k = 0; k < w; k ++ ) {

								if ( mask[ n + k + h * dimsU ] !== c ) {

									done = true;
									break;

								}

							}

							if ( ! done ) h ++;

						}

						// Add quad
						const pos = [ 0, 0, 0 ];
						pos[ d ] = slice;
						pos[ u ] = uu;
						pos[ v ] = vv;

						const du = [ 0, 0, 0 ];
						const dv = [ 0, 0, 0 ];
						du[ u ] = w;
						dv[ v ] = h;

						// Get color
						const colorIndex = Math.abs( c );
						const hex = palette[ colorIndex ];
						const r = ( hex >> 0 & 0xff ) / 0xff;
						const g = ( hex >> 8 & 0xff ) / 0xff;
						const b = ( hex >> 16 & 0xff ) / 0xff;

						if ( r > 0 || g > 0 || b > 0 ) hasColors = true;

						_color.setRGB( r, g, b, SRGBColorSpace );

						// Convert VOX coords to Three.js coords (Y-up)
						// VOX: X right, Y forward, Z up -> Three.js: X right, Y up, Z back
						const toThree = ( p ) => [
							p[ 0 ] - sx / 2,
							p[ 2 ] - sz / 2,
							- p[ 1 ] + sy / 2
						];

						const v0 = toThree( pos );
						const v1 = toThree( [ pos[ 0 ] + du[ 0 ], pos[ 1 ] + du[ 1 ], pos[ 2 ] + du[ 2 ] ] );
						const v2 = toThree( [ pos[ 0 ] + du[ 0 ] + dv[ 0 ], pos[ 1 ] + du[ 1 ] + dv[ 1 ], pos[ 2 ] + du[ 2 ] + dv[ 2 ] ] );
						const v3 = toThree( [ pos[ 0 ] + dv[ 0 ], pos[ 1 ] + dv[ 1 ], pos[ 2 ] + dv[ 2 ] ] );

						const idx = vertices.length / 3;

						// Winding order depends on face direction
						if ( c > 0 ) {

							vertices.push( ...v0, ...v1, ...v2, ...v3 );
							indices.push( idx, idx + 1, idx + 2, idx, idx + 2, idx + 3 );

						} else {

							vertices.push( ...v0, ...v3, ...v2, ...v1 );
							indices.push( idx, idx + 1, idx + 2, idx, idx + 2, idx + 3 );

						}

						colors.push(
							_color.r, _color.g, _color.b,
							_color.r, _color.g, _color.b,
							_color.r, _color.g, _color.b,
							_color.r, _color.g, _color.b
						);

						// Clear mask
						for ( let hh = 0; hh < h; hh ++ ) {

							for ( let ww = 0; ww < w; ww ++ ) {

								mask[ n + ww + hh * dimsU ] = 0;

							}

						}

						uu += w;
						n += w;

					} else {

						uu ++;
						n ++;

					}

				}

			}

		}

	}

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	geometry.setIndex( indices );
	geometry.computeVertexNormals();

	const material = new MeshStandardMaterial();

	if ( hasColors ) {

		geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );
		material.vertexColors = true;

	}

	return new Mesh( geometry, material );

}

/**
 * Builds a 3D texture from a VOX chunk.
 *
 * @param {Object} chunk - A VOX chunk loaded via {@link VOXLoader}.
 * @return {Data3DTexture} The generated 3D texture.
 */
function buildData3DTexture( chunk ) {

	const data = chunk.data;
	const size = chunk.size;

	const offsety = size.x;
	const offsetz = size.x * size.y;

	const array = new Uint8Array( size.x * size.y * size.z );

	for ( let j = 0; j < data.length; j += 4 ) {

		const x = data[ j + 0 ];
		const y = data[ j + 1 ];
		const z = data[ j + 2 ];

		const index = x + ( y * offsety ) + ( z * offsetz );

		array[ index ] = 255;

	}

	const texture = new Data3DTexture( array, size.x, size.y, size.z );

	texture.format = RedFormat;
	texture.minFilter = NearestFilter;
	texture.magFilter = LinearFilter;
	texture.unpackAlignment = 1;
	texture.needsUpdate = true;

	return texture;

}

// @deprecated, r182

class VOXMesh extends Mesh {

	constructor( chunk ) {

		console.warn( 'VOXMesh has been deprecated. Use buildMesh() instead.' );

		const mesh = buildMesh( chunk );

		super( mesh.geometry, mesh.material );

	}

}

class VOXData3DTexture extends Data3DTexture {

	constructor( chunk ) {

		console.warn( 'VOXData3DTexture has been deprecated. Use buildData3DTexture() instead.' );

		const texture = buildData3DTexture( chunk );

		super( texture.image.data, texture.image.width, texture.image.height, texture.image.depth );

		this.format = texture.format;
		this.minFilter = texture.minFilter;
		this.magFilter = texture.magFilter;
		this.unpackAlignment = texture.unpackAlignment;
		this.needsUpdate = true;

	}

}

export { VOXLoader, buildMesh, buildData3DTexture, VOXMesh, VOXData3DTexture };
