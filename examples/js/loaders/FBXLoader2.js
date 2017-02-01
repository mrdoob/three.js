/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 *
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII format.
 *
 * Supports:
 * 	Mesh Generation (Positional Data)
 * 	Normal Data (Per Vertex Drawing Instance)
 *  UV Data (Per Vertex Drawing Instance)
 *  Skinning
 *  Animation
 * 	- Separated Animations based on stacks.
 * 	- Skeletal & Non-Skeletal Animations
 *
 * Needs Support:
 * 	Indexed Buffers
 * 	PreRotation support.
 */

( function () {

	/**
	 * Generates a loader for loading FBX files from URL and parsing into
	 * a THREE.Group.
	 * @param {THREE.LoadingManager} manager - Loading Manager for loader to use.
	 */
	THREE.FBXLoader = function ( manager ) {

		THREE.Loader.call( this );
		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
		this.fileLoader = new THREE.FileLoader( this.manager );
		this.textureLoader = new THREE.TextureLoader( this.manager );

	};

	Object.assign( THREE.FBXLoader.prototype, THREE.Loader.prototype );

	THREE.FBXLoader.prototype.constructor = THREE.FBXLoader;

	Object.assign( THREE.FBXLoader.prototype, {

		/**
		 * Loads an ASCII FBX file from URL and parses into a THREE.Group.
		 * THREE.Group will have an animations property of AnimationClips
		 * of the different animations exported with the FBX.
		 * @param {string} url - URL of the FBX file.
		 * @param {function(THREE.Group):void} onLoad - Callback for when FBX file is loaded and parsed.
		 * @param {function(ProgressEvent):void} onProgress - Callback fired periodically when file is being retrieved from server.
		 * @param {function(Event):void} onError - Callback fired when error occurs (Currently only with retrieving file, not with parsing errors).
		 */
		load: function ( url, onLoad, onProgress, onError ) {

			var self = this;

			var resourceDirectory = url.split( /[\\\/]/ );
			resourceDirectory.pop();
			resourceDirectory = resourceDirectory.join( '/' );

			this.fileLoader.load( url, function ( text ) {

				if ( ! isFbxFormatASCII( text ) ) {

					console.error( 'FBXLoader: FBX Binary format not supported.' );
					self.manager.itemError( url );
					return;

				}
				if ( getFbxVersion( text ) < 7000 ) {

					console.error( 'FBXLoader: FBX version not supported for file at ' + url + ', FileVersion: ' + getFbxVersion( text ) );
					self.manager.itemError( url );
					return;

				}

				var scene = self.parse( text, resourceDirectory );
				onLoad( scene );

			}, onProgress, onError );

		},

		/**
		 * Parses an ASCII FBX file and returns a THREE.Group.
		 * THREE.Group will have an animations property of AnimationClips
		 * of the different animations within the FBX file.
		 * @param {string} FBXText - Contents of FBX file to parse.
		 * @param {string} resourceDirectory - Directory to load external assets (e.g. textures ) from.
		 * @returns {THREE.Group}
		 */
		parse: function ( FBXText, resourceDirectory ) {

			var loader = this;

			var FBXTree = new TextParser().parse( FBXText );

			var connections = parseConnections( FBXTree );

			var textures = parseTextures( FBXTree );

			var materials = parseMaterials( FBXTree, textures, connections );

			var deformerMap = parseDeformers( FBXTree, connections );

			var geometryMap = parseGeometries( FBXTree, connections, deformerMap );

			var sceneGraph = parseScene( FBXTree, connections, deformerMap, geometryMap, materials );

			return sceneGraph;


			/**
			 * @typedef {{value: number}} FBXValue
			 */
			/**
			 * @typedef {{value: {x: string, y: string, z: string}}} FBXVector3
			 */
			/**
			 * @typedef {{properties: {a: string}}} FBXArrayNode
			 */
			/**
			 * @typedef {{properties: {MappingInformationType: string, ReferenceInformationType: string }, subNodes: Object<string, FBXArrayNode>}} FBXMappedArrayNode
			 */
			/**
			 * @typedef {{id: number, name: string, properties: {FileName: string}}} FBXTextureNode
			 */
			/**
			 * @typedef {{id: number, attrName: string, properties: {ShadingModel: string, Diffuse: FBXVector3, Specular: FBXVector3, Shininess: FBXValue, Emissive: FBXVector3, EmissiveFactor: FBXValue, Opacity: FBXValue}}} FBXMaterialNode
			 */
			/**
			 * @typedef {{subNodes: {Indexes: FBXArrayNode, Weights: FBXArrayNode, Transform: FBXArrayNode, TransformLink: FBXArrayNode}, properties: { Mode: string }}} FBXSubDeformerNode
			 */
			/**
			 * @typedef {{id: number, attrName: string, attrType: string, subNodes: {Vertices: FBXArrayNode, PolygonVertexIndex: FBXArrayNode, LayerElementNormal: FBXMappedArrayNode[], LayerElementMaterial: FBXMappedArrayNode[], LayerElementUV: FBXMappedArrayNode[]}}} FBXGeometryNode
			 */
			/**
			 * @typedef {{id: number, attrName: string, attrType: string, properties: {Lcl_Translation: FBXValue, Lcl_Rotation: FBXValue, Lcl_Scaling: FBXValue}}} FBXModelNode
			 */








			/**
			 * Parses map of relationships between objects.
			 * @param {{Connections: { properties: { connections: [number, number, string][]}}}} FBXTree
			 * @returns {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>}
			 */
			function parseConnections( FBXTree ) {

				/**
				 * @type {Map<number, { parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>}
				 */
				var connectionMap = new Map();

				if ( 'Connections' in FBXTree ) {

					/**
					 * @type {[number, number, string][]}
					 */
					var connectionArray = FBXTree.Connections.properties.connections;
					for ( var connectionArrayIndex = 0, connectionArrayLength = connectionArray.length; connectionArrayIndex < connectionArrayLength; ++ connectionArrayIndex ) {

						var connection = connectionArray[ connectionArrayIndex ];

						if ( ! connectionMap.has( connection[ 0 ] ) ) {

							connectionMap.set( connection[ 0 ], {
								parents: [],
								children: []
							} );

						}

						var parentRelationship = { ID: connection[ 1 ], relationship: connection[ 2 ] };
						connectionMap.get( connection[ 0 ] ).parents.push( parentRelationship );

						if ( ! connectionMap.has( connection[ 1 ] ) ) {

							connectionMap.set( connection[ 1 ], {
								parents: [],
								children: []
							} );

						}

						var childRelationship = { ID: connection[ 0 ], relationship: connection[ 2 ] };
						connectionMap.get( connection[ 1 ] ).children.push( childRelationship );

					}

				}

				return connectionMap;

			}

			/**
			 * Parses map of textures referenced in FBXTree.
			 * @param {{Objects: {subNodes: {Texture: Object.<string, FBXTextureNode>}}}} FBXTree
			 * @returns {Map<number, THREE.Texture>}
			 */
			function parseTextures( FBXTree ) {

				/**
				 * @type {Map<number, THREE.Texture>}
				 */
				var textureMap = new Map();

				if ( 'Texture' in FBXTree.Objects.subNodes ) {

					var textureNodes = FBXTree.Objects.subNodes.Texture;
					for ( var nodeID in textureNodes ) {

						var texture = parseTexture( textureNodes[ nodeID ] );
						textureMap.set( parseInt( nodeID ), texture );

					}

				}

				return textureMap;

				/**
				 * @param {textureNode} textureNode - Node to get texture information from.
				 * @returns {THREE.Texture}
				 */
				function parseTexture( textureNode ) {

					var FBX_ID = textureNode.id;
					var name = textureNode.name;
					var filePath = textureNode.properties.FileName;
					var split = filePath.split( /[\\\/]/ );
					if ( split.length > 0 ) {

						var fileName = split[ split.length - 1 ];

					} else {

						var fileName = filePath;

					}
					/**
					 * @type {THREE.Texture}
					 */
					var texture = loader.textureLoader.load( resourceDirectory + '/' + fileName );
					texture.name = name;
					texture.FBX_ID = FBX_ID;

					return texture;

				}

			}

			/**
			 * Parses map of Material information.
			 * @param {{Objects: {subNodes: {Material: Object.<number, FBXMaterialNode>}}}} FBXTree
			 * @param {Map<number, THREE.Texture>} textureMap
			 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
			 * @returns {Map<number, THREE.Material>}
			 */
			function parseMaterials( FBXTree, textureMap, connections ) {

				var materialMap = new Map();

				if ( 'Material' in FBXTree.Objects.subNodes ) {

					var materialNodes = FBXTree.Objects.subNodes.Material;
					for ( var nodeID in materialNodes ) {

						var material = parseMaterial( materialNodes[ nodeID ], textureMap, connections );
						materialMap.set( parseInt( nodeID ), material );

					}

				}

				return materialMap;

				/**
				 * Takes information from Material node and returns a generated THREE.Material
				 * @param {FBXMaterialNode} materialNode
				 * @param {Map<number, THREE.Texture>} textureMap
				 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
				 * @returns {THREE.Material}
				 */
				function parseMaterial( materialNode, textureMap, connections ) {

					var FBX_ID = materialNode.id;
					var name = materialNode.attrName;
					var type = materialNode.properties.ShadingModel;

					//Case where FBXs wrap shading model in property object.
					if ( typeof type === 'object' ) {

						type = type.value;

					}

					var children = connections.get( FBX_ID ).children;

					var parameters = parseParameters( materialNode.properties, textureMap, children );

					var material;
					switch ( type ) {

						case 'phong':
							material = new THREE.MeshPhongMaterial();
							break;
						case 'lambert':
							material = new THREE.MeshLambertMaterial();
							break;
						default:
							console.warn( 'No implementation given for material type ' + type + ' in FBXLoader.js.  Defaulting to basic material' );
							material = new THREE.MeshBasicMaterial( { color: 0x3300ff } );
							break;

					}

					material.setValues( parameters );
					material.name = name;

					return material;

					/**
					 * @typedef {{Diffuse: FBXVector3, Specular: FBXVector3, Shininess: FBXValue, Emissive: FBXVector3, EmissiveFactor: FBXValue, Opacity: FBXValue}} FBXMaterialProperties
					 */
					/**
					 * @typedef {{color: THREE.Color=, specular: THREE.Color=, shininess: number=, emissive: THREE.Color=, emissiveIntensity: number=, opacity: number=, transparent: boolean=, map: THREE.Texture=}} THREEMaterialParameterPack
					 */
					/**
					 * @param {FBXMaterialProperties} properties
					 * @param {Map<number, THREE.Texture>} textureMap
					 * @param {{ID: number, relationship: string}[]} childrenRelationships
					 * @returns {THREEMaterialParameterPack}
					 */
					function parseParameters( properties, textureMap, childrenRelationships ) {

						var parameters = {};

						if ( properties.Diffuse ) {

							parameters.color = parseColor( properties.Diffuse );

						}
						if ( properties.Specular ) {

							parameters.specular = parseColor( properties.Specular );

						}
						if ( properties.Shininess ) {

							parameters.shininess = properties.Shininess.value;

						}
						if ( properties.Emissive ) {

							parameters.emissive = parseColor( properties.Emissive );

						}
						if ( properties.EmissiveFactor ) {

							parameters.emissiveIntensity = properties.EmissiveFactor.value;

						}
						if ( properties.Opacity ) {

							parameters.opacity = properties.Opacity.value;

						}
						if ( parameters.opacity < 1.0 ) {

							parameters.transparent = true;

						}

						for ( var childrenRelationshipsIndex = 0, childrenRelationshipsLength = childrenRelationships.length; childrenRelationshipsIndex < childrenRelationshipsLength; ++ childrenRelationshipsIndex ) {

							var relationship = childrenRelationships[ childrenRelationshipsIndex ];

							var type = relationship.relationship;
							switch ( type ) {

								case " \"AmbientColor":
									//TODO: Support AmbientColor textures
									break;

								case " \"DiffuseColor":
									parameters.map = textureMap.get( relationship.ID );
									break;

								default:
									console.warn( 'Unknown texture application of type ' + type + ', skipping texture' );
									break;

							}

						}

						return parameters;

					}

				}

			}

			/**
			 * Generates map of Skeleton-like objects for use later when generating and binding skeletons.
			 * @param {{Objects: {subNodes: {Deformer: Object.<number, FBXSubDeformerNode>}}}} FBXTree
			 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
			 * @returns {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: THREE.Skeleton|null}>}
			 */
			function parseDeformers( FBXTree, connections ) {

				var skeletonMap = new Map();

				if ( 'Deformer' in FBXTree.Objects.subNodes ) {

					var DeformerNodes = FBXTree.Objects.subNodes.Deformer;
					for ( var nodeID in DeformerNodes ) {

						var deformerNode = DeformerNodes[ nodeID ];
						if ( deformerNode.attrType === 'Skin' ) {

							var conns = connections.get( parseInt( nodeID ) );
							var skeleton = parseSkeleton( conns, DeformerNodes );
							skeleton.FBX_ID = parseInt( nodeID );
							skeletonMap.set( parseInt( nodeID ), skeleton );

						}

					}

				}

				return skeletonMap;

				/**
				 * Generates a "Skeleton Representation" of FBX nodes based on an FBX Skin Deformer's connections and an object containing SubDeformer nodes.
				 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} connections
				 * @param {Object.<number, FBXSubDeformerNode>} DeformerNodes
				 * @returns {{map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: THREE.Skeleton|null}}
				 */
				function parseSkeleton( connections, DeformerNodes ) {

					var subDeformers = new Map();
					var subDeformerArray = [];
					for ( var childrenIndex = 0, childrenLength = connections.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

						var child = connections.children[ childrenIndex ];

						var subDeformerNode = DeformerNodes[ child.ID ];
						var subDeformer = {
							FBX_ID: child.ID,
							indices: [],
							weights: [],
							transform: parseMatrixArray( subDeformerNode.subNodes.Transform.properties.a ),
							transformLink: parseMatrixArray( subDeformerNode.subNodes.TransformLink.properties.a ),
							linkMode: subDeformerNode.properties.Mode
						};
						if ( 'Indexes' in subDeformerNode.subNodes ) {

							subDeformer.indices = parseIntArray( subDeformerNode.subNodes.Indexes.properties.a );
							subDeformer.weights = parseFloatArray( subDeformerNode.subNodes.Weights.properties.a );

						}
						subDeformers.set( child.ID, subDeformer );
						subDeformerArray.push( subDeformer );

					}

					return {
						map: subDeformers,
						array: subDeformerArray,
						bones: []
					};

				}

			}

			/**
			 * Generates Buffer geometries from geometry information in FBXTree, and generates map of THREE.BufferGeometries
			 * @param {{Objects: {subNodes: {Geometry: Object.<number, FBXGeometryNode}}}} FBXTree
			 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
			 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: THREE.Skeleton|null}>} deformerMap
			 * @returns {Map<number, THREE.BufferGeometry>}
			 */
			function parseGeometries( FBXTree, connections, deformerMap ) {

				var geometryMap = new Map();

				if ( 'Geometry' in FBXTree.Objects.subNodes ) {

					var geometryNodes = FBXTree.Objects.subNodes.Geometry;
					for ( var nodeID in geometryNodes ) {

						var relationships = connections.get( parseInt( nodeID ) );
						var geo = parseGeometry( geometryNodes[ nodeID ], relationships, deformerMap );
						geometryMap.set( parseInt( nodeID ), geo );

					}

				}

				return geometryMap;

				/**
				 * Generates BufferGeometry from FBXGeometryNode.
				 * @param {FBXGeometryNode} geometryNode
				 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} relationships
				 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[]}>} deformerMap
				 * @returns {THREE.BufferGeometry}
				 */
				function parseGeometry( geometryNode, relationships, deformerMap ) {

					switch ( geometryNode.attrType ) {

						case 'Mesh':
							return parseMeshGeometry( geometryNode, relationships, deformerMap );
							break;

						case 'NurbsCurve':
							return parseNurbsGeometry( geometryNode, relationships, deformerMap );
							break;

					}

					/**
					 * Specialty function for parsing Mesh based Geometry Nodes.
					 * @param {FBXGeometryNode} geometryNode
					 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} relationships - Object representing relationships between specific geometry node and other nodes.
					 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[]}>} deformerMap - Map object of deformers and subDeformers by ID.
					 * @returns {THREE.BufferGeometry}
					 */
					function parseMeshGeometry( geometryNode, relationships, deformerMap ) {

						var FBX_ID = geometryNode.id;
						var name = geometryNode.attrName;
						for ( var i = 0; i < relationships.children.length; ++ i ) {

							if ( deformerMap.has( relationships.children[ i ].ID ) ) {

								var deformer = deformerMap.get( relationships.children[ i ].ID );
								break;

							}

						}

						var geometry = genGeometry( geometryNode, deformer );

						return geometry;

						/**
						 * @param {{map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[]}} deformer - Skeleton representation for geometry instance.
						 * @returns {THREE.BufferGeometry}
						 */
						function genGeometry( geometryNode, deformer ) {

							var geometry = new Geometry();

							//First, each index is going to be its own vertex.
							var vertexBuffer = parseFloatArray( geometryNode.subNodes.Vertices.properties.a );
							var indexBuffer = parseIntArray( geometryNode.subNodes.PolygonVertexIndex.properties.a );

							if ( 'LayerElementNormal' in geometryNode.subNodes ) {

								var normalInfo = getNormals( geometryNode );

							}

							if ( 'LayerElementUV' in geometryNode.subNodes ) {

								var uvInfo = getUVs( geometryNode );

							}

							if ( 'LayerElementMaterial' in geometryNode.subNodes ) {

								var materialInfo = getMaterials( geometryNode );

							}

							var faceVertexBuffer = [];
							var polygonIndex = 0;
							indexBuffer.forEach( function ( vertexIndex, polygonVertexIndex, indexBuffer ) {

								var endOfFace = false;
								if ( vertexIndex < 0 ) {

									vertexIndex = vertexIndex ^ - 1;
									indexBuffer[ polygonVertexIndex ] = vertexIndex;
									endOfFace = true;

								}
								var vertex = new Vertex();
								var weightIndices = [];
								var weights = [];
								vertex.position.fromArray( vertexBuffer, vertexIndex * 3 );

								if ( deformer ) {

									deformer.array.forEach( function ( subDeformer, subDeformerIndex ) {

										var index = subDeformer.indices.findIndex( function ( indx ) {

											return indx === vertexIndex;

										} );

										if ( index !== - 1 ) {

											weights.push( subDeformer.weights[ index ] );
											weightIndices.push( subDeformerIndex );

										}

									} );

									if ( weights.length > 4 ) {

										console.warn( 'FBXLoader: Vertex has more than 4 skinning weights assigned to vertex.  Deleting additional weights.' );

										var WIndex = [ 0, 0, 0, 0 ];
										var Weight = [ 0, 0, 0, 0 ];

										weights.forEach( function ( weight, weightIndex ) {

											var currentWeight = weight;
											var currentIndex = weightIndices[ weightIndex ];
											Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

												if ( currentWeight > comparedWeight ) {

													comparedWeightArray[ comparedWeightIndex ] = currentWeight;
													currentWeight = comparedWeight;

													var tmp = WIndex[ comparedWeightIndex ];
													WIndex[ comparedWeightIndex ] = currentIndex;
													currentIndex = tmp;

												}

											} );

										} );

										weightIndices = WIndex;
										weights = Weight;

									}

									for ( var i = weights.length; i < 4; ++ i ) {

										weights[ i ] = 0;
										weightIndices[ i ] = 0;

									}

									vertex.skinWeights.fromArray( weights );
									vertex.skinIndices.fromArray( weightIndices );

								}

								if ( normalInfo ) {

									vertex.normal.fromArray( getData( polygonVertexIndex, polygonIndex, vertexIndex, normalInfo ) );

								}

								if ( uvInfo ) {

									vertex.uv.fromArray( getData( polygonVertexIndex, polygonIndex, vertexIndex, uvInfo ) );

								}

								faceVertexBuffer.push( vertex );

								if ( endOfFace ) {

									var face = new Face();
									var materials = getData( polygonVertexIndex, polygonIndex, vertexIndex, materialInfo );
									face.genTrianglesFromVertices( faceVertexBuffer );
									face.materialIndex = materials[ 0 ];
									geometry.faces.push( face );
									faceVertexBuffer = [];
									polygonIndex ++;
									endOfFace = false;

								}

							} );

							/**
							 * @type {{vertexBuffer: number[], normalBuffer: number[], uvBuffer: number[], skinIndexBuffer: number[], skinWeightBuffer: number[], materialIndexBuffer: number[]}}
							 */
							var bufferInfo = geometry.flattenToBuffers();

							var geo = new THREE.BufferGeometry();
							geo.name = geometryNode.name;
							geo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( bufferInfo.vertexBuffer ), 3 ) );

							if ( bufferInfo.normalBuffer.length > 0 ) {

								geo.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( bufferInfo.normalBuffer ), 3 ) );

							}
							if ( bufferInfo.uvBuffer.length > 0 ) {

								geo.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( bufferInfo.uvBuffer ), 2 ) );

							}

							if ( deformer ) {

								geo.addAttribute( 'skinIndex', new THREE.BufferAttribute( new Float32Array( bufferInfo.skinIndexBuffer ), 4 ) );

								geo.addAttribute( 'skinWeight', new THREE.BufferAttribute( new Float32Array( bufferInfo.skinWeightBuffer ), 4 ) );

								geo.FBX_Deformer = deformer;

							}

							// Convert the material indices of each vertex into rendering groups on the geometry.
							var prevMaterialIndex = bufferInfo.materialIndexBuffer[ 0 ];
							var startIndex = 0;
							for ( var materialBufferIndex = 0; materialBufferIndex < bufferInfo.materialIndexBuffer.length; ++ materialBufferIndex ) {

								if ( bufferInfo.materialIndexBuffer[ materialBufferIndex ] !== prevMaterialIndex ) {

									geo.addGroup( startIndex, materialBufferIndex - startIndex, prevMaterialIndex );
									startIndex = materialBufferIndex;
									prevMaterialIndex = bufferInfo.materialIndexBuffer[ materialBufferIndex ];

								}

							}

							return geo;

							/**
							 * Parses normal information for geometry.
							 * @param {FBXGeometryNode} geometryNode
							 * @returns {{dataSize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}}
							 */
							function getNormals( geometryNode ) {

								var NormalNode = geometryNode.subNodes.LayerElementNormal[ 0 ];

								var mappingType = NormalNode.properties.MappingInformationType;
								var referenceType = NormalNode.properties.ReferenceInformationType;
								var buffer = parseFloatArray( NormalNode.subNodes.Normals.properties.a );
								var indexBuffer = [];
								if ( referenceType === 'IndexToDirect' ) {

									indexBuffer = parseIntArray( NormalNode.subNodes.NormalIndex.properties.a );

								}

								return {
									dataSize: 3,
									buffer: buffer,
									indices: indexBuffer,
									mappingType: mappingType,
									referenceType: referenceType
								};

							}

							/**
							 * Parses UV information for geometry.
							 * @param {FBXGeometryNode} geometryNode
							 * @returns {{dataSize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}}
							 */
							function getUVs( geometryNode ) {

								var UVNode = geometryNode.subNodes.LayerElementUV[ 0 ];

								var mappingType = UVNode.properties.MappingInformationType;
								var referenceType = UVNode.properties.ReferenceInformationType;
								var buffer = parseFloatArray( UVNode.subNodes.UV.properties.a );
								var indexBuffer = [];
								if ( referenceType === 'IndexToDirect' ) {

									indexBuffer = parseIntArray( UVNode.subNodes.UVIndex.properties.a );

								}

								return {
									dataSize: 2,
									buffer: buffer,
									indices: indexBuffer,
									mappingType: mappingType,
									referenceType: referenceType
								};

							}

							/**
							 * Parses material application information for geometry.
							 * @param {FBXGeometryNode}
							 * @returns {{dataSize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}}
							 */
							function getMaterials( geometryNode ) {

								var MaterialNode = geometryNode.subNodes.LayerElementMaterial[ 0 ];
								var mappingType = MaterialNode.properties.MappingInformationType;
								var referenceType = MaterialNode.properties.ReferenceInformationType;
								var materialIndexBuffer = parseIntArray( MaterialNode.subNodes.Materials.properties.a );

								// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
								// we expect.  So we create an intermediate buffer that points to the index in the buffer,
								// for conforming with the other functions we've written for other data.
								var materialIndices = [];
								for ( var materialIndexBufferIndex = 0, materialIndexBufferLength = materialIndexBuffer.length; materialIndexBufferIndex < materialIndexBufferLength; ++ materialIndexBufferIndex ) {

									materialIndices.push( materialIndexBufferIndex );

								}

								return {
									dataSize: 1,
									buffer: materialIndexBuffer,
									indices: materialIndices,
									mappingType: mappingType,
									referenceType: referenceType
								};

							}

							/**
							 * Function uses the infoObject and given indices to return value array of object.
							 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
							 * @param {number} polygonIndex - Index of polygon in geometry.
							 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
							 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
							 * @returns {number[]}
							 */
							function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

								var GetData = {

									ByPolygonVertex: {

										/**
										 * Function uses the infoObject and given indices to return value array of object.
										 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
										 * @param {number} polygonIndex - Index of polygon in geometry.
										 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
										 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
										 * @returns {number[]}
										 */
										Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

											return infoObject.buffer.slice( ( polygonVertexIndex * infoObject.dataSize ), ( polygonVertexIndex * infoObject.dataSize ) + infoObject.dataSize );

										},

										/**
										 * Function uses the infoObject and given indices to return value array of object.
										 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
										 * @param {number} polygonIndex - Index of polygon in geometry.
										 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
										 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
										 * @returns {number[]}
										 */
										IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

											var index = infoObject.indices[ polygonVertexIndex ];
											return infoObject.buffer.slice( ( index * infoObject.dataSize ), ( index * infoObject.dataSize ) + infoObject.dataSize );

										}

									},

									ByPolygon: {

										/**
										 * Function uses the infoObject and given indices to return value array of object.
										 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
										 * @param {number} polygonIndex - Index of polygon in geometry.
										 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
										 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
										 * @returns {number[]}
										 */
										Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

											return infoObject.buffer.slice( polygonIndex * infoObject.dataSize, polygonIndex * infoObject.dataSize + infoObject.dataSize );

										},

										/**
										 * Function uses the infoObject and given indices to return value array of object.
										 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
										 * @param {number} polygonIndex - Index of polygon in geometry.
										 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
										 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
										 * @returns {number[]}
										 */
										IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

											var index = infoObject.indices[ polygonIndex ];
											return infoObject.buffer.slice( index * infoObject.dataSize, index * infoObject.dataSize + infoObject.dataSize );

										}

									},

									AllSame: {

										/**
										 * Function uses the infoObject and given indices to return value array of object.
										 * @param {number} polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
										 * @param {number} polygonIndex - Index of polygon in geometry.
										 * @param {number} vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
										 * @param {{datasize: number, buffer: number[], indices: number[], mappingType: string, referenceType: string}} infoObject - Object containing data and how to access data.
										 * @returns {number[]}
										 */
										IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

											return infoObject.buffer.slice( infoObject.indices[ 0 ] * infoObject.dataSize, infoObject.indices[ 0 ] * infoObject.dataSize + infoObject.dataSize );

										}

									}

								};

								return GetData[ infoObject.mappingType ][ infoObject.referenceType ]( polygonVertexIndex, polygonIndex, vertexIndex, infoObject );

							}

						}

					}

					/**
					 * Specialty function for parsing NurbsCurve based Geometry Nodes.
					 * @param {FBXGeometryNode} geometryNode
					 * @param {{parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}} relationships
					 * @returns {THREE.BufferGeometry}
					 */
					function parseNurbsGeometry( geometryNode, relationships ) {

						if ( THREE.NURBSCurve === undefined ) {

							console.error( "THREE.FBXLoader relies on THREE.NURBSCurve for any nurbs present in the model.  Nurbs will show up as empty geometry." );
							return new THREE.BufferGeometry();

						}

						var order = parseInt( geometryNode.properties.Order );

						if ( isNaN( order ) ) {

							console.error( "FBXLoader: Invalid Order " + geometryNode.properties.Order + " given for geometry ID: " + geometryNode.id );
							return new THREE.BufferGeometry();

						}

						var knots = parseFloatArray( geometryNode.subNodes.KnotVector.properties.a );
						var controlPoints = [];
						var pointsValues = parseFloatArray( geometryNode.subNodes.Points.properties.a );

						for ( var i = 0; i < pointsValues.length; i += 4 ) {

							controlPoints.push( new THREE.Vector4( pointsValues[ i ], pointsValues[ i + 1 ], pointsValues[ i + 2 ], pointsValues[ i + 3 ] ) );

						}

						if ( geometryNode.properties.Form === 'Closed' ) {

							controlPoints.push( controlPoints[ 0 ] );

						}

						var curve = new THREE.NURBSCurve( order - 1, knots, controlPoints );
						var vertices = curve.getPoints( controlPoints.length * 1.5 );

						var vertexBuffer = [];
						for ( var verticesIndex = 0, verticesLength = vertices.length; verticesIndex < verticesLength; ++ verticesIndex ) {

							var position = vertices[ verticesIndex ];

							var array = position.toArray();
							vertexBuffer = vertexBuffer.concat( array );

						}

						var geometry = new THREE.BufferGeometry();
						geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertexBuffer ), 3 ) );

						return geometry;

					}

				}

			}

			/**
			 * Finally generates Scene graph and Scene graph Objects.
			 * @param {{Objects: {subNodes: {Model: Object.<number, FBXModelNode>}}}} FBXTree
			 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
			 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: THREE.Skeleton|null}>} deformerMap
			 * @param {Map<number, THREE.BufferGeometry>} geometryMap
			 * @param {Map<number, THREE.Material>} materialMap
			 * @returns {THREE.Group}
			 */
			function parseScene( FBXTree, connections, deformerMap, geometryMap, materialMap ) {

				var sceneGraph = new THREE.Group();

				var ModelNode = FBXTree.Objects.subNodes.Model;

				/**
				 * @type {Array.<THREE.Object3D>}
				 */
				var modelArray = [];

				/**
				 * @type {Map.<number, THREE.Object3D>}
				 */
				var modelMap = new Map();

				for ( var nodeID in ModelNode ) {

					var id = parseInt( nodeID );
					var node = ModelNode[ nodeID ];
					var conns = connections.get( id );
					var model = null;
					for ( var i = 0; i < conns.parents.length; ++ i ) {

						deformerMap.forEach( function ( deformer ) {

							if ( deformer.map.has( conns.parents[ i ].ID ) ) {

								model = new THREE.Bone();
								var index = deformer.array.findIndex( function ( subDeformer ) {

									return subDeformer.FBX_ID === conns.parents[ i ].ID;

								} );
								deformer.bones[ index ] = model;

							}

						} );

					}
					if ( ! model ) {

						switch ( node.attrType ) {

							case "Mesh":
								/**
								 * @type {?THREE.BufferGeometry}
								 */
								var geometry = null;

								/**
								 * @type {THREE.MultiMaterial|THREE.Material}
								 */
								var material = null;

								/**
								 * @type {Array.<THREE.Material>}
								 */
								var materials = [];

								for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

									var child = conns.children[ childrenIndex ];

									if ( geometryMap.has( child.ID ) ) {

										geometry = geometryMap.get( child.ID );

									}

									if ( materialMap.has( child.ID ) ) {

										materials.push( materialMap.get( child.ID ) );

									}

								}
								if ( materials.length > 1 ) {

									material = new THREE.MultiMaterial( materials );

								} else if ( materials.length > 0 ) {

									material = materials[ 0 ];

								} else {

									material = new THREE.MeshBasicMaterial( { color: 0x3300ff } );

								}
								if ( geometry.FBX_Deformer ) {

									for ( var materialsIndex = 0, materialsLength = materials.length; materialsIndex < materialsLength; ++ materialsIndex ) {

										var material = materials[ materialsIndex ];

										material.skinning = true;

									}
									material.skinning = true;
									model = new THREE.SkinnedMesh( geometry, material );

								} else {

									model = new THREE.Mesh( geometry, material );

								}
								break;

							case "NurbsCurve":
								var geometry = null;

								for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

									var child = conns.children[ childrenIndex ];

									if ( geometryMap.has( child.ID ) ) {

										geometry = geometryMap.get( child.ID );

									}

								}

								// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
								material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 5 } );
								model = new THREE.Line( geometry, material );
								break;

							default:
								model = new THREE.Object3D();
								break;

						}

					}

					model.name = node.attrName.replace( /:/, '' ).replace( /_/, '' ).replace( /-/, '' );
					model.FBX_ID = id;

					modelArray.push( model );
					modelMap.set( id, model );

				}

				for ( var modelArrayIndex = 0, modelArrayLength = modelArray.length; modelArrayIndex < modelArrayLength; ++ modelArrayIndex ) {

					var model = modelArray[ modelArrayIndex ];

					var node = ModelNode[ model.FBX_ID ];

					if ( 'Lcl_Translation' in node.properties ) {

						model.position.fromArray( parseFloatArray( node.properties.Lcl_Translation.value ) );

					}

					if ( 'Lcl_Rotation' in node.properties ) {

						var rotation = parseFloatArray( node.properties.Lcl_Rotation.value ).map( function ( value ) {

							return value * Math.PI / 180;

						} );
						rotation.push( 'ZYX' );
						model.rotation.fromArray( rotation );

					}

					if ( 'Lcl_Scaling' in node.properties ) {

						model.scale.fromArray( parseFloatArray( node.properties.Lcl_Scaling.value ) );

					}

					var conns = connections.get( model.FBX_ID );
					for ( var parentIndex = 0; parentIndex < conns.parents.length; parentIndex ++ ) {

						var pIndex = modelArray.findIndex( function ( mod ) {

							return mod.FBX_ID === conns.parents[ parentIndex ].ID;

						} );
						if ( pIndex > - 1 ) {

							modelArray[ pIndex ].add( model );
							break;

						}

					}
					if ( model.parent === null ) {

						sceneGraph.add( model );

					}

				}


				// Now with the bones created, we can update the skeletons and bind them to the skinned meshes.
				sceneGraph.updateMatrixWorld( true );

				// Put skeleton into bind pose.
				var BindPoseNode = FBXTree.Objects.subNodes.Pose;
				for ( var nodeID in BindPoseNode ) {

					if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

						BindPoseNode = BindPoseNode[ nodeID ];
						break;

					}

				}
				if ( BindPoseNode ) {

					var PoseNode = BindPoseNode.subNodes.PoseNode;
					var worldMatrices = new Map();

					for ( var PoseNodeIndex = 0, PoseNodeLength = PoseNode.length; PoseNodeIndex < PoseNodeLength; ++ PoseNodeIndex ) {

						var node = PoseNode[ PoseNodeIndex ];

						var rawMatWrd = parseMatrixArray( node.subNodes.Matrix.properties.a );

						worldMatrices.set( parseInt( node.id ), rawMatWrd );

					}

				}

				deformerMap.forEach( function ( deformer, FBX_ID ) {

					for ( var deformerArrayIndex = 0, deformerArrayLength = deformer.array.length; deformerArrayIndex < deformerArrayLength; ++ deformerArrayIndex ) {

						//var subDeformer = deformer.array[ deformerArrayIndex ];
						var subDeformerIndex = deformerArrayIndex;

						/**
						 * @type {THREE.Bone}
						 */
						var bone = deformer.bones[ subDeformerIndex ];
						if ( ! worldMatrices.has( bone.FBX_ID ) ) {

							break;

						}
						var mat = worldMatrices.get( bone.FBX_ID );
						bone.matrixWorld.copy( mat );

					}

					// Now that skeleton is in bind pose, bind to model.
					deformer.skeleton = new THREE.Skeleton( deformer.bones );
					var conns = connections.get( FBX_ID );
					for ( var parentsIndex = 0, parentsLength = conns.parents.length; parentsIndex < parentsLength; ++ parentsIndex ) {

						var parent = conns.parents[ parentsIndex ];

						if ( geometryMap.has( parent.ID ) ) {

							var geoID = parent.ID;
							var geoConns = connections.get( geoID );
							for ( var i = 0; i < geoConns.parents.length; ++ i ) {

								if ( modelMap.has( geoConns.parents[ i ].ID ) ) {

									var model = modelMap.get( geoConns.parents[ i ].ID );
									//ASSERT model typeof SkinnedMesh
									model.bind( deformer.skeleton, model.matrixWorld );
									break;

								}

							}

						}

					}

				} );

				// Skeleton is now bound, we are now free to set up the
				// scene graph.
				for ( var modelArrayIndex = 0, modelArrayLength = modelArray.length; modelArrayIndex < modelArrayLength; ++ modelArrayIndex ) {

					var model = modelArray[ modelArrayIndex ];

					var node = ModelNode[ model.FBX_ID ];

					if ( 'Lcl_Translation' in node.properties ) {

						model.position.fromArray( parseFloatArray( node.properties.Lcl_Translation.value ) );

					}

					if ( 'Lcl_Rotation' in node.properties ) {

						var rotation = parseFloatArray( node.properties.Lcl_Rotation.value ).map( function ( value ) {

							return value * Math.PI / 180;

						} );
						rotation.push( 'ZYX' );
						model.rotation.fromArray( rotation );

					}

					if ( 'Lcl_Scaling' in node.properties ) {

						model.scale.fromArray( parseFloatArray( node.properties.Lcl_Scaling.value ) );

					}

				}

				// Silly hack with the animation parsing.  We're gonna pretend the scene graph has a skeleton
				// to attach animations to, since FBXs treat animations as animations for the entire scene,
				// not just for individual objects.
				sceneGraph.skeleton = {
					bones: modelArray
				};

				var animations = parseAnimations( FBXTree, connections, sceneGraph );

				addAnimations( sceneGraph, animations );

				return sceneGraph;

			}

			/**
			 * Parses animation information from FBXTree and generates an AnimationInfoObject.
			 * @param {{Objects: {subNodes: {AnimationCurveNode: any, AnimationCurve: any, AnimationLayer: any, AnimationStack: any}}}} FBXTree
			 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
			 */
			function parseAnimations( FBXTree, connections, sceneGraph ) {

				var rawNodes = FBXTree.Objects.subNodes.AnimationCurveNode;
				var rawCurves = FBXTree.Objects.subNodes.AnimationCurve;
				var rawLayers = FBXTree.Objects.subNodes.AnimationLayer;
				var rawStacks = FBXTree.Objects.subNodes.AnimationStack;

				/**
				 * @type {{
				     curves: Map<number, {
						 T: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							};
						},
						 R: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							};
						},
						 S: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							};
						}
					 }>,
					 layers: Map<number, {
					 	T: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							},
						},
						R: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							},
						},
						S: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							},
						}
						}[]>,
					 stacks: Map<number, {
						 name: string,
						 layers: {
							T: {
								id: number;
								attr: string;
								internalID: number;
								attrX: boolean;
								attrY: boolean;
								attrZ: boolean;
								containerBoneID: number;
								containerID: number;
								curves: {
									x: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
									y: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
									z: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
								};
							};
							R: {
								id: number;
								attr: string;
								internalID: number;
								attrX: boolean;
								attrY: boolean;
								attrZ: boolean;
								containerBoneID: number;
								containerID: number;
								curves: {
									x: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
									y: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
									z: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
								};
							};
							S: {
								id: number;
								attr: string;
								internalID: number;
								attrX: boolean;
								attrY: boolean;
								attrZ: boolean;
								containerBoneID: number;
								containerID: number;
								curves: {
									x: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
									y: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
									z: {
										version: any;
										id: number;
										internalID: number;
										times: number[];
										values: number[];
										attrFlag: number[];
										attrData: number[];
									};
								};
							};
						}[][],
					 length: number,
					 frames: number }>,
					 length: number,
					 fps: number,
					 frames: number
				 }}
				 */
				var returnObject = {
					curves: new Map(),
					layers: new Map(),
					stacks: new Map(),
					length: 0,
					fps: 30,
					frames: 0
				};

				/**
				 * @type {Array.<{
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
					}>}
				 */
				var animationCurveNodes = [];
				for ( var nodeID in rawNodes ) {

					if ( nodeID.match( /\d+/ ) ) {

						var animationNode = parseAnimationNode( FBXTree, rawNodes[ nodeID ], connections, sceneGraph );
						animationCurveNodes.push( animationNode );

					}

				}

				/**
				 * @type {Map.<number, {
						id: number,
						attr: string,
						internalID: number,
						attrX: boolean,
						attrY: boolean,
						attrZ: boolean,
						containerBoneID: number,
						containerID: number,
						curves: {
							x: {
								version: any,
								id: number,
								internalID: number,
								times: number[],
								values: number[],
								attrFlag: number[],
								attrData: number[],
							},
							y: {
								version: any,
								id: number,
								internalID: number,
								times: number[],
								values: number[],
								attrFlag: number[],
								attrData: number[],
							},
							z: {
								version: any,
								id: number,
								internalID: number,
								times: number[],
								values: number[],
								attrFlag: number[],
								attrData: number[],
							}
						}
					}>}
				 */
				var tmpMap = new Map();
				for ( var animationCurveNodeIndex = 0; animationCurveNodeIndex < animationCurveNodes.length; ++ animationCurveNodeIndex ) {

					if ( animationCurveNodes[ animationCurveNodeIndex ] === null ) {

						continue;

					}
					tmpMap.set( animationCurveNodes[ animationCurveNodeIndex ].id, animationCurveNodes[ animationCurveNodeIndex ] );

				}


				/**
				 * @type {{
						version: any,
						id: number,
						internalID: number,
						times: number[],
						values: number[],
						attrFlag: number[],
						attrData: number[],
					}[]}
				 */
				var animationCurves = [];
				for ( nodeID in rawCurves ) {

					if ( nodeID.match( /\d+/ ) ) {

						var animationCurve = parseAnimationCurve( rawCurves[ nodeID ] );
						animationCurves.push( animationCurve );

						var firstParentConn = connections.get( animationCurve.id ).parents[ 0 ];
						var firstParentID = firstParentConn.ID;
						var firstParentRelationship = firstParentConn.relationship;
						var axis = '';

						if ( firstParentRelationship.match( /X/ ) ) {

							axis = 'x';

						} else if ( firstParentRelationship.match( /Y/ ) ) {

							axis = 'y';

						} else if ( firstParentRelationship.match( /Z/ ) ) {

							axis = 'z';

						} else {

							continue;

						}

						tmpMap.get( firstParentID ).curves[ axis ] = animationCurve;

					}

				}

				tmpMap.forEach( function ( curveNode ) {

					var id = curveNode.containerBoneID;
					if ( ! returnObject.curves.has( id ) ) {

						returnObject.curves.set( id, { T: null, R: null, S: null } );

					}
					returnObject.curves.get( id )[ curveNode.attr ] = curveNode;

				} );

				for ( var nodeID in rawLayers ) {

					/**
					 * @type {{
					 	T: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							},
						},
						R: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							},
						},
						S: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							},
						}
						}[]}
					 */
					var layer = [];
					var children = connections.get( parseInt( nodeID ) ).children;
					for ( var childIndex = 0; childIndex < children.length; childIndex ++ ) {

						// Skip lockInfluenceWeights
						if ( tmpMap.has( children[ childIndex ].ID ) ) {

							var curveNode = tmpMap.get( children[ childIndex ].ID );
							var boneID = curveNode.containerBoneID;
							if ( layer[ boneID ] === undefined ) {

								layer[ boneID ] = {
									T: null,
									R: null,
									S: null
								};

							}

							layer[ boneID ][ curveNode.attr ] = curveNode;

						}

					}

					returnObject.layers.set( parseInt( nodeID ), layer );

				}

				for ( var nodeID in rawStacks ) {

					var layers = [];
					var children = connections.get( parseInt( nodeID ) ).children;
					var maxTimeStamp = 0;
					var minTimeStamp = Number.MAX_VALUE;
					for ( var childIndex = 0; childIndex < children.length; ++ childIndex ) {

						if ( returnObject.layers.has( children[ childIndex ].ID ) ) {

							var currentLayer = returnObject.layers.get( children[ childIndex ].ID );
							layers.push( currentLayer );

							for ( var currentLayerIndex = 0, currentLayerLength = currentLayer.length; currentLayerIndex < currentLayerLength; ++ currentLayerIndex ) {

								var layer = currentLayer[ currentLayerIndex ];

								if ( layer ) {

									getCurveNodeMaxMinTimeStamps( layer );

								}

								/**
								 * Sets the maxTimeStamp and minTimeStamp variables if it has timeStamps that are either larger or smaller
								 * than the max or min respectively.
								 * @param {{
											T: {
													id: number,
													attr: string,
													internalID: number,
													attrX: boolean,
													attrY: boolean,
													attrZ: boolean,
													containerBoneID: number,
													containerID: number,
													curves: {
															x: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
															y: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
															z: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
													},
											},
											R: {
													id: number,
													attr: string,
													internalID: number,
													attrX: boolean,
													attrY: boolean,
													attrZ: boolean,
													containerBoneID: number,
													containerID: number,
													curves: {
															x: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
															y: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
															z: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
													},
											},
											S: {
													id: number,
													attr: string,
													internalID: number,
													attrX: boolean,
													attrY: boolean,
													attrZ: boolean,
													containerBoneID: number,
													containerID: number,
													curves: {
															x: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
															y: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
															z: {
																	version: any,
																	id: number,
																	internalID: number,
																	times: number[],
																	values: number[],
																	attrFlag: number[],
																	attrData: number[],
															},
													},
											},
									}} layer
								 */
								function getCurveNodeMaxMinTimeStamps( layer ) {

									/**
									 * Sets the maxTimeStamp and minTimeStamp if one of the curve's time stamps
									 * exceeds the maximum or minimum.
									 * @param {{
												x: {
														version: any,
														id: number,
														internalID: number,
														times: number[],
														values: number[],
														attrFlag: number[],
														attrData: number[],
												},
												y: {
														version: any,
														id: number,
														internalID: number,
														times: number[],
														values: number[],
														attrFlag: number[],
														attrData: number[],
												},
												z: {
														version: any,
														id: number,
														internalID: number,
														times: number[],
														values: number[],
														attrFlag: number[],
														attrData: number[],
												}
										}} curve
									 */
									function getCurveMaxMinTimeStamp( curve ) {

										/**
										 * Sets the maxTimeStamp and minTimeStamp if one of its timestamps exceeds the maximum or minimum.
										 * @param {{times: number[]}} axis
										 */
										function getCurveAxisMaxMinTimeStamps( axis ) {

											maxTimeStamp = axis.times[ axis.times.length - 1 ] > maxTimeStamp ? axis.times[ axis.times.length - 1 ] : maxTimeStamp;
											minTimeStamp = axis.times[ 0 ] < minTimeStamp ? axis.times[ 0 ] : minTimeStamp;

										}

										if ( curve.x ) {

											getCurveAxisMaxMinTimeStamps( curve.x );

										}
										if ( curve.y ) {

											getCurveAxisMaxMinTimeStamps( curve.y );

										}
										if ( curve.z ) {

											getCurveAxisMaxMinTimeStamps( curve.z );

										}

									}

									if ( layer.R ) {

										getCurveMaxMinTimeStamp( layer.R.curves );

									}
									if ( layer.S ) {

										getCurveMaxMinTimeStamp( layer.S.curves );

									}
									if ( layer.T ) {

										getCurveMaxMinTimeStamp( layer.T.curves );

									}

								}

							}

						}

					}

					// Do we have an animation clip with actual length?
					if ( maxTimeStamp > minTimeStamp ) {

						returnObject.stacks.set( parseInt( nodeID ), {
							name: rawStacks[ nodeID ].attrName,
							layers: layers,
							length: maxTimeStamp - minTimeStamp,
							frames: ( maxTimeStamp - minTimeStamp ) * 30
						} );

					}

				}

				return returnObject;

				/**
				 * @param {Object} FBXTree
				 * @param {{id: number, attrName: string, properties: Object<string, any>}} animationCurveNode
				 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
				 * @param {{skeleton: {bones: {FBX_ID: number}[]}}} sceneGraph
				 */
				function parseAnimationNode( FBXTree, animationCurveNode, connections, sceneGraph ) {

					var returnObject = {
						/**
						 * @type {number}
						 */
						id: animationCurveNode.id,

						/**
						 * @type {string}
						 */
						attr: animationCurveNode.attrName,

						/**
						 * @type {number}
						 */
						internalID: animationCurveNode.id,

						/**
						 * @type {boolean}
						 */
						attrX: false,

						/**
						 * @type {boolean}
						 */
						attrY: false,

						/**
						 * @type {boolean}
						 */
						attrZ: false,

						/**
						 * @type {number}
						 */
						containerBoneID: - 1,

						/**
						 * @type {number}
						 */
						containerID: - 1,

						curves: {
							x: null,
							y: null,
							z: null
						}
					};

					if ( returnObject.attr.match( /S|R|T/ ) ) {

						for ( var attributeKey in animationCurveNode.properties ) {

							if ( attributeKey.match( /X/ ) ) {

								returnObject.attrX = true;

							}
							if ( attributeKey.match( /Y/ ) ) {

								returnObject.attrY = true;

							}
							if ( attributeKey.match( /Z/ ) ) {

								returnObject.attrZ = true;

							}

						}

					} else {

						return null;

					}

					var conns = connections.get( returnObject.id );
					var containerIndices = conns.parents;

					for ( var containerIndicesIndex = containerIndices.length - 1; containerIndicesIndex >= 0; -- containerIndicesIndex ) {

						var boneID = sceneGraph.skeleton.bones.findIndex( function ( bone ) {

							return bone.FBX_ID === containerIndices[ containerIndicesIndex ].ID;

						} );
						if ( boneID > - 1 ) {

							returnObject.containerBoneID = boneID;
							returnObject.containerID = containerIndices[ containerIndicesIndex ].ID;
							break;

						}

					}

					return returnObject;

				}

				/**
				 * @param {{id: number, subNodes: {KeyTime: {properties: {a: string}}, KeyValueFloat: {properties: {a: string}}, KeyAttrFlags: {properties: {a: string}}, KeyAttrDataFloat: {properties: {a: string}}}}} animationCurve
				 */
				function parseAnimationCurve( animationCurve ) {

					return {
						version: null,
						id: animationCurve.id,
						internalID: animationCurve.id,
						times: parseFloatArray( animationCurve.subNodes.KeyTime.properties.a ).map( function ( time ) {

							return ConvertFBXTimeToSeconds( time );

						} ),
						values: parseFloatArray( animationCurve.subNodes.KeyValueFloat.properties.a ),

						attrFlag: parseIntArray( animationCurve.subNodes.KeyAttrFlags.properties.a ),
						attrData: parseFloatArray( animationCurve.subNodes.KeyAttrDataFloat.properties.a )
					};

				}

			}

			/**
			 * @param {{
				curves: Map<number, {
					T: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
					R: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
					S: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
				}>;
				layers: Map<number, {
					T: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
					R: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
					S: {
						id: number;
						attr: string;
						internalID: number;
						attrX: boolean;
						attrY: boolean;
						attrZ: boolean;
						containerBoneID: number;
						containerID: number;
						curves: {
							x: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							y: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
							z: {
								version: any;
								id: number;
								internalID: number;
								times: number[];
								values: number[];
								attrFlag: number[];
								attrData: number[];
							};
						};
					};
				}[]>;
				stacks: Map<number, {
					name: string;
					layers: {
						T: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							};
						};
						R: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							};
						};
						S: {
							id: number;
							attr: string;
							internalID: number;
							attrX: boolean;
							attrY: boolean;
							attrZ: boolean;
							containerBoneID: number;
							containerID: number;
							curves: {
								x: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								y: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
								z: {
									version: any;
									id: number;
									internalID: number;
									times: number[];
									values: number[];
									attrFlag: number[];
									attrData: number[];
								};
							};
						};
					}[][];
					length: number;
					frames: number;
				}>;
				length: number;
				fps: number;
				frames: number;
			}} animations,
			 * @param {{skeleton: { bones: THREE.Bone[]}}} group
			 */
			function addAnimations( group, animations ) {

				if ( group.animations === undefined ) {

					group.animations = [];

				}

				animations.stacks.forEach( function ( stack ) {

					/**
					 * @type {{
					 * name: string,
					 * fps: number,
					 * length: number,
					 * hierarchy: Array.<{
					 * 	parent: number,
					 * 	name: string,
					 * 	keys: Array.<{
					 * 		time: number,
					 * 		pos: Array.<number>,
					 * 		rot: Array.<number>,
					 * 		scl: Array.<number>
					 * 	}>
					 * }>
					 * }}
					 */
					var animationData = {
						name: stack.name,
						fps: 30,
						length: stack.length,
						hierarchy: []
					};

					var bones = group.skeleton.bones;

					for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

						var bone = bones[ bonesIndex ];

						var name = bone.name.replace( /.*:/, '' );
						var parentIndex = bones.findIndex( function ( parentBone ) {

							return bone.parent === parentBone;

						} );
						animationData.hierarchy.push( { parent: parentIndex, name: name, keys: [] } );

					}

					for ( var frame = 0; frame < stack.frames; frame ++ ) {

						for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

							var bone = bones[ bonesIndex ];
							var boneIndex = bonesIndex;

							var animationNode = stack.layers[ 0 ][ boneIndex ];

							for ( var hierarchyIndex = 0, hierarchyLength = animationData.hierarchy.length; hierarchyIndex < hierarchyLength; ++ hierarchyIndex ) {

								var node = animationData.hierarchy[ hierarchyIndex ];

								if ( node.name === bone.name ) {

									node.keys.push( generateKey( animationNode, bone, frame ) );

								}

							}

						}

					}

					group.animations.push( THREE.AnimationClip.parseAnimation( animationData, bones ) );


					/**
					 * @param {THREE.Bone} bone
					 */
					function generateKey( animationNode, bone, frame ) {

						var key = {
							time: frame / animations.fps,
							pos: bone.position.toArray(),
							rot: bone.quaternion.toArray(),
							scl: bone.scale.toArray()
						};

						if ( animationNode === undefined ) {

							return key;

						}

						try {

							if ( hasCurve( animationNode, 'T' ) && hasKeyOnFrame( animationNode.T, frame ) ) {

								key.pos = [ animationNode.T.curves.x.values[ frame ], animationNode.T.curves.y.values[ frame ], animationNode.T.curves.z.values[ frame ] ];

							}

							if ( hasCurve( animationNode, 'R' ) && hasKeyOnFrame( animationNode.R, frame ) ) {

								var rotationX = degreeToRadian( animationNode.R.curves.x.values[ frame ] );
								var rotationY = degreeToRadian( animationNode.R.curves.y.values[ frame ] );
								var rotationZ = degreeToRadian( animationNode.R.curves.z.values[ frame ] );
								var euler = new THREE.Euler( rotationX, rotationY, rotationZ, 'ZYX' );
								key.rot = new THREE.Quaternion().setFromEuler( euler ).toArray();

							}

							if ( hasCurve( animationNode, 'S' ) && hasKeyOnFrame( animationNode.S, frame ) ) {

								key.scl = [ animationNode.S.curves.x.values[ frame ], animationNode.S.curves.y.values[ frame ], animationNode.S.curves.z.values[ frame ] ];

							}

						} catch ( error ) {

							// Curve is not fully plotted.
							console.log( bone );
							console.log( error );

						}

						return key;

						function hasCurve( animationNode, attribute ) {

							if ( animationNode === undefined ) {

								return false;

							}

							var attributeNode = animationNode[ attribute ];
							if ( ! attributeNode ) {

								return false;

							}

							return [ 'x', 'y', 'z' ].every( function ( key ) {

								return attributeNode.curves[ key ] !== null;

							} );

						}

						function hasKeyOnFrame( attributeNode, frame ) {

							return [ 'x', 'y', 'z' ].every( function ( key ) {

								return isKeyExistOnFrame( attributeNode.curves[ key ], frame );

								function isKeyExistOnFrame( curve, frame ) {

									return curve.values[ frame ] !== undefined;

								}

							} );

						}

					}

				} );

			}



			// UTILS
			/**
			 * Parses Vector3 property from FBXTree.  Property is given as .value.x, .value.y, etc.
			 * @param {FBXVector3} property - Property to parse as Vector3.
			 * @returns {THREE.Vector3}
			 */
			function parseVector3( property ) {

				return new THREE.Vector3( parseFloat( property.value.x ), parseFloat( property.value.y ), parseFloat( property.value.z ) );

			}

			/**
			 * Parses Color property from FBXTree.  Property is given as .value.x, .value.y, etc.
			 * @param {FBXVector3} property - Property to parse as Color.
			 * @returns {THREE.Color}
			 */
			function parseColor( property ) {

				return new THREE.Color().fromArray( parseVector3( property ).toArray() );

			}

		}

	} );

	/**
	 * An instance of a Vertex with data for drawing vertices to the screen.
	 * @constructor
	 */
	function Vertex() {

		/**
		 * Position of the vertex.
		 * @type {THREE.Vector3}
		 */
		this.position = new THREE.Vector3( );

		/**
		 * Normal of the vertex
		 * @type {THREE.Vector3}
		 */
		this.normal = new THREE.Vector3( );

		/**
		 * UV coordinates of the vertex.
		 * @type {THREE.Vector2}
		 */
		this.uv = new THREE.Vector2( );

		/**
		 * Indices of the bones vertex is influenced by.
		 * @type {THREE.Vector4}
		 */
		this.skinIndices = new THREE.Vector4( 0, 0, 0, 0 );

		/**
		 * Weights that each bone influences the vertex.
		 * @type {THREE.Vector4}
		 */
		this.skinWeights = new THREE.Vector4( 0, 0, 0, 0 );

	}

	Object.assign( Vertex.prototype, {

		copy: function ( target ) {

			var returnVar = target || new Vertex();

			returnVar.position.copy( this.position );
			returnVar.normal.copy( this.normal );
			returnVar.uv.copy( this.uv );
			returnVar.skinIndices.copy( this.skinIndices );
			returnVar.skinWeights.copy( this.skinWeights );

			return returnVar;

		},

		flattenToBuffers: function () {

			var vertexBuffer = this.position.toArray();
			var normalBuffer = this.normal.toArray();
			var uvBuffer = this.uv.toArray();
			var skinIndexBuffer = this.skinIndices.toArray();
			var skinWeightBuffer = this.skinWeights.toArray();

			return {
				vertexBuffer: vertexBuffer,
				normalBuffer: normalBuffer,
				uvBuffer: uvBuffer,
				skinIndexBuffer: skinIndexBuffer,
				skinWeightBuffer: skinWeightBuffer,
			};

		}

	} );

	/**
	 * @constructor
	 */
	function Triangle() {

		/**
		 * @type {{position: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2, skinIndices: THREE.Vector4, skinWeights: THREE.Vector4}[]}
		 */
		this.vertices = [ ];

	}

	Object.assign( Triangle.prototype, {

		copy: function ( target ) {

			var returnVar = target || new Triangle();

			for ( var i = 0; i < this.vertices.length; ++ i ) {

				 this.vertices[ i ].copy( returnVar.vertices[ i ] );

			}

			return returnVar;

		},

		flattenToBuffers: function () {

			var vertexBuffer = [];
			var normalBuffer = [];
			var uvBuffer = [];
			var skinIndexBuffer = [];
			var skinWeightBuffer = [];

			for ( var verticesIndex = 0, verticesLength = this.vertices.length; verticesIndex < verticesLength; ++ verticesIndex ) {

				var vertex = this.vertices[ verticesIndex ];

				var flatVertex = vertex.flattenToBuffers();
				vertexBuffer = vertexBuffer.concat( flatVertex.vertexBuffer );
				normalBuffer = normalBuffer.concat( flatVertex.normalBuffer );
				uvBuffer = uvBuffer.concat( flatVertex.uvBuffer );
				skinIndexBuffer = skinIndexBuffer.concat( flatVertex.skinIndexBuffer );
				skinWeightBuffer = skinWeightBuffer.concat( flatVertex.skinWeightBuffer );

			}

			return {
				vertexBuffer: vertexBuffer,
				normalBuffer: normalBuffer,
				uvBuffer: uvBuffer,
				skinIndexBuffer: skinIndexBuffer,
				skinWeightBuffer: skinWeightBuffer,
			};

		}

	} );

	/**
	 * @constructor
	 */
	function Face() {

		/**
		 * @type {{vertices: {position: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2, skinIndices: THREE.Vector4, skinWeights: THREE.Vector4}[]}[]}
		 */
		this.triangles = [ ];
		this.materialIndex = 0;

	}

	Object.assign( Face.prototype, {

		copy: function ( target ) {

			var returnVar = target || new Face();

			for ( var i = 0; i < this.triangles.length; ++ i ) {

				this.triangles[ i ].copy( returnVar.triangles[ i ] );

			}

			returnVar.materialIndex = this.materialIndex;

			return returnVar;

		},

		genTrianglesFromVertices: function ( vertexArray ) {

			for ( var i = 2; i < vertexArray.length; ++ i ) {

				var triangle = new Triangle();
				triangle.vertices[ 0 ] = vertexArray[ 0 ];
				triangle.vertices[ 1 ] = vertexArray[ i - 1 ];
				triangle.vertices[ 2 ] = vertexArray[ i ];
				this.triangles.push( triangle );

			}

		},

		flattenToBuffers: function () {

			var vertexBuffer = [];
			var normalBuffer = [];
			var uvBuffer = [];
			var skinIndexBuffer = [];
			var skinWeightBuffer = [];

			var materialIndexBuffer = [];

			var materialIndex = this.materialIndex;

			for ( var triangleIndex = 0, triangleLength = this.triangles.length; triangleIndex < triangleLength; ++ triangleIndex ) {

				var triangle = this.triangles[ triangleIndex ];
				var flatTriangle = triangle.flattenToBuffers();
				vertexBuffer = vertexBuffer.concat( flatTriangle.vertexBuffer );
				normalBuffer = normalBuffer.concat( flatTriangle.normalBuffer );
				uvBuffer = uvBuffer.concat( flatTriangle.uvBuffer );
				skinIndexBuffer = skinIndexBuffer.concat( flatTriangle.skinIndexBuffer );
				skinWeightBuffer = skinWeightBuffer.concat( flatTriangle.skinWeightBuffer );
				materialIndexBuffer = materialIndexBuffer.concat( [ materialIndex, materialIndex, materialIndex ] );

			}

			return {
				vertexBuffer: vertexBuffer,
				normalBuffer: normalBuffer,
				uvBuffer: uvBuffer,
				skinIndexBuffer: skinIndexBuffer,
				skinWeightBuffer: skinWeightBuffer,
				materialIndexBuffer: materialIndexBuffer
			};

		}

	} );

	/**
	 * @constructor
	 */
	function Geometry() {

		/**
		 * @type {{triangles: {vertices: {position: THREE.Vector3, normal: THREE.Vector3, uv: THREE.Vector2, skinIndices: THREE.Vector4, skinWeights: THREE.Vector4}[]}[], materialIndex: number}[]}
		 */
		this.faces = [ ];

		/**
		 * @type {{}|THREE.Skeleton}
		 */
		this.skeleton = null;

	}

	Object.assign( Geometry.prototype, {

		/**
		 * @returns	{{vertexBuffer: number[], normalBuffer: number[], uvBuffer: number[], skinIndexBuffer: number[], skinWeightBuffer: number[], materialIndexBuffer: number[]}}
		 */
		flattenToBuffers: function () {

			var vertexBuffer = [];
			var normalBuffer = [];
			var uvBuffer = [];
			var skinIndexBuffer = [];
			var skinWeightBuffer = [];

			var materialIndexBuffer = [];

			for ( var faceIndex = 0, faceLength = this.faces.length; faceIndex < faceLength; ++ faceIndex ) {

				var face = this.faces[ faceIndex ];
				var flatFace = face.flattenToBuffers();
				vertexBuffer = vertexBuffer.concat( flatFace.vertexBuffer );
				normalBuffer = normalBuffer.concat( flatFace.normalBuffer );
				uvBuffer = uvBuffer.concat( flatFace.uvBuffer );
				skinIndexBuffer = skinIndexBuffer.concat( flatFace.skinIndexBuffer );
				skinWeightBuffer = skinWeightBuffer.concat( flatFace.skinWeightBuffer );
				materialIndexBuffer = materialIndexBuffer.concat( flatFace.materialIndexBuffer );

			}

			return {
				vertexBuffer: vertexBuffer,
				normalBuffer: normalBuffer,
				uvBuffer: uvBuffer,
				skinIndexBuffer: skinIndexBuffer,
				skinWeightBuffer: skinWeightBuffer,
				materialIndexBuffer: materialIndexBuffer
			};

		}

	} );

	function TextParser() {}

	Object.assign( TextParser.prototype, {

		getPrevNode: function () {

			return this.nodeStack[ this.currentIndent - 2 ];

		},

		getCurrentNode: function () {

			return this.nodeStack[ this.currentIndent - 1 ];

		},

		getCurrentProp: function () {

			return this.currentProp;

		},

		pushStack: function ( node ) {

			this.nodeStack.push( node );
			this.currentIndent += 1;

		},

		popStack: function () {

			this.nodeStack.pop();
			this.currentIndent -= 1;

		},

		setCurrentProp: function ( val, name ) {

			this.currentProp = val;
			this.currentPropName = name;

		},

		// ----------parse ---------------------------------------------------
		parse: function ( text ) {

			this.currentIndent = 0;
			this.allNodes = new FBXTree();
			this.nodeStack = [];
			this.currentProp = [];
			this.currentPropName = '';

			var split = text.split( "\n" );
			for ( var line in split ) {

				var l = split[ line ];

				// short cut
				if ( l.match( /^[\s\t]*;/ ) ) {

					continue;

				} // skip comment line
				if ( l.match( /^[\s\t]*$/ ) ) {

					continue;

				} // skip empty line

				// beginning of node
				var beginningOfNodeExp = new RegExp( "^\\t{" + this.currentIndent + "}(\\w+):(.*){", '' );
				var match = l.match( beginningOfNodeExp );
				if ( match ) {

					var nodeName = match[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, "" );
					var nodeAttrs = match[ 2 ].split( ',' ).map( function ( element ) {

						return element.trim().replace( /^"/, '' ).replace( /"$/, '' );

					} );

					this.parseNodeBegin( l, nodeName, nodeAttrs || null );
					continue;

				}

				// node's property
				var propExp = new RegExp( "^\\t{" + ( this.currentIndent ) + "}(\\w+):[\\s\\t\\r\\n](.*)" );
				var match = l.match( propExp );
				if ( match ) {

					var propName = match[ 1 ].replace( /^"/, '' ).replace( /"$/, "" ).trim();
					var propValue = match[ 2 ].replace( /^"/, '' ).replace( /"$/, "" ).trim();

					this.parseNodeProperty( l, propName, propValue );
					continue;

				}

				// end of node
				var endOfNodeExp = new RegExp( "^\\t{" + ( this.currentIndent - 1 ) + "}}" );
				if ( l.match( endOfNodeExp ) ) {

					this.nodeEnd();
					continue;

				}

				// for special case,
				//
				//	  Vertices: *8670 {
				//		  a: 0.0356229953467846,13.9599733352661,-0.399196773.....(snip)
				// -0.0612030513584614,13.960485458374,-0.409748703241348,-0.10.....
				// 0.12490539252758,13.7450733184814,-0.454119384288788,0.09272.....
				// 0.0836158767342567,13.5432004928589,-0.435397416353226,0.028.....
				//
				// these case the lines must contiue with previous line
				if ( l.match( /^[^\s\t}]/ ) ) {

					this.parseNodePropertyContinued( l );

				}

			}

			return this.allNodes;

		},

		parseNodeBegin: function ( line, nodeName, nodeAttrs ) {

			// var nodeName = match[1];
			var node = { 'name': nodeName, properties: {}, 'subNodes': {} };
			var attrs = this.parseNodeAttr( nodeAttrs );
			var currentNode = this.getCurrentNode();

			// a top node
			if ( this.currentIndent === 0 ) {

				this.allNodes.add( nodeName, node );

			} else {

				// a subnode

				// already exists subnode, then append it
				if ( nodeName in currentNode.subNodes ) {

					var tmp = currentNode.subNodes[ nodeName ];

					// console.log( "duped entry found\nkey: " + nodeName + "\nvalue: " + propValue );
					if ( this.isFlattenNode( currentNode.subNodes[ nodeName ] ) ) {


						if ( attrs.id === '' ) {

							currentNode.subNodes[ nodeName ] = [];
							currentNode.subNodes[ nodeName ].push( tmp );

						} else {

							currentNode.subNodes[ nodeName ] = {};
							currentNode.subNodes[ nodeName ][ tmp.id ] = tmp;

						}

					}

					if ( attrs.id === '' ) {

						currentNode.subNodes[ nodeName ].push( node );

					} else {

						currentNode.subNodes[ nodeName ][ attrs.id ] = node;

					}

				} else if ( typeof attrs.id === 'number' || attrs.id.match( /^\d+$/ ) ) {

					currentNode.subNodes[ nodeName ] = {};
					currentNode.subNodes[ nodeName ][ attrs.id ] = node;

				} else {

					currentNode.subNodes[ nodeName ] = node;

				}

			}

			// for this		  ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
			// NodeAttribute: 1001463072, "NodeAttribute::", "LimbNode" {
			if ( nodeAttrs ) {

				node.id = attrs.id;
				node.attrName = attrs.name;
				node.attrType = attrs.type;

			}

			this.pushStack( node );

		},

		parseNodeAttr: function ( attrs ) {

			var id = attrs[ 0 ];

			if ( attrs[ 0 ] !== "" ) {

				id = parseInt( attrs[ 0 ] );

				if ( isNaN( id ) ) {

					// PolygonVertexIndex: *16380 {
					id = attrs[ 0 ];

				}

			}

			var name;
			var type;
			if ( attrs.length > 1 ) {

				name = attrs[ 1 ].replace( /^(\w+)::/, '' );
				type = attrs[ 2 ];

			}

			return { id: id, name: name || '', type: type || '' };

		},

		parseNodeProperty: function ( line, propName, propValue ) {

			var currentNode = this.getCurrentNode();
			var parentName = currentNode.name;

			// special case parent node's is like "Properties70"
			// these chilren nodes must treat with careful
			if ( parentName !== undefined ) {

				var propMatch = parentName.match( /Properties(\d)+/ );
				if ( propMatch ) {

					this.parseNodeSpecialProperty( line, propName, propValue );
					return;

				}

			}

			// special case Connections
			if ( propName == 'C' ) {

				var connProps = propValue.split( ',' ).slice( 1 );
				var from = parseInt( connProps[ 0 ] );
				var to = parseInt( connProps[ 1 ] );

				var rest = propValue.split( ',' ).slice( 3 );

				propName = 'connections';
				propValue = [ from, to ];
				propValue = propValue.concat( rest );

				if ( currentNode.properties[ propName ] === undefined ) {

					currentNode.properties[ propName ] = [];

				}

			}

			// special case Connections
			if ( propName == 'Node' ) {

				var id = parseInt( propValue );
				currentNode.properties.id = id;
				currentNode.id = id;

			}

			// already exists in properties, then append this
			if ( propName in currentNode.properties ) {

				// console.log( "duped entry found\nkey: " + propName + "\nvalue: " + propValue );
				if ( Array.isArray( currentNode.properties[ propName ] ) ) {

					currentNode.properties[ propName ].push( propValue );

				} else {

					currentNode.properties[ propName ] += propValue;

				}

			} else {

				// console.log( propName + ":  " + propValue );
				if ( Array.isArray( currentNode.properties[ propName ] ) ) {

					currentNode.properties[ propName ].push( propValue );

				} else {

					currentNode.properties[ propName ] = propValue;

				}

			}

			this.setCurrentProp( currentNode.properties, propName );

		},

		// TODO:
		parseNodePropertyContinued: function ( line ) {

			this.currentProp[ this.currentPropName ] += line;

		},

		parseNodeSpecialProperty: function ( line, propName, propValue ) {

			// split this
			// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
			// into array like below
			// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
			var props = propValue.split( '",' ).map( function ( element ) {

				return element.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

			} );

			var innerPropName = props[ 0 ];
			var innerPropType1 = props[ 1 ];
			var innerPropType2 = props[ 2 ];
			var innerPropFlag = props[ 3 ];
			var innerPropValue = props[ 4 ];

			/*
			if ( innerPropValue === undefined ) {
				innerPropValue = props[3];
			}
			*/

			// cast value in its type
			switch ( innerPropType1 ) {

				case "int":
					innerPropValue = parseInt( innerPropValue );
					break;

				case "double":
					innerPropValue = parseFloat( innerPropValue );
					break;

				case "ColorRGB":
				case "Vector3D":
					var tmp = innerPropValue.split( ',' );
					innerPropValue = new THREE.Vector3( tmp[ 0 ], tmp[ 1 ], tmp[ 2 ] );
					break;

			}

			// CAUTION: these props must append to parent's parent
			this.getPrevNode().properties[ innerPropName ] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

			this.setCurrentProp( this.getPrevNode().properties, innerPropName );

		},

		nodeEnd: function () {

			this.popStack();

		},

		/* ---------------------------------------------------------------- */
		/*		util													  */
		isFlattenNode: function ( node ) {

			return ( 'subNodes' in node && 'properties' in node ) ? true : false;

		}

	} );

	function FBXTree() {}

	Object.assign( FBXTree.prototype, {

		add: function ( key, val ) {

			this[ key ] = val;

		},

		searchConnectionParent: function ( id ) {

			if ( this.__cache_search_connection_parent === undefined ) {

				this.__cache_search_connection_parent = [];

			}

			if ( this.__cache_search_connection_parent[ id ] !== undefined ) {

				return this.__cache_search_connection_parent[ id ];

			} else {

				this.__cache_search_connection_parent[ id ] = [];

			}

			var conns = this.Connections.properties.connections;

			var results = [];
			for ( var i = 0; i < conns.length; ++ i ) {

				if ( conns[ i ][ 0 ] == id ) {

					// 0 means scene root
					var res = conns[ i ][ 1 ] === 0 ? - 1 : conns[ i ][ 1 ];
					results.push( res );

				}

			}

			if ( results.length > 0 ) {

				this.__cache_search_connection_parent[ id ] = this.__cache_search_connection_parent[ id ].concat( results );
				return results;

			} else {

				this.__cache_search_connection_parent[ id ] = [ - 1 ];
				return [ - 1 ];

			}

		},

		searchConnectionChildren: function ( id ) {

			if ( this.__cache_search_connection_children === undefined ) {

				this.__cache_search_connection_children = [];

			}

			if ( this.__cache_search_connection_children[ id ] !== undefined ) {

				return this.__cache_search_connection_children[ id ];

			} else {

				this.__cache_search_connection_children[ id ] = [];

			}

			var conns = this.Connections.properties.connections;

			var res = [];
			for ( var i = 0; i < conns.length; ++ i ) {

				if ( conns[ i ][ 1 ] == id ) {

					// 0 means scene root
					res.push( conns[ i ][ 0 ] === 0 ? - 1 : conns[ i ][ 0 ] );
					// there may more than one kid, then search to the end

				}

			}

			if ( res.length > 0 ) {

				this.__cache_search_connection_children[ id ] = this.__cache_search_connection_children[ id ].concat( res );
				return res;

			} else {

				this.__cache_search_connection_children[ id ] = [ ];
				return [ ];

			}

		},

		searchConnectionType: function ( id, to ) {

			var key = id + ',' + to; // TODO: to hash
			if ( this.__cache_search_connection_type === undefined ) {

				this.__cache_search_connection_type = {};

			}

			if ( this.__cache_search_connection_type[ key ] !== undefined ) {

				return this.__cache_search_connection_type[ key ];

			} else {

				this.__cache_search_connection_type[ key ] = '';

			}

			var conns = this.Connections.properties.connections;

			for ( var i = 0; i < conns.length; ++ i ) {

				if ( conns[ i ][ 0 ] == id && conns[ i ][ 1 ] == to ) {

					// 0 means scene root
					this.__cache_search_connection_type[ key ] = conns[ i ][ 2 ];
					return conns[ i ][ 2 ];

				}

			}

			this.__cache_search_connection_type[ id ] = null;
			return null;

		}

	} );

	/**
	 * @returns {boolean}
	 */
	function isFbxFormatASCII( text ) {

		var CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

		var cursor = 0;
		var read = function ( offset ) {

			var result = text[ offset - 1 ];
			text = text.slice( cursor + offset );
			cursor ++;
			return result;

		};

		for ( var i = 0; i < CORRECT.length; ++ i ) {

			var num = read( 1 );
			if ( num == CORRECT[ i ] ) {

				return false;

			}

		}

		return true;

	}

	/**
	 * @returns {number}
	 */
	function getFbxVersion( text ) {

		var versionRegExp = /FBXVersion: (\d+)/;
		var match = text.match( versionRegExp );
		if ( match ) {

			var version = parseInt( match[ 1 ] );
			return version;

		}
		throw new Error( 'FBXLoader: Cannot find the version number for the file given.' );

	}

	/**
	 * Converts FBX ticks into real time seconds.
	 * @param {number} time - FBX tick timestamp to convert.
	 * @returns {number} - FBX tick in real world time.
	 */
	function ConvertFBXTimeToSeconds( time ) {

		// Constant is FBX ticks per second.
		return time / 46186158000;

	}

	/**
	 * Parses comma separated list of float numbers and returns them in an array.
	 * @example
	 * // Returns [ 5.6, 9.4, 2.5, 1.4 ]
	 * parseFloatArray( "5.6,9.4,2.5,1.4" )
	 * @returns {number[]}
	 */
	function parseFloatArray( floatString ) {

		return floatString.split( ',' ).map( function ( stringValue ) {

			return parseFloat( stringValue );

		} );

	}

	/**
	 * Parses comma separated list of int numbers and returns them in an array.
	 * @example
	 * // Returns [ 5, 8, 2, 3 ]
	 * parseFloatArray( "5,8,2,3" )
	 * @returns {number[]}
	 */
	function parseIntArray( intString ) {

		return intString.split( ',' ).map( function ( stringValue ) {

			return parseInt( stringValue );

		} );

	}

	function parseMatrixArray( floatString ) {

		return new THREE.Matrix4().fromArray( parseFloatArray( floatString ) );

	}

	/**
	 * Converts number from degrees into radians.
	 * @param {number} value
	 * @returns {number}
	 */
	function degreeToRadian( value ) {

		return value * Math.PI / 180;

	}

} )();
