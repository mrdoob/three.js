/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.LegacyJSONLoader = ( function () {

	function LegacyJSONLoader( manager ) {

		if ( typeof manager === 'boolean' ) {

			console.warn( 'THREE.JSONLoader: showStatus parameter has been removed from constructor.' );
			manager = undefined;

		}

		THREE.Loader.call( this, manager );

		this.withCredentials = false;

	}

	LegacyJSONLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: LegacyJSONLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = ( this.path === '' ) ? THREE.LoaderUtils.extractUrlBase( url ) : this.path;

			var loader = new THREE.FileLoader( this.manager );
			loader.setPath( this.path );
			loader.setWithCredentials( this.withCredentials );
			loader.load( url, function ( text ) {

				var json = JSON.parse( text );
				var metadata = json.metadata;

				if ( metadata !== undefined ) {

					var type = metadata.type;

					if ( type !== undefined ) {

						if ( type.toLowerCase() === 'object' ) {

							console.error( 'THREE.JSONLoader: ' + url + ' should be loaded with THREE.ObjectLoader instead.' );
							return;

						}

					}

				}

				var object = scope.parse( json, path );
				onLoad( object.geometry, object.materials );

			}, onProgress, onError );

		},

		parse: ( function () {

			var _BlendingMode = {
				NoBlending: THREE.NoBlending,
				NormalBlending: THREE.NormalBlending,
				AdditiveBlending: THREE.AdditiveBlending,
				SubtractiveBlending: THREE.SubtractiveBlending,
				MultiplyBlending: THREE.MultiplyBlending,
				CustomBlending: THREE.CustomBlending
			};

			var _color = new THREE.Color();
			var _textureLoader = new THREE.TextureLoader();
			var _materialLoader = new THREE.MaterialLoader();

			function initMaterials( materials, texturePath, crossOrigin, manager ) {

				var array = [];

				for ( var i = 0; i < materials.length; ++ i ) {

					array[ i ] = createMaterial( materials[ i ], texturePath, crossOrigin, manager );

				}

				return array;

			}

			function createMaterial( m, texturePath, crossOrigin, manager ) {

				// convert from old material format

				var textures = {};

				//

				var json = {
					uuid: THREE.Math.generateUUID(),
					type: 'MeshLambertMaterial'
				};

				for ( var name in m ) {

					var value = m[ name ];

					switch ( name ) {

						case 'DbgColor':
						case 'DbgIndex':
						case 'opticalDensity':
						case 'illumination':
							break;
						case 'DbgName':
							json.name = value;
							break;
						case 'blending':
							json.blending = _BlendingMode[ value ];
							break;
						case 'colorAmbient':
						case 'mapAmbient':
							console.warn( 'THREE.LegacyJSONLoader.createMaterial:', name, 'is no longer supported.' );
							break;
						case 'colorDiffuse':
							json.color = _color.fromArray( value ).getHex();
							break;
						case 'colorSpecular':
							json.specular = _color.fromArray( value ).getHex();
							break;
						case 'colorEmissive':
							json.emissive = _color.fromArray( value ).getHex();
							break;
						case 'specularCoef':
							json.shininess = value;
							break;
						case 'shading':
							if ( value.toLowerCase() === 'basic' ) json.type = 'MeshBasicMaterial';
							if ( value.toLowerCase() === 'phong' ) json.type = 'MeshPhongMaterial';
							if ( value.toLowerCase() === 'standard' ) json.type = 'MeshStandardMaterial';
							break;
						case 'mapDiffuse':
							json.map = loadTexture( value, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapDiffuseRepeat':
						case 'mapDiffuseOffset':
						case 'mapDiffuseWrap':
						case 'mapDiffuseAnisotropy':
							break;
						case 'mapEmissive':
							json.emissiveMap = loadTexture( value, m.mapEmissiveRepeat, m.mapEmissiveOffset, m.mapEmissiveWrap, m.mapEmissiveAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapEmissiveRepeat':
						case 'mapEmissiveOffset':
						case 'mapEmissiveWrap':
						case 'mapEmissiveAnisotropy':
							break;
						case 'mapLight':
							json.lightMap = loadTexture( value, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapLightRepeat':
						case 'mapLightOffset':
						case 'mapLightWrap':
						case 'mapLightAnisotropy':
							break;
						case 'mapAO':
							json.aoMap = loadTexture( value, m.mapAORepeat, m.mapAOOffset, m.mapAOWrap, m.mapAOAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapAORepeat':
						case 'mapAOOffset':
						case 'mapAOWrap':
						case 'mapAOAnisotropy':
							break;
						case 'mapBump':
							json.bumpMap = loadTexture( value, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapBumpScale':
							json.bumpScale = value;
							break;
						case 'mapBumpRepeat':
						case 'mapBumpOffset':
						case 'mapBumpWrap':
						case 'mapBumpAnisotropy':
							break;
						case 'mapNormal':
							json.normalMap = loadTexture( value, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapNormalFactor':
							json.normalScale = value;
							break;
						case 'mapNormalRepeat':
						case 'mapNormalOffset':
						case 'mapNormalWrap':
						case 'mapNormalAnisotropy':
							break;
						case 'mapSpecular':
							json.specularMap = loadTexture( value, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapSpecularRepeat':
						case 'mapSpecularOffset':
						case 'mapSpecularWrap':
						case 'mapSpecularAnisotropy':
							break;
						case 'mapMetalness':
							json.metalnessMap = loadTexture( value, m.mapMetalnessRepeat, m.mapMetalnessOffset, m.mapMetalnessWrap, m.mapMetalnessAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapMetalnessRepeat':
						case 'mapMetalnessOffset':
						case 'mapMetalnessWrap':
						case 'mapMetalnessAnisotropy':
							break;
						case 'mapRoughness':
							json.roughnessMap = loadTexture( value, m.mapRoughnessRepeat, m.mapRoughnessOffset, m.mapRoughnessWrap, m.mapRoughnessAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapRoughnessRepeat':
						case 'mapRoughnessOffset':
						case 'mapRoughnessWrap':
						case 'mapRoughnessAnisotropy':
							break;
						case 'mapAlpha':
							json.alphaMap = loadTexture( value, m.mapAlphaRepeat, m.mapAlphaOffset, m.mapAlphaWrap, m.mapAlphaAnisotropy, textures, texturePath, crossOrigin, manager );
							break;
						case 'mapAlphaRepeat':
						case 'mapAlphaOffset':
						case 'mapAlphaWrap':
						case 'mapAlphaAnisotropy':
							break;
						case 'flipSided':
							json.side = THREE.BackSide;
							break;
						case 'doubleSided':
							json.side = THREE.DoubleSide;
							break;
						case 'transparency':
							console.warn( 'THREE.LegacyJSONLoader.createMaterial: transparency has been renamed to opacity' );
							json.opacity = value;
							break;
						case 'depthTest':
						case 'depthWrite':
						case 'colorWrite':
						case 'opacity':
						case 'reflectivity':
						case 'transparent':
						case 'visible':
						case 'wireframe':
							json[ name ] = value;
							break;
						case 'vertexColors':
							if ( value === true ) json.vertexColors = THREE.VertexColors;
							if ( value === 'face' ) json.vertexColors = THREE.FaceColors;
							break;
						default:
							console.error( 'THREE.LegacyJSONLoader.createMaterial: Unsupported', name, value );
							break;

					}

				}

				if ( json.type === 'MeshBasicMaterial' ) delete json.emissive;
				if ( json.type !== 'MeshPhongMaterial' ) delete json.specular;

				if ( json.opacity < 1 ) json.transparent = true;

				_materialLoader.setTextures( textures );

				return _materialLoader.parse( json );

			}

			function loadTexture( path, repeat, offset, wrap, anisotropy, textures, texturePath, crossOrigin, manager ) {

				var fullPath = texturePath + path;
				var loader = manager.getHandler( fullPath );

				var texture;

				if ( loader !== null ) {

					texture = loader.load( fullPath );

				} else {

					_textureLoader.setCrossOrigin( crossOrigin );
					texture = _textureLoader.load( fullPath );

				}

				if ( repeat !== undefined ) {

					texture.repeat.fromArray( repeat );

					if ( repeat[ 0 ] !== 1 ) texture.wrapS = THREE.RepeatWrapping;
					if ( repeat[ 1 ] !== 1 ) texture.wrapT = THREE.RepeatWrapping;

				}

				if ( offset !== undefined ) {

					texture.offset.fromArray( offset );

				}

				if ( wrap !== undefined ) {

					if ( wrap[ 0 ] === 'repeat' ) texture.wrapS = THREE.RepeatWrapping;
					if ( wrap[ 0 ] === 'mirror' ) texture.wrapS = THREE.MirroredRepeatWrapping;

					if ( wrap[ 1 ] === 'repeat' ) texture.wrapT = THREE.RepeatWrapping;
					if ( wrap[ 1 ] === 'mirror' ) texture.wrapT = THREE.MirroredRepeatWrapping;

				}

				if ( anisotropy !== undefined ) {

					texture.anisotropy = anisotropy;

				}

				var uuid = THREE.Math.generateUUID();

				textures[ uuid ] = texture;

				return uuid;

			}

			function parseModel( json, geometry ) {

				function isBitSet( value, position ) {

					return value & ( 1 << position );

				}

				var i, j, fi,

					offset, zLength,

					colorIndex, normalIndex, uvIndex, materialIndex,

					type,
					isQuad,
					hasMaterial,
					hasFaceVertexUv,
					hasFaceNormal, hasFaceVertexNormal,
					hasFaceColor, hasFaceVertexColor,

					vertex, face, faceA, faceB, hex, normal,

					uvLayer, uv, u, v,

					faces = json.faces,
					vertices = json.vertices,
					normals = json.normals,
					colors = json.colors,

					scale = json.scale,

					nUvLayers = 0;


				if ( json.uvs !== undefined ) {

					// disregard empty arrays

					for ( i = 0; i < json.uvs.length; i ++ ) {

						if ( json.uvs[ i ].length ) nUvLayers ++;

					}

					for ( i = 0; i < nUvLayers; i ++ ) {

						geometry.faceVertexUvs[ i ] = [];

					}

				}

				offset = 0;
				zLength = vertices.length;

				while ( offset < zLength ) {

					vertex = new THREE.Vector3();

					vertex.x = vertices[ offset ++ ] * scale;
					vertex.y = vertices[ offset ++ ] * scale;
					vertex.z = vertices[ offset ++ ] * scale;

					geometry.vertices.push( vertex );

				}

				offset = 0;
				zLength = faces.length;

				while ( offset < zLength ) {

					type = faces[ offset ++ ];

					isQuad = isBitSet( type, 0 );
					hasMaterial = isBitSet( type, 1 );
					hasFaceVertexUv = isBitSet( type, 3 );
					hasFaceNormal = isBitSet( type, 4 );
					hasFaceVertexNormal = isBitSet( type, 5 );
					hasFaceColor = isBitSet( type, 6 );
					hasFaceVertexColor = isBitSet( type, 7 );

					// console.log("type", type, "bits", isQuad, hasMaterial, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);

					if ( isQuad ) {

						faceA = new THREE.Face3();
						faceA.a = faces[ offset ];
						faceA.b = faces[ offset + 1 ];
						faceA.c = faces[ offset + 3 ];

						faceB = new THREE.Face3();
						faceB.a = faces[ offset + 1 ];
						faceB.b = faces[ offset + 2 ];
						faceB.c = faces[ offset + 3 ];

						offset += 4;

						if ( hasMaterial ) {

							materialIndex = faces[ offset ++ ];
							faceA.materialIndex = materialIndex;
							faceB.materialIndex = materialIndex;

						}

						// to get face <=> uv index correspondence

						fi = geometry.faces.length;

						if ( hasFaceVertexUv ) {

							for ( i = 0; i < nUvLayers; i ++ ) {

								uvLayer = json.uvs[ i ];

								geometry.faceVertexUvs[ i ][ fi ] = [];
								geometry.faceVertexUvs[ i ][ fi + 1 ] = [];

								for ( j = 0; j < 4; j ++ ) {

									uvIndex = faces[ offset ++ ];

									u = uvLayer[ uvIndex * 2 ];
									v = uvLayer[ uvIndex * 2 + 1 ];

									uv = new THREE.Vector2( u, v );

									if ( j !== 2 ) geometry.faceVertexUvs[ i ][ fi ].push( uv );
									if ( j !== 0 ) geometry.faceVertexUvs[ i ][ fi + 1 ].push( uv );

								}

							}

						}

						if ( hasFaceNormal ) {

							normalIndex = faces[ offset ++ ] * 3;

							faceA.normal.set(
								normals[ normalIndex ++ ],
								normals[ normalIndex ++ ],
								normals[ normalIndex ]
							);

							faceB.normal.copy( faceA.normal );

						}

						if ( hasFaceVertexNormal ) {

							for ( i = 0; i < 4; i ++ ) {

								normalIndex = faces[ offset ++ ] * 3;

								normal = new THREE.Vector3(
									normals[ normalIndex ++ ],
									normals[ normalIndex ++ ],
									normals[ normalIndex ]
								);


								if ( i !== 2 ) faceA.vertexNormals.push( normal );
								if ( i !== 0 ) faceB.vertexNormals.push( normal );

							}

						}


						if ( hasFaceColor ) {

							colorIndex = faces[ offset ++ ];
							hex = colors[ colorIndex ];

							faceA.color.setHex( hex );
							faceB.color.setHex( hex );

						}


						if ( hasFaceVertexColor ) {

							for ( i = 0; i < 4; i ++ ) {

								colorIndex = faces[ offset ++ ];
								hex = colors[ colorIndex ];

								if ( i !== 2 ) faceA.vertexColors.push( new THREE.Color( hex ) );
								if ( i !== 0 ) faceB.vertexColors.push( new THREE.Color( hex ) );

							}

						}

						geometry.faces.push( faceA );
						geometry.faces.push( faceB );

					} else {

						face = new THREE.Face3();
						face.a = faces[ offset ++ ];
						face.b = faces[ offset ++ ];
						face.c = faces[ offset ++ ];

						if ( hasMaterial ) {

							materialIndex = faces[ offset ++ ];
							face.materialIndex = materialIndex;

						}

						// to get face <=> uv index correspondence

						fi = geometry.faces.length;

						if ( hasFaceVertexUv ) {

							for ( i = 0; i < nUvLayers; i ++ ) {

								uvLayer = json.uvs[ i ];

								geometry.faceVertexUvs[ i ][ fi ] = [];

								for ( j = 0; j < 3; j ++ ) {

									uvIndex = faces[ offset ++ ];

									u = uvLayer[ uvIndex * 2 ];
									v = uvLayer[ uvIndex * 2 + 1 ];

									uv = new THREE.Vector2( u, v );

									geometry.faceVertexUvs[ i ][ fi ].push( uv );

								}

							}

						}

						if ( hasFaceNormal ) {

							normalIndex = faces[ offset ++ ] * 3;

							face.normal.set(
								normals[ normalIndex ++ ],
								normals[ normalIndex ++ ],
								normals[ normalIndex ]
							);

						}

						if ( hasFaceVertexNormal ) {

							for ( i = 0; i < 3; i ++ ) {

								normalIndex = faces[ offset ++ ] * 3;

								normal = new THREE.Vector3(
									normals[ normalIndex ++ ],
									normals[ normalIndex ++ ],
									normals[ normalIndex ]
								);

								face.vertexNormals.push( normal );

							}

						}


						if ( hasFaceColor ) {

							colorIndex = faces[ offset ++ ];
							face.color.setHex( colors[ colorIndex ] );

						}


						if ( hasFaceVertexColor ) {

							for ( i = 0; i < 3; i ++ ) {

								colorIndex = faces[ offset ++ ];
								face.vertexColors.push( new THREE.Color( colors[ colorIndex ] ) );

							}

						}

						geometry.faces.push( face );

					}

				}

			}

			function parseSkin( json, geometry ) {

				var influencesPerVertex = ( json.influencesPerVertex !== undefined ) ? json.influencesPerVertex : 2;

				if ( json.skinWeights ) {

					for ( var i = 0, l = json.skinWeights.length; i < l; i += influencesPerVertex ) {

						var x = json.skinWeights[ i ];
						var y = ( influencesPerVertex > 1 ) ? json.skinWeights[ i + 1 ] : 0;
						var z = ( influencesPerVertex > 2 ) ? json.skinWeights[ i + 2 ] : 0;
						var w = ( influencesPerVertex > 3 ) ? json.skinWeights[ i + 3 ] : 0;

						geometry.skinWeights.push( new THREE.Vector4( x, y, z, w ) );

					}

				}

				if ( json.skinIndices ) {

					for ( var i = 0, l = json.skinIndices.length; i < l; i += influencesPerVertex ) {

						var a = json.skinIndices[ i ];
						var b = ( influencesPerVertex > 1 ) ? json.skinIndices[ i + 1 ] : 0;
						var c = ( influencesPerVertex > 2 ) ? json.skinIndices[ i + 2 ] : 0;
						var d = ( influencesPerVertex > 3 ) ? json.skinIndices[ i + 3 ] : 0;

						geometry.skinIndices.push( new THREE.Vector4( a, b, c, d ) );

					}

				}

				geometry.bones = json.bones;

				if ( geometry.bones && geometry.bones.length > 0 && ( geometry.skinWeights.length !== geometry.skinIndices.length || geometry.skinIndices.length !== geometry.vertices.length ) ) {

					console.warn( 'When skinning, number of vertices (' + geometry.vertices.length + '), skinIndices (' +
						geometry.skinIndices.length + '), and skinWeights (' + geometry.skinWeights.length + ') should match.' );

				}

			}

			function parseMorphing( json, geometry ) {

				var scale = json.scale;

				if ( json.morphTargets !== undefined ) {

					for ( var i = 0, l = json.morphTargets.length; i < l; i ++ ) {

						geometry.morphTargets[ i ] = {};
						geometry.morphTargets[ i ].name = json.morphTargets[ i ].name;
						geometry.morphTargets[ i ].vertices = [];

						var dstVertices = geometry.morphTargets[ i ].vertices;
						var srcVertices = json.morphTargets[ i ].vertices;

						for ( var v = 0, vl = srcVertices.length; v < vl; v += 3 ) {

							var vertex = new THREE.Vector3();
							vertex.x = srcVertices[ v ] * scale;
							vertex.y = srcVertices[ v + 1 ] * scale;
							vertex.z = srcVertices[ v + 2 ] * scale;

							dstVertices.push( vertex );

						}

					}

				}

				if ( json.morphColors !== undefined && json.morphColors.length > 0 ) {

					console.warn( 'THREE.JSONLoader: "morphColors" no longer supported. Using them as face colors.' );

					var faces = geometry.faces;
					var morphColors = json.morphColors[ 0 ].colors;

					for ( var i = 0, l = faces.length; i < l; i ++ ) {

						faces[ i ].color.fromArray( morphColors, i * 3 );

					}

				}

			}

			function parseAnimations( json, geometry ) {

				var outputAnimations = [];

				// parse old style Bone/Hierarchy animations
				var animations = [];

				if ( json.animation !== undefined ) {

					animations.push( json.animation );

				}

				if ( json.animations !== undefined ) {

					if ( json.animations.length ) {

						animations = animations.concat( json.animations );

					} else {

						animations.push( json.animations );

					}

				}

				for ( var i = 0; i < animations.length; i ++ ) {

					var clip = THREE.AnimationClip.parseAnimation( animations[ i ], geometry.bones );
					if ( clip ) outputAnimations.push( clip );

				}

				// parse implicit morph animations
				if ( geometry.morphTargets ) {

					// TODO: Figure out what an appropraite FPS is for morph target animations -- defaulting to 10, but really it is completely arbitrary.
					var morphAnimationClips = THREE.AnimationClip.CreateClipsFromMorphTargetSequences( geometry.morphTargets, 10 );
					outputAnimations = outputAnimations.concat( morphAnimationClips );

				}

				if ( outputAnimations.length > 0 ) geometry.animations = outputAnimations;

			}

			return function parse( json, path ) {

				if ( json.data !== undefined ) {

					// Geometry 4.0 spec
					json = json.data;

				}

				if ( json.scale !== undefined ) {

					json.scale = 1.0 / json.scale;

				} else {

					json.scale = 1.0;

				}

				var geometry = new THREE.Geometry();

				parseModel( json, geometry );
				parseSkin( json, geometry );
				parseMorphing( json, geometry );
				parseAnimations( json, geometry );

				geometry.computeFaceNormals();
				geometry.computeBoundingSphere();

				if ( json.materials === undefined || json.materials.length === 0 ) {

					return { geometry: geometry };

				} else {

					var materials = initMaterials( json.materials, this.resourcePath || path, this.crossOrigin, this.manager );

					return { geometry: geometry, materials: materials };

				}

			};

		} )()

	} );

	return LegacyJSONLoader;

} )();
