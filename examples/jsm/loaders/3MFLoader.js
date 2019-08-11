/**
 * @author technohippy / https://github.com/technohippy
 * @author Mugen87 / https://github.com/Mugen87
 *
 * 3D Manufacturing Format (3MF) specification: https://3mf.io/specification/
 *
 * The following features from the core specification are supported:
 *
 * - 3D Models
 * - Object Resources (Meshes and Components)
 * - Material Resources (Base Materials)
 *
 * 3MF Materials and Properties Extension (e.g. textures) are not yet supported.
 *
 */

import {
	BufferAttribute,
	BufferGeometry,
	DefaultLoadingManager,
	FileLoader,
	Group,
	LoaderUtils,
	Matrix4,
	Mesh,
	MeshPhongMaterial
} from "../../../build/three.module.js";

var ThreeMFLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.availableExtensions = [];

};

ThreeMFLoader.prototype = {

	constructor: ThreeMFLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;
		var loader = new FileLoader( scope.manager );
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

					console.error( 'THREE.3MFLoader: jszip missing and file is compressed.' );
					return null;

				}

			}

			for ( file in zip.files ) {

				if ( file.match( /\_rels\/.rels$/ ) ) {

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
			var relsFileText = LoaderUtils.decodeText( relsView );
			rels = parseRelsXml( relsFileText );

			for ( var i = 0; i < modelPartNames.length; i ++ ) {

				var modelPart = modelPartNames[ i ];
				var view = new Uint8Array( zip.file( modelPart ).asArrayBuffer() );

				var fileText = LoaderUtils.decodeText( view );
				var xmlData = new DOMParser().parseFromString( fileText, 'application/xml' );

				if ( xmlData.documentElement.nodeName.toLowerCase() !== 'model' ) {

					console.error( 'THREE.3MFLoader: Error loading 3MF - no 3MF document found: ', modelPart );

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

		function parseBasematerialsNode( basematerialsNode ) {

			var basematerialsData = {
				id: basematerialsNode.getAttribute( 'id' ), // required
				basematerials: []
			};

			var basematerialNodes = basematerialsNode.querySelectorAll( 'base' );

			for ( var i = 0; i < basematerialNodes.length; i ++ ) {

				var basematerialNode = basematerialNodes[ i ];
				var basematerialData = parseBasematerialNode( basematerialNode );
				basematerialsData.basematerials.push( basematerialData );

			}

			return basematerialsData;

		}

		function parseBasematerialNode( basematerialNode ) {

			var basematerialData = {};

			basematerialData[ 'name' ] = basematerialNode.getAttribute( 'name' ); // required
			basematerialData[ 'displaycolor' ] = basematerialNode.getAttribute( 'displaycolor' ); // required

			return basematerialData;

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

			var matrix = new Matrix4();
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

				resourcesData[ 'basematerials' ] = parseBasematerialsNode( basematerialsNode );

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

		function buildMesh( meshData, objects, modelData, objectData ) {

			// geometry

			var geometry = new BufferGeometry();
			geometry.setIndex( new BufferAttribute( meshData[ 'triangles' ], 1 ) );
			geometry.addAttribute( 'position', new BufferAttribute( meshData[ 'vertices' ], 3 ) );

			// groups

			var basematerialsData = modelData[ 'resources' ][ 'basematerials' ];
			var triangleProperties = meshData[ 'triangleProperties' ];

			var start = 0;
			var count = 0;
			var currentMaterialIndex = - 1;

			for ( var i = 0, l = triangleProperties.length; i < l; i ++ ) {

				var triangleProperty = triangleProperties[ i ];
				var pid = triangleProperty.pid;

				// only proceed if the triangle refers to a basematerials definition

				if ( basematerialsData && ( basematerialsData.id === pid ) ) {

					if ( currentMaterialIndex === - 1 ) currentMaterialIndex = triangleProperty.p1;

					if ( currentMaterialIndex === triangleProperty.p1 ) {

						count += 3; // primitves per triangle

					} else {

						geometry.addGroup( start, count, currentMaterialIndex );

						start += count;
						count = 3;
						currentMaterialIndex = triangleProperty.p1;

					}

				}

			}

			if ( geometry.groups.length > 0 ) mergeGroups( geometry );

			geometry.computeBoundingSphere();

			// material

			var material;

			// add material if an object-level definition is present

			if ( basematerialsData && ( basematerialsData.id === objectData.pid ) ) {

				var materialIndex = objectData.pindex;
				var basematerialData = basematerialsData.basematerials[ materialIndex ];

				material = getBuild( basematerialData, objects, modelData, objectData, buildBasematerial );

			}

			// add/overwrite material if definitions on triangles are present

			if ( geometry.groups.length > 0 ) {

				var groups = geometry.groups;
				material = [];

				for ( var i = 0, l = groups.length; i < l; i ++ ) {

					var group = groups[ i ];
					var basematerialData = basematerialsData.basematerials[ group.materialIndex ];

					material.push( getBuild( basematerialData, objects, modelData, objectData, buildBasematerial ) );

				}

			}

			// default material

			if ( material === undefined ) material = new MeshPhongMaterial( { color: 0xaaaaff, flatShading: true } );

			return new Mesh( geometry, material );

		}

		function mergeGroups( geometry ) {

			// sort by material index

			var groups = geometry.groups.sort( function ( a, b ) {

				if ( a.materialIndex !== b.materialIndex ) return a.materialIndex - b.materialIndex;

				return a.start - b.start;

			} );

			// reorganize index buffer

			var index = geometry.index;

			var itemSize = index.itemSize;
			var srcArray = index.array;

			var targetOffset = 0;

			var targetArray = new srcArray.constructor( srcArray.length );

			for ( var i = 0; i < groups.length; i ++ ) {

				var group = groups[ i ];

				var groupLength = group.count * itemSize;
				var groupStart = group.start * itemSize;

				var sub = srcArray.subarray( groupStart, groupStart + groupLength );

				targetArray.set( sub, targetOffset );

				targetOffset += groupLength;

			}

			srcArray.set( targetArray );

			// update groups

			var start = 0;

			for ( i = 0; i < groups.length; i ++ ) {

				group = groups[ i ];

				group.start = start;
				start += group.count;

			}

			// merge groups

			var lastGroup = groups[ 0 ];

			geometry.groups = [ lastGroup ];

			for ( i = 1; i < groups.length; i ++ ) {

				group = groups[ i ];

				if ( lastGroup.materialIndex === group.materialIndex ) {

					lastGroup.count += group.count;

				} else {

					lastGroup = group;
					geometry.groups.push( lastGroup );

				}

			}

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

		function getBuild( data, objects, modelData, objectData, builder ) {

			if ( data.build !== undefined ) return data.build;

			data.build = builder( data, objects, modelData, objectData );

			return data.build;

		}

		function buildBasematerial( materialData ) {

			var material = new MeshPhongMaterial( { flatShading: true } );

			material.name = materialData.name;

			// displaycolor MUST be specified with a value of a 6 or 8 digit hexadecimal number, e.g. "#RRGGBB" or "#RRGGBBAA"

			var displaycolor = materialData.displaycolor;

			var color = displaycolor.substring( 0, 7 );
			material.color.setStyle( color );
			material.color.convertSRGBToLinear(); // displaycolor is in sRGB

			// process alpha if set

			if ( displaycolor.length === 9 ) {

				material.opacity = parseInt( displaycolor.charAt( 7 ) + displaycolor.charAt( 8 ), 16 ) / 255;

			}

			return material;

		}

		function buildComposite( compositeData, objects, modelData ) {

			var composite = new Group();

			for ( var j = 0; j < compositeData.length; j ++ ) {

				var component = compositeData[ j ];
				var build = objects[ component.objectId ];

				if ( build === undefined ) {

					buildObject( component.objectId, objects, modelData );
					build = objects[ component.objectId ];

				}

				var object3D = build.clone();

				// apply component transfrom

				var transform = component.transform;

				if ( transform ) {

					object3D.applyMatrix( transform );

				}

				composite.add( object3D );

			}

			return composite;

		}

		function buildObject( objectId, objects, modelData ) {

			var objectData = modelData[ 'resources' ][ 'object' ][ objectId ];

			if ( objectData[ 'mesh' ] ) {

				var meshData = objectData[ 'mesh' ];

				var extensions = modelData[ 'extensions' ];
				var modelXml = modelData[ 'xml' ];

				applyExtensions( extensions, meshData, modelXml );

				objects[ objectData.id ] = getBuild( meshData, objects, modelData, objectData, buildMesh );

			} else {

				var compositeData = objectData[ 'components' ];

				objects[ objectData.id ] = getBuild( compositeData, objects, modelData, objectData, buildComposite );

			}

		}

		function buildObjects( data3mf ) {

			var modelsData = data3mf.model;
			var objects = {};
			var modelsKeys = Object.keys( modelsData );

			for ( var i = 0; i < modelsKeys.length; i ++ ) {

				var modelsKey = modelsKeys[ i ];
				var modelData = modelsData[ modelsKey ];

				var objectIds = Object.keys( modelData[ 'resources' ][ 'object' ] );

				for ( var j = 0; j < objectIds.length; j ++ ) {

					var objectId = objectIds[ j ];

					buildObject( objectId, objects, modelData );

				}

			}

			return objects;

		}

		function build( objects, refs, data3mf ) {

			var group = new Group();
			var buildData = data3mf.model[ refs[ 'target' ].substring( 1 ) ][ 'build' ];

			for ( var i = 0; i < buildData.length; i ++ ) {

				var buildItem = buildData[ i ];
				var object3D = objects[ buildItem[ 'objectId' ] ];

				// apply transform

				var transform = buildItem[ 'transform' ];

				if ( transform ) {

					object3D.applyMatrix( transform );

				}

				group.add( object3D );

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

export { ThreeMFLoader };
