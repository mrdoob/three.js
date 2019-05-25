/*
 * @author tamarintech / https://tamarintech.com
 *
 * Description: Early release of an AMF Loader following the pattern of the
 * example loaders in the three.js project.
 *
 * More information about the AMF format: http://amf.wikispaces.com
 *
 * Usage:
 *	var loader = new AMFLoader();
 *	loader.load('/path/to/project.amf', function(objecttree) {
 *		scene.add(objecttree);
 *	});
 *
 * Materials now supported, material colors supported
 * Zip support, requires jszip
 * No constellation support (yet)!
 *
 */

import {
	BufferGeometry,
	Color,
	DefaultLoadingManager,
	FileLoader,
	Float32BufferAttribute,
	Group,
	LoaderUtils,
	Mesh,
	MeshPhongMaterial
} from "../../../build/three.module.js";

var AMFLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

};

AMFLoader.prototype = {

	constructor: AMFLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
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

		function loadDocument( data ) {

			var view = new DataView( data );
			var magic = String.fromCharCode( view.getUint8( 0 ), view.getUint8( 1 ) );

			if ( magic === 'PK' ) {

				var zip = null;
				var file = null;

				console.log( 'THREE.AMFLoader: Loading Zip' );

				try {

					zip = new JSZip( data ); // eslint-disable-line no-undef

				} catch ( e ) {

					if ( e instanceof ReferenceError ) {

						console.log( 'THREE.AMFLoader: jszip missing and file is compressed.' );
						return null;

					}

				}

				for ( file in zip.files ) {

					if ( file.toLowerCase().substr( - 4 ) === '.amf' ) {

						break;

					}

				}

				console.log( 'THREE.AMFLoader: Trying to load file asset: ' + file );
				view = new DataView( zip.file( file ).asArrayBuffer() );

			}

			var fileText = LoaderUtils.decodeText( view );
			var xmlData = new DOMParser().parseFromString( fileText, 'application/xml' );

			if ( xmlData.documentElement.nodeName.toLowerCase() !== 'amf' ) {

				console.log( 'THREE.AMFLoader: Error loading AMF - no AMF document found.' );
				return null;

			}

			return xmlData;

		}

		function loadDocumentScale( node ) {

			var scale = 1.0;
			var unit = 'millimeter';

			if ( node.documentElement.attributes.unit !== undefined ) {

				unit = node.documentElement.attributes.unit.value.toLowerCase();

			}

			var scaleUnits = {
				millimeter: 1.0,
				inch: 25.4,
				feet: 304.8,
				meter: 1000.0,
				micron: 0.001
			};

			if ( scaleUnits[ unit ] !== undefined ) {

				scale = scaleUnits[ unit ];

			}

			console.log( 'THREE.AMFLoader: Unit scale: ' + scale );
			return scale;

		}

		function loadMaterials( node ) {

			var matName = 'AMF Material';
			var matId = node.attributes.id.textContent;
			var color = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

			var loadedMaterial = null;

			for ( var i = 0; i < node.childNodes.length; i ++ ) {

				var matChildEl = node.childNodes[ i ];

				if ( matChildEl.nodeName === 'metadata' && matChildEl.attributes.type !== undefined ) {

					if ( matChildEl.attributes.type.value === 'name' ) {

						matName = matChildEl.textContent;

					}

				} else if ( matChildEl.nodeName === 'color' ) {

					color = loadColor( matChildEl );

				}

			}

			loadedMaterial = new MeshPhongMaterial( {
				flatShading: true,
				color: new Color( color.r, color.g, color.b ),
				name: matName
			} );

			if ( color.a !== 1.0 ) {

				loadedMaterial.transparent = true;
				loadedMaterial.opacity = color.a;

			}

			return { id: matId, material: loadedMaterial };

		}

		function loadColor( node ) {

			var color = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

			for ( var i = 0; i < node.childNodes.length; i ++ ) {

				var matColor = node.childNodes[ i ];

				if ( matColor.nodeName === 'r' ) {

					color.r = matColor.textContent;

				} else if ( matColor.nodeName === 'g' ) {

					color.g = matColor.textContent;

				} else if ( matColor.nodeName === 'b' ) {

					color.b = matColor.textContent;

				} else if ( matColor.nodeName === 'a' ) {

					color.a = matColor.textContent;

				}

			}

			return color;

		}

		function loadMeshVolume( node ) {

			var volume = { name: '', triangles: [], materialid: null };

			var currVolumeNode = node.firstElementChild;

			if ( node.attributes.materialid !== undefined ) {

				volume.materialId = node.attributes.materialid.nodeValue;

			}

			while ( currVolumeNode ) {

				if ( currVolumeNode.nodeName === 'metadata' ) {

					if ( currVolumeNode.attributes.type !== undefined ) {

						if ( currVolumeNode.attributes.type.value === 'name' ) {

							volume.name = currVolumeNode.textContent;

						}

					}

				} else if ( currVolumeNode.nodeName === 'triangle' ) {

					var v1 = currVolumeNode.getElementsByTagName( 'v1' )[ 0 ].textContent;
					var v2 = currVolumeNode.getElementsByTagName( 'v2' )[ 0 ].textContent;
					var v3 = currVolumeNode.getElementsByTagName( 'v3' )[ 0 ].textContent;

					volume.triangles.push( v1, v2, v3 );

				}

				currVolumeNode = currVolumeNode.nextElementSibling;

			}

			return volume;

		}

		function loadMeshVertices( node ) {

			var vertArray = [];
			var normalArray = [];
			var currVerticesNode = node.firstElementChild;

			while ( currVerticesNode ) {

				if ( currVerticesNode.nodeName === 'vertex' ) {

					var vNode = currVerticesNode.firstElementChild;

					while ( vNode ) {

						if ( vNode.nodeName === 'coordinates' ) {

							var x = vNode.getElementsByTagName( 'x' )[ 0 ].textContent;
							var y = vNode.getElementsByTagName( 'y' )[ 0 ].textContent;
							var z = vNode.getElementsByTagName( 'z' )[ 0 ].textContent;

							vertArray.push( x, y, z );

						} else if ( vNode.nodeName === 'normal' ) {

							var nx = vNode.getElementsByTagName( 'nx' )[ 0 ].textContent;
							var ny = vNode.getElementsByTagName( 'ny' )[ 0 ].textContent;
							var nz = vNode.getElementsByTagName( 'nz' )[ 0 ].textContent;

							normalArray.push( nx, ny, nz );

						}

						vNode = vNode.nextElementSibling;

					}

				}
				currVerticesNode = currVerticesNode.nextElementSibling;

			}

			return { 'vertices': vertArray, 'normals': normalArray };

		}

		function loadObject( node ) {

			var objId = node.attributes.id.textContent;
			var loadedObject = { name: 'amfobject', meshes: [] };
			var currColor = null;
			var currObjNode = node.firstElementChild;

			while ( currObjNode ) {

				if ( currObjNode.nodeName === 'metadata' ) {

					if ( currObjNode.attributes.type !== undefined ) {

						if ( currObjNode.attributes.type.value === 'name' ) {

							loadedObject.name = currObjNode.textContent;

						}

					}

				} else if ( currObjNode.nodeName === 'color' ) {

					currColor = loadColor( currObjNode );

				} else if ( currObjNode.nodeName === 'mesh' ) {

					var currMeshNode = currObjNode.firstElementChild;
					var mesh = { vertices: [], normals: [], volumes: [], color: currColor };

					while ( currMeshNode ) {

						if ( currMeshNode.nodeName === 'vertices' ) {

							var loadedVertices = loadMeshVertices( currMeshNode );

							mesh.normals = mesh.normals.concat( loadedVertices.normals );
							mesh.vertices = mesh.vertices.concat( loadedVertices.vertices );

						} else if ( currMeshNode.nodeName === 'volume' ) {

							mesh.volumes.push( loadMeshVolume( currMeshNode ) );

						}

						currMeshNode = currMeshNode.nextElementSibling;

					}

					loadedObject.meshes.push( mesh );

				}

				currObjNode = currObjNode.nextElementSibling;

			}

			return { 'id': objId, 'obj': loadedObject };

		}

		var xmlData = loadDocument( data );
		var amfName = '';
		var amfAuthor = '';
		var amfScale = loadDocumentScale( xmlData );
		var amfMaterials = {};
		var amfObjects = {};
		var childNodes = xmlData.documentElement.childNodes;

		var i, j;

		for ( i = 0; i < childNodes.length; i ++ ) {

			var child = childNodes[ i ];

			if ( child.nodeName === 'metadata' ) {

				if ( child.attributes.type !== undefined ) {

					if ( child.attributes.type.value === 'name' ) {

						amfName = child.textContent;

					} else if ( child.attributes.type.value === 'author' ) {

						amfAuthor = child.textContent;

					}

				}

			} else if ( child.nodeName === 'material' ) {

				var loadedMaterial = loadMaterials( child );

				amfMaterials[ loadedMaterial.id ] = loadedMaterial.material;

			} else if ( child.nodeName === 'object' ) {

				var loadedObject = loadObject( child );

				amfObjects[ loadedObject.id ] = loadedObject.obj;

			}

		}

		var sceneObject = new Group();
		var defaultMaterial = new MeshPhongMaterial( { color: 0xaaaaff, flatShading: true } );

		sceneObject.name = amfName;
		sceneObject.userData.author = amfAuthor;
		sceneObject.userData.loader = 'AMF';

		for ( var id in amfObjects ) {

			var part = amfObjects[ id ];
			var meshes = part.meshes;
			var newObject = new Group();
			newObject.name = part.name || '';

			for ( i = 0; i < meshes.length; i ++ ) {

				var objDefaultMaterial = defaultMaterial;
				var mesh = meshes[ i ];
				var vertices = new Float32BufferAttribute( mesh.vertices, 3 );
				var normals = null;

				if ( mesh.normals.length ) {

					normals = new Float32BufferAttribute( mesh.normals, 3 );

				}

				if ( mesh.color ) {

					var color = mesh.color;

					objDefaultMaterial = defaultMaterial.clone();
					objDefaultMaterial.color = new Color( color.r, color.g, color.b );

					if ( color.a !== 1.0 ) {

						objDefaultMaterial.transparent = true;
						objDefaultMaterial.opacity = color.a;

					}

				}

				var volumes = mesh.volumes;

				for ( j = 0; j < volumes.length; j ++ ) {

					var volume = volumes[ j ];
					var newGeometry = new BufferGeometry();
					var material = objDefaultMaterial;

					newGeometry.setIndex( volume.triangles );
					newGeometry.addAttribute( 'position', vertices.clone() );

					if ( normals ) {

						newGeometry.addAttribute( 'normal', normals.clone() );

					}

					if ( amfMaterials[ volume.materialId ] !== undefined ) {

						material = amfMaterials[ volume.materialId ];

					}

					newGeometry.scale( amfScale, amfScale, amfScale );
					newObject.add( new Mesh( newGeometry, material.clone() ) );

				}

			}

			sceneObject.add( newObject );

		}

		return sceneObject;

	}

};

export { AMFLoader };
