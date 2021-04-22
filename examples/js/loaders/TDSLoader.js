( function () {

	/**
 * Autodesk 3DS three.js file loader, based on lib3ds.
 *
 * Loads geometry with uv and materials basic properties with texture support.
 *
 * @class TDSLoader
 * @constructor
 */

	class TDSLoader extends THREE.Loader {

		constructor( manager ) {

			super( manager );
			this.debug = false;
			this.group = null;
			this.position = 0;
			this.materials = [];
			this.meshes = [];

		}
		/**
   * Load 3ds file from url.
   *
   * @method load
   * @param {[type]} url URL for the file.
   * @param {Function} onLoad onLoad callback, receives group Object3D as argument.
   * @param {Function} onProgress onProgress callback.
   * @param {Function} onError onError callback.
   */


		load( url, onLoad, onProgress, onError ) {

			const scope = this;
			const path = this.path === '' ? THREE.LoaderUtils.extractUrlBase( url ) : this.path;
			const loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );
			loader.setRequestHeader( this.requestHeader );
			loader.setWithCredentials( this.withCredentials );
			loader.load( url, function ( data ) {

				try {

					onLoad( scope.parse( data, path ) );

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
   * Parse arraybuffer data and load 3ds file.
   *
   * @method parse
   * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
   * @param {String} path Path for external resources.
   * @return {Group} THREE.Group loaded from 3ds file.
   */


		parse( arraybuffer, path ) {

			this.group = new THREE.Group();
			this.position = 0;
			this.materials = [];
			this.meshes = [];
			this.readFile( arraybuffer, path );

			for ( let i = 0; i < this.meshes.length; i ++ ) {

				this.group.add( this.meshes[ i ] );

			}

			return this.group;

		}
		/**
   * Decode file content to read 3ds data.
   *
   * @method readFile
   * @param {ArrayBuffer} arraybuffer Arraybuffer data to be loaded.
   * @param {String} path Path for external resources.
   */


		readFile( arraybuffer, path ) {

			const data = new DataView( arraybuffer );
			const chunk = this.readChunk( data );

			if ( chunk.id === MLIBMAGIC || chunk.id === CMAGIC || chunk.id === M3DMAGIC ) {

				let next = this.nextChunk( data, chunk );

				while ( next !== 0 ) {

					if ( next === M3D_VERSION ) {

						const version = this.readDWord( data );
						this.debugMessage( '3DS file version: ' + version );

					} else if ( next === MDATA ) {

						this.resetPosition( data );
						this.readMeshData( data, path );

					} else {

						this.debugMessage( 'Unknown main chunk: ' + next.toString( 16 ) );

					}

					next = this.nextChunk( data, chunk );

				}

			}

			this.debugMessage( 'Parsed ' + this.meshes.length + ' meshes' );

		}
		/**
   * Read mesh data chunk.
   *
   * @method readMeshData
   * @param {Dataview} data Dataview in use.
   * @param {String} path Path for external resources.
   */


		readMeshData( data, path ) {

			const chunk = this.readChunk( data );
			let next = this.nextChunk( data, chunk );

			while ( next !== 0 ) {

				if ( next === MESH_VERSION ) {

					const version = + this.readDWord( data );
					this.debugMessage( 'Mesh Version: ' + version );

				} else if ( next === MASTER_SCALE ) {

					const scale = this.readFloat( data );
					this.debugMessage( 'Master scale: ' + scale );
					this.group.scale.set( scale, scale, scale );

				} else if ( next === NAMED_OBJECT ) {

					this.debugMessage( 'Named Object' );
					this.resetPosition( data );
					this.readNamedObject( data );

				} else if ( next === MAT_ENTRY ) {

					this.debugMessage( 'Material' );
					this.resetPosition( data );
					this.readMaterialEntry( data, path );

				} else {

					this.debugMessage( 'Unknown MDATA chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

		}
		/**
   * Read named object chunk.
   *
   * @method readNamedObject
   * @param {Dataview} data Dataview in use.
   */


		readNamedObject( data ) {

			const chunk = this.readChunk( data );
			const name = this.readString( data, 64 );
			chunk.cur = this.position;
			let next = this.nextChunk( data, chunk );

			while ( next !== 0 ) {

				if ( next === N_TRI_OBJECT ) {

					this.resetPosition( data );
					const mesh = this.readMesh( data );
					mesh.name = name;
					this.meshes.push( mesh );

				} else {

					this.debugMessage( 'Unknown named object chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );

		}
		/**
   * Read material data chunk and add it to the material list.
   *
   * @method readMaterialEntry
   * @param {Dataview} data Dataview in use.
   * @param {String} path Path for external resources.
   */


		readMaterialEntry( data, path ) {

			const chunk = this.readChunk( data );
			let next = this.nextChunk( data, chunk );
			const material = new THREE.MeshPhongMaterial();

			while ( next !== 0 ) {

				if ( next === MAT_NAME ) {

					material.name = this.readString( data, 64 );
					this.debugMessage( '   Name: ' + material.name );

				} else if ( next === MAT_WIRE ) {

					this.debugMessage( '   Wireframe' );
					material.wireframe = true;

				} else if ( next === MAT_WIRE_SIZE ) {

					const value = this.readByte( data );
					material.wireframeLinewidth = value;
					this.debugMessage( '   Wireframe Thickness: ' + value );

				} else if ( next === MAT_TWO_SIDE ) {

					material.side = THREE.DoubleSide;
					this.debugMessage( '   DoubleSided' );

				} else if ( next === MAT_ADDITIVE ) {

					this.debugMessage( '   Additive Blending' );
					material.blending = THREE.AdditiveBlending;

				} else if ( next === MAT_DIFFUSE ) {

					this.debugMessage( '   Diffuse THREE.Color' );
					material.color = this.readColor( data );

				} else if ( next === MAT_SPECULAR ) {

					this.debugMessage( '   Specular THREE.Color' );
					material.specular = this.readColor( data );

				} else if ( next === MAT_AMBIENT ) {

					this.debugMessage( '   Ambient color' );
					material.color = this.readColor( data );

				} else if ( next === MAT_SHININESS ) {

					const shininess = this.readPercentage( data );
					material.shininess = shininess * 100;
					this.debugMessage( '   Shininess : ' + shininess );

				} else if ( next === MAT_TRANSPARENCY ) {

					const transparency = this.readPercentage( data );
					material.opacity = 1 - transparency;
					this.debugMessage( '  Transparency : ' + transparency );
					material.transparent = material.opacity < 1 ? true : false;

				} else if ( next === MAT_TEXMAP ) {

					this.debugMessage( '   ColorMap' );
					this.resetPosition( data );
					material.map = this.readMap( data, path );

				} else if ( next === MAT_BUMPMAP ) {

					this.debugMessage( '   BumpMap' );
					this.resetPosition( data );
					material.bumpMap = this.readMap( data, path );

				} else if ( next === MAT_OPACMAP ) {

					this.debugMessage( '   OpacityMap' );
					this.resetPosition( data );
					material.alphaMap = this.readMap( data, path );

				} else if ( next === MAT_SPECMAP ) {

					this.debugMessage( '   SpecularMap' );
					this.resetPosition( data );
					material.specularMap = this.readMap( data, path );

				} else {

					this.debugMessage( '   Unknown material chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );
			this.materials[ material.name ] = material;

		}
		/**
   * Read mesh data chunk.
   *
   * @method readMesh
   * @param {Dataview} data Dataview in use.
   * @return {Mesh} The parsed mesh.
   */


		readMesh( data ) {

			const chunk = this.readChunk( data );
			let next = this.nextChunk( data, chunk );
			const geometry = new THREE.BufferGeometry();
			const material = new THREE.MeshPhongMaterial();
			const mesh = new THREE.Mesh( geometry, material );
			mesh.name = 'mesh';

			while ( next !== 0 ) {

				if ( next === POINT_ARRAY ) {

					const points = this.readWord( data );
					this.debugMessage( '   Vertex: ' + points ); //BufferGeometry

					const vertices = [];

					for ( let i = 0; i < points; i ++ ) {

						vertices.push( this.readFloat( data ) );
						vertices.push( this.readFloat( data ) );
						vertices.push( this.readFloat( data ) );

					}

					geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

				} else if ( next === FACE_ARRAY ) {

					this.resetPosition( data );
					this.readFaceArray( data, mesh );

				} else if ( next === TEX_VERTS ) {

					const texels = this.readWord( data );
					this.debugMessage( '   UV: ' + texels ); //BufferGeometry

					const uvs = [];

					for ( let i = 0; i < texels; i ++ ) {

						uvs.push( this.readFloat( data ) );
						uvs.push( this.readFloat( data ) );

					}

					geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

				} else if ( next === MESH_MATRIX ) {

					this.debugMessage( '   Tranformation Matrix (TODO)' );
					const values = [];

					for ( let i = 0; i < 12; i ++ ) {

						values[ i ] = this.readFloat( data );

					}

					const matrix = new THREE.Matrix4(); //X Line

					matrix.elements[ 0 ] = values[ 0 ];
					matrix.elements[ 1 ] = values[ 6 ];
					matrix.elements[ 2 ] = values[ 3 ];
					matrix.elements[ 3 ] = values[ 9 ]; //Y Line

					matrix.elements[ 4 ] = values[ 2 ];
					matrix.elements[ 5 ] = values[ 8 ];
					matrix.elements[ 6 ] = values[ 5 ];
					matrix.elements[ 7 ] = values[ 11 ]; //Z Line

					matrix.elements[ 8 ] = values[ 1 ];
					matrix.elements[ 9 ] = values[ 7 ];
					matrix.elements[ 10 ] = values[ 4 ];
					matrix.elements[ 11 ] = values[ 10 ]; //W Line

					matrix.elements[ 12 ] = 0;
					matrix.elements[ 13 ] = 0;
					matrix.elements[ 14 ] = 0;
					matrix.elements[ 15 ] = 1;
					matrix.transpose();
					const inverse = new THREE.Matrix4();
					inverse.copy( matrix ).invert();
					geometry.applyMatrix4( inverse );
					matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

				} else {

					this.debugMessage( '   Unknown mesh chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );
			geometry.computeVertexNormals();
			return mesh;

		}
		/**
   * Read face array data chunk.
   *
   * @method readFaceArray
   * @param {Dataview} data Dataview in use.
   * @param {Mesh} mesh THREE.Mesh to be filled with the data read.
   */


		readFaceArray( data, mesh ) {

			const chunk = this.readChunk( data );
			const faces = this.readWord( data );
			this.debugMessage( '   Faces: ' + faces );
			const index = [];

			for ( let i = 0; i < faces; ++ i ) {

				index.push( this.readWord( data ), this.readWord( data ), this.readWord( data ) );
				this.readWord( data ); // visibility

			}

			mesh.geometry.setIndex( index ); //The rest of the FACE_ARRAY chunk is subchunks

			let materialIndex = 0;
			let start = 0;

			while ( this.position < chunk.end ) {

				const subchunk = this.readChunk( data );

				if ( subchunk.id === MSH_MAT_GROUP ) {

					this.debugMessage( '      Material THREE.Group' );
					this.resetPosition( data );
					const group = this.readMaterialGroup( data );
					const count = group.index.length * 3; // assuming successive indices

					mesh.geometry.addGroup( start, count, materialIndex );
					start += count;
					materialIndex ++;
					const material = this.materials[ group.name ];
					if ( Array.isArray( mesh.material ) === false ) mesh.material = [];

					if ( material !== undefined ) {

						mesh.material.push( material );

					}

				} else {

					this.debugMessage( '      Unknown face array chunk: ' + subchunk.toString( 16 ) );

				}

				this.endChunk( subchunk );

			}

			if ( mesh.material.length === 1 ) mesh.material = mesh.material[ 0 ]; // for backwards compatibility

			this.endChunk( chunk );

		}
		/**
   * Read texture map data chunk.
   *
   * @method readMap
   * @param {Dataview} data Dataview in use.
   * @param {String} path Path for external resources.
   * @return {Texture} Texture read from this data chunk.
   */


		readMap( data, path ) {

			const chunk = this.readChunk( data );
			let next = this.nextChunk( data, chunk );
			let texture = {};
			const loader = new THREE.TextureLoader( this.manager );
			loader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

			while ( next !== 0 ) {

				if ( next === MAT_MAPNAME ) {

					const name = this.readString( data, 128 );
					texture = loader.load( name );
					this.debugMessage( '      File: ' + path + name );

				} else if ( next === MAT_MAP_UOFFSET ) {

					texture.offset.x = this.readFloat( data );
					this.debugMessage( '      OffsetX: ' + texture.offset.x );

				} else if ( next === MAT_MAP_VOFFSET ) {

					texture.offset.y = this.readFloat( data );
					this.debugMessage( '      OffsetY: ' + texture.offset.y );

				} else if ( next === MAT_MAP_USCALE ) {

					texture.repeat.x = this.readFloat( data );
					this.debugMessage( '      RepeatX: ' + texture.repeat.x );

				} else if ( next === MAT_MAP_VSCALE ) {

					texture.repeat.y = this.readFloat( data );
					this.debugMessage( '      RepeatY: ' + texture.repeat.y );

				} else {

					this.debugMessage( '      Unknown map chunk: ' + next.toString( 16 ) );

				}

				next = this.nextChunk( data, chunk );

			}

			this.endChunk( chunk );
			return texture;

		}
		/**
   * Read material group data chunk.
   *
   * @method readMaterialGroup
   * @param {Dataview} data Dataview in use.
   * @return {Object} Object with name and index of the object.
   */


		readMaterialGroup( data ) {

			this.readChunk( data );
			const name = this.readString( data, 64 );
			const numFaces = this.readWord( data );
			this.debugMessage( '         Name: ' + name );
			this.debugMessage( '         Faces: ' + numFaces );
			const index = [];

			for ( let i = 0; i < numFaces; ++ i ) {

				index.push( this.readWord( data ) );

			}

			return {
				name: name,
				index: index
			};

		}
		/**
   * Read a color value.
   *
   * @method readColor
   * @param {DataView} data Dataview.
   * @return {Color} THREE.Color value read..
   */


		readColor( data ) {

			const chunk = this.readChunk( data );
			const color = new THREE.Color();

			if ( chunk.id === COLOR_24 || chunk.id === LIN_COLOR_24 ) {

				const r = this.readByte( data );
				const g = this.readByte( data );
				const b = this.readByte( data );
				color.setRGB( r / 255, g / 255, b / 255 );
				this.debugMessage( '      THREE.Color: ' + color.r + ', ' + color.g + ', ' + color.b );

			} else if ( chunk.id === COLOR_F || chunk.id === LIN_COLOR_F ) {

				const r = this.readFloat( data );
				const g = this.readFloat( data );
				const b = this.readFloat( data );
				color.setRGB( r, g, b );
				this.debugMessage( '      THREE.Color: ' + color.r + ', ' + color.g + ', ' + color.b );

			} else {

				this.debugMessage( '      Unknown color chunk: ' + chunk.toString( 16 ) );

			}

			this.endChunk( chunk );
			return color;

		}
		/**
   * Read next chunk of data.
   *
   * @method readChunk
   * @param {DataView} data Dataview.
   * @return {Object} Chunk of data read.
   */


		readChunk( data ) {

			const chunk = {};
			chunk.cur = this.position;
			chunk.id = this.readWord( data );
			chunk.size = this.readDWord( data );
			chunk.end = chunk.cur + chunk.size;
			chunk.cur += 6;
			return chunk;

		}
		/**
   * Set position to the end of the current chunk of data.
   *
   * @method endChunk
   * @param {Object} chunk Data chunk.
   */


		endChunk( chunk ) {

			this.position = chunk.end;

		}
		/**
   * Move to the next data chunk.
   *
   * @method nextChunk
   * @param {DataView} data Dataview.
   * @param {Object} chunk Data chunk.
   */


		nextChunk( data, chunk ) {

			if ( chunk.cur >= chunk.end ) {

				return 0;

			}

			this.position = chunk.cur;

			try {

				const next = this.readChunk( data );
				chunk.cur += next.size;
				return next.id;

			} catch ( e ) {

				this.debugMessage( 'Unable to read chunk at ' + this.position );
				return 0;

			}

		}
		/**
   * Reset dataview position.
   *
   * @method resetPosition
   */


		resetPosition() {

			this.position -= 6;

		}
		/**
   * Read byte value.
   *
   * @method readByte
   * @param {DataView} data Dataview to read data from.
   * @return {Number} Data read from the dataview.
   */


		readByte( data ) {

			const v = data.getUint8( this.position, true );
			this.position += 1;
			return v;

		}
		/**
   * Read 32 bit float value.
   *
   * @method readFloat
   * @param {DataView} data Dataview to read data from.
   * @return {Number} Data read from the dataview.
   */


		readFloat( data ) {

			try {

				const v = data.getFloat32( this.position, true );
				this.position += 4;
				return v;

			} catch ( e ) {

				this.debugMessage( e + ' ' + this.position + ' ' + data.byteLength );

			}

		}
		/**
   * Read 32 bit signed integer value.
   *
   * @method readInt
   * @param {DataView} data Dataview to read data from.
   * @return {Number} Data read from the dataview.
   */


		readInt( data ) {

			const v = data.getInt32( this.position, true );
			this.position += 4;
			return v;

		}
		/**
   * Read 16 bit signed integer value.
   *
   * @method readShort
   * @param {DataView} data Dataview to read data from.
   * @return {Number} Data read from the dataview.
   */


		readShort( data ) {

			const v = data.getInt16( this.position, true );
			this.position += 2;
			return v;

		}
		/**
   * Read 64 bit unsigned integer value.
   *
   * @method readDWord
   * @param {DataView} data Dataview to read data from.
   * @return {Number} Data read from the dataview.
   */


		readDWord( data ) {

			const v = data.getUint32( this.position, true );
			this.position += 4;
			return v;

		}
		/**
   * Read 32 bit unsigned integer value.
   *
   * @method readWord
   * @param {DataView} data Dataview to read data from.
   * @return {Number} Data read from the dataview.
   */


		readWord( data ) {

			const v = data.getUint16( this.position, true );
			this.position += 2;
			return v;

		}
		/**
   * Read string value.
   *
   * @method readString
   * @param {DataView} data Dataview to read data from.
   * @param {Number} maxLength Max size of the string to be read.
   * @return {String} Data read from the dataview.
   */


		readString( data, maxLength ) {

			let s = '';

			for ( let i = 0; i < maxLength; i ++ ) {

				const c = this.readByte( data );

				if ( ! c ) {

					break;

				}

				s += String.fromCharCode( c );

			}

			return s;

		}
		/**
   * Read percentage value.
   *
   * @method readPercentage
   * @param {DataView} data Dataview to read data from.
   * @return {Number} Data read from the dataview.
   */


		readPercentage( data ) {

			const chunk = this.readChunk( data );
			let value;

			switch ( chunk.id ) {

				case INT_PERCENTAGE:
					value = this.readShort( data ) / 100;
					break;

				case FLOAT_PERCENTAGE:
					value = this.readFloat( data );
					break;

				default:
					this.debugMessage( '      Unknown percentage chunk: ' + chunk.toString( 16 ) );

			}

			this.endChunk( chunk );
			return value;

		}
		/**
   * Print debug message to the console.
   *
   * Is controlled by a flag to show or hide debug messages.
   *
   * @method debugMessage
   * @param {Object} message Debug message to print to the console.
   */


		debugMessage( message ) {

			if ( this.debug ) {

				console.log( message );

			}

		}

	} // const NULL_CHUNK = 0x0000;


	const M3DMAGIC = 0x4D4D; // const SMAGIC = 0x2D2D;
	// const LMAGIC = 0x2D3D;

	const MLIBMAGIC = 0x3DAA; // const MATMAGIC = 0x3DFF;

	const CMAGIC = 0xC23D;
	const M3D_VERSION = 0x0002; // const M3D_KFVERSION = 0x0005;

	const COLOR_F = 0x0010;
	const COLOR_24 = 0x0011;
	const LIN_COLOR_24 = 0x0012;
	const LIN_COLOR_F = 0x0013;
	const INT_PERCENTAGE = 0x0030;
	const FLOAT_PERCENTAGE = 0x0031;
	const MDATA = 0x3D3D;
	const MESH_VERSION = 0x3D3E;
	const MASTER_SCALE = 0x0100; // const LO_SHADOW_BIAS = 0x1400;
	// const HI_SHADOW_BIAS = 0x1410;
	// const SHADOW_MAP_SIZE = 0x1420;
	// const SHADOW_SAMPLES = 0x1430;
	// const SHADOW_RANGE = 0x1440;
	// const SHADOW_FILTER = 0x1450;
	// const RAY_BIAS = 0x1460;
	// const O_CONSTS = 0x1500;
	// const AMBIENT_LIGHT = 0x2100;
	// const BIT_MAP = 0x1100;
	// const SOLID_BGND = 0x1200;
	// const V_GRADIENT = 0x1300;
	// const USE_BIT_MAP = 0x1101;
	// const USE_SOLID_BGND = 0x1201;
	// const USE_V_GRADIENT = 0x1301;
	// const FOG = 0x2200;
	// const FOG_BGND = 0x2210;
	// const LAYER_FOG = 0x2302;
	// const DISTANCE_CUE = 0x2300;
	// const DCUE_BGND = 0x2310;
	// const USE_FOG = 0x2201;
	// const USE_LAYER_FOG = 0x2303;
	// const USE_DISTANCE_CUE = 0x2301;

	const MAT_ENTRY = 0xAFFF;
	const MAT_NAME = 0xA000;
	const MAT_AMBIENT = 0xA010;
	const MAT_DIFFUSE = 0xA020;
	const MAT_SPECULAR = 0xA030;
	const MAT_SHININESS = 0xA040; // const MAT_SHIN2PCT = 0xA041;

	const MAT_TRANSPARENCY = 0xA050; // const MAT_XPFALL = 0xA052;
	// const MAT_USE_XPFALL = 0xA240;
	// const MAT_REFBLUR = 0xA053;
	// const MAT_SHADING = 0xA100;
	// const MAT_USE_REFBLUR = 0xA250;
	// const MAT_SELF_ILLUM = 0xA084;

	const MAT_TWO_SIDE = 0xA081; // const MAT_DECAL = 0xA082;

	const MAT_ADDITIVE = 0xA083;
	const MAT_WIRE = 0xA085; // const MAT_FACEMAP = 0xA088;
	// const MAT_TRANSFALLOFF_IN = 0xA08A;
	// const MAT_PHONGSOFT = 0xA08C;
	// const MAT_WIREABS = 0xA08E;

	const MAT_WIRE_SIZE = 0xA087;
	const MAT_TEXMAP = 0xA200; // const MAT_SXP_TEXT_DATA = 0xA320;
	// const MAT_TEXMASK = 0xA33E;
	// const MAT_SXP_TEXTMASK_DATA = 0xA32A;
	// const MAT_TEX2MAP = 0xA33A;
	// const MAT_SXP_TEXT2_DATA = 0xA321;
	// const MAT_TEX2MASK = 0xA340;
	// const MAT_SXP_TEXT2MASK_DATA = 0xA32C;

	const MAT_OPACMAP = 0xA210; // const MAT_SXP_OPAC_DATA = 0xA322;
	// const MAT_OPACMASK = 0xA342;
	// const MAT_SXP_OPACMASK_DATA = 0xA32E;

	const MAT_BUMPMAP = 0xA230; // const MAT_SXP_BUMP_DATA = 0xA324;
	// const MAT_BUMPMASK = 0xA344;
	// const MAT_SXP_BUMPMASK_DATA = 0xA330;

	const MAT_SPECMAP = 0xA204; // const MAT_SXP_SPEC_DATA = 0xA325;
	// const MAT_SPECMASK = 0xA348;
	// const MAT_SXP_SPECMASK_DATA = 0xA332;
	// const MAT_SHINMAP = 0xA33C;
	// const MAT_SXP_SHIN_DATA = 0xA326;
	// const MAT_SHINMASK = 0xA346;
	// const MAT_SXP_SHINMASK_DATA = 0xA334;
	// const MAT_SELFIMAP = 0xA33D;
	// const MAT_SXP_SELFI_DATA = 0xA328;
	// const MAT_SELFIMASK = 0xA34A;
	// const MAT_SXP_SELFIMASK_DATA = 0xA336;
	// const MAT_REFLMAP = 0xA220;
	// const MAT_REFLMASK = 0xA34C;
	// const MAT_SXP_REFLMASK_DATA = 0xA338;
	// const MAT_ACUBIC = 0xA310;

	const MAT_MAPNAME = 0xA300; // const MAT_MAP_TILING = 0xA351;
	// const MAT_MAP_TEXBLUR = 0xA353;

	const MAT_MAP_USCALE = 0xA354;
	const MAT_MAP_VSCALE = 0xA356;
	const MAT_MAP_UOFFSET = 0xA358;
	const MAT_MAP_VOFFSET = 0xA35A; // const MAT_MAP_ANG = 0xA35C;
	// const MAT_MAP_COL1 = 0xA360;
	// const MAT_MAP_COL2 = 0xA362;
	// const MAT_MAP_RCOL = 0xA364;
	// const MAT_MAP_GCOL = 0xA366;
	// const MAT_MAP_BCOL = 0xA368;

	const NAMED_OBJECT = 0x4000; // const N_DIRECT_LIGHT = 0x4600;
	// const DL_OFF = 0x4620;
	// const DL_OUTER_RANGE = 0x465A;
	// const DL_INNER_RANGE = 0x4659;
	// const DL_MULTIPLIER = 0x465B;
	// const DL_EXCLUDE = 0x4654;
	// const DL_ATTENUATE = 0x4625;
	// const DL_SPOTLIGHT = 0x4610;
	// const DL_SPOT_ROLL = 0x4656;
	// const DL_SHADOWED = 0x4630;
	// const DL_LOCAL_SHADOW2 = 0x4641;
	// const DL_SEE_CONE = 0x4650;
	// const DL_SPOT_RECTANGULAR = 0x4651;
	// const DL_SPOT_ASPECT = 0x4657;
	// const DL_SPOT_PROJECTOR = 0x4653;
	// const DL_SPOT_OVERSHOOT = 0x4652;
	// const DL_RAY_BIAS = 0x4658;
	// const DL_RAYSHAD = 0x4627;
	// const N_CAMERA = 0x4700;
	// const CAM_SEE_CONE = 0x4710;
	// const CAM_RANGES = 0x4720;
	// const OBJ_HIDDEN = 0x4010;
	// const OBJ_VIS_LOFTER = 0x4011;
	// const OBJ_DOESNT_CAST = 0x4012;
	// const OBJ_DONT_RECVSHADOW = 0x4017;
	// const OBJ_MATTE = 0x4013;
	// const OBJ_FAST = 0x4014;
	// const OBJ_PROCEDURAL = 0x4015;
	// const OBJ_FROZEN = 0x4016;

	const N_TRI_OBJECT = 0x4100;
	const POINT_ARRAY = 0x4110; // const POINT_FLAG_ARRAY = 0x4111;

	const FACE_ARRAY = 0x4120;
	const MSH_MAT_GROUP = 0x4130; // const SMOOTH_GROUP = 0x4150;
	// const MSH_BOXMAP = 0x4190;

	const TEX_VERTS = 0x4140;
	const MESH_MATRIX = 0x4160; // const MESH_COLOR = 0x4165;

	THREE.TDSLoader = TDSLoader;

} )();
