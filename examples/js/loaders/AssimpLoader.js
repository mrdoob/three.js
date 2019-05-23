/**
 * @author Virtulous / https://virtulo.us/
 */

THREE.AssimpLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.AssimpLoader.prototype = {

	constructor: THREE.AssimpLoader,

	crossOrigin: 'anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var path = ( scope.path === undefined ) ? THREE.LoaderUtils.extractUrlBase( url ) : scope.path;

		var loader = new THREE.FileLoader( this.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );

		loader.load( url, function ( buffer ) {

			onLoad( scope.parse( buffer, path ) );

		}, onProgress, onError );

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	setResourcePath: function ( value ) {

		this.resourcePath = value;
		return this;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	parse: function ( buffer, path ) {

		var textureLoader = new THREE.TextureLoader( this.manager );
		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		var Virtulous = {};

		Virtulous.KeyFrame = function ( time, matrix ) {

			this.time = time;
			this.matrix = matrix.clone();
			this.position = new THREE.Vector3();
			this.quaternion = new THREE.Quaternion();
			this.scale = new THREE.Vector3( 1, 1, 1 );
			this.matrix.decompose( this.position, this.quaternion, this.scale );
			this.clone = function () {

				var n = new Virtulous.KeyFrame( this.time, this.matrix );
				return n;

			};
			this.lerp = function ( nextKey, time ) {

				time -= this.time;
				var dist = ( nextKey.time - this.time );
				var l = time / dist;
				var l2 = 1 - l;
				var keypos = this.position;
				var keyrot = this.quaternion;
				//      var keyscl =  key.parentspaceScl || key.scl;
				var key2pos = nextKey.position;
				var key2rot = nextKey.quaternion;
				//  var key2scl =  key2.parentspaceScl || key2.scl;
				Virtulous.KeyFrame.tempAniPos.x = keypos.x * l2 + key2pos.x * l;
				Virtulous.KeyFrame.tempAniPos.y = keypos.y * l2 + key2pos.y * l;
				Virtulous.KeyFrame.tempAniPos.z = keypos.z * l2 + key2pos.z * l;
				//     tempAniScale.x = keyscl[0] * l2 + key2scl[0] * l;
				//     tempAniScale.y = keyscl[1] * l2 + key2scl[1] * l;
				//     tempAniScale.z = keyscl[2] * l2 + key2scl[2] * l;
				Virtulous.KeyFrame.tempAniQuat.set( keyrot.x, keyrot.y, keyrot.z, keyrot.w );
				Virtulous.KeyFrame.tempAniQuat.slerp( key2rot, l );
				return Virtulous.KeyFrame.tempAniMatrix.compose( Virtulous.KeyFrame.tempAniPos, Virtulous.KeyFrame.tempAniQuat, Virtulous.KeyFrame.tempAniScale );

			};

		};

		Virtulous.KeyFrame.tempAniPos = new THREE.Vector3();
		Virtulous.KeyFrame.tempAniQuat = new THREE.Quaternion();
		Virtulous.KeyFrame.tempAniScale = new THREE.Vector3( 1, 1, 1 );
		Virtulous.KeyFrame.tempAniMatrix = new THREE.Matrix4();
		Virtulous.KeyFrameTrack = function () {

			this.keys = [];
			this.target = null;
			this.time = 0;
			this.length = 0;
			this._accelTable = {};
			this.fps = 20;
			this.addKey = function ( key ) {

				this.keys.push( key );

			};
			this.init = function () {

				this.sortKeys();

				if ( this.keys.length > 0 )
					this.length = this.keys[ this.keys.length - 1 ].time;
				else
					this.length = 0;

				if ( ! this.fps ) return;

				for ( var j = 0; j < this.length * this.fps; j ++ ) {

					for ( var i = 0; i < this.keys.length; i ++ ) {

						if ( this.keys[ i ].time == j ) {

							this._accelTable[ j ] = i;
							break;

						} else if ( this.keys[ i ].time < j / this.fps && this.keys[ i + 1 ] && this.keys[ i + 1 ].time >= j / this.fps ) {

							this._accelTable[ j ] = i;
							break;

						}

					}

				}

			};

			this.parseFromThree = function ( data ) {

				var fps = data.fps;
				this.target = data.node;
				var track = data.hierarchy[ 0 ].keys;
				for ( var i = 0; i < track.length; i ++ ) {

					this.addKey( new Virtulous.KeyFrame( i / fps || track[ i ].time, track[ i ].targets[ 0 ].data ) );

				}
				this.init();

			};

			this.parseFromCollada = function ( data ) {

				var track = data.keys;
				var fps = this.fps;

				for ( var i = 0; i < track.length; i ++ ) {

					this.addKey( new Virtulous.KeyFrame( i / fps || track[ i ].time, track[ i ].matrix ) );

				}

				this.init();

			};

			this.sortKeys = function () {

				this.keys.sort( this.keySortFunc );

			};

			this.keySortFunc = function ( a, b ) {

				return a.time - b.time;

			};

			this.clone = function () {

				var t = new Virtulous.KeyFrameTrack();
				t.target = this.target;
				t.time = this.time;
				t.length = this.length;

				for ( var i = 0; i < this.keys.length; i ++ ) {

					t.addKey( this.keys[ i ].clone() );

				}

				t.init();
				return t;

			};

			this.reTarget = function ( root, compareitor ) {

				if ( ! compareitor ) compareitor = Virtulous.TrackTargetNodeNameCompare;
				this.target = compareitor( root, this.target );

			};

			this.keySearchAccel = function ( time ) {

				time *= this.fps;
				time = Math.floor( time );
				return this._accelTable[ time ] || 0;

			};

			this.setTime = function ( time ) {

				time = Math.abs( time );
				if ( this.length )
					time = time % this.length + .05;
				var key0 = null;
				var key1 = null;

				for ( var i = this.keySearchAccel( time ); i < this.keys.length; i ++ ) {

					if ( this.keys[ i ].time == time ) {

						key0 = this.keys[ i ];
						key1 = this.keys[ i ];
						break;

					} else if ( this.keys[ i ].time < time && this.keys[ i + 1 ] && this.keys[ i + 1 ].time > time ) {

						key0 = this.keys[ i ];
						key1 = this.keys[ i + 1 ];
						break;

					} else if ( this.keys[ i ].time < time && i == this.keys.length - 1 ) {

						key0 = this.keys[ i ];
						key1 = this.keys[ 0 ].clone();
						key1.time += this.length + .05;
						break;

					}

				}

				if ( key0 && key1 && key0 !== key1 ) {

					this.target.matrixAutoUpdate = false;
					this.target.matrix.copy( key0.lerp( key1, time ) );
					this.target.matrixWorldNeedsUpdate = true;
					return;

				}

				if ( key0 && key1 && key0 == key1 ) {

					this.target.matrixAutoUpdate = false;
					this.target.matrix.copy( key0.matrix );
					this.target.matrixWorldNeedsUpdate = true;
					return;

				}

			};

		};

		Virtulous.TrackTargetNodeNameCompare = function ( root, target ) {

			function find( node, name ) {

				if ( node.name == name )
					return node;

				for ( var i = 0; i < node.children.length; i ++ ) {

					var r = find( node.children[ i ], name );
					if ( r ) return r;

				}

				return null;

			}

			return find( root, target.name );

		};

		Virtulous.Animation = function () {

			this.tracks = [];
			this.length = 0;

			this.addTrack = function ( track ) {

				this.tracks.push( track );
				this.length = Math.max( track.length, this.length );

			};

			this.setTime = function ( time ) {

				this.time = time;

				for ( var i = 0; i < this.tracks.length; i ++ )
					this.tracks[ i ].setTime( time );

			};

			this.clone = function ( target, compareitor ) {

				if ( ! compareitor ) compareitor = Virtulous.TrackTargetNodeNameCompare;
				var n = new Virtulous.Animation();
				n.target = target;
				for ( var i = 0; i < this.tracks.length; i ++ ) {

					var track = this.tracks[ i ].clone();
					track.reTarget( target, compareitor );
					n.addTrack( track );

				}

				return n;

			};

		};

		var ASSBIN_CHUNK_AICAMERA = 0x1234;
		var ASSBIN_CHUNK_AILIGHT = 0x1235;
		var ASSBIN_CHUNK_AITEXTURE = 0x1236;
		var ASSBIN_CHUNK_AIMESH = 0x1237;
		var ASSBIN_CHUNK_AINODEANIM = 0x1238;
		var ASSBIN_CHUNK_AISCENE = 0x1239;
		var ASSBIN_CHUNK_AIBONE = 0x123a;
		var ASSBIN_CHUNK_AIANIMATION = 0x123b;
		var ASSBIN_CHUNK_AINODE = 0x123c;
		var ASSBIN_CHUNK_AIMATERIAL = 0x123d;
		var ASSBIN_CHUNK_AIMATERIALPROPERTY = 0x123e;
		var ASSBIN_MESH_HAS_POSITIONS = 0x1;
		var ASSBIN_MESH_HAS_NORMALS = 0x2;
		var ASSBIN_MESH_HAS_TANGENTS_AND_BITANGENTS = 0x4;
		var ASSBIN_MESH_HAS_TEXCOORD_BASE = 0x100;
		var ASSBIN_MESH_HAS_COLOR_BASE = 0x10000;
		var AI_MAX_NUMBER_OF_COLOR_SETS = 1;
		var AI_MAX_NUMBER_OF_TEXTURECOORDS = 4;
		var aiLightSource_UNDEFINED = 0x0;
		//! A directional light source has a well-defined direction
		//! but is infinitely far away. That's quite a good
		//! approximation for sun light.
		var aiLightSource_DIRECTIONAL = 0x1;
		//! A point light source has a well-defined position
		//! in space but no direction - it emits light in all
		//! directions. A normal bulb is a point light.
		var aiLightSource_POINT = 0x2;
		//! A spot light source emits light in a specific
		//! angle. It has a position and a direction it is pointing to.
		//! A good example for a spot light is a light spot in
		//! sport arenas.
		var aiLightSource_SPOT = 0x3;
		//! The generic light level of the world, including the bounces
		//! of all other lightsources.
		//! Typically, there's at most one ambient light in a scene.
		//! This light type doesn't have a valid position, direction, or
		//! other properties, just a color.
		var aiLightSource_AMBIENT = 0x4;
		/** Flat shading. Shading is done on per-face base,
		 *  diffuse only. Also known as 'faceted shading'.
		 */
		var aiShadingMode_Flat = 0x1;
		/** Simple Gouraud shading.
		 */
		var aiShadingMode_Gouraud = 0x2;
		/** Phong-Shading -
		 */
		var aiShadingMode_Phong = 0x3;
		/** Phong-Blinn-Shading
		 */
		var aiShadingMode_Blinn = 0x4;
		/** Toon-Shading per pixel
		 *
		 *  Also known as 'comic' shader.
		 */
		var aiShadingMode_Toon = 0x5;
		/** OrenNayar-Shading per pixel
		 *
		 *  Extension to standard Lambertian shading, taking the
		 *  roughness of the material into account
		 */
		var aiShadingMode_OrenNayar = 0x6;
		/** Minnaert-Shading per pixel
		 *
		 *  Extension to standard Lambertian shading, taking the
		 *  "darkness" of the material into account
		 */
		var aiShadingMode_Minnaert = 0x7;
		/** CookTorrance-Shading per pixel
		 *
		 *  Special shader for metallic surfaces.
		 */
		var aiShadingMode_CookTorrance = 0x8;
		/** No shading at all. Constant light influence of 1.0.
		 */
		var aiShadingMode_NoShading = 0x9;
		/** Fresnel shading
		 */
		var aiShadingMode_Fresnel = 0xa;
		var aiTextureType_NONE = 0x0;
		/** The texture is combined with the result of the diffuse
		 *  lighting equation.
		 */
		var aiTextureType_DIFFUSE = 0x1;
		/** The texture is combined with the result of the specular
		 *  lighting equation.
		 */
		var aiTextureType_SPECULAR = 0x2;
		/** The texture is combined with the result of the ambient
		 *  lighting equation.
		 */
		var aiTextureType_AMBIENT = 0x3;
		/** The texture is added to the result of the lighting
		 *  calculation. It isn't influenced by incoming light.
		 */
		var aiTextureType_EMISSIVE = 0x4;
		/** The texture is a height map.
		 *
		 *  By convention, higher gray-scale values stand for
		 *  higher elevations from the base height.
		 */
		var aiTextureType_HEIGHT = 0x5;
		/** The texture is a (tangent space) normal-map.
		 *
		 *  Again, there are several conventions for tangent-space
		 *  normal maps. Assimp does (intentionally) not
		 *  distinguish here.
		 */
		var aiTextureType_NORMALS = 0x6;
		/** The texture defines the glossiness of the material.
		 *
		 *  The glossiness is in fact the exponent of the specular
		 *  (phong) lighting equation. Usually there is a conversion
		 *  function defined to map the linear color values in the
		 *  texture to a suitable exponent. Have fun.
		 */
		var aiTextureType_SHININESS = 0x7;
		/** The texture defines per-pixel opacity.
		 *
		 *  Usually 'white' means opaque and 'black' means
		 *  'transparency'. Or quite the opposite. Have fun.
		 */
		var aiTextureType_OPACITY = 0x8;
		/** Displacement texture
		 *
		 *  The exact purpose and format is application-dependent.
		 *  Higher color values stand for higher vertex displacements.
		 */
		var aiTextureType_DISPLACEMENT = 0x9;
		/** Lightmap texture (aka Ambient Occlusion)
		 *
		 *  Both 'Lightmaps' and dedicated 'ambient occlusion maps' are
		 *  covered by this material property. The texture contains a
		 *  scaling value for the final color value of a pixel. Its
		 *  intensity is not affected by incoming light.
		 */
		var aiTextureType_LIGHTMAP = 0xA;
		/** Reflection texture
		 *
		 * Contains the color of a perfect mirror reflection.
		 * Rarely used, almost never for real-time applications.
		 */
		var aiTextureType_REFLECTION = 0xB;
		/** Unknown texture
		 *
		 *  A texture reference that does not match any of the definitions
		 *  above is considered to be 'unknown'. It is still imported,
		 *  but is excluded from any further postprocessing.
		 */
		var aiTextureType_UNKNOWN = 0xC;
		var BONESPERVERT = 4;

		function ASSBIN_MESH_HAS_TEXCOORD( n ) {

			return ASSBIN_MESH_HAS_TEXCOORD_BASE << n;

		}

		function ASSBIN_MESH_HAS_COLOR( n ) {

			return ASSBIN_MESH_HAS_COLOR_BASE << n;

		}

		function markBones( scene ) {

			for ( var i in scene.mMeshes ) {

				var mesh = scene.mMeshes[ i ];
				for ( var k in mesh.mBones ) {

					var boneNode = scene.findNode( mesh.mBones[ k ].mName );
					if ( boneNode )
						boneNode.isBone = true;

				}

			}

		}
		function cloneTreeToBones( root, scene ) {

			var rootBone = new THREE.Bone();
			rootBone.matrix.copy( root.matrix );
			rootBone.matrixWorld.copy( root.matrixWorld );
			rootBone.position.copy( root.position );
			rootBone.quaternion.copy( root.quaternion );
			rootBone.scale.copy( root.scale );
			scene.nodeCount ++;
			rootBone.name = "bone_" + root.name + scene.nodeCount.toString();

			if ( ! scene.nodeToBoneMap[ root.name ] )
				scene.nodeToBoneMap[ root.name ] = [];
			scene.nodeToBoneMap[ root.name ].push( rootBone );
			for ( var i in root.children ) {

				var child = cloneTreeToBones( root.children[ i ], scene );
				if ( child )
					rootBone.add( child );

			}

			return rootBone;

		}

		function sortWeights( indexes, weights ) {

			var pairs = [];

			for ( var i = 0; i < indexes.length; i ++ ) {

				pairs.push( {
					i: indexes[ i ],
					w: weights[ i ]
				} );

			}

			pairs.sort( function ( a, b ) {

				return b.w - a.w;

			 } );

			while ( pairs.length < 4 ) {

				pairs.push( {
					i: 0,
					w: 0
				} );

			}

			if ( pairs.length > 4 )
				pairs.length = 4;
			var sum = 0;

			for ( var i = 0; i < 4; i ++ ) {

				sum += pairs[ i ].w * pairs[ i ].w;

			}

			sum = Math.sqrt( sum );

			for ( var i = 0; i < 4; i ++ ) {

				pairs[ i ].w = pairs[ i ].w / sum;
				indexes[ i ] = pairs[ i ].i;
				weights[ i ] = pairs[ i ].w;

			}

		}

		function findMatchingBone( root, name ) {

			if ( root.name.indexOf( "bone_" + name ) == 0 )
				return root;

			for ( var i in root.children ) {

				var ret = findMatchingBone( root.children[ i ], name );

				if ( ret )
					return ret;

			}

			return undefined;

		}

		function aiMesh() {

			this.mPrimitiveTypes = 0;
			this.mNumVertices = 0;
			this.mNumFaces = 0;
			this.mNumBones = 0;
			this.mMaterialIndex = 0;
			this.mVertices = [];
			this.mNormals = [];
			this.mTangents = [];
			this.mBitangents = [];
			this.mColors = [
				[]
			];
			this.mTextureCoords = [
				[]
			];
			this.mFaces = [];
			this.mBones = [];
			this.hookupSkeletons = function ( scene, threeScene ) {

				if ( this.mBones.length == 0 ) return;

				var allBones = [];
				var offsetMatrix = [];
				var skeletonRoot = scene.findNode( this.mBones[ 0 ].mName );

				while ( skeletonRoot.mParent && skeletonRoot.mParent.isBone ) {

					skeletonRoot = skeletonRoot.mParent;

				}

				var threeSkeletonRoot = skeletonRoot.toTHREE( scene );
				var threeSkeletonRootBone = cloneTreeToBones( threeSkeletonRoot, scene );
				this.threeNode.add( threeSkeletonRootBone );

				for ( var i = 0; i < this.mBones.length; i ++ ) {

					var bone = findMatchingBone( threeSkeletonRootBone, this.mBones[ i ].mName );

					if ( bone ) {

						var tbone = bone;
						allBones.push( tbone );
						//tbone.matrixAutoUpdate = false;
						offsetMatrix.push( this.mBones[ i ].mOffsetMatrix.toTHREE() );

					} else {

						var skeletonRoot = scene.findNode( this.mBones[ i ].mName );
						if ( ! skeletonRoot ) return;
						var threeSkeletonRoot = skeletonRoot.toTHREE( scene );
						var threeSkeletonRootParent = threeSkeletonRoot.parent;
						var threeSkeletonRootBone = cloneTreeToBones( threeSkeletonRoot, scene );
						this.threeNode.add( threeSkeletonRootBone );
						var bone = findMatchingBone( threeSkeletonRootBone, this.mBones[ i ].mName );
						var tbone = bone;
						allBones.push( tbone );
						//tbone.matrixAutoUpdate = false;
						offsetMatrix.push( this.mBones[ i ].mOffsetMatrix.toTHREE() );

					}

				}
				var skeleton = new THREE.Skeleton( allBones, offsetMatrix );

				this.threeNode.bind( skeleton, new THREE.Matrix4() );
				this.threeNode.material.skinning = true;

			};

			this.toTHREE = function ( scene ) {

				if ( this.threeNode ) return this.threeNode;
				var geometry = new THREE.BufferGeometry();
				var mat;
				if ( scene.mMaterials[ this.mMaterialIndex ] )
					mat = scene.mMaterials[ this.mMaterialIndex ].toTHREE( scene );
				else
					mat = new THREE.MeshLambertMaterial();
				geometry.setIndex( new THREE.BufferAttribute( new Uint32Array( this.mIndexArray ), 1 ) );
				geometry.addAttribute( 'position', new THREE.BufferAttribute( this.mVertexBuffer, 3 ) );
				if ( this.mNormalBuffer && this.mNormalBuffer.length > 0 )
					geometry.addAttribute( 'normal', new THREE.BufferAttribute( this.mNormalBuffer, 3 ) );
				if ( this.mColorBuffer && this.mColorBuffer.length > 0 )
					geometry.addAttribute( 'color', new THREE.BufferAttribute( this.mColorBuffer, 4 ) );
				if ( this.mTexCoordsBuffers[ 0 ] && this.mTexCoordsBuffers[ 0 ].length > 0 )
					geometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( this.mTexCoordsBuffers[ 0 ] ), 2 ) );
				if ( this.mTexCoordsBuffers[ 1 ] && this.mTexCoordsBuffers[ 1 ].length > 0 )
					geometry.addAttribute( 'uv1', new THREE.BufferAttribute( new Float32Array( this.mTexCoordsBuffers[ 1 ] ), 2 ) );
				if ( this.mTangentBuffer && this.mTangentBuffer.length > 0 )
					geometry.addAttribute( 'tangents', new THREE.BufferAttribute( this.mTangentBuffer, 3 ) );
				if ( this.mBitangentBuffer && this.mBitangentBuffer.length > 0 )
					geometry.addAttribute( 'bitangents', new THREE.BufferAttribute( this.mBitangentBuffer, 3 ) );
				if ( this.mBones.length > 0 ) {

					var weights = [];
					var bones = [];

					for ( var i = 0; i < this.mBones.length; i ++ ) {

						for ( var j = 0; j < this.mBones[ i ].mWeights.length; j ++ ) {

							var weight = this.mBones[ i ].mWeights[ j ];
							if ( weight ) {

								if ( ! weights[ weight.mVertexId ] ) weights[ weight.mVertexId ] = [];
								if ( ! bones[ weight.mVertexId ] ) bones[ weight.mVertexId ] = [];
								weights[ weight.mVertexId ].push( weight.mWeight );
								bones[ weight.mVertexId ].push( parseInt( i ) );

							}

						}

					}

					for ( var i in bones ) {

						sortWeights( bones[ i ], weights[ i ] );

					}

					var _weights = [];
					var _bones = [];

					for ( var i = 0; i < weights.length; i ++ ) {

						for ( var j = 0; j < 4; j ++ ) {

							if ( weights[ i ] && bones[ i ] ) {

								_weights.push( weights[ i ][ j ] );
								_bones.push( bones[ i ][ j ] );

							} else {

								_weights.push( 0 );
								_bones.push( 0 );

							}

						}

					}

					geometry.addAttribute( 'skinWeight', new THREE.BufferAttribute( new Float32Array( _weights ), BONESPERVERT ) );
					geometry.addAttribute( 'skinIndex', new THREE.BufferAttribute( new Float32Array( _bones ), BONESPERVERT ) );

				}

				var mesh;

				if ( this.mBones.length == 0 )
					mesh = new THREE.Mesh( geometry, mat );

				if ( this.mBones.length > 0 ) {

					mesh = new THREE.SkinnedMesh( geometry, mat );
					mesh.normalizeSkinWeights();

				}

				this.threeNode = mesh;
				//mesh.matrixAutoUpdate = false;
				return mesh;

			};

		}

		function aiFace() {

			this.mNumIndices = 0;
			this.mIndices = [];

		}

		function aiVector3D() {

			this.x = 0;
			this.y = 0;
			this.z = 0;

			this.toTHREE = function () {

				return new THREE.Vector3( this.x, this.y, this.z );

			};

		}

		function aiVector2D() {

			this.x = 0;
			this.y = 0;
			this.toTHREE = function () {

				return new THREE.Vector2( this.x, this.y );

			};

		}

		function aiVector4D() {

			this.w = 0;
			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.toTHREE = function () {

				return new THREE.Vector4( this.w, this.x, this.y, this.z );

			};

		}

		function aiColor4D() {

			this.r = 0;
			this.g = 0;
			this.b = 0;
			this.a = 0;
			this.toTHREE = function () {

				return new THREE.Color( this.r, this.g, this.b, this.a );

			};

		}

		function aiColor3D() {

			this.r = 0;
			this.g = 0;
			this.b = 0;
			this.a = 0;
			this.toTHREE = function () {

				return new THREE.Color( this.r, this.g, this.b, 1 );

			};

		}

		function aiQuaternion() {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 0;
			this.toTHREE = function () {

				return new THREE.Quaternion( this.x, this.y, this.z, this.w );

			};

		}

		function aiVertexWeight() {

			this.mVertexId = 0;
			this.mWeight = 0;

		}

		function aiString() {

			this.data = [];
			this.toString = function () {

				var str = '';
				this.data.forEach( function ( i ) {

					str += ( String.fromCharCode( i ) );

				} );
				return str.replace( /[^\x20-\x7E]+/g, '' );

			};

		}

		function aiVectorKey() {

			this.mTime = 0;
			this.mValue = null;

		}

		function aiQuatKey() {

			this.mTime = 0;
			this.mValue = null;

		}

		function aiNode() {

			this.mName = '';
			this.mTransformation = [];
			this.mNumChildren = 0;
			this.mNumMeshes = 0;
			this.mMeshes = [];
			this.mChildren = [];
			this.toTHREE = function ( scene ) {

				if ( this.threeNode ) return this.threeNode;
				var o = new THREE.Object3D();
				o.name = this.mName;
				o.matrix = this.mTransformation.toTHREE();

				for ( var i = 0; i < this.mChildren.length; i ++ ) {

					o.add( this.mChildren[ i ].toTHREE( scene ) );

				}

				for ( var i = 0; i < this.mMeshes.length; i ++ ) {

					o.add( scene.mMeshes[ this.mMeshes[ i ] ].toTHREE( scene ) );

				}

				this.threeNode = o;
				//o.matrixAutoUpdate = false;
				o.matrix.decompose( o.position, o.quaternion, o.scale );
				return o;

			};

		}

		function aiBone() {

			this.mName = '';
			this.mNumWeights = 0;
			this.mOffsetMatrix = 0;

		}

		function aiMaterialProperty() {

			this.mKey = "";
			this.mSemantic = 0;
			this.mIndex = 0;
			this.mData = [];
			this.mDataLength = 0;
			this.mType = 0;
			this.dataAsColor = function () {

				var array = ( new Uint8Array( this.mData ) ).buffer;
				var reader = new DataView( array );
				var r = reader.getFloat32( 0, true );
				var g = reader.getFloat32( 4, true );
				var b = reader.getFloat32( 8, true );
				//var a = reader.getFloat32(12, true);
				return new THREE.Color( r, g, b );

			};

			this.dataAsFloat = function () {

				var array = ( new Uint8Array( this.mData ) ).buffer;
				var reader = new DataView( array );
				var r = reader.getFloat32( 0, true );
				return r;

			};

			this.dataAsBool = function () {

				var array = ( new Uint8Array( this.mData ) ).buffer;
				var reader = new DataView( array );
				var r = reader.getFloat32( 0, true );
				return !! r;

			};

			this.dataAsString = function () {

				var s = new aiString();
				s.data = this.mData;
				return s.toString();

			};

			this.dataAsMap = function () {

				var s = new aiString();
				s.data = this.mData;
				var path = s.toString();
				path = path.replace( /\\/g, '/' );

				if ( path.indexOf( '/' ) != - 1 ) {

					path = path.substr( path.lastIndexOf( '/' ) + 1 );

				}

				return textureLoader.load( path );

			};

		}
		var namePropMapping = {

			"?mat.name": "name",
			"$mat.shadingm": "shading",
			"$mat.twosided": "twoSided",
			"$mat.wireframe": "wireframe",
			"$clr.ambient": "ambient",
			"$clr.diffuse": "color",
			"$clr.specular": "specular",
			"$clr.emissive": "emissive",
			"$clr.transparent": "transparent",
			"$clr.reflective": "reflect",
			"$mat.shininess": "shininess",
			"$mat.reflectivity": "reflectivity",
			"$mat.refracti": "refraction",
			"$tex.file": "map"

		};

		var nameTypeMapping = {

			"?mat.name": "string",
			"$mat.shadingm": "bool",
			"$mat.twosided": "bool",
			"$mat.wireframe": "bool",
			"$clr.ambient": "color",
			"$clr.diffuse": "color",
			"$clr.specular": "color",
			"$clr.emissive": "color",
			"$clr.transparent": "color",
			"$clr.reflective": "color",
			"$mat.shininess": "float",
			"$mat.reflectivity": "float",
			"$mat.refracti": "float",
			"$tex.file": "map"

		};

		function aiMaterial() {

			this.mNumAllocated = 0;
			this.mNumProperties = 0;
			this.mProperties = [];
			this.toTHREE = function ( scene ) {

				var name = this.mProperties[ 0 ].dataAsString();
				var mat = new THREE.MeshPhongMaterial();

				for ( var i = 0; i < this.mProperties.length; i ++ ) {

					if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'float' )
						mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsFloat();
					if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'color' )
						mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsColor();
					if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'bool' )
						mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsBool();
					if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'string' )
						mat[ namePropMapping[ this.mProperties[ i ].mKey ] ] = this.mProperties[ i ].dataAsString();
					if ( nameTypeMapping[ this.mProperties[ i ].mKey ] == 'map' ) {

						var prop = this.mProperties[ i ];
						if ( prop.mSemantic == aiTextureType_DIFFUSE )
							mat.map = this.mProperties[ i ].dataAsMap();
						if ( prop.mSemantic == aiTextureType_NORMALS )
							mat.normalMap = this.mProperties[ i ].dataAsMap();
						if ( prop.mSemantic == aiTextureType_LIGHTMAP )
							mat.lightMap = this.mProperties[ i ].dataAsMap();
						if ( prop.mSemantic == aiTextureType_OPACITY )
							mat.alphaMap = this.mProperties[ i ].dataAsMap();

					}

				}

				mat.ambient.r = .53;
				mat.ambient.g = .53;
				mat.ambient.b = .53;
				mat.color.r = 1;
				mat.color.g = 1;
				mat.color.b = 1;
				return mat;

			};

		}


		function veclerp( v1, v2, l ) {

			var v = new THREE.Vector3();
			var lm1 = 1 - l;
			v.x = v1.x * l + v2.x * lm1;
			v.y = v1.y * l + v2.y * lm1;
			v.z = v1.z * l + v2.z * lm1;
			return v;

		}

		function quatlerp( q1, q2, l ) {

			return q1.clone().slerp( q2, 1 - l );

		}

		function sampleTrack( keys, time, lne, lerp ) {

			if ( keys.length == 1 ) return keys[ 0 ].mValue.toTHREE();

			var dist = Infinity;
			var key = null;
			var nextKey = null;

			for ( var i = 0; i < keys.length; i ++ ) {

				var timeDist = Math.abs( keys[ i ].mTime - time );

				if ( timeDist < dist && keys[ i ].mTime <= time ) {

					dist = timeDist;
					key = keys[ i ];
					nextKey = keys[ i + 1 ];

				}

			}

			if ( ! key ) {

				return null;

			} else if ( nextKey ) {

				var dT = nextKey.mTime - key.mTime;
				var T = key.mTime - time;
				var l = T / dT;

				return lerp( key.mValue.toTHREE(), nextKey.mValue.toTHREE(), l );

			} else {

				nextKey = keys[ 0 ].clone();
				nextKey.mTime += lne;

				var dT = nextKey.mTime - key.mTime;
				var T = key.mTime - time;
				var l = T / dT;

				return lerp( key.mValue.toTHREE(), nextKey.mValue.toTHREE(), l );

			}

		}

		function aiNodeAnim() {

			this.mNodeName = "";
			this.mNumPositionKeys = 0;
			this.mNumRotationKeys = 0;
			this.mNumScalingKeys = 0;
			this.mPositionKeys = [];
			this.mRotationKeys = [];
			this.mScalingKeys = [];
			this.mPreState = "";
			this.mPostState = "";
			this.init = function ( tps ) {

				if ( ! tps ) tps = 1;

				function t( t ) {

					t.mTime /= tps;

				}

				this.mPositionKeys.forEach( t );
				this.mRotationKeys.forEach( t );
				this.mScalingKeys.forEach( t );

			};

			this.sortKeys = function () {

				function comp( a, b ) {

					return a.mTime - b.mTime;

				}

				this.mPositionKeys.sort( comp );
				this.mRotationKeys.sort( comp );
				this.mScalingKeys.sort( comp );

			};

			this.getLength = function () {

				return Math.max(
					Math.max.apply( null, this.mPositionKeys.map( function ( a ) {

						return a.mTime;

					} ) ),
					Math.max.apply( null, this.mRotationKeys.map( function ( a ) {

						return a.mTime;

					} ) ),
					Math.max.apply( null, this.mScalingKeys.map( function ( a ) {

						return a.mTime;

				 } ) )
				);

			};

			this.toTHREE = function ( o, tps ) {

				this.sortKeys();
				var length = this.getLength();
				var track = new Virtulous.KeyFrameTrack();

				for ( var i = 0; i < length; i += .05 ) {

					var matrix = new THREE.Matrix4();
					var time = i;
					var pos = sampleTrack( this.mPositionKeys, time, length, veclerp );
					var scale = sampleTrack( this.mScalingKeys, time, length, veclerp );
					var rotation = sampleTrack( this.mRotationKeys, time, length, quatlerp );
					matrix.compose( pos, rotation, scale );

					var key = new Virtulous.KeyFrame( time, matrix );
					track.addKey( key );

				}

				track.target = o.findNode( this.mNodeName ).toTHREE();

				var tracks = [ track ];

				if ( o.nodeToBoneMap[ this.mNodeName ] ) {

					for ( var i = 0; i < o.nodeToBoneMap[ this.mNodeName ].length; i ++ ) {

						var t2 = track.clone();
						t2.target = o.nodeToBoneMap[ this.mNodeName ][ i ];
						tracks.push( t2 );

					}

				}

				return tracks;

			};

		}

		function aiAnimation() {

			this.mName = "";
			this.mDuration = 0;
			this.mTicksPerSecond = 0;
			this.mNumChannels = 0;
			this.mChannels = [];
			this.toTHREE = function ( root ) {

				var animationHandle = new Virtulous.Animation();

				for ( var i in this.mChannels ) {

					this.mChannels[ i ].init( this.mTicksPerSecond );

					var tracks = this.mChannels[ i ].toTHREE( root );

					for ( var j in tracks ) {

						tracks[ j ].init();
						animationHandle.addTrack( tracks[ j ] );

					}

				}

				animationHandle.length = Math.max.apply( null, animationHandle.tracks.map( function ( e ) {

					return e.length;

				} ) );
				return animationHandle;

			};

		}

		function aiTexture() {

			this.mWidth = 0;
			this.mHeight = 0;
			this.texAchFormatHint = [];
			this.pcData = [];

		}

		function aiLight() {

			this.mName = '';
			this.mType = 0;
			this.mAttenuationConstant = 0;
			this.mAttenuationLinear = 0;
			this.mAttenuationQuadratic = 0;
			this.mAngleInnerCone = 0;
			this.mAngleOuterCone = 0;
			this.mColorDiffuse = null;
			this.mColorSpecular = null;
			this.mColorAmbient = null;

		}

		function aiCamera() {

			this.mName = '';
			this.mPosition = null;
			this.mLookAt = null;
			this.mUp = null;
			this.mHorizontalFOV = 0;
			this.mClipPlaneNear = 0;
			this.mClipPlaneFar = 0;
			this.mAspect = 0;

		}

		function aiScene() {

			this.mFlags = 0;
			this.mNumMeshes = 0;
			this.mNumMaterials = 0;
			this.mNumAnimations = 0;
			this.mNumTextures = 0;
			this.mNumLights = 0;
			this.mNumCameras = 0;
			this.mRootNode = null;
			this.mMeshes = [];
			this.mMaterials = [];
			this.mAnimations = [];
			this.mLights = [];
			this.mCameras = [];
			this.nodeToBoneMap = {};
			this.findNode = function ( name, root ) {

				if ( ! root ) {

					root = this.mRootNode;

				}

				if ( root.mName == name ) {

					return root;

				}

				for ( var i = 0; i < root.mChildren.length; i ++ ) {

					var ret = this.findNode( name, root.mChildren[ i ] );
					if ( ret ) return ret;

				}

				return null;

			};

			this.toTHREE = function () {

				this.nodeCount = 0;

				markBones( this );

				var o = this.mRootNode.toTHREE( this );

				for ( var i in this.mMeshes )
					this.mMeshes[ i ].hookupSkeletons( this, o );

				if ( this.mAnimations.length > 0 ) {

					var a = this.mAnimations[ 0 ].toTHREE( this );

				}

				return { object: o, animation: a };

			};

		}

		function aiMatrix4() {

			this.elements = [
				[],
				[],
				[],
				[]
			];
			this.toTHREE = function () {

				var m = new THREE.Matrix4();

				for ( var i = 0; i < 4; ++ i ) {

					for ( var i2 = 0; i2 < 4; ++ i2 ) {

						m.elements[ i * 4 + i2 ] = this.elements[ i2 ][ i ];

					}

				}

				return m;

			};

		}

		var littleEndian = true;

		function readFloat( dataview ) {

			var val = dataview.getFloat32( dataview.readOffset, littleEndian );
			dataview.readOffset += 4;
			return val;

		}

		function Read_double( dataview ) {

			var val = dataview.getFloat64( dataview.readOffset, littleEndian );
			dataview.readOffset += 8;
			return val;

		}

		function Read_uint8_t( dataview ) {

			var val = dataview.getUint8( dataview.readOffset );
			dataview.readOffset += 1;
			return val;

		}

		function Read_uint16_t( dataview ) {

			var val = dataview.getUint16( dataview.readOffset, littleEndian );
			dataview.readOffset += 2;
			return val;

		}

		function Read_unsigned_int( dataview ) {

			var val = dataview.getUint32( dataview.readOffset, littleEndian );
			dataview.readOffset += 4;
			return val;

		}

		function Read_uint32_t( dataview ) {

			var val = dataview.getUint32( dataview.readOffset, littleEndian );
			dataview.readOffset += 4;
			return val;

		}

		function Read_aiVector3D( stream ) {

			var v = new aiVector3D();
			v.x = readFloat( stream );
			v.y = readFloat( stream );
			v.z = readFloat( stream );
			return v;

		}

		function Read_aiVector2D( stream ) {

			var v = new aiVector2D();
			v.x = readFloat( stream );
			v.y = readFloat( stream );
			return v;

		}

		function Read_aiVector4D( stream ) {

			var v = new aiVector4D();
			v.w = readFloat( stream );
			v.x = readFloat( stream );
			v.y = readFloat( stream );
			v.z = readFloat( stream );
			return v;

		}

		function Read_aiColor3D( stream ) {

			var c = new aiColor3D();
			c.r = readFloat( stream );
			c.g = readFloat( stream );
			c.b = readFloat( stream );
			return c;

		}

		function Read_aiColor4D( stream ) {

			var c = new aiColor4D();
			c.r = readFloat( stream );
			c.g = readFloat( stream );
			c.b = readFloat( stream );
			c.a = readFloat( stream );
			return c;

		}

		function Read_aiQuaternion( stream ) {

			var v = new aiQuaternion();
			v.w = readFloat( stream );
			v.x = readFloat( stream );
			v.y = readFloat( stream );
			v.z = readFloat( stream );
			return v;

		}

		function Read_aiString( stream ) {

			var s = new aiString();
			var stringlengthbytes = Read_unsigned_int( stream );
			stream.ReadBytes( s.data, 1, stringlengthbytes );
			return s.toString();

		}

		function Read_aiVertexWeight( stream ) {

			var w = new aiVertexWeight();
			w.mVertexId = Read_unsigned_int( stream );
			w.mWeight = readFloat( stream );
			return w;

		}

		function Read_aiMatrix4x4( stream ) {

			var m = new aiMatrix4();

			for ( var i = 0; i < 4; ++ i ) {

				for ( var i2 = 0; i2 < 4; ++ i2 ) {

					m.elements[ i ][ i2 ] = readFloat( stream );

				}

			}

			return m;

		}

		function Read_aiVectorKey( stream ) {

			var v = new aiVectorKey();
			v.mTime = Read_double( stream );
			v.mValue = Read_aiVector3D( stream );
			return v;

		}

		function Read_aiQuatKey( stream ) {

			var v = new aiQuatKey();
			v.mTime = Read_double( stream );
			v.mValue = Read_aiQuaternion( stream );
			return v;

		}

		function ReadArray( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read( stream );

		}

		function ReadArray_aiVector2D( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVector2D( stream );

		}

		function ReadArray_aiVector3D( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVector3D( stream );

		}

		function ReadArray_aiVector4D( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVector4D( stream );

		}

		function ReadArray_aiVertexWeight( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVertexWeight( stream );

		}

		function ReadArray_aiColor4D( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiColor4D( stream );

		}

		function ReadArray_aiVectorKey( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiVectorKey( stream );

		}

		function ReadArray_aiQuatKey( stream, data, size ) {

			for ( var i = 0; i < size; i ++ ) data[ i ] = Read_aiQuatKey( stream );

		}

		function ReadBounds( stream, T /*p*/, n ) {

			// not sure what to do here, the data isn't really useful.
			return stream.Seek( sizeof( T ) * n, aiOrigin_CUR );

		}

		function ai_assert( bool ) {

			if ( ! bool )
				throw ( "asset failed" );

		}

		function ReadBinaryNode( stream, parent, depth ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AINODE );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			var node = new aiNode();
			node.mParent = parent;
			node.mDepth = depth;
			node.mName = Read_aiString( stream );
			node.mTransformation = Read_aiMatrix4x4( stream );
			node.mNumChildren = Read_unsigned_int( stream );
			node.mNumMeshes = Read_unsigned_int( stream );

			if ( node.mNumMeshes ) {

				node.mMeshes = [];

				for ( var i = 0; i < node.mNumMeshes; ++ i ) {

					node.mMeshes[ i ] = Read_unsigned_int( stream );

				}

			}

			if ( node.mNumChildren ) {

				node.mChildren = [];

				for ( var i = 0; i < node.mNumChildren; ++ i ) {

					var node2 = ReadBinaryNode( stream, node, depth ++ );
					node.mChildren[ i ] = node2;

				}

			}

			return node;

		}

		// -----------------------------------------------------------------------------------

		function ReadBinaryBone( stream, b ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AIBONE );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			b.mName = Read_aiString( stream );
			b.mNumWeights = Read_unsigned_int( stream );
			b.mOffsetMatrix = Read_aiMatrix4x4( stream );
			// for the moment we write dumb min/max values for the bones, too.
			// maybe I'll add a better, hash-like solution later
			if ( shortened ) {

				ReadBounds( stream, b.mWeights, b.mNumWeights );

			} else {

				// else write as usual

				b.mWeights = [];
				ReadArray_aiVertexWeight( stream, b.mWeights, b.mNumWeights );

			}

			return b;

		}

		function ReadBinaryMesh( stream, mesh ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AIMESH );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			mesh.mPrimitiveTypes = Read_unsigned_int( stream );
			mesh.mNumVertices = Read_unsigned_int( stream );
			mesh.mNumFaces = Read_unsigned_int( stream );
			mesh.mNumBones = Read_unsigned_int( stream );
			mesh.mMaterialIndex = Read_unsigned_int( stream );
			mesh.mNumUVComponents = [];
			// first of all, write bits for all existent vertex components
			var c = Read_unsigned_int( stream );

			if ( c & ASSBIN_MESH_HAS_POSITIONS ) {

				if ( shortened ) {

					ReadBounds( stream, mesh.mVertices, mesh.mNumVertices );

				} else {

					// else write as usual

					mesh.mVertices = [];
					mesh.mVertexBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
					stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

				}

			}

			if ( c & ASSBIN_MESH_HAS_NORMALS ) {

				if ( shortened ) {

					ReadBounds( stream, mesh.mNormals, mesh.mNumVertices );

				} else {

					// else write as usual

					mesh.mNormals = [];
					mesh.mNormalBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
					stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

				}

			}

			if ( c & ASSBIN_MESH_HAS_TANGENTS_AND_BITANGENTS ) {

				if ( shortened ) {

					ReadBounds( stream, mesh.mTangents, mesh.mNumVertices );
					ReadBounds( stream, mesh.mBitangents, mesh.mNumVertices );

				} else {

					// else write as usual

					mesh.mTangents = [];
					mesh.mTangentBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
					stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );
					mesh.mBitangents = [];
					mesh.mBitangentBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 3 * 4 );
					stream.Seek( mesh.mNumVertices * 3 * 4, aiOrigin_CUR );

				}

			}

			for ( var n = 0; n < AI_MAX_NUMBER_OF_COLOR_SETS; ++ n ) {

				if ( ! ( c & ASSBIN_MESH_HAS_COLOR( n ) ) ) break;

				if ( shortened ) {

					ReadBounds( stream, mesh.mColors[ n ], mesh.mNumVertices );

				} else {

					// else write as usual

					mesh.mColors[ n ] = [];
					mesh.mColorBuffer = stream.subArray32( stream.readOffset, stream.readOffset + mesh.mNumVertices * 4 * 4 );
					stream.Seek( mesh.mNumVertices * 4 * 4, aiOrigin_CUR );

				}

			}

			mesh.mTexCoordsBuffers = [];

			for ( var n = 0; n < AI_MAX_NUMBER_OF_TEXTURECOORDS; ++ n ) {

				if ( ! ( c & ASSBIN_MESH_HAS_TEXCOORD( n ) ) ) break;

				// write number of UV components
				mesh.mNumUVComponents[ n ] = Read_unsigned_int( stream );

				if ( shortened ) {

					ReadBounds( stream, mesh.mTextureCoords[ n ], mesh.mNumVertices );

				} else {

					// else write as usual

					mesh.mTextureCoords[ n ] = [];
					//note that assbin always writes 3d texcoords
					mesh.mTexCoordsBuffers[ n ] = [];

					for ( var uv = 0; uv < mesh.mNumVertices; uv ++ ) {

						mesh.mTexCoordsBuffers[ n ].push( readFloat( stream ) );
						mesh.mTexCoordsBuffers[ n ].push( readFloat( stream ) );
						readFloat( stream );

					}

				}

			}
			// write faces. There are no floating-point calculations involved
			// in these, so we can write a simple hash over the face data
			// to the dump file. We generate a single 32 Bit hash for 512 faces
			// using Assimp's standard hashing function.
			if ( shortened ) {

				Read_unsigned_int( stream );

			} else {

				// else write as usual

				// if there are less than 2^16 vertices, we can simply use 16 bit integers ...
				mesh.mFaces = [];

				var indexCounter = 0;
				mesh.mIndexArray = [];

				for ( var i = 0; i < mesh.mNumFaces; ++ i ) {

					var f = mesh.mFaces[ i ] = new aiFace();
					// BOOST_STATIC_ASSERT(AI_MAX_FACE_INDICES <= 0xffff);
					f.mNumIndices = Read_uint16_t( stream );
					f.mIndices = [];

					for ( var a = 0; a < f.mNumIndices; ++ a ) {

						if ( mesh.mNumVertices < ( 1 << 16 ) ) {

							f.mIndices[ a ] = Read_uint16_t( stream );

						} else {

							f.mIndices[ a ] = Read_unsigned_int( stream );

						}



					}

					if ( f.mNumIndices === 3 ) {

						mesh.mIndexArray.push( f.mIndices[ 0 ] );
						mesh.mIndexArray.push( f.mIndices[ 1 ] );
						mesh.mIndexArray.push( f.mIndices[ 2 ] );

					} else if ( f.mNumIndices === 4 ) {

						mesh.mIndexArray.push( f.mIndices[ 0 ] );
						mesh.mIndexArray.push( f.mIndices[ 1 ] );
						mesh.mIndexArray.push( f.mIndices[ 2 ] );
						mesh.mIndexArray.push( f.mIndices[ 2 ] );
						mesh.mIndexArray.push( f.mIndices[ 3 ] );
						mesh.mIndexArray.push( f.mIndices[ 0 ] );

					} else {

						throw ( new Error( "Sorry, can't currently triangulate polys. Use the triangulate preprocessor in Assimp." ) );

					}



				}

			}
			// write bones
			if ( mesh.mNumBones ) {

				mesh.mBones = [];

				for ( var a = 0; a < mesh.mNumBones; ++ a ) {

					mesh.mBones[ a ] = new aiBone();
					ReadBinaryBone( stream, mesh.mBones[ a ] );

				}

			}

		}

		function ReadBinaryMaterialProperty( stream, prop ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AIMATERIALPROPERTY );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			prop.mKey = Read_aiString( stream );
			prop.mSemantic = Read_unsigned_int( stream );
			prop.mIndex = Read_unsigned_int( stream );
			prop.mDataLength = Read_unsigned_int( stream );
			prop.mType = Read_unsigned_int( stream );
			prop.mData = [];
			stream.ReadBytes( prop.mData, 1, prop.mDataLength );

		}

		// -----------------------------------------------------------------------------------

		function ReadBinaryMaterial( stream, mat ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AIMATERIAL );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			mat.mNumAllocated = mat.mNumProperties = Read_unsigned_int( stream );

			if ( mat.mNumProperties ) {

				if ( mat.mProperties ) {

					delete mat.mProperties;

				}

				mat.mProperties = [];

				for ( var i = 0; i < mat.mNumProperties; ++ i ) {

					mat.mProperties[ i ] = new aiMaterialProperty();
					ReadBinaryMaterialProperty( stream, mat.mProperties[ i ] );

				}

			}

		}
		// -----------------------------------------------------------------------------------
		function ReadBinaryNodeAnim( stream, nd ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AINODEANIM );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			nd.mNodeName = Read_aiString( stream );
			nd.mNumPositionKeys = Read_unsigned_int( stream );
			nd.mNumRotationKeys = Read_unsigned_int( stream );
			nd.mNumScalingKeys = Read_unsigned_int( stream );
			nd.mPreState = Read_unsigned_int( stream );
			nd.mPostState = Read_unsigned_int( stream );

			if ( nd.mNumPositionKeys ) {

				if ( shortened ) {

					ReadBounds( stream, nd.mPositionKeys, nd.mNumPositionKeys );

				} else {

					// else write as usual

					nd.mPositionKeys = [];
					ReadArray_aiVectorKey( stream, nd.mPositionKeys, nd.mNumPositionKeys );

				}

			}

			if ( nd.mNumRotationKeys ) {

				if ( shortened ) {

					ReadBounds( stream, nd.mRotationKeys, nd.mNumRotationKeys );

				} else {

		 			// else write as usual

					nd.mRotationKeys = [];
					ReadArray_aiQuatKey( stream, nd.mRotationKeys, nd.mNumRotationKeys );

				}

			}

			if ( nd.mNumScalingKeys ) {

				if ( shortened ) {

					ReadBounds( stream, nd.mScalingKeys, nd.mNumScalingKeys );

				} else {

	 				// else write as usual

					nd.mScalingKeys = [];
					ReadArray_aiVectorKey( stream, nd.mScalingKeys, nd.mNumScalingKeys );

				}

			}

		}
		// -----------------------------------------------------------------------------------
		function ReadBinaryAnim( stream, anim ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AIANIMATION );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			anim.mName = Read_aiString( stream );
			anim.mDuration = Read_double( stream );
			anim.mTicksPerSecond = Read_double( stream );
			anim.mNumChannels = Read_unsigned_int( stream );

			if ( anim.mNumChannels ) {

				anim.mChannels = [];

				for ( var a = 0; a < anim.mNumChannels; ++ a ) {

					anim.mChannels[ a ] = new aiNodeAnim();
					ReadBinaryNodeAnim( stream, anim.mChannels[ a ] );

				}

			}

		}

		function ReadBinaryTexture( stream, tex ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AITEXTURE );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			tex.mWidth = Read_unsigned_int( stream );
			tex.mHeight = Read_unsigned_int( stream );
			stream.ReadBytes( tex.achFormatHint, 1, 4 );

			if ( ! shortened ) {

				if ( ! tex.mHeight ) {

					tex.pcData = [];
					stream.ReadBytes( tex.pcData, 1, tex.mWidth );

				} else {

					tex.pcData = [];
					stream.ReadBytes( tex.pcData, 1, tex.mWidth * tex.mHeight * 4 );

				}

			}

		}
		// -----------------------------------------------------------------------------------
		function ReadBinaryLight( stream, l ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AILIGHT );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			l.mName = Read_aiString( stream );
			l.mType = Read_unsigned_int( stream );

			if ( l.mType != aiLightSource_DIRECTIONAL ) {

				l.mAttenuationConstant = readFloat( stream );
				l.mAttenuationLinear = readFloat( stream );
				l.mAttenuationQuadratic = readFloat( stream );

			}

			l.mColorDiffuse = Read_aiColor3D( stream );
			l.mColorSpecular = Read_aiColor3D( stream );
			l.mColorAmbient = Read_aiColor3D( stream );

			if ( l.mType == aiLightSource_SPOT ) {

				l.mAngleInnerCone = readFloat( stream );
				l.mAngleOuterCone = readFloat( stream );

			}

		}
		// -----------------------------------------------------------------------------------
		function ReadBinaryCamera( stream, cam ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AICAMERA );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			cam.mName = Read_aiString( stream );
			cam.mPosition = Read_aiVector3D( stream );
			cam.mLookAt = Read_aiVector3D( stream );
			cam.mUp = Read_aiVector3D( stream );
			cam.mHorizontalFOV = readFloat( stream );
			cam.mClipPlaneNear = readFloat( stream );
			cam.mClipPlaneFar = readFloat( stream );
			cam.mAspect = readFloat( stream );

		}

		function ReadBinaryScene( stream, scene ) {

			var chunkID = Read_uint32_t( stream );
			ai_assert( chunkID == ASSBIN_CHUNK_AISCENE );
			/*uint32_t size =*/
			Read_uint32_t( stream );
			scene.mFlags = Read_unsigned_int( stream );
			scene.mNumMeshes = Read_unsigned_int( stream );
			scene.mNumMaterials = Read_unsigned_int( stream );
			scene.mNumAnimations = Read_unsigned_int( stream );
			scene.mNumTextures = Read_unsigned_int( stream );
			scene.mNumLights = Read_unsigned_int( stream );
			scene.mNumCameras = Read_unsigned_int( stream );
			// Read node graph
			scene.mRootNode = new aiNode();
			scene.mRootNode = ReadBinaryNode( stream, null, 0 );
			// Read all meshes
			if ( scene.mNumMeshes ) {

				scene.mMeshes = [];

				for ( var i = 0; i < scene.mNumMeshes; ++ i ) {

					scene.mMeshes[ i ] = new aiMesh();
					ReadBinaryMesh( stream, scene.mMeshes[ i ] );

				}

			}
			// Read materials
			if ( scene.mNumMaterials ) {

				scene.mMaterials = [];

				for ( var i = 0; i < scene.mNumMaterials; ++ i ) {

					scene.mMaterials[ i ] = new aiMaterial();
					ReadBinaryMaterial( stream, scene.mMaterials[ i ] );

				}

			}
			// Read all animations
			if ( scene.mNumAnimations ) {

				scene.mAnimations = [];

				for ( var i = 0; i < scene.mNumAnimations; ++ i ) {

					scene.mAnimations[ i ] = new aiAnimation();
					ReadBinaryAnim( stream, scene.mAnimations[ i ] );

				}

			}
			// Read all textures
			if ( scene.mNumTextures ) {

				scene.mTextures = [];

				for ( var i = 0; i < scene.mNumTextures; ++ i ) {

					scene.mTextures[ i ] = new aiTexture();
					ReadBinaryTexture( stream, scene.mTextures[ i ] );

				}

			}
			// Read lights
			if ( scene.mNumLights ) {

				scene.mLights = [];

				for ( var i = 0; i < scene.mNumLights; ++ i ) {

					scene.mLights[ i ] = new aiLight();
					ReadBinaryLight( stream, scene.mLights[ i ] );

				}

			}
			// Read cameras
			if ( scene.mNumCameras ) {

				scene.mCameras = [];

				for ( var i = 0; i < scene.mNumCameras; ++ i ) {

					scene.mCameras[ i ] = new aiCamera();
					ReadBinaryCamera( stream, scene.mCameras[ i ] );

				}

			}

		}
		var aiOrigin_CUR = 0;
		var aiOrigin_BEG = 1;

		function extendStream( stream ) {

			stream.readOffset = 0;
			stream.Seek = function ( off, ori ) {

				if ( ori == aiOrigin_CUR ) {

					stream.readOffset += off;

				}
				if ( ori == aiOrigin_BEG ) {

					stream.readOffset = off;

				}

			};

			stream.ReadBytes = function ( buff, size, n ) {

				var bytes = size * n;
				for ( var i = 0; i < bytes; i ++ )
					buff[ i ] = Read_uint8_t( this );

			};

			stream.subArray32 = function ( start, end ) {

				var buff = this.buffer;
				var newbuff = buff.slice( start, end );
				return new Float32Array( newbuff );

			};

			stream.subArrayUint16 = function ( start, end ) {

				var buff = this.buffer;
				var newbuff = buff.slice( start, end );
				return new Uint16Array( newbuff );

			};

			stream.subArrayUint8 = function ( start, end ) {

				var buff = this.buffer;
				var newbuff = buff.slice( start, end );
				return new Uint8Array( newbuff );

			};

			stream.subArrayUint32 = function ( start, end ) {

				var buff = this.buffer;
				var newbuff = buff.slice( start, end );
				return new Uint32Array( newbuff );

			};

		}

		var shortened, compressed;

		function InternReadFile( pFiledata ) {

			var pScene = new aiScene();
			var stream = new DataView( pFiledata );
			extendStream( stream );
			stream.Seek( 44, aiOrigin_CUR ); // signature
			/*unsigned int versionMajor =*/
			var versionMajor = Read_unsigned_int( stream );
			/*unsigned int versionMinor =*/
			var versionMinor = Read_unsigned_int( stream );
			/*unsigned int versionRevision =*/
			var versionRevision = Read_unsigned_int( stream );
			/*unsigned int compileFlags =*/
			var compileFlags = Read_unsigned_int( stream );
			shortened = Read_uint16_t( stream ) > 0;
			compressed = Read_uint16_t( stream ) > 0;
			if ( shortened )
				throw "Shortened binaries are not supported!";
			stream.Seek( 256, aiOrigin_CUR ); // original filename
			stream.Seek( 128, aiOrigin_CUR ); // options
			stream.Seek( 64, aiOrigin_CUR ); // padding
			if ( compressed ) {

				var uncompressedSize = Read_uint32_t( stream );
				var compressedSize = stream.FileSize() - stream.Tell();
				var compressedData = [];
				stream.Read( compressedData, 1, compressedSize );
				var uncompressedData = [];
				uncompress( uncompressedData, uncompressedSize, compressedData, compressedSize );
				var buff = new ArrayBuffer( uncompressedData );
				ReadBinaryScene( buff, pScene );

			} else {

				ReadBinaryScene( stream, pScene );
				return pScene.toTHREE();

			}

		}

		return InternReadFile( buffer );

	}

};
