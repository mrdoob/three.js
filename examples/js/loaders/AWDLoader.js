/**
 * Author: Pierre Lepers
 * Date: 09/12/2013 17:21
 */

THREE.AWDLoader = ( function () {

	var //UNCOMPRESSED = 0,
		//DEFLATE = 1,
		//LZMA = 2,

		AWD_FIELD_INT8 = 1,
		AWD_FIELD_INT16 = 2,
		AWD_FIELD_INT32 = 3,
		AWD_FIELD_UINT8 = 4,
		AWD_FIELD_UINT16 = 5,
		AWD_FIELD_UINT32 = 6,
		AWD_FIELD_FLOAT32 = 7,
		AWD_FIELD_FLOAT64 = 8,
		AWD_FIELD_BOOL = 21,
		//AWD_FIELD_COLOR = 22,
		AWD_FIELD_BADDR = 23,
		//AWD_FIELD_STRING = 31,
		//AWD_FIELD_BYTEARRAY = 32,
		AWD_FIELD_VECTOR2x1 = 41,
		AWD_FIELD_VECTOR3x1 = 42,
		AWD_FIELD_VECTOR4x1 = 43,
		AWD_FIELD_MTX3x2 = 44,
		AWD_FIELD_MTX3x3 = 45,
		AWD_FIELD_MTX4x3 = 46,
		AWD_FIELD_MTX4x4 = 47,

		BOOL = 21,
		//COLOR = 22,
		BADDR = 23,

		//INT8 = 1,
		//INT16 = 2,
		//INT32 = 3,
		UINT8 = 4,
		UINT16 = 5,
		//UINT32 = 6,
		FLOAT32 = 7,
		FLOAT64 = 8;

	var littleEndian = true;

	function Block() {

		this.id = 0;
		this.data = null;

	}

	function AWDProperties() {}

	AWDProperties.prototype = {
		set: function ( key, value ) {

			this[ key ] = value;

		},

		get: function ( key, fallback ) {

			if ( this.hasOwnProperty( key ) ) {

				return this[ key ];

			} else {

				return fallback;

			}

		}
	};

	var AWDLoader = function ( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

		this.trunk = new THREE.Object3D();

		this.materialFactory = undefined;

		this._url = '';
		this._baseDir = '';

		this._data = undefined;
		this._ptr = 0;

		this._version = [];
		this._streaming = false;
		this._optimized_for_accuracy = false;
		this._compression = 0;
		this._bodylen = 0xFFFFFFFF;

		this._blocks = [ new Block() ];

		this._accuracyMatrix = false;
		this._accuracyGeo = false;
		this._accuracyProps = false;

	};

	AWDLoader.prototype = {

		constructor: AWDLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			this._url = url;
			this._baseDir = url.substr( 0, url.lastIndexOf( '/' ) + 1 );

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( text ) {

				onLoad( scope.parse( text ) );

			}, onProgress, onError );

		},

		setPath: function ( value ) {

			this.path = value;
			return this;

		},

		parse: function ( data ) {

			var blen = data.byteLength;

			this._ptr = 0;
			this._data = new DataView( data );

			this._parseHeader( );

			if ( this._compression != 0 ) {

				console.error( 'compressed AWD not supported' );

			}

			if ( ! this._streaming && this._bodylen != data.byteLength - this._ptr ) {

				console.error( 'AWDLoader: body len does not match file length', this._bodylen, blen - this._ptr );

			}

			while ( this._ptr < blen ) {

				this.parseNextBlock();

			}

			return this.trunk;

		},

		parseNextBlock: function () {

			var assetData,
				ns, type, len, block,
				blockId = this.readU32(),
				ns = this.readU8(),
				type = this.readU8(),
				flags = this.readU8(),
				len = this.readU32();


			switch ( type ) {

				case 1:
					assetData = this.parseMeshData();
					break;

				case 22:
					assetData = this.parseContainer();
					break;

				case 23:
					assetData = this.parseMeshInstance();
					break;

				case 81:
					assetData = this.parseMaterial();
					break;

				case 82:
					assetData = this.parseTexture();
					break;

				case 101:
					assetData = this.parseSkeleton();
					break;

				case 112:
					assetData = this.parseMeshPoseAnimation( false );
					break;

				case 113:
					assetData = this.parseVertexAnimationSet();
					break;

				case 102:
					assetData = this.parseSkeletonPose();
					break;

				case 103:
					assetData = this.parseSkeletonAnimation();
					break;

				case 122:
					assetData = this.parseAnimatorSet();
					break;

				default:
					//debug('Ignoring block!',type, len);
					this._ptr += len;
					break;

			}


			// Store block reference for later use
			this._blocks[ blockId ] = block = new Block();
			block.data = assetData;
			block.id = blockId;


		},

		_parseHeader: function () {

			var version = this._version,
				awdmagic = ( this.readU8() << 16 ) | ( this.readU8() << 8 ) | this.readU8();

			if ( awdmagic != 4282180 )
				throw new Error( "AWDLoader - bad magic" );

			version[ 0 ] = this.readU8();
			version[ 1 ] = this.readU8();

			var flags = this.readU16();

			this._streaming = ( flags & 0x1 ) == 0x1;

			if ( ( version[ 0 ] === 2 ) && ( version[ 1 ] === 1 ) ) {

				this._accuracyMatrix = ( flags & 0x2 ) === 0x2;
				this._accuracyGeo = ( flags & 0x4 ) === 0x4;
				this._accuracyProps = ( flags & 0x8 ) === 0x8;

			}

			this._geoNrType = this._accuracyGeo ? FLOAT64 : FLOAT32;
			this._matrixNrType = this._accuracyMatrix ? FLOAT64 : FLOAT32;
			this._propsNrType = this._accuracyProps ? FLOAT64 : FLOAT32;

			this._optimized_for_accuracy = ( flags & 0x2 ) === 0x2;

			this._compression = this.readU8();
			this._bodylen = this.readU32();

		},

		parseContainer: function () {

			var parent,
				ctr = new THREE.Object3D(),
				par_id = this.readU32(),
				mtx = this.parseMatrix4();

			ctr.name = this.readUTF();
			ctr.applyMatrix( mtx );

			parent = this._blocks[ par_id ].data || this.trunk;
			parent.add( ctr );

			this.parseProperties( {
				1: this._matrixNrType,
				2: this._matrixNrType,
				3: this._matrixNrType,
				4: UINT8
			} );

			ctr.extra = this.parseUserAttributes();

			return ctr;

		},

		parseMeshInstance: function () {

			var name,
				mesh, geometries, meshLen, meshes,
				par_id, data_id,
				mtx,
				materials, mat, mat_id,
				num_materials,
				parent,
				i;

			par_id = this.readU32();
			mtx = this.parseMatrix4();
			name = this.readUTF();
			data_id = this.readU32();
			num_materials = this.readU16();

			geometries = this.getBlock( data_id );

			materials = [];

			for ( i = 0; i < num_materials; i ++ ) {

				mat_id = this.readU32();
				mat = this.getBlock( mat_id );
				materials.push( mat );

			}

			meshLen = geometries.length;
			meshes = [];

			// TODO : BufferGeometry don't support "geometryGroups" for now.
			// so we create sub meshes for each groups
			if ( meshLen > 1 ) {

				mesh = new THREE.Object3D();
				for ( i = 0; i < meshLen; i ++ ) {

					var sm = new THREE.Mesh( geometries[ i ] );
					meshes.push( sm );
					mesh.add( sm );

				}

			} else {

				mesh = new THREE.Mesh( geometries[ 0 ] );
				meshes.push( mesh );

			}

			mesh.applyMatrix( mtx );
			mesh.name = name;


			parent = this.getBlock( par_id ) || this.trunk;
			parent.add( mesh );


			var matLen = materials.length;
			var maxLen = Math.max( meshLen, matLen );
			for ( i = 0; i < maxLen; i ++ )
				meshes[ i % meshLen ].material = materials[ i % matLen ];


			// Ignore for now
			this.parseProperties( null );
			mesh.extra = this.parseUserAttributes();

			return mesh;

		},

		parseMaterial: function () {

			var name,
				type,
				props,
				mat,
				attributes,
				num_methods,
				methods_parsed;

			name = this.readUTF();
			type = this.readU8();
			num_methods = this.readU8();

			//log( "AWDLoader parseMaterial ",name )

			// Read material numerical properties
			// (1=color, 2=bitmap url, 11=alpha_blending, 12=alpha_threshold, 13=repeat)
			props = this.parseProperties( {
				1: AWD_FIELD_INT32,
				2: AWD_FIELD_BADDR,
				11: AWD_FIELD_BOOL,
				12: AWD_FIELD_FLOAT32,
				13: AWD_FIELD_BOOL
			} );

			methods_parsed = 0;

			while ( methods_parsed < num_methods ) {

				var method_type = this.readU16();
				this.parseProperties( null );
				this.parseUserAttributes();

			}

			attributes = this.parseUserAttributes();

			if ( this.materialFactory !== undefined ) {

				mat = this.materialFactory( name );
				if ( mat ) return mat;

			}

			mat = new THREE.MeshPhongMaterial();

			if ( type === 1 ) {

				// Color material
				mat.color.setHex( props.get( 1, 0xcccccc ) );

			} else if ( type === 2 ) {

				// Bitmap material
				var tex_addr = props.get( 2, 0 );
				mat.map = this.getBlock( tex_addr );

			}

			mat.extra = attributes;
			mat.alphaThreshold = props.get( 12, 0.0 );
			mat.repeat = props.get( 13, false );


			return mat;

		},

		parseTexture: function () {

			var name = this.readUTF(),
				type = this.readU8(),
				asset,
				data_len;

			// External
			if ( type === 0 ) {

				data_len = this.readU32();
				var url = this.readUTFBytes( data_len );
				console.log( url );

				asset = this.loadTexture( url );

			} else {
				// embed texture not supported
			}
			// Ignore for now
			this.parseProperties( null );

			this.parseUserAttributes();
			return asset;

		},

		loadTexture: function ( url ) {

			var tex = new THREE.Texture();

			var loader = new THREE.ImageLoader( this.manager );

			loader.load( this._baseDir + url, function ( image ) {

				tex.image = image;
				tex.needsUpdate = true;

			} );

			return tex;

		},

		parseSkeleton: function () {

			// Array<Bone>
			var name = this.readUTF(),
				num_joints = this.readU16(),
				skeleton = [],
				joints_parsed = 0;

			this.parseProperties( null );

			while ( joints_parsed < num_joints ) {

				var joint, ibp;

				// Ignore joint id
				this.readU16();

				joint = new THREE.Bone();
				joint.parent = this.readU16() - 1; // 0=null in AWD
				joint.name = this.readUTF();

				ibp = this.parseMatrix4();
				joint.skinMatrix = ibp;

				// Ignore joint props/attributes for now
				this.parseProperties( null );
				this.parseUserAttributes();

				skeleton.push( joint );
				joints_parsed ++;

			}

			// Discard attributes for now
			this.parseUserAttributes();


			return skeleton;

		},

		parseSkeletonPose: function () {

			var name = this.readUTF();

			var num_joints = this.readU16();
			this.parseProperties( null );

			// debug( 'parse Skeleton Pose. joints : ' + num_joints);

			var pose = [];

			var joints_parsed = 0;

			while ( joints_parsed < num_joints ) {

				var has_transform; //:uint;
				var mtx_data;

				has_transform = this.readU8();

				if ( has_transform === 1 ) {

					mtx_data = this.parseMatrix4();

				} else {

					mtx_data = new THREE.Matrix4();

				}
				pose[ joints_parsed ] = mtx_data;
				joints_parsed ++;

			}

			// Skip attributes for now
			this.parseUserAttributes();

			return pose;

		},

		parseSkeletonAnimation: function () {

			var frame_dur;
			var pose_addr;
			var pose;

			var name = this.readUTF();

			var clip = [];

			var num_frames = this.readU16();
			this.parseProperties( null );

			var frames_parsed = 0;

			// debug( 'parse Skeleton Animation. frames : ' + num_frames);

			while ( frames_parsed < num_frames ) {

				pose_addr = this.readU32();
				frame_dur = this.readU16();

				pose = this._blocks[ pose_addr ].data;
				// debug( 'pose address ',pose[2].elements[12],pose[2].elements[13],pose[2].elements[14] );
				clip.push( {
					pose: pose,
					duration: frame_dur
				} );

				frames_parsed ++;

			}

			if ( clip.length === 0 ) {

				// debug("Could not this SkeletonClipNode, because no Frames where set.");
				return;

			}
			// Ignore attributes for now
			this.parseUserAttributes();
			return clip;

		},

		parseVertexAnimationSet: function () {

			var poseBlockAdress,
				name = this.readUTF(),
				num_frames = this.readU16(),
				props = this.parseProperties( { 1: UINT16 } ),
				frames_parsed = 0,
				skeletonFrames = [];

			while ( frames_parsed < num_frames ) {

				poseBlockAdress = this.readU32();
				skeletonFrames.push( this._blocks[ poseBlockAdress ].data );
				frames_parsed ++;

			}

			this.parseUserAttributes();


			return skeletonFrames;

		},

		parseAnimatorSet: function () {

			var animSetBlockAdress; //:int

			var targetAnimationSet; //:AnimationSetBase;
			var name = this.readUTF();
			var type = this.readU16();

			var props = this.parseProperties( { 1: BADDR } );

			animSetBlockAdress = this.readU32();
			var targetMeshLength = this.readU16();

			var meshAdresses = []; //:Vector.<uint> = new Vector.<uint>;

			for ( var i = 0; i < targetMeshLength; i ++ )
				meshAdresses.push( this.readU32() );

			var activeState = this.readU16();
			var autoplay = Boolean( this.readU8() );
			this.parseUserAttributes();
			this.parseUserAttributes();

			var targetMeshes = []; //:Vector.<Mesh> = new Vector.<Mesh>;

			for ( i = 0; i < meshAdresses.length; i ++ ) {

				//			returnedArray = getAssetByID(meshAdresses[i], [AssetType.MESH]);
				//			if (returnedArray[0])
				targetMeshes.push( this._blocks[ meshAdresses[ i ] ].data );

			}

			targetAnimationSet = this._blocks[ animSetBlockAdress ].data;
			var thisAnimator;

			if ( type == 1 ) {


				thisAnimator = {
					animationSet: targetAnimationSet,
					skeleton: this._blocks[ props.get( 1, 0 ) ].data
				};

			} else if ( type == 2 ) {
				// debug( "vertex Anim???");
			}


			for ( i = 0; i < targetMeshes.length; i ++ ) {

				targetMeshes[ i ].animator = thisAnimator;

			}
			// debug("Parsed a Animator: Name = " + name);

			return thisAnimator;

		},

		parseMeshData: function () {

			var name = this.readUTF(),
				num_subs = this.readU16(),
				geom,
				subs_parsed = 0,
				buffer,
				geometries = [];

			// Ignore for now
			this.parseProperties( { 1: this._geoNrType, 2: this._geoNrType } );

			// Loop through sub meshes
			while ( subs_parsed < num_subs ) {

				var sm_len, sm_end, attrib;

				geom = new THREE.BufferGeometry();
				geom.name = name;
				geometries.push( geom );


				sm_len = this.readU32();
				sm_end = this._ptr + sm_len;


				// Ignore for now
				this.parseProperties( { 1: this._geoNrType, 2: this._geoNrType } );

				// Loop through data streams
				while ( this._ptr < sm_end ) {

					var idx = 0,
						str_type = this.readU8(),
						str_ftype = this.readU8(),
						str_len = this.readU32(),
						str_end = str_len + this._ptr;

					if ( str_type === 1 ) {

						// VERTICES

						buffer = new Float32Array( ( str_len / 12 ) * 3 );
						attrib = new THREE.BufferAttribute( buffer, 3 );

						geom.addAttribute( 'position', attrib );
						idx = 0;

						while ( this._ptr < str_end ) {

							buffer[ idx ] = - this.readF32();
							buffer[ idx + 1 ] = this.readF32();
							buffer[ idx + 2 ] = this.readF32();
							idx += 3;

						}

					} else if ( str_type === 2 ) {

						// INDICES

						buffer = new Uint16Array( str_len / 2 );
						attrib = new THREE.BufferAttribute( buffer, 1 );
						geom.setIndex( attrib );

						idx = 0;

						while ( this._ptr < str_end ) {

							buffer[ idx + 1 ] = this.readU16();
							buffer[ idx ] = this.readU16();
							buffer[ idx + 2 ] = this.readU16();
							idx += 3;

						}

					} else if ( str_type === 3 ) {

						// UVS

						buffer = new Float32Array( ( str_len / 8 ) * 2 );
						attrib = new THREE.BufferAttribute( buffer, 2 );

						geom.addAttribute( 'uv', attrib );
						idx = 0;

						while ( this._ptr < str_end ) {

							buffer[ idx ] = this.readF32();
							buffer[ idx + 1 ] = 1.0 - this.readF32();
							idx += 2;

						}

					} else if ( str_type === 4 ) {

						// NORMALS

						buffer = new Float32Array( ( str_len / 12 ) * 3 );
						attrib = new THREE.BufferAttribute( buffer, 3 );
						geom.addAttribute( 'normal', attrib );
						idx = 0;

						while ( this._ptr < str_end ) {

							buffer[ idx ] = - this.readF32();
							buffer[ idx + 1 ] = this.readF32();
							buffer[ idx + 2 ] = this.readF32();
							idx += 3;

						}

					} else {

						this._ptr = str_end;

					}

				}

				this.parseUserAttributes();

				geom.computeBoundingSphere();
				subs_parsed ++;

			}

			//geom.computeFaceNormals();

			this.parseUserAttributes();
			//finalizeAsset(geom, name);

			return geometries;

		},

		parseMeshPoseAnimation: function ( poseOnly ) {

			var num_frames = 1,
				num_submeshes,
				frames_parsed,
				subMeshParsed,

				str_len,
				str_end,
				geom,
				idx = 0,
				clip = {},
				num_Streams,
				streamsParsed,
				streamtypes = [],

				props,
				name = this.readUTF(),
				geoAdress = this.readU32();

			var mesh = this.getBlock( geoAdress );

			if ( mesh === null ) {

				console.log( "parseMeshPoseAnimation target mesh not found at:", geoAdress );
				return;

			}

			geom = mesh.geometry;
			geom.morphTargets = [];

			if ( ! poseOnly )
				num_frames = this.readU16();

			num_submeshes = this.readU16();
			num_Streams = this.readU16();

			// debug("VA num_frames : ", num_frames );
			// debug("VA num_submeshes : ", num_submeshes );
			// debug("VA numstreams : ", num_Streams );

			streamsParsed = 0;
			while ( streamsParsed < num_Streams ) {

				streamtypes.push( this.readU16() );
				streamsParsed ++;

			}
			props = this.parseProperties( { 1: BOOL, 2: BOOL } );

			clip.looping = props.get( 1, true );
			clip.stitchFinalFrame = props.get( 2, false );

			frames_parsed = 0;

			while ( frames_parsed < num_frames ) {

				this.readU16();
				subMeshParsed = 0;

				while ( subMeshParsed < num_submeshes ) {

					streamsParsed = 0;
					str_len = this.readU32();
					str_end = this._ptr + str_len;

					while ( streamsParsed < num_Streams ) {

						if ( streamtypes[ streamsParsed ] === 1 ) {

							//geom.addAttribute( 'morphTarget'+frames_parsed, Float32Array, str_len/12, 3 );
							var buffer = new Float32Array( str_len / 4 );
							geom.morphTargets.push( {
								array: buffer
							} );

							//buffer = geom.attributes['morphTarget'+frames_parsed].array
							idx = 0;

							while ( this._ptr < str_end ) {

								buffer[ idx ] = this.readF32();
								buffer[ idx + 1 ] = this.readF32();
								buffer[ idx + 2 ] = this.readF32();
								idx += 3;

							}


							subMeshParsed ++;

						} else
							this._ptr = str_end;
						streamsParsed ++;

					}

				}


				frames_parsed ++;

			}

			this.parseUserAttributes();

			return null;

		},

		getBlock: function ( id ) {

			return this._blocks[ id ].data;

		},

		parseMatrix4: function () {

			var mtx = new THREE.Matrix4();
			var e = mtx.elements;

			e[ 0 ] = this.readF32();
			e[ 1 ] = this.readF32();
			e[ 2 ] = this.readF32();
			e[ 3 ] = 0.0;
			//e[3] = 0.0;

			e[ 4 ] = this.readF32();
			e[ 5 ] = this.readF32();
			e[ 6 ] = this.readF32();
			//e[7] = this.readF32();
			e[ 7 ] = 0.0;

			e[ 8 ] = this.readF32();
			e[ 9 ] = this.readF32();
			e[ 10 ] = this.readF32();
			//e[11] = this.readF32();
			e[ 11 ] = 0.0;

			e[ 12 ] = - this.readF32();
			e[ 13 ] = this.readF32();
			e[ 14 ] = this.readF32();
			//e[15] = this.readF32();
			e[ 15 ] = 1.0;
			return mtx;

		},

		parseProperties: function ( expected ) {

			var list_len = this.readU32();
			var list_end = this._ptr + list_len;

			var props = new AWDProperties();

			if ( expected ) {

				while ( this._ptr < list_end ) {

					var key = this.readU16();
					var len = this.readU32();
					var type;

					if ( expected.hasOwnProperty( key ) ) {

						type = expected[ key ];
						props.set( key, this.parseAttrValue( type, len ) );

					} else {

						this._ptr += len;

					}

				}

			}

			return props;

		},

		parseUserAttributes: function () {

			// skip for now
			this._ptr = this.readU32() + this._ptr;
			return null;

		},

		parseAttrValue: function ( type, len ) {

			var elem_len;
			var read_func;

			switch ( type ) {

				case AWD_FIELD_INT8:
					elem_len = 1;
					read_func = this.readI8;
					break;

				case AWD_FIELD_INT16:
					elem_len = 2;
					read_func = this.readI16;
					break;

				case AWD_FIELD_INT32:
					elem_len = 4;
					read_func = this.readI32;
					break;

				case AWD_FIELD_BOOL:
				case AWD_FIELD_UINT8:
					elem_len = 1;
					read_func = this.readU8;
					break;

				case AWD_FIELD_UINT16:
					elem_len = 2;
					read_func = this.readU16;
					break;

				case AWD_FIELD_UINT32:
				case AWD_FIELD_BADDR:
					elem_len = 4;
					read_func = this.readU32;
					break;

				case AWD_FIELD_FLOAT32:
					elem_len = 4;
					read_func = this.readF32;
					break;

				case AWD_FIELD_FLOAT64:
					elem_len = 8;
					read_func = this.readF64;
					break;

				case AWD_FIELD_VECTOR2x1:
				case AWD_FIELD_VECTOR3x1:
				case AWD_FIELD_VECTOR4x1:
				case AWD_FIELD_MTX3x2:
				case AWD_FIELD_MTX3x3:
				case AWD_FIELD_MTX4x3:
				case AWD_FIELD_MTX4x4:
					elem_len = 8;
					read_func = this.readF64;
					break;

			}

			if ( elem_len < len ) {

				var list;
				var num_read;
				var num_elems;

				list = [];
				num_read = 0;
				num_elems = len / elem_len;

				while ( num_read < num_elems ) {

					list.push( read_func.call( this ) );
					num_read ++;

				}

				return list;

			} else {

				return read_func.call( this );

			}

		},

		readU8: function () {

			return this._data.getUint8( this._ptr ++ );

		},
		readI8: function () {

			return this._data.getInt8( this._ptr ++ );

		},
		readU16: function () {

			var a = this._data.getUint16( this._ptr, littleEndian );
			this._ptr += 2;
			return a;

		},
		readI16: function () {

			var a = this._data.getInt16( this._ptr, littleEndian );
			this._ptr += 2;
			return a;

		},
		readU32: function () {

			var a = this._data.getUint32( this._ptr, littleEndian );
			this._ptr += 4;
			return a;

		},
		readI32: function () {

			var a = this._data.getInt32( this._ptr, littleEndian );
			this._ptr += 4;
			return a;

		},
		readF32: function () {

			var a = this._data.getFloat32( this._ptr, littleEndian );
			this._ptr += 4;
			return a;

		},
		readF64: function () {

			var a = this._data.getFloat64( this._ptr, littleEndian );
			this._ptr += 8;
			return a;

		},

		/**
	 * Converts a UTF-8 byte array to JavaScript's 16-bit Unicode.
	 * @param {Array.<number>} bytes UTF-8 byte array.
	 * @return {string} 16-bit Unicode string.
	 */
		readUTF: function () {

			var len = this.readU16();
			return this.readUTFBytes( len );

		},

		/**
		 * Converts a UTF-8 byte array to JavaScript's 16-bit Unicode.
		 * @param {Array.<number>} bytes UTF-8 byte array.
		 * @return {string} 16-bit Unicode string.
		 */
		readUTFBytes: function ( len ) {

			// TODO(user): Use native implementations if/when available
			var out = [], c = 0;

			while ( out.length < len ) {

				var c1 = this._data.getUint8( this._ptr ++, littleEndian );
				if ( c1 < 128 ) {

					out[ c ++ ] = String.fromCharCode( c1 );

				} else if ( c1 > 191 && c1 < 224 ) {

					var c2 = this._data.getUint8( this._ptr ++, littleEndian );
					out[ c ++ ] = String.fromCharCode( ( c1 & 31 ) << 6 | c2 & 63 );

				} else {

					var c2 = this._data.getUint8( this._ptr ++, littleEndian );
					var c3 = this._data.getUint8( this._ptr ++, littleEndian );
					out[ c ++ ] = String.fromCharCode( ( c1 & 15 ) << 12 | ( c2 & 63 ) << 6 | c3 & 63 );

				}

			}
			return out.join( '' );

		}

	};

	return AWDLoader;

} )();
