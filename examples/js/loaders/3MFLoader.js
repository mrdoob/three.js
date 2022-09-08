( function () {

	/**
 *
 * 3D Manufacturing Format (3MF) specification: https://3mf.io/specification/
 *
 * The following features from the core specification are supported:
 *
 * - 3D Models
 * - Object Resources (Meshes and Components)
 * - Material Resources (Base Materials)
 *
 * 3MF Materials and Properties Extension are only partially supported.
 *
 * - Texture 2D
 * - Texture 2D Groups
 * - THREE.Color Groups (Vertex Colors)
 * - Metallic Display Properties (PBR)
 */

	class ThreeMFLoader extends THREE.Loader {

		constructor( manager ) {

			super( manager );
			this.availableExtensions = [];

		}

		load( url, onLoad, onProgress, onError ) {

			const scope = this;
			const loader = new THREE.FileLoader( scope.manager );
			loader.setPath( scope.path );
			loader.setResponseType( 'arraybuffer' );
			loader.setRequestHeader( scope.requestHeader );
			loader.setWithCredentials( scope.withCredentials );
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

		parse( data ) {

			const scope = this;
			const textureLoader = new THREE.TextureLoader( this.manager );

			function loadDocument( data ) {

				let zip = null;
				let file = null;
				let relsName;
				let modelRelsName;
				const modelPartNames = [];
				const texturesPartNames = [];
				let modelRels;
				const modelParts = {};
				const printTicketParts = {};
				const texturesParts = {};

				try {

					zip = fflate.unzipSync( new Uint8Array( data ) ); // eslint-disable-line no-undef

				} catch ( e ) {

					if ( e instanceof ReferenceError ) {

						console.error( 'THREE.3MFLoader: fflate missing and file is compressed.' );
						return null;

					}

				}

				for ( file in zip ) {

					if ( file.match( /\_rels\/.rels$/ ) ) {

						relsName = file;

					} else if ( file.match( /3D\/_rels\/.*\.model\.rels$/ ) ) {

						modelRelsName = file;

					} else if ( file.match( /^3D\/.*\.model$/ ) ) {

						modelPartNames.push( file );

					} else if ( file.match( /^3D\/Textures?\/.*/ ) ) {

						texturesPartNames.push( file );

					}

				} //


				const relsView = zip[ relsName ];
				const relsFileText = THREE.LoaderUtils.decodeText( relsView );
				const rels = parseRelsXml( relsFileText ); //

				if ( modelRelsName ) {

					const relsView = zip[ modelRelsName ];
					const relsFileText = THREE.LoaderUtils.decodeText( relsView );
					modelRels = parseRelsXml( relsFileText );

				} //


				for ( let i = 0; i < modelPartNames.length; i ++ ) {

					const modelPart = modelPartNames[ i ];
					const view = zip[ modelPart ];
					const fileText = THREE.LoaderUtils.decodeText( view );
					const xmlData = new DOMParser().parseFromString( fileText, 'application/xml' );

					if ( xmlData.documentElement.nodeName.toLowerCase() !== 'model' ) {

						console.error( 'THREE.3MFLoader: Error loading 3MF - no 3MF document found: ', modelPart );

					}

					const modelNode = xmlData.querySelector( 'model' );
					const extensions = {};

					for ( let i = 0; i < modelNode.attributes.length; i ++ ) {

						const attr = modelNode.attributes[ i ];

						if ( attr.name.match( /^xmlns:(.+)$/ ) ) {

							extensions[ attr.value ] = RegExp.$1;

						}

					}

					const modelData = parseModelNode( modelNode );
					modelData[ 'xml' ] = modelNode;

					if ( 0 < Object.keys( extensions ).length ) {

						modelData[ 'extensions' ] = extensions;

					}

					modelParts[ modelPart ] = modelData;

				} //


				for ( let i = 0; i < texturesPartNames.length; i ++ ) {

					const texturesPartName = texturesPartNames[ i ];
					texturesParts[ texturesPartName ] = zip[ texturesPartName ].buffer;

				}

				return {
					rels: rels,
					modelRels: modelRels,
					model: modelParts,
					printTicket: printTicketParts,
					texture: texturesParts
				};

			}

			function parseRelsXml( relsFileText ) {

				const relationships = [];
				const relsXmlData = new DOMParser().parseFromString( relsFileText, 'application/xml' );
				const relsNodes = relsXmlData.querySelectorAll( 'Relationship' );

				for ( let i = 0; i < relsNodes.length; i ++ ) {

					const relsNode = relsNodes[ i ];
					const relationship = {
						target: relsNode.getAttribute( 'Target' ),
						//required
						id: relsNode.getAttribute( 'Id' ),
						//required
						type: relsNode.getAttribute( 'Type' ) //required

					};
					relationships.push( relationship );

				}

				return relationships;

			}

			function parseMetadataNodes( metadataNodes ) {

				const metadataData = {};

				for ( let i = 0; i < metadataNodes.length; i ++ ) {

					const metadataNode = metadataNodes[ i ];
					const name = metadataNode.getAttribute( 'name' );
					const validNames = [ 'Title', 'Designer', 'Description', 'Copyright', 'LicenseTerms', 'Rating', 'CreationDate', 'ModificationDate' ];

					if ( 0 <= validNames.indexOf( name ) ) {

						metadataData[ name ] = metadataNode.textContent;

					}

				}

				return metadataData;

			}

			function parseBasematerialsNode( basematerialsNode ) {

				const basematerialsData = {
					id: basematerialsNode.getAttribute( 'id' ),
					// required
					basematerials: []
				};
				const basematerialNodes = basematerialsNode.querySelectorAll( 'base' );

				for ( let i = 0; i < basematerialNodes.length; i ++ ) {

					const basematerialNode = basematerialNodes[ i ];
					const basematerialData = parseBasematerialNode( basematerialNode );
					basematerialData.index = i; // the order and count of the material nodes form an implicit 0-based index

					basematerialsData.basematerials.push( basematerialData );

				}

				return basematerialsData;

			}

			function parseTexture2DNode( texture2DNode ) {

				const texture2dData = {
					id: texture2DNode.getAttribute( 'id' ),
					// required
					path: texture2DNode.getAttribute( 'path' ),
					// required
					contenttype: texture2DNode.getAttribute( 'contenttype' ),
					// required
					tilestyleu: texture2DNode.getAttribute( 'tilestyleu' ),
					tilestylev: texture2DNode.getAttribute( 'tilestylev' ),
					filter: texture2DNode.getAttribute( 'filter' )
				};
				return texture2dData;

			}

			function parseTextures2DGroupNode( texture2DGroupNode ) {

				const texture2DGroupData = {
					id: texture2DGroupNode.getAttribute( 'id' ),
					// required
					texid: texture2DGroupNode.getAttribute( 'texid' ),
					// required
					displaypropertiesid: texture2DGroupNode.getAttribute( 'displaypropertiesid' )
				};
				const tex2coordNodes = texture2DGroupNode.querySelectorAll( 'tex2coord' );
				const uvs = [];

				for ( let i = 0; i < tex2coordNodes.length; i ++ ) {

					const tex2coordNode = tex2coordNodes[ i ];
					const u = tex2coordNode.getAttribute( 'u' );
					const v = tex2coordNode.getAttribute( 'v' );
					uvs.push( parseFloat( u ), parseFloat( v ) );

				}

				texture2DGroupData[ 'uvs' ] = new Float32Array( uvs );
				return texture2DGroupData;

			}

			function parseColorGroupNode( colorGroupNode ) {

				const colorGroupData = {
					id: colorGroupNode.getAttribute( 'id' ),
					// required
					displaypropertiesid: colorGroupNode.getAttribute( 'displaypropertiesid' )
				};
				const colorNodes = colorGroupNode.querySelectorAll( 'color' );
				const colors = [];
				const colorObject = new THREE.Color();

				for ( let i = 0; i < colorNodes.length; i ++ ) {

					const colorNode = colorNodes[ i ];
					const color = colorNode.getAttribute( 'color' );
					colorObject.setStyle( color.substring( 0, 7 ) );
					colorObject.convertSRGBToLinear(); // color is in sRGB

					colors.push( colorObject.r, colorObject.g, colorObject.b );

				}

				colorGroupData[ 'colors' ] = new Float32Array( colors );
				return colorGroupData;

			}

			function parseMetallicDisplaypropertiesNode( metallicDisplaypropetiesNode ) {

				const metallicDisplaypropertiesData = {
					id: metallicDisplaypropetiesNode.getAttribute( 'id' ) // required

				};
				const metallicNodes = metallicDisplaypropetiesNode.querySelectorAll( 'pbmetallic' );
				const metallicData = [];

				for ( let i = 0; i < metallicNodes.length; i ++ ) {

					const metallicNode = metallicNodes[ i ];
					metallicData.push( {
						name: metallicNode.getAttribute( 'name' ),
						// required
						metallicness: parseFloat( metallicNode.getAttribute( 'metallicness' ) ),
						// required
						roughness: parseFloat( metallicNode.getAttribute( 'roughness' ) ) // required

					} );

				}

				metallicDisplaypropertiesData.data = metallicData;
				return metallicDisplaypropertiesData;

			}

			function parseBasematerialNode( basematerialNode ) {

				const basematerialData = {};
				basematerialData[ 'name' ] = basematerialNode.getAttribute( 'name' ); // required

				basematerialData[ 'displaycolor' ] = basematerialNode.getAttribute( 'displaycolor' ); // required

				basematerialData[ 'displaypropertiesid' ] = basematerialNode.getAttribute( 'displaypropertiesid' );
				return basematerialData;

			}

			function parseMeshNode( meshNode ) {

				const meshData = {};
				const vertices = [];
				const vertexNodes = meshNode.querySelectorAll( 'vertices vertex' );

				for ( let i = 0; i < vertexNodes.length; i ++ ) {

					const vertexNode = vertexNodes[ i ];
					const x = vertexNode.getAttribute( 'x' );
					const y = vertexNode.getAttribute( 'y' );
					const z = vertexNode.getAttribute( 'z' );
					vertices.push( parseFloat( x ), parseFloat( y ), parseFloat( z ) );

				}

				meshData[ 'vertices' ] = new Float32Array( vertices );
				const triangleProperties = [];
				const triangles = [];
				const triangleNodes = meshNode.querySelectorAll( 'triangles triangle' );

				for ( let i = 0; i < triangleNodes.length; i ++ ) {

					const triangleNode = triangleNodes[ i ];
					const v1 = triangleNode.getAttribute( 'v1' );
					const v2 = triangleNode.getAttribute( 'v2' );
					const v3 = triangleNode.getAttribute( 'v3' );
					const p1 = triangleNode.getAttribute( 'p1' );
					const p2 = triangleNode.getAttribute( 'p2' );
					const p3 = triangleNode.getAttribute( 'p3' );
					const pid = triangleNode.getAttribute( 'pid' );
					const triangleProperty = {};
					triangleProperty[ 'v1' ] = parseInt( v1, 10 );
					triangleProperty[ 'v2' ] = parseInt( v2, 10 );
					triangleProperty[ 'v3' ] = parseInt( v3, 10 );
					triangles.push( triangleProperty[ 'v1' ], triangleProperty[ 'v2' ], triangleProperty[ 'v3' ] ); // optional

					if ( p1 ) {

						triangleProperty[ 'p1' ] = parseInt( p1, 10 );

					}

					if ( p2 ) {

						triangleProperty[ 'p2' ] = parseInt( p2, 10 );

					}

					if ( p3 ) {

						triangleProperty[ 'p3' ] = parseInt( p3, 10 );

					}

					if ( pid ) {

						triangleProperty[ 'pid' ] = pid;

					}

					if ( 0 < Object.keys( triangleProperty ).length ) {

						triangleProperties.push( triangleProperty );

					}

				}

				meshData[ 'triangleProperties' ] = triangleProperties;
				meshData[ 'triangles' ] = new Uint32Array( triangles );
				return meshData;

			}

			function parseComponentsNode( componentsNode ) {

				const components = [];
				const componentNodes = componentsNode.querySelectorAll( 'component' );

				for ( let i = 0; i < componentNodes.length; i ++ ) {

					const componentNode = componentNodes[ i ];
					const componentData = parseComponentNode( componentNode );
					components.push( componentData );

				}

				return components;

			}

			function parseComponentNode( componentNode ) {

				const componentData = {};
				componentData[ 'objectId' ] = componentNode.getAttribute( 'objectid' ); // required

				const transform = componentNode.getAttribute( 'transform' );

				if ( transform ) {

					componentData[ 'transform' ] = parseTransform( transform );

				}

				return componentData;

			}

			function parseTransform( transform ) {

				const t = [];
				transform.split( ' ' ).forEach( function ( s ) {

					t.push( parseFloat( s ) );

				} );
				const matrix = new THREE.Matrix4();
				matrix.set( t[ 0 ], t[ 3 ], t[ 6 ], t[ 9 ], t[ 1 ], t[ 4 ], t[ 7 ], t[ 10 ], t[ 2 ], t[ 5 ], t[ 8 ], t[ 11 ], 0.0, 0.0, 0.0, 1.0 );
				return matrix;

			}

			function parseObjectNode( objectNode ) {

				const objectData = {
					type: objectNode.getAttribute( 'type' )
				};
				const id = objectNode.getAttribute( 'id' );

				if ( id ) {

					objectData[ 'id' ] = id;

				}

				const pid = objectNode.getAttribute( 'pid' );

				if ( pid ) {

					objectData[ 'pid' ] = pid;

				}

				const pindex = objectNode.getAttribute( 'pindex' );

				if ( pindex ) {

					objectData[ 'pindex' ] = pindex;

				}

				const thumbnail = objectNode.getAttribute( 'thumbnail' );

				if ( thumbnail ) {

					objectData[ 'thumbnail' ] = thumbnail;

				}

				const partnumber = objectNode.getAttribute( 'partnumber' );

				if ( partnumber ) {

					objectData[ 'partnumber' ] = partnumber;

				}

				const name = objectNode.getAttribute( 'name' );

				if ( name ) {

					objectData[ 'name' ] = name;

				}

				const meshNode = objectNode.querySelector( 'mesh' );

				if ( meshNode ) {

					objectData[ 'mesh' ] = parseMeshNode( meshNode );

				}

				const componentsNode = objectNode.querySelector( 'components' );

				if ( componentsNode ) {

					objectData[ 'components' ] = parseComponentsNode( componentsNode );

				}

				return objectData;

			}

			function parseResourcesNode( resourcesNode ) {

				const resourcesData = {};
				resourcesData[ 'basematerials' ] = {};
				const basematerialsNodes = resourcesNode.querySelectorAll( 'basematerials' );

				for ( let i = 0; i < basematerialsNodes.length; i ++ ) {

					const basematerialsNode = basematerialsNodes[ i ];
					const basematerialsData = parseBasematerialsNode( basematerialsNode );
					resourcesData[ 'basematerials' ][ basematerialsData[ 'id' ] ] = basematerialsData;

				} //


				resourcesData[ 'texture2d' ] = {};
				const textures2DNodes = resourcesNode.querySelectorAll( 'texture2d' );

				for ( let i = 0; i < textures2DNodes.length; i ++ ) {

					const textures2DNode = textures2DNodes[ i ];
					const texture2DData = parseTexture2DNode( textures2DNode );
					resourcesData[ 'texture2d' ][ texture2DData[ 'id' ] ] = texture2DData;

				} //


				resourcesData[ 'colorgroup' ] = {};
				const colorGroupNodes = resourcesNode.querySelectorAll( 'colorgroup' );

				for ( let i = 0; i < colorGroupNodes.length; i ++ ) {

					const colorGroupNode = colorGroupNodes[ i ];
					const colorGroupData = parseColorGroupNode( colorGroupNode );
					resourcesData[ 'colorgroup' ][ colorGroupData[ 'id' ] ] = colorGroupData;

				} //


				resourcesData[ 'pbmetallicdisplayproperties' ] = {};
				const pbmetallicdisplaypropertiesNodes = resourcesNode.querySelectorAll( 'pbmetallicdisplayproperties' );

				for ( let i = 0; i < pbmetallicdisplaypropertiesNodes.length; i ++ ) {

					const pbmetallicdisplaypropertiesNode = pbmetallicdisplaypropertiesNodes[ i ];
					const pbmetallicdisplaypropertiesData = parseMetallicDisplaypropertiesNode( pbmetallicdisplaypropertiesNode );
					resourcesData[ 'pbmetallicdisplayproperties' ][ pbmetallicdisplaypropertiesData[ 'id' ] ] = pbmetallicdisplaypropertiesData;

				} //


				resourcesData[ 'texture2dgroup' ] = {};
				const textures2DGroupNodes = resourcesNode.querySelectorAll( 'texture2dgroup' );

				for ( let i = 0; i < textures2DGroupNodes.length; i ++ ) {

					const textures2DGroupNode = textures2DGroupNodes[ i ];
					const textures2DGroupData = parseTextures2DGroupNode( textures2DGroupNode );
					resourcesData[ 'texture2dgroup' ][ textures2DGroupData[ 'id' ] ] = textures2DGroupData;

				} //


				resourcesData[ 'object' ] = {};
				const objectNodes = resourcesNode.querySelectorAll( 'object' );

				for ( let i = 0; i < objectNodes.length; i ++ ) {

					const objectNode = objectNodes[ i ];
					const objectData = parseObjectNode( objectNode );
					resourcesData[ 'object' ][ objectData[ 'id' ] ] = objectData;

				}

				return resourcesData;

			}

			function parseBuildNode( buildNode ) {

				const buildData = [];
				const itemNodes = buildNode.querySelectorAll( 'item' );

				for ( let i = 0; i < itemNodes.length; i ++ ) {

					const itemNode = itemNodes[ i ];
					const buildItem = {
						objectId: itemNode.getAttribute( 'objectid' )
					};
					const transform = itemNode.getAttribute( 'transform' );

					if ( transform ) {

						buildItem[ 'transform' ] = parseTransform( transform );

					}

					buildData.push( buildItem );

				}

				return buildData;

			}

			function parseModelNode( modelNode ) {

				const modelData = {
					unit: modelNode.getAttribute( 'unit' ) || 'millimeter'
				};
				const metadataNodes = modelNode.querySelectorAll( 'metadata' );

				if ( metadataNodes ) {

					modelData[ 'metadata' ] = parseMetadataNodes( metadataNodes );

				}

				const resourcesNode = modelNode.querySelector( 'resources' );

				if ( resourcesNode ) {

					modelData[ 'resources' ] = parseResourcesNode( resourcesNode );

				}

				const buildNode = modelNode.querySelector( 'build' );

				if ( buildNode ) {

					modelData[ 'build' ] = parseBuildNode( buildNode );

				}

				return modelData;

			}

			function buildTexture( texture2dgroup, objects, modelData, textureData ) {

				const texid = texture2dgroup.texid;
				const texture2ds = modelData.resources.texture2d;
				const texture2d = texture2ds[ texid ];

				if ( texture2d ) {

					const data = textureData[ texture2d.path ];
					const type = texture2d.contenttype;
					const blob = new Blob( [ data ], {
						type: type
					} );
					const sourceURI = URL.createObjectURL( blob );
					const texture = textureLoader.load( sourceURI, function () {

						URL.revokeObjectURL( sourceURI );

					} );
					texture.encoding = THREE.sRGBEncoding; // texture parameters

					switch ( texture2d.tilestyleu ) {

						case 'wrap':
							texture.wrapS = THREE.RepeatWrapping;
							break;

						case 'mirror':
							texture.wrapS = THREE.MirroredRepeatWrapping;
							break;

						case 'none':
						case 'clamp':
							texture.wrapS = THREE.ClampToEdgeWrapping;
							break;

						default:
							texture.wrapS = THREE.RepeatWrapping;

					}

					switch ( texture2d.tilestylev ) {

						case 'wrap':
							texture.wrapT = THREE.RepeatWrapping;
							break;

						case 'mirror':
							texture.wrapT = THREE.MirroredRepeatWrapping;
							break;

						case 'none':
						case 'clamp':
							texture.wrapT = THREE.ClampToEdgeWrapping;
							break;

						default:
							texture.wrapT = THREE.RepeatWrapping;

					}

					switch ( texture2d.filter ) {

						case 'auto':
							texture.magFilter = THREE.LinearFilter;
							texture.minFilter = THREE.LinearMipmapLinearFilter;
							break;

						case 'linear':
							texture.magFilter = THREE.LinearFilter;
							texture.minFilter = THREE.LinearFilter;
							break;

						case 'nearest':
							texture.magFilter = THREE.NearestFilter;
							texture.minFilter = THREE.NearestFilter;
							break;

						default:
							texture.magFilter = THREE.LinearFilter;
							texture.minFilter = THREE.LinearMipmapLinearFilter;

					}

					return texture;

				} else {

					return null;

				}

			}

			function buildBasematerialsMeshes( basematerials, triangleProperties, meshData, objects, modelData, textureData, objectData ) {

				const objectPindex = objectData.pindex;
				const materialMap = {};

				for ( let i = 0, l = triangleProperties.length; i < l; i ++ ) {

					const triangleProperty = triangleProperties[ i ];
					const pindex = triangleProperty.p1 !== undefined ? triangleProperty.p1 : objectPindex;
					if ( materialMap[ pindex ] === undefined ) materialMap[ pindex ] = [];
					materialMap[ pindex ].push( triangleProperty );

				} //


				const keys = Object.keys( materialMap );
				const meshes = [];

				for ( let i = 0, l = keys.length; i < l; i ++ ) {

					const materialIndex = keys[ i ];
					const trianglePropertiesProps = materialMap[ materialIndex ];
					const basematerialData = basematerials.basematerials[ materialIndex ];
					const material = getBuild( basematerialData, objects, modelData, textureData, objectData, buildBasematerial ); //

					const geometry = new THREE.BufferGeometry();
					const positionData = [];
					const vertices = meshData.vertices;

					for ( let j = 0, jl = trianglePropertiesProps.length; j < jl; j ++ ) {

						const triangleProperty = trianglePropertiesProps[ j ];
						positionData.push( vertices[ triangleProperty.v1 * 3 + 0 ] );
						positionData.push( vertices[ triangleProperty.v1 * 3 + 1 ] );
						positionData.push( vertices[ triangleProperty.v1 * 3 + 2 ] );
						positionData.push( vertices[ triangleProperty.v2 * 3 + 0 ] );
						positionData.push( vertices[ triangleProperty.v2 * 3 + 1 ] );
						positionData.push( vertices[ triangleProperty.v2 * 3 + 2 ] );
						positionData.push( vertices[ triangleProperty.v3 * 3 + 0 ] );
						positionData.push( vertices[ triangleProperty.v3 * 3 + 1 ] );
						positionData.push( vertices[ triangleProperty.v3 * 3 + 2 ] );

					}

					geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positionData, 3 ) ); //

					const mesh = new THREE.Mesh( geometry, material );
					meshes.push( mesh );

				}

				return meshes;

			}

			function buildTexturedMesh( texture2dgroup, triangleProperties, meshData, objects, modelData, textureData, objectData ) {

				// geometry
				const geometry = new THREE.BufferGeometry();
				const positionData = [];
				const uvData = [];
				const vertices = meshData.vertices;
				const uvs = texture2dgroup.uvs;

				for ( let i = 0, l = triangleProperties.length; i < l; i ++ ) {

					const triangleProperty = triangleProperties[ i ];
					positionData.push( vertices[ triangleProperty.v1 * 3 + 0 ] );
					positionData.push( vertices[ triangleProperty.v1 * 3 + 1 ] );
					positionData.push( vertices[ triangleProperty.v1 * 3 + 2 ] );
					positionData.push( vertices[ triangleProperty.v2 * 3 + 0 ] );
					positionData.push( vertices[ triangleProperty.v2 * 3 + 1 ] );
					positionData.push( vertices[ triangleProperty.v2 * 3 + 2 ] );
					positionData.push( vertices[ triangleProperty.v3 * 3 + 0 ] );
					positionData.push( vertices[ triangleProperty.v3 * 3 + 1 ] );
					positionData.push( vertices[ triangleProperty.v3 * 3 + 2 ] ); //

					uvData.push( uvs[ triangleProperty.p1 * 2 + 0 ] );
					uvData.push( uvs[ triangleProperty.p1 * 2 + 1 ] );
					uvData.push( uvs[ triangleProperty.p2 * 2 + 0 ] );
					uvData.push( uvs[ triangleProperty.p2 * 2 + 1 ] );
					uvData.push( uvs[ triangleProperty.p3 * 2 + 0 ] );
					uvData.push( uvs[ triangleProperty.p3 * 2 + 1 ] );

				}

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positionData, 3 ) );
				geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvData, 2 ) ); // material

				const texture = getBuild( texture2dgroup, objects, modelData, textureData, objectData, buildTexture );
				const material = new THREE.MeshPhongMaterial( {
					map: texture,
					flatShading: true
				} ); // mesh

				const mesh = new THREE.Mesh( geometry, material );
				return mesh;

			}

			function buildVertexColorMesh( colorgroup, triangleProperties, meshData, objectData ) {

				// geometry
				const geometry = new THREE.BufferGeometry();
				const positionData = [];
				const colorData = [];
				const vertices = meshData.vertices;
				const colors = colorgroup.colors;

				for ( let i = 0, l = triangleProperties.length; i < l; i ++ ) {

					const triangleProperty = triangleProperties[ i ];
					const v1 = triangleProperty.v1;
					const v2 = triangleProperty.v2;
					const v3 = triangleProperty.v3;
					positionData.push( vertices[ v1 * 3 + 0 ] );
					positionData.push( vertices[ v1 * 3 + 1 ] );
					positionData.push( vertices[ v1 * 3 + 2 ] );
					positionData.push( vertices[ v2 * 3 + 0 ] );
					positionData.push( vertices[ v2 * 3 + 1 ] );
					positionData.push( vertices[ v2 * 3 + 2 ] );
					positionData.push( vertices[ v3 * 3 + 0 ] );
					positionData.push( vertices[ v3 * 3 + 1 ] );
					positionData.push( vertices[ v3 * 3 + 2 ] ); //

					const p1 = triangleProperty.p1 !== undefined ? triangleProperty.p1 : objectData.pindex;
					const p2 = triangleProperty.p2 !== undefined ? triangleProperty.p2 : p1;
					const p3 = triangleProperty.p3 !== undefined ? triangleProperty.p3 : p1;
					colorData.push( colors[ p1 * 3 + 0 ] );
					colorData.push( colors[ p1 * 3 + 1 ] );
					colorData.push( colors[ p1 * 3 + 2 ] );
					colorData.push( colors[ p2 * 3 + 0 ] );
					colorData.push( colors[ p2 * 3 + 1 ] );
					colorData.push( colors[ p2 * 3 + 2 ] );
					colorData.push( colors[ p3 * 3 + 0 ] );
					colorData.push( colors[ p3 * 3 + 1 ] );
					colorData.push( colors[ p3 * 3 + 2 ] );

				}

				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positionData, 3 ) );
				geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorData, 3 ) ); // material

				const material = new THREE.MeshPhongMaterial( {
					vertexColors: true,
					flatShading: true
				} ); // mesh

				const mesh = new THREE.Mesh( geometry, material );
				return mesh;

			}

			function buildDefaultMesh( meshData ) {

				const geometry = new THREE.BufferGeometry();
				geometry.setIndex( new THREE.BufferAttribute( meshData[ 'triangles' ], 1 ) );
				geometry.setAttribute( 'position', new THREE.BufferAttribute( meshData[ 'vertices' ], 3 ) );
				const material = new THREE.MeshPhongMaterial( {
					color: 0xffffff,
					flatShading: true
				} );
				const mesh = new THREE.Mesh( geometry, material );
				return mesh;

			}

			function buildMeshes( resourceMap, meshData, objects, modelData, textureData, objectData ) {

				const keys = Object.keys( resourceMap );
				const meshes = [];

				for ( let i = 0, il = keys.length; i < il; i ++ ) {

					const resourceId = keys[ i ];
					const triangleProperties = resourceMap[ resourceId ];
					const resourceType = getResourceType( resourceId, modelData );

					switch ( resourceType ) {

						case 'material':
							const basematerials = modelData.resources.basematerials[ resourceId ];
							const newMeshes = buildBasematerialsMeshes( basematerials, triangleProperties, meshData, objects, modelData, textureData, objectData );

							for ( let j = 0, jl = newMeshes.length; j < jl; j ++ ) {

								meshes.push( newMeshes[ j ] );

							}

							break;

						case 'texture':
							const texture2dgroup = modelData.resources.texture2dgroup[ resourceId ];
							meshes.push( buildTexturedMesh( texture2dgroup, triangleProperties, meshData, objects, modelData, textureData, objectData ) );
							break;

						case 'vertexColors':
							const colorgroup = modelData.resources.colorgroup[ resourceId ];
							meshes.push( buildVertexColorMesh( colorgroup, triangleProperties, meshData, objectData ) );
							break;

						case 'default':
							meshes.push( buildDefaultMesh( meshData ) );
							break;

						default:
							console.error( 'THREE.3MFLoader: Unsupported resource type.' );

					}

				}

				if ( objectData.name ) {

					for ( let i = 0; i < meshes.length; i ++ ) {

						meshes[ i ].name = objectData.name;

					}

				}

				return meshes;

			}

			function getResourceType( pid, modelData ) {

				if ( modelData.resources.texture2dgroup[ pid ] !== undefined ) {

					return 'texture';

				} else if ( modelData.resources.basematerials[ pid ] !== undefined ) {

					return 'material';

				} else if ( modelData.resources.colorgroup[ pid ] !== undefined ) {

					return 'vertexColors';

				} else if ( pid === 'default' ) {

					return 'default';

				} else {

					return undefined;

				}

			}

			function analyzeObject( meshData, objectData ) {

				const resourceMap = {};
				const triangleProperties = meshData[ 'triangleProperties' ];
				const objectPid = objectData.pid;

				for ( let i = 0, l = triangleProperties.length; i < l; i ++ ) {

					const triangleProperty = triangleProperties[ i ];
					let pid = triangleProperty.pid !== undefined ? triangleProperty.pid : objectPid;
					if ( pid === undefined ) pid = 'default';
					if ( resourceMap[ pid ] === undefined ) resourceMap[ pid ] = [];
					resourceMap[ pid ].push( triangleProperty );

				}

				return resourceMap;

			}

			function buildGroup( meshData, objects, modelData, textureData, objectData ) {

				const group = new THREE.Group();
				const resourceMap = analyzeObject( meshData, objectData );
				const meshes = buildMeshes( resourceMap, meshData, objects, modelData, textureData, objectData );

				for ( let i = 0, l = meshes.length; i < l; i ++ ) {

					group.add( meshes[ i ] );

				}

				return group;

			}

			function applyExtensions( extensions, meshData, modelXml ) {

				if ( ! extensions ) {

					return;

				}

				const availableExtensions = [];
				const keys = Object.keys( extensions );

				for ( let i = 0; i < keys.length; i ++ ) {

					const ns = keys[ i ];

					for ( let j = 0; j < scope.availableExtensions.length; j ++ ) {

						const extension = scope.availableExtensions[ j ];

						if ( extension.ns === ns ) {

							availableExtensions.push( extension );

						}

					}

				}

				for ( let i = 0; i < availableExtensions.length; i ++ ) {

					const extension = availableExtensions[ i ];
					extension.apply( modelXml, extensions[ extension[ 'ns' ] ], meshData );

				}

			}

			function getBuild( data, objects, modelData, textureData, objectData, builder ) {

				if ( data.build !== undefined ) return data.build;
				data.build = builder( data, objects, modelData, textureData, objectData );
				return data.build;

			}

			function buildBasematerial( materialData, objects, modelData ) {

				let material;
				const displaypropertiesid = materialData.displaypropertiesid;
				const pbmetallicdisplayproperties = modelData.resources.pbmetallicdisplayproperties;

				if ( displaypropertiesid !== null && pbmetallicdisplayproperties[ displaypropertiesid ] !== undefined ) {

					// metallic display property, use StandardMaterial
					const pbmetallicdisplayproperty = pbmetallicdisplayproperties[ displaypropertiesid ];
					const metallicData = pbmetallicdisplayproperty.data[ materialData.index ];
					material = new THREE.MeshStandardMaterial( {
						flatShading: true,
						roughness: metallicData.roughness,
						metalness: metallicData.metallicness
					} );

				} else {

					// otherwise use PhongMaterial
					material = new THREE.MeshPhongMaterial( {
						flatShading: true
					} );

				}

				material.name = materialData.name; // displaycolor MUST be specified with a value of a 6 or 8 digit hexadecimal number, e.g. "#RRGGBB" or "#RRGGBBAA"

				const displaycolor = materialData.displaycolor;
				const color = displaycolor.substring( 0, 7 );
				material.color.setStyle( color );
				material.color.convertSRGBToLinear(); // displaycolor is in sRGB
				// process alpha if set

				if ( displaycolor.length === 9 ) {

					material.opacity = parseInt( displaycolor.charAt( 7 ) + displaycolor.charAt( 8 ), 16 ) / 255;

				}

				return material;

			}

			function buildComposite( compositeData, objects, modelData, textureData ) {

				const composite = new THREE.Group();

				for ( let j = 0; j < compositeData.length; j ++ ) {

					const component = compositeData[ j ];
					let build = objects[ component.objectId ];

					if ( build === undefined ) {

						buildObject( component.objectId, objects, modelData, textureData );
						build = objects[ component.objectId ];

					}

					const object3D = build.clone(); // apply component transform

					const transform = component.transform;

					if ( transform ) {

						object3D.applyMatrix4( transform );

					}

					composite.add( object3D );

				}

				return composite;

			}

			function buildObject( objectId, objects, modelData, textureData ) {

				const objectData = modelData[ 'resources' ][ 'object' ][ objectId ];

				if ( objectData[ 'mesh' ] ) {

					const meshData = objectData[ 'mesh' ];
					const extensions = modelData[ 'extensions' ];
					const modelXml = modelData[ 'xml' ];
					applyExtensions( extensions, meshData, modelXml );
					objects[ objectData.id ] = getBuild( meshData, objects, modelData, textureData, objectData, buildGroup );

				} else {

					const compositeData = objectData[ 'components' ];
					objects[ objectData.id ] = getBuild( compositeData, objects, modelData, textureData, objectData, buildComposite );

				}

				if ( objectData.name ) {

					objects[ objectData.id ].name = objectData.name;

				}

			}

			function buildObjects( data3mf ) {

				const modelsData = data3mf.model;
				const modelRels = data3mf.modelRels;
				const objects = {};
				const modelsKeys = Object.keys( modelsData );
				const textureData = {}; // evaluate model relationships to textures

				if ( modelRels ) {

					for ( let i = 0, l = modelRels.length; i < l; i ++ ) {

						const modelRel = modelRels[ i ];
						const textureKey = modelRel.target.substring( 1 );

						if ( data3mf.texture[ textureKey ] ) {

							textureData[ modelRel.target ] = data3mf.texture[ textureKey ];

						}

					}

				} // start build


				for ( let i = 0; i < modelsKeys.length; i ++ ) {

					const modelsKey = modelsKeys[ i ];
					const modelData = modelsData[ modelsKey ];
					const objectIds = Object.keys( modelData[ 'resources' ][ 'object' ] );

					for ( let j = 0; j < objectIds.length; j ++ ) {

						const objectId = objectIds[ j ];
						buildObject( objectId, objects, modelData, textureData );

					}

				}

				return objects;

			}

			function fetch3DModelPart( rels ) {

				for ( let i = 0; i < rels.length; i ++ ) {

					const rel = rels[ i ];
					const extension = rel.target.split( '.' ).pop();
					if ( extension.toLowerCase() === 'model' ) return rel;

				}

			}

			function build( objects, data3mf ) {

				const group = new THREE.Group();
				const relationship = fetch3DModelPart( data3mf[ 'rels' ] );
				const buildData = data3mf.model[ relationship[ 'target' ].substring( 1 ) ][ 'build' ];

				for ( let i = 0; i < buildData.length; i ++ ) {

					const buildItem = buildData[ i ];
					const object3D = objects[ buildItem[ 'objectId' ] ].clone(); // apply transform

					const transform = buildItem[ 'transform' ];

					if ( transform ) {

						object3D.applyMatrix4( transform );

					}

					group.add( object3D );

				}

				return group;

			}

			const data3mf = loadDocument( data );
			const objects = buildObjects( data3mf );
			return build( objects, data3mf );

		}

		addExtension( extension ) {

			this.availableExtensions.push( extension );

		}

	}

	THREE.ThreeMFLoader = ThreeMFLoader;

} )();
