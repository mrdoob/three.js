/**
 * @author technohippy / https://github.com/technohippy
 */

THREE.ThreeMFLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.availableExtensions = [];

};

THREE.ThreeMFLoader.prototype = {

	constructor: THREE.ThreeMFLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;
		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			onLoad( scope.parse( buffer ) );

		}, onProgress, onError );

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	parse: function ( data ) {

		var scope = this;

		function loadDocument( data ) {

			var zip = null;
			var file = null;

			var relsName;
			var modelPartNames = [];
			var printTicketPartNames = [];
			var texturesPartNames = [];
			var otherPartNames = [];

			var rels;
			var modelParts = {};
			var printTicketParts = {};
			var texturesParts = {};
			var otherParts = {};

			try {

				zip = new JSZip( data ); // eslint-disable-line no-undef

			} catch ( e ) {

				if ( e instanceof ReferenceError ) {

					console.error( 'THREE.ThreeMFLoader: jszip missing and file is compressed.' );
					return null;

				}

			}

			for ( file in zip.files ) {

				if ( file.match( /\.rels$/ ) ) {

					relsName = file;

				} else if ( file.match( /^3D\/.*\.model$/ ) ) {

					modelPartNames.push( file );

				} else if ( file.match( /^3D\/Metadata\/.*\.xml$/ ) ) {

					printTicketPartNames.push( file );

				} else if ( file.match( /^3D\/Textures\/.*/ ) ) {

					texturesPartNames.push( file );

				} else if ( file.match( /^3D\/Other\/.*/ ) ) {

					otherPartNames.push( file );

				}

			}

			var relsView = new Uint8Array( zip.file( relsName ).asArrayBuffer() );
			var relsFileText = THREE.LoaderUtils.decodeText( relsView );
			rels = parseRelsXml( relsFileText );

			for ( var i = 0; i < modelPartNames.length; i ++ ) {

				var modelPart = modelPartNames[ i ];
				var view = new Uint8Array( zip.file( modelPart ).asArrayBuffer() );

				var fileText = THREE.LoaderUtils.decodeText( view );
				var xmlData = new DOMParser().parseFromString( fileText, 'application/xml' );

				if ( xmlData.documentElement.nodeName.toLowerCase() !== 'model' ) {

					console.error( 'THREE.ThreeMFLoader: Error loading 3MF - no 3MF document found: ', modelPart );

				}

				var modelNode = xmlData.querySelector( 'model' );
				var extensions = {};

				for ( var i = 0; i < modelNode.attributes.length; i ++ ) {

					var attr = modelNode.attributes[ i ];
					if ( attr.name.match( /^xmlns:(.+)$/ ) ) {

						extensions[ attr.value ] = RegExp.$1;

					}

				}

				var modelData = parseModelNode( modelNode );
				modelData[ 'xml' ] = modelNode;

				if ( 0 < Object.keys( extensions ).length ) {

					modelData[ 'extensions' ] = extensions;

				}

				modelParts[ modelPart ] = modelData;

			}

			for ( var i = 0; i < texturesPartNames.length; i ++ ) {

				var texturesPartName = texturesPartNames[ i ];
				texturesParts[ texturesPartName ] = zip.file( texturesPartName ).asBinary();

			}

			return {
				rels: rels,
				model: modelParts,
				printTicket: printTicketParts,
				texture: texturesParts,
				other: otherParts
			};

		}

		function parseRelsXml( relsFileText ) {

			var relsXmlData = new DOMParser().parseFromString( relsFileText, 'application/xml' );
			var relsNode = relsXmlData.querySelector( 'Relationship' );
			var target = relsNode.getAttribute( 'Target' );
			var id = relsNode.getAttribute( 'Id' );
			var type = relsNode.getAttribute( 'Type' );

			return {
				target: target,
				id: id,
				type: type
			};

		}

		function parseMetadataNodes( metadataNodes ) {

			var metadataData = {};

			for ( var i = 0; i < metadataNodes.length; i ++ ) {

				var metadataNode = metadataNodes[ i ];
				var name = metadataNode.getAttribute( 'name' );
				var validNames = [
					'Title',
					'Designer',
					'Description',
					'Copyright',
					'LicenseTerms',
					'Rating',
					'CreationDate',
					'ModificationDate'
				];

				if ( 0 <= validNames.indexOf( name ) ) {

					metadataData[ name ] = metadataNode.textContent;

				}

			}

			return metadataData;

		}

		function parseBasematerialsNode( /* basematerialsNode */ ) {

		}

		function parseMeshNode( meshNode ) {

			var meshData = {};

			var vertices = [];
			var vertexNodes = meshNode.querySelectorAll( 'vertices vertex' );

			for ( var i = 0; i < vertexNodes.length; i ++ ) {

				var vertexNode = vertexNodes[ i ];
				var x = vertexNode.getAttribute( 'x' );
				var y = vertexNode.getAttribute( 'y' );
				var z = vertexNode.getAttribute( 'z' );

				vertices.push( parseFloat( x ), parseFloat( y ), parseFloat( z ) );

			}

			meshData[ 'vertices' ] = new Float32Array( vertices.length );

			for ( var i = 0; i < vertices.length; i ++ ) {

				meshData[ 'vertices' ][ i ] = vertices[ i ];

			}

			var triangleProperties = [];
			var triangles = [];
			var triangleNodes = meshNode.querySelectorAll( 'triangles triangle' );

			for ( var i = 0; i < triangleNodes.length; i ++ ) {

				var triangleNode = triangleNodes[ i ];
				var v1 = triangleNode.getAttribute( 'v1' );
				var v2 = triangleNode.getAttribute( 'v2' );
				var v3 = triangleNode.getAttribute( 'v3' );
				var p1 = triangleNode.getAttribute( 'p1' );
				var p2 = triangleNode.getAttribute( 'p2' );
				var p3 = triangleNode.getAttribute( 'p3' );
				var pid = triangleNode.getAttribute( 'pid' );

				triangles.push( parseInt( v1, 10 ), parseInt( v2, 10 ), parseInt( v3, 10 ) );

				var triangleProperty = {};

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
			meshData[ 'triangles' ] = new Uint32Array( triangles.length );

			for ( var i = 0; i < triangles.length; i ++ ) {

				meshData[ 'triangles' ][ i ] = triangles[ i ];

			}

			return meshData;

		}

		function parseComponentsNode( componentsNode ) {

			var components = [];

			var componentNodes = componentsNode.querySelectorAll( 'component' );

			for ( var i = 0; i < componentNodes.length; i ++ ) {

				var componentNode = componentNodes[ i ];
				var componentData = parseComponentNode( componentNode );
				components.push( componentData );

			}

			return components;

		}

		function parseComponentNode( componentNode ) {

			var componentData = {};

			componentData[ 'objectId' ] = componentNode.getAttribute( 'objectid' ); // required

			var transform = componentNode.getAttribute( 'transform' );

			if ( transform ) {

				componentData[ 'transform' ] = parseTransform( transform );

			}

			return componentData;

		}

		function parseTransform( transform ) {

			var t = [];
			transform.split( ' ' ).forEach( function ( s ) {

				t.push( parseFloat( s ) );

			} );

			var matrix = new THREE.Matrix4();
			matrix.set(
				t[ 0 ], t[ 3 ], t[ 6 ], t[ 9 ],
				t[ 1 ], t[ 4 ], t[ 7 ], t[ 10 ],
				t[ 2 ], t[ 5 ], t[ 8 ], t[ 11 ],
				 0.0, 0.0, 0.0, 1.0
			);

			return matrix;

		}

		function parseObjectNode( objectNode ) {

			var objectData = {
				type: objectNode.getAttribute( 'type' )
			};

			var id = objectNode.getAttribute( 'id' );

			if ( id ) {

				objectData[ 'id' ] = id;

			}

			var pid = objectNode.getAttribute( 'pid' );

			if ( pid ) {

				objectData[ 'pid' ] = pid;

			}

			var pindex = objectNode.getAttribute( 'pindex' );

			if ( pindex ) {

				objectData[ 'pindex' ] = pindex;

			}

			var thumbnail = objectNode.getAttribute( 'thumbnail' );

			if ( thumbnail ) {

				objectData[ 'thumbnail' ] = thumbnail;

			}

			var partnumber = objectNode.getAttribute( 'partnumber' );

			if ( partnumber ) {

				objectData[ 'partnumber' ] = partnumber;

			}

			var name = objectNode.getAttribute( 'name' );

			if ( name ) {

				objectData[ 'name' ] = name;

			}

			var meshNode = objectNode.querySelector( 'mesh' );

			if ( meshNode ) {

				objectData[ 'mesh' ] = parseMeshNode( meshNode );

			}

			var componentsNode = objectNode.querySelector( 'components' );

			if ( componentsNode ) {

				objectData[ 'components' ] = parseComponentsNode( componentsNode );

			}

			return objectData;

		}

		function parseResourcesNode( resourcesNode ) {

			var resourcesData = {};
			var basematerialsNode = resourcesNode.querySelector( 'basematerials' );

			if ( basematerialsNode ) {

				resourcesData[ 'basematerial' ] = parseBasematerialsNode( basematerialsNode );

			}

			resourcesData[ 'object' ] = {};
			var objectNodes = resourcesNode.querySelectorAll( 'object' );

			for ( var i = 0; i < objectNodes.length; i ++ ) {

				var objectNode = objectNodes[ i ];
				var objectData = parseObjectNode( objectNode );
				resourcesData[ 'object' ][ objectData[ 'id' ] ] = objectData;

			}

			return resourcesData;

		}

		function parseBuildNode( buildNode ) {

			var buildData = [];
			var itemNodes = buildNode.querySelectorAll( 'item' );

			for ( var i = 0; i < itemNodes.length; i ++ ) {

				var itemNode = itemNodes[ i ];
				var buildItem = {
					objectId: itemNode.getAttribute( 'objectid' )
				};
				var transform = itemNode.getAttribute( 'transform' );

				if ( transform ) {

					buildItem[ 'transform' ] = parseTransform( transform );

				}

				buildData.push( buildItem );

			}

			return buildData;

		}

		function parseModelNode( modelNode ) {

			var modelData = { unit: modelNode.getAttribute( 'unit' ) || 'millimeter' };
			var metadataNodes = modelNode.querySelectorAll( 'metadata' );

			if ( metadataNodes ) {

				modelData[ 'metadata' ] = parseMetadataNodes( metadataNodes );

			}

			var resourcesNode = modelNode.querySelector( 'resources' );

			if ( resourcesNode ) {

				modelData[ 'resources' ] = parseResourcesNode( resourcesNode );

			}

			var buildNode = modelNode.querySelector( 'build' );

			if ( buildNode ) {

				modelData[ 'build' ] = parseBuildNode( buildNode );

			}

			return modelData;

		}

		function buildMesh( meshData ) {

			var geometry = new THREE.BufferGeometry();
			geometry.setIndex( new THREE.BufferAttribute( meshData[ 'triangles' ], 1 ) );
			geometry.addAttribute( 'position', new THREE.BufferAttribute( meshData[ 'vertices' ], 3 ) );

			if ( meshData[ 'colors' ] ) {

				geometry.addAttribute( 'color', new THREE.BufferAttribute( meshData[ 'colors' ], 3 ) );

			}

			geometry.computeBoundingSphere();

			var materialOpts = {
				flatShading: true
			};

			if ( meshData[ 'colors' ] && 0 < meshData[ 'colors' ].length ) {

				materialOpts[ 'vertexColors' ] = THREE.VertexColors;

			} else {

				materialOpts[ 'color' ] = 0xaaaaff;

			}

			var material = new THREE.MeshPhongMaterial( materialOpts );
			return new THREE.Mesh( geometry, material );

		}

		function applyExtensions( extensions, meshData, modelXml ) {

			if ( ! extensions ) {

				return;

			}

			var availableExtensions = [];
			var keys = Object.keys( extensions );

			for ( var i = 0; i < keys.length; i ++ ) {

				var ns = keys[ i ];

				for ( var j = 0; j < scope.availableExtensions.length; j ++ ) {

					var extension = scope.availableExtensions[ j ];

					if ( extension.ns === ns ) {

						availableExtensions.push( extension );

					}

				}

			}

			for ( var i = 0; i < availableExtensions.length; i ++ ) {

				var extension = availableExtensions[ i ];
				extension.apply( modelXml, extensions[ extension[ 'ns' ] ], meshData );

			}

		}

		function buildObjects( data3mf ) {

			var modelsData = data3mf.model;
			var objects = {};
			var modelsKeys = Object.keys( modelsData );

			for ( var i = 0; i < modelsKeys.length; i ++ ) {

				var modelsKey = modelsKeys[ i ];
				var modelData = modelsData[ modelsKey ];
				var modelXml = modelData[ 'xml' ];
				var extensions = modelData[ 'extensions' ];

				var objectIds = Object.keys( modelData[ 'resources' ][ 'object' ] );

				for ( var j = 0; j < objectIds.length; j ++ ) {

					var objectId = objectIds[ j ];
					var objectData = modelData[ 'resources' ][ 'object' ][ objectId ];
					var meshData = objectData[ 'mesh' ];

					if ( meshData ) {

						applyExtensions( extensions, meshData, modelXml );

						objects[ objectId ] = {
							isMesh: true,
							mesh: buildMesh( meshData )
						};

					} else {

						objects[ objectId ] = {
							isComposite: true,
							components:	objectData[ 'components' ]
						};

					}

				}

			}

			return objects;

		}

		function build( objects, refs, data3mf ) {

			var group = new THREE.Group();
			var buildData = data3mf.model[ refs[ 'target' ].substring( 1 ) ][ 'build' ];

			for ( var i = 0; i < buildData.length; i ++ ) {

				var buildItem = buildData[ i ];
				var object = objects[ buildItem[ 'objectId' ] ];

				if ( object.isComposite ) {

					var composite = new THREE.Group();
					var components = object.components;

					// add meshes to composite object

					for ( var j = 0; j < components.length; j ++ ) {

						var component = components[ j ];
						var mesh = objects[ component.objectId ].mesh.clone();

						var transform = component.transform;

						if ( transform ) {

							mesh.applyMatrix( transform );

						}

						composite.add( mesh );

					}

					// transform composite if necessary

					var transform = buildItem[ 'transform' ];

					if ( transform ) {

						composite.applyMatrix( transform );

					}

					group.add( composite );


				} else {

					var mesh = object.mesh;
					var transform = buildItem[ 'transform' ];

					if ( transform ) {

						mesh.applyMatrix( transform );

					}

					group.add( mesh );

				}

			}

			return group;

		}

		var data3mf = loadDocument( data );
		var objects = buildObjects( data3mf );

		return build( objects, data3mf[ 'rels' ], data3mf );

	},

	addExtension: function ( extension ) {

		this.availableExtensions.push( extension );

	}

};
