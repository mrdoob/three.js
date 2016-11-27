/**
 * @author yamahigashi https://github.com/yamahigashi
 * @author Kyle-Larson https://github.com/Kyle-Larson
 *
 * This loader loads FBX file in *ASCII and version 7 format*.
 *
 * Support
 *  - mesh
 *  - skinning
 *  - normal / uv
 *
 *  Not Support
 *  - material
 *  - texture
 *  - morph
 */

( function() {

	THREE.FBXLoader = function ( manager ) {

		THREE.Loader.call( this );
		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
		this.textureLoader = null;
		this.textureBasePath = null;

	};

	THREE.FBXLoader.prototype = Object.create( THREE.Loader.prototype );

	THREE.FBXLoader.prototype.constructor = THREE.FBXLoader;

	THREE.FBXLoader.prototype.load = function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		// loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			if ( ! scope.isFbxFormatASCII( text ) ) {

				console.warn( 'FBXLoader: !!! FBX Binary format not supported !!!' );

			} else if ( ! scope.isFbxVersionSupported( text ) ) {

				console.warn( 'FBXLoader: !!! FBX Version below 7 not supported !!!' );

			} else {

				scope.textureBasePath = scope.extractUrlBase( url );
				onLoad( scope.parse( text ) );

			}

		}, onProgress, onError );

	};

	THREE.FBXLoader.prototype.setCrossOrigin = function ( value ) {

		this.crossOrigin = value;

	};

	THREE.FBXLoader.prototype.isFbxFormatASCII = function ( body ) {

		var CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

		var cursor = 0;
		var read = function ( offset ) {

			var result = body[ offset - 1 ];
			body = body.slice( cursor + offset );
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

	};

	THREE.FBXLoader.prototype.isFbxVersionSupported = function ( body ) {

		var versionExp = /FBXVersion: (\d+)/;
		var match = body.match( versionExp );
		if ( match ) {

			var version = parseInt( match[ 1 ] );
			console.log( 'FBXLoader: FBX version ' + version );
			return version >= 7000;

		}
		return false;

	};

	THREE.FBXLoader.prototype.parse = function ( text ) {

		var scope = this;

		console.time( 'FBXLoader' );

		console.time( 'FBXLoader: TextParser' );
		var nodes = new FBXParser().parse( text );
		console.timeEnd( 'FBXLoader: TextParser' );

		console.time( 'FBXLoader: ObjectParser' );
		scope.hierarchy = ( new Bones() ).parseHierarchy( nodes );
		scope.weights	= ( new Weights() ).parse( nodes, scope.hierarchy );
		scope.animations = ( new Animation() ).parse( nodes, scope.hierarchy );
		scope.textures = ( new Textures() ).parse( nodes, scope.hierarchy );
		scope.materials = ( new Materials() ).parse( nodes, scope.hierarchy );
		console.timeEnd( 'FBXLoader: ObjectParser' );

		console.time( 'FBXLoader: GeometryParser' );
		var geometries = this.parseGeometries( nodes );
		console.timeEnd( 'FBXLoader: GeometryParser' );

		var container = new THREE.Group();

		for ( var i = 0; i < geometries.length; ++ i ) {

			if ( geometries[ i ] === undefined ) {

				continue;

			}

			container.add( geometries[ i ] );

			//wireframe = new THREE.WireframeHelper( geometries[i], 0x00ff00 );
			//container.add( wireframe );

			//vnh = new THREE.VertexNormalsHelper( geometries[i], 0.6 );
			//container.add( vnh );

			//skh = new THREE.SkeletonHelper( geometries[i] );
			//container.add( skh );

			// container.add( new THREE.BoxHelper( geometries[i] ) );

		}

		console.timeEnd( 'FBXLoader' );
		return container;

	};

	THREE.FBXLoader.prototype.parseGeometries = function ( node ) {

		// has not geo, return []
		if ( ! ( 'Geometry' in node.Objects.subNodes ) ) {

			return [];

		}

		// has many
		var geoCount = 0;
		for ( var geo in node.Objects.subNodes.Geometry ) {

			if ( geo.match( /^\d+$/ ) ) {

				geoCount ++;

			}

		}

		var res = [];
		if ( geoCount > 0 ) {

			for ( geo in node.Objects.subNodes.Geometry ) {

				if ( node.Objects.subNodes.Geometry[ geo ].attrType === 'Mesh' ) {

					res.push( this.parseGeometry( node.Objects.subNodes.Geometry[ geo ], node ) );

				}

			}

		} else {

			res.push( this.parseGeometry( node.Objects.subNodes.Geometry, node ) );

		}

		return res;

	};

	THREE.FBXLoader.prototype.parseGeometry = function ( node, nodes ) {

		var geo = ( new Geometry() ).parse( node );
		geo.addBones( this.hierarchy.hierarchy );

		//*
		var geometry = new THREE.BufferGeometry();
		geometry.name = geo.name;
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geo.vertices ), 3 ) );

		if ( geo.normals !== undefined && geo.normals.length > 0 ) {

			geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geo.normals ), 3 ) );

		}

		if ( geo.uvs !== undefined && geo.uvs.length > 0 ) {

			geometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geo.uvs ), 2 ) );

		}

		if ( geo.indices !== undefined && geo.indices.length > 65535 ) {

			geometry.setIndex( new THREE.BufferAttribute( new Uint32Array( geo.indices ), 1 ) );

		} else if ( geo.indices !== undefined ) {

			geometry.setIndex( new THREE.BufferAttribute( new Uint16Array( geo.indices ), 1 ) );

		}

		geometry.verticesNeedUpdate = true;
		geometry.computeBoundingSphere();
		geometry.computeBoundingBox();

		var texture;
		var texs = this.textures.getById( nodes.searchConnectionParent( geo.id ) );
		if ( texs !== undefined && texs.length > 0 ) {

			if ( this.textureLoader === null ) {

				this.textureLoader = new THREE.TextureLoader();

			}
			texture = this.textureLoader.load( this.textureBasePath + '/' + texs[ 0 ].fileName );

		}

		var materials = [];
		var material;
		var mats = this.materials.getById( nodes.searchConnectionParent( geo.id ) );
		if ( mats !== undefined && mats.length > 0) {
			for(var i = 0; i < mats.length; ++i) {
				var mat_data = mats[i];
				var tmpMat;

				// TODO:
				// Cannot find a list of possible ShadingModel values.
				// If someone finds a list, please add additional cases
				// and map to appropriate materials.
				switch(mat_data.type) {
					case "phong":
					tmpMat = new THREE.MeshPhongMaterial();
					break;
					case "Lambert":
					tmpMat = new THREE.MeshLambertMaterial();
					break;
					default:
					console.warn("No implementation given for material type " + mat_data.type + " in FBXLoader.js.  Defaulting to basic material")
					tmpMat = new THREE.MeshBasicMaterial({ color: 0x3300ff });
					break;
				}
				if (texture !== undefined) {
					mat_data.parameters.map = texture;
				}
				tmpMat.setValues(mat_data.parameters);

				materials.push(tmpMat);
			}

			if(materials.length === 1) {
				material = materials[0];
			} else {
				//Set up for multi-material
				material = new THREE.MultiMaterial(materials);
				var material_groupings = [];
				var last_material_group = -1;
				var material_index_list = toInt(node.subNodes.LayerElementMaterial.subNodes.Materials.properties.a.split( ',' ));
				for(var i = 0; i < geo.polyIndices.length; ++i) {
					if(last_material_group !== material_index_list[geo.polyIndices[i]]) {
						material_groupings.push({start: i * 3, count: 0, materialIndex: material_index_list[geo.polyIndices[i]]});
						last_material_group = material_index_list[geo.polyIndices[i]];
					}
					material_groupings[material_groupings.length - 1].count += 3;
				}
				geometry.groups = material_groupings;
			}


		} else {
			//No material found for this geometry, create default
			if (texture !== undefined) {

				material = new THREE.MeshBasicMaterial({ map: texture });

			} else {

				material = new THREE.MeshBasicMaterial({ color: 0x3300ff });

			}
		}

		geometry = new THREE.Geometry().fromBufferGeometry( geometry );
		geometry.bones = geo.bones;
		geometry.skinIndices = this.weights.skinIndices;
		geometry.skinWeights = this.weights.skinWeights;

		var mesh = null;
		if ( geo.bones === undefined || geo.skins === undefined || this.animations === undefined || this.animations.length === 0 ) {

			mesh = new THREE.Mesh( geometry, material );

		} else {

			material.skinning = true;
			mesh = new THREE.SkinnedMesh( geometry, material );
			this.addAnimation( mesh, this.weights.matrices, this.animations );

		}

		return mesh;

	};

	THREE.FBXLoader.prototype.addAnimation = function ( mesh, matrices, animations ) {

		var animationdata = { "name": 'animationtest', "fps": 30, "length": animations.length, "hierarchy": [] };

		for ( var i = 0; i < mesh.geometry.bones.length; ++ i ) {

			var name = mesh.geometry.bones[ i ].name;
			name = name.replace( /.*:/, '' );
			animationdata.hierarchy.push( { parent: mesh.geometry.bones[ i ].parent, name: name, keys: [] } );

		}

		var hasCurve = function ( animNode, attr ) {

			if ( animNode === undefined ) {

				return false;

			}

			var attrNode;
			switch ( attr ) {

				case 'S':
					if ( animNode.S === undefined ) {

						return false;

					}
					attrNode = animNode.S;
					break;

				case 'R':
					if ( animNode.R === undefined ) {

						return false;

					}
					attrNode = animNode.R;
					break;

				case 'T':
					if ( animNode.T === undefined ) {

						return false;

					}
					attrNode = animNode.T;
					break;
			}

			if ( attrNode.curves.x === undefined ) {

				return false;

			}

			if ( attrNode.curves.y === undefined ) {

				return false;

			}

			if ( attrNode.curves.z === undefined ) {

				return false;

			}

			return true;

		};

		var hasKeyOnFrame = function ( attrNode, frame ) {

			var x = isKeyExistOnFrame( attrNode.curves.x, frame );
			var y = isKeyExistOnFrame( attrNode.curves.y, frame );
			var z = isKeyExistOnFrame( attrNode.curves.z, frame );

			return x && y && z;

		};

		var isKeyExistOnFrame = function ( curve, frame ) {

			var value = curve.values[ frame ];
			return value !== undefined;

		};


		var genKey = function ( animNode, bone ) {

			// key initialize with its bone's bind pose at first
			var key = {};
			key.time = frame / animations.fps; // TODO:
			key.pos = bone.pos;
			key.rot = bone.rotq;
			key.scl = bone.scl;

			if ( animNode === undefined ) {

				return key;

			}

			try {

				if ( hasCurve( animNode, 'T' ) && hasKeyOnFrame( animNode.T, frame ) ) {

					var pos = new THREE.Vector3(
						animNode.T.curves.x.values[ frame ],
						animNode.T.curves.y.values[ frame ],
						animNode.T.curves.z.values[ frame ] );
					key.pos = [ pos.x, pos.y, pos.z ];

				} else {

					delete key.pos;

				}

				if ( hasCurve( animNode, 'R' ) && hasKeyOnFrame( animNode.R, frame ) ) {

					var rx = degToRad( animNode.R.curves.x.values[ frame ] );
					var ry = degToRad( animNode.R.curves.y.values[ frame ] );
					var rz = degToRad( animNode.R.curves.z.values[ frame ] );
					var eul = new THREE.Vector3( rx, ry, rz );
					var rot = quatFromVec( eul.x, eul.y, eul.z );
					key.rot = [ rot.x, rot.y, rot.z, rot.w ];

				} else {

					delete key.rot;

				}

				if ( hasCurve( animNode, 'S' ) && hasKeyOnFrame( animNode.S, frame ) ) {

					var scl = new THREE.Vector3(
						animNode.S.curves.x.values[ frame ],
						animNode.S.curves.y.values[ frame ],
						animNode.S.curves.z.values[ frame ] );
					key.scl = [ scl.x, scl.y, scl.z ];

				} else {

					delete key.scl;

				}

			} catch ( e ) {

				// curve is not full plotted
				console.log( bone );
				console.log( e );

			}

			return key;

		};

		var bones = mesh.geometry.bones;
		for ( var frame = 0; frame < animations.frames; frame ++ ) {


			for ( i = 0; i < bones.length; i ++ ) {

				var bone = bones[ i ];
				var animNode = animations.curves[ i ];

				for ( var j = 0; j < animationdata.hierarchy.length; j ++ ) {

					if ( animationdata.hierarchy[ j ].name === bone.name ) {

						animationdata.hierarchy[ j ].keys.push( genKey( animNode, bone ) );

					}

				}

			}

		}

		if ( mesh.geometry.animations === undefined ) {

			mesh.geometry.animations = [];

		}

		mesh.geometry.animations.push( THREE.AnimationClip.parseAnimation( animationdata, mesh.geometry.bones ) );

	};


	THREE.FBXLoader.prototype.loadFile = function ( url, onLoad, onProgress, onError, responseType ) {

		var loader = new THREE.FileLoader( this.manager );

		loader.setResponseType( responseType );

		var request = loader.load( url, function ( result ) {

			onLoad( result );

		}, onProgress, onError );

		return request;

	};

	THREE.FBXLoader.prototype.loadFileAsBuffer = function ( url, onload, onProgress, onError ) {

		this.loadFile( url, onLoad, onProgress, onError, 'arraybuffer' );

	};

	THREE.FBXLoader.prototype.loadFileAsText = function ( url, onLoad, onProgress, onError ) {

		this.loadFile( url, onLoad, onProgress, onError, 'text' );

	};


	/* ----------------------------------------------------------------- */

	function FBXNodes() {}

	FBXNodes.prototype.add = function ( key, val ) {

		this[ key ] = val;

	};

	FBXNodes.prototype.searchConnectionParent = function ( id ) {

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

	};

	FBXNodes.prototype.searchConnectionChildren = function ( id ) {

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

			this.__cache_search_connection_children[ id ] = [ - 1 ];
			return [ - 1 ];

		}

	};

	FBXNodes.prototype.searchConnectionType = function ( id, to ) {

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

	};

	function FBXParser() {}

	FBXParser.prototype = {

		// constructor: FBXParser,

		// ------------ node stack manipulations ----------------------------------

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
			this.allNodes = new FBXNodes();
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

		nodeEnd: function ( line ) {

			this.popStack();

		},

		/* ---------------------------------------------------------------- */
		/*		util													  */
		isFlattenNode: function ( node ) {

			return ( 'subNodes' in node && 'properties' in node ) ? true : false;

		}

	};

	function FBXAnalyzer() {}

	FBXAnalyzer.prototype = {

	};


	// generate skinIndices, skinWeights
	//	  @skinIndices: per vertex data, this represents the bone indexes affects that vertex
	//	  @skinWeights: per vertex data, this represents the Weight Values affects that vertex
	//	  @matrices:	per `bones` data
	function Weights() {

		this.skinIndices = [];
		this.skinWeights = [];

		this.matrices	= [];

	}


	Weights.prototype.parseCluster = function ( node, id, entry ) {

		var _p = node.searchConnectionParent( id );
		var _indices = toInt( entry.subNodes.Indexes.properties.a.split( ',' ) );
		var _weights = toFloat( entry.subNodes.Weights.properties.a.split( ',' ) );
		var _transform = toMat44( toFloat( entry.subNodes.Transform.properties.a.split( ',' ) ) );
		var _link = toMat44( toFloat( entry.subNodes.TransformLink.properties.a.split( ',' ) ) );

		return {

			'parent': _p,
			'id': parseInt( id ),
			'indices': _indices,
			'weights': _weights,
			'transform': _transform,
			'transformlink': _link,
			'linkMode': entry.properties.Mode

		};

	};

	Weights.prototype.parse = function ( node, bones ) {

		this.skinIndices = [];
		this.skinWeights = [];

		this.matrices = [];

		var deformers = node.Objects.subNodes.Deformer;

		var clusters = {};
		for ( var id in deformers ) {

			if ( deformers[ id ].attrType === 'Cluster' ) {

				if ( ! ( 'Indexes' in deformers[ id ].subNodes ) ) {

					continue;

				}

				//clusters.push( this.parseCluster( node, id, deformers[id] ) );
				var cluster = this.parseCluster( node, id, deformers[ id ] );
				var boneId = node.searchConnectionChildren( cluster.id )[ 0 ];
				clusters[ boneId ] = cluster;

			}

		}


		// this clusters is per Bone data, thus we make this into per vertex data
		var weights = [];
		var hi = bones.hierarchy;
		for ( var b = 0; b < hi.length; ++ b ) {

			var bid = hi[ b ].internalId;
			if ( clusters[ bid ] === undefined ) {

				//console.log( bid );
				this.matrices.push( new THREE.Matrix4() );
				continue;

			}

			var clst = clusters[ bid ];
			// store transform matrix per bones
			this.matrices.push( clst.transform );
			//this.matrices.push( clst.transformlink );
			for ( var v = 0; v < clst.indices.length; ++ v ) {

				if ( weights[ clst.indices[ v ] ] === undefined ) {

					weights[ clst.indices[ v ] ] = {};
					weights[ clst.indices[ v ] ].joint = [];
					weights[ clst.indices[ v ] ].weight = [];

				}

				// indices
				var affect = node.searchConnectionChildren( clst.id );

				if ( affect.length > 1 ) {

					console.warn( "FBXLoader: node " + clst.id + " have many weight kids: " + affect );

				}
				weights[ clst.indices[ v ] ].joint.push( bones.getBoneIdfromInternalId( node, affect[ 0 ] ) );

				// weight value
				weights[ clst.indices[ v ] ].weight.push( clst.weights[ v ] );

			}

		}

		// normalize the skin weights
		// TODO -  this might be a good place to choose greatest 4 weights
		for ( var i = 0; i < weights.length; i ++ ) {

			var indicies = new THREE.Vector4(
				weights[ i ].joint[ 0 ] ? weights[ i ].joint[ 0 ] : 0,
				weights[ i ].joint[ 1 ] ? weights[ i ].joint[ 1 ] : 0,
				weights[ i ].joint[ 2 ] ? weights[ i ].joint[ 2 ] : 0,
				weights[ i ].joint[ 3 ] ? weights[ i ].joint[ 3 ] : 0 );

			var weight = new THREE.Vector4(
				weights[ i ].weight[ 0 ] ? weights[ i ].weight[ 0 ] : 0,
				weights[ i ].weight[ 1 ] ? weights[ i ].weight[ 1 ] : 0,
				weights[ i ].weight[ 2 ] ? weights[ i ].weight[ 2 ] : 0,
				weights[ i ].weight[ 3 ] ? weights[ i ].weight[ 3 ] : 0 );

			this.skinIndices.push( indicies );
			this.skinWeights.push( weight );

		}

		//console.log( this );
		return this;

	};

	function Bones() {

		// returns bones hierarchy tree.
		//	  [
		//		  {
		//			  "parent": id,
		//			  "name": name,
		//			  "pos": pos,
		//			  "rotq": quat
		//		  },
		//		  ...
		//		  {},
		//		  ...
		//	  ]
		//
		/* sample response

		   "bones" : [
			{"parent":-1, "name":"Fbx01",			"pos":[-0.002,	 98.739,   1.6e-05],	 "rotq":[0, 0, 0, 1]},
			{"parent":0,  "name":"Fbx01_Pelvis",	 "pos":[0.00015963, 0,		7.33107e-08], "rotq":[0, 0, 0, 1]},
			{"parent":1,  "name":"Fbx01_Spine",	  "pos":[6.577e-06,  10.216,   0.0106811],   "rotq":[0, 0, 0, 1]},
			{"parent":2,  "name":"Fbx01_R_Thigh",	"pos":[14.6537,	-10.216,  -0.00918758], "rotq":[0, 0, 0, 1]},
			{"parent":3,  "name":"Fbx01_R_Calf",	 "pos":[-3.70047,	 -42.9681,	 -7.78158],	 "rotq":[0, 0, 0, 1]},
			{"parent":4,  "name":"Fbx01_R_Foot",	 "pos":[-2.0696,	  -46.0488,	 9.42052],	  "rotq":[0, 0, 0, 1]},
			{"parent":5,  "name":"Fbx01_R_Toe0",	 "pos":[-0.0234785,   -9.46233,	 -15.3187],	 "rotq":[0, 0, 0, 1]},
			{"parent":2,  "name":"Fbx01_L_Thigh",	"pos":[-14.6537,	 -10.216,	  -0.00918314],  "rotq":[0, 0, 0, 1]},
			{"parent":7,  "name":"Fbx01_L_Calf",	 "pos":[3.70037,	  -42.968,	  -7.78155],	 "rotq":[0, 0, 0, 1]},
			{"parent":8,  "name":"Fbx01_L_Foot",	 "pos":[2.06954,	  -46.0488,	 9.42052],	  "rotq":[0, 0, 0, 1]},
			{"parent":9,  "name":"Fbx01_L_Toe0",	 "pos":[0.0234566,	-9.46235,	 -15.3187],	 "rotq":[0, 0, 0, 1]},
			{"parent":2,  "name":"Fbx01_Spine1",	 "pos":[-2.97523e-05, 11.5892,	  -9.81027e-05], "rotq":[0, 0, 0, 1]},
			{"parent":11, "name":"Fbx01_Spine2",	 "pos":[-2.91292e-05, 11.4685,	  8.27126e-05],  "rotq":[0, 0, 0, 1]},
			{"parent":12, "name":"Fbx01_Spine3",	 "pos":[-4.48857e-05, 11.5783,	  8.35108e-05],  "rotq":[0, 0, 0, 1]},
			{"parent":13, "name":"Fbx01_Neck",	   "pos":[1.22987e-05,  11.5582,	  -0.0044775],   "rotq":[0, 0, 0, 1]},
			{"parent":14, "name":"Fbx01_Head",	   "pos":[-3.50709e-05, 6.62915,	  -0.00523254],  "rotq":[0, 0, 0, 1]},
			{"parent":15, "name":"Fbx01_R_Eye",	  "pos":[3.31681,	  12.739,	   -10.5267],	 "rotq":[0, 0, 0, 1]},
			{"parent":15, "name":"Fbx01_L_Eye",	  "pos":[-3.32038,	 12.7391,	  -10.5267],	 "rotq":[0, 0, 0, 1]},
			{"parent":15, "name":"Jaw",			  "pos":[-0.0017738,   7.43481,	  -4.08114],	 "rotq":[0, 0, 0, 1]},
			{"parent":14, "name":"Fbx01_R_Clavicle", "pos":[3.10919,	  2.46577,	  -0.0115284],   "rotq":[0, 0, 0, 1]},
			{"parent":19, "name":"Fbx01_R_UpperArm", "pos":[16.014,	   4.57764e-05,  3.10405],	  "rotq":[0, 0, 0, 1]},
			{"parent":20, "name":"Fbx01_R_Forearm",  "pos":[22.7068,	  -1.66322,	 -2.13803],	 "rotq":[0, 0, 0, 1]},
			{"parent":21, "name":"Fbx01_R_Hand",	 "pos":[25.5881,	  -0.80249,	 -6.37307],	 "rotq":[0, 0, 0, 1]},
			...
			{"parent":27, "name":"Fbx01_R_Finger32", "pos":[2.15572,	  -0.548737,	-0.539604],	"rotq":[0, 0, 0, 1]},
			{"parent":22, "name":"Fbx01_R_Finger2",  "pos":[9.79318,	  0.132553,	 -2.97845],	 "rotq":[0, 0, 0, 1]},
			{"parent":29, "name":"Fbx01_R_Finger21", "pos":[2.74037,	  0.0483093,	-0.650531],	"rotq":[0, 0, 0, 1]},
			{"parent":55, "name":"Fbx01_L_Finger02", "pos":[-1.65308,	 -1.43208,	 -1.82885],	 "rotq":[0, 0, 0, 1]}
			]
		*/
		this.hierarchy = [];

	}

	Bones.prototype.parseHierarchy = function ( node ) {

		var objects = node.Objects;
		var models = objects.subNodes.Model;

		var bones = [];
		for ( var id in models ) {

			if ( models[ id ].attrType === undefined ) {

				continue;

			}
			bones.push( models[ id ] );

		}

		this.hierarchy = [];
		for ( var i = 0; i < bones.length; ++ i ) {

			var bone = bones[ i ];

			var p = node.searchConnectionParent( bone.id )[ 0 ];
			var t = [ 0.0, 0.0, 0.0 ];
			var r = [ 0.0, 0.0, 0.0, 1.0 ];
			var s = [ 1.0, 1.0, 1.0 ];

			if ( 'Lcl_Translation' in bone.properties ) {

				t = toFloat( bone.properties.Lcl_Translation.value.split( ',' ) );

			}

			if ( 'Lcl_Rotation' in bone.properties ) {

				r = toRad( toFloat( bone.properties.Lcl_Rotation.value.split( ',' ) ) );
				var q = new THREE.Quaternion();
				q.setFromEuler( new THREE.Euler( r[ 0 ], r[ 1 ], r[ 2 ], 'ZYX' ) );
				r = [ q.x, q.y, q.z, q.w ];

			}

			if ( 'Lcl_Scaling' in bone.properties ) {

				s = toFloat( bone.properties.Lcl_Scaling.value.split( ',' ) );

			}

			// replace unsafe character
			var name = bone.attrName;
			name = name.replace( /:/, '' );
			name = name.replace( /_/, '' );
			name = name.replace( /-/, '' );
			this.hierarchy.push( { "parent": p, "name": name, "pos": t, "rotq": r, "scl": s, "internalId": bone.id } );

		}

		this.reindexParentId();

		this.restoreBindPose( node );

		return this;

	};

	Bones.prototype.reindexParentId = function () {

		for ( var h = 0; h < this.hierarchy.length; h ++ ) {

			for ( var ii = 0; ii < this.hierarchy.length; ++ ii ) {

				if ( this.hierarchy[ h ].parent == this.hierarchy[ ii ].internalId ) {

					this.hierarchy[ h ].parent = ii;
					break;

				}

			}

		}

	};

	Bones.prototype.restoreBindPose = function ( node ) {

		var bindPoseNode = node.Objects.subNodes.Pose;
		if ( bindPoseNode === undefined ) {

			return;

		}

		var poseNode = bindPoseNode.subNodes.PoseNode;
		var localMatrices = {}; // store local matrices, modified later( initialy world space )
		var worldMatrices = {}; // store world matrices

		for ( var i = 0; i < poseNode.length; ++ i ) {

			var rawMatLcl = toMat44( poseNode[ i ].subNodes.Matrix.properties.a.split( ',' ) );
			var rawMatWrd = toMat44( poseNode[ i ].subNodes.Matrix.properties.a.split( ',' ) );

			localMatrices[ poseNode[ i ].id ] = rawMatLcl;
			worldMatrices[ poseNode[ i ].id ] = rawMatWrd;

		}

		for ( var h = 0; h < this.hierarchy.length; ++ h ) {

			var bone = this.hierarchy[ h ];
			var inId = bone.internalId;

			if ( worldMatrices[ inId ] === undefined ) {

				// has no bind pose node, possibly be mesh
				// console.log( bone );
				continue;

			}

			var t = new THREE.Vector3( 0, 0, 0 );
			var r = new THREE.Quaternion();
			var s = new THREE.Vector3( 1, 1, 1 );

			var parentId;
			var parentNodes = node.searchConnectionParent( inId );
			for ( var pn = 0; pn < parentNodes.length; ++ pn ) {

				if ( this.isBoneNode( parentNodes[ pn ] ) ) {

					parentId = parentNodes[ pn ];
					break;

				}

			}

			if ( parentId !== undefined && localMatrices[ parentId ] !== undefined ) {

				// convert world space matrix into local space
				var inv = new THREE.Matrix4();
				inv.getInverse( worldMatrices[ parentId ] );
				inv.multiply( localMatrices[ inId ] );
				localMatrices[ inId ] = inv;

			} else {
				//console.log( bone );
			}

			localMatrices[ inId ].decompose( t, r, s );
			bone.pos = [ t.x, t.y, t.z ];
			bone.rotq = [ r.x, r.y, r.z, r.w ];
			bone.scl = [ s.x, s.y, s.z ];

		}

	};

	Bones.prototype.searchRealId = function ( internalId ) {

		for ( var h = 0; h < this.hierarchy.length; h ++ ) {

			if ( internalId == this.hierarchy[ h ].internalId ) {

				return h;

			}

		}

		// console.warn( 'FBXLoader: notfound internalId in bones: ' + internalId);
		return - 1;

	};

	Bones.prototype.getByInternalId = function ( internalId ) {

		for ( var h = 0; h < this.hierarchy.length; h ++ ) {

			if ( internalId == this.hierarchy[ h ].internalId ) {

				return this.hierarchy[ h ];

			}

		}

		return null;

	};

	Bones.prototype.isBoneNode = function ( id ) {

		for ( var i = 0; i < this.hierarchy.length; ++ i ) {

			if ( id === this.hierarchy[ i ].internalId ) {

				return true;

			}

		}
		return false;

	};

	Bones.prototype.getBoneIdfromInternalId = function ( node, id ) {

		if ( node.__cache_get_boneid_from_internalid === undefined ) {

			node.__cache_get_boneid_from_internalid = [];

		}

		if ( node.__cache_get_boneid_from_internalid[ id ] !== undefined ) {

			return node.__cache_get_boneid_from_internalid[ id ];

		}

		for ( var i = 0; i < this.hierarchy.length; ++ i ) {

			if ( this.hierarchy[ i ].internalId == id ) {

				var res = i;
				node.__cache_get_boneid_from_internalid[ id ] = i;
				return i;

			}

		}

		// console.warn( 'FBXLoader: bone internalId(' + id + ') not found in bone hierarchy' );
		return - 1;

	};


	function Geometry() {

		this.node = null;
		this.name = null;
		this.id = null;

		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.uvs = [];

		this.bones = [];
		this.skins = null;

	}

	Geometry.prototype.parse = function ( geoNode ) {

		this.node = geoNode;
		this.name = geoNode.attrName;
		this.id = geoNode.id;

		this.vertices = this.getVertices();

		if ( this.vertices === undefined ) {

			console.log( 'FBXLoader: Geometry.parse(): pass' + this.node.id );
			return;

		}

		this.indices = this.getPolygonVertexIndices();
		this.uvs = ( new UV() ).parse( this.node, this );
		this.normals = ( new Normal() ).parse( this.node, this );

		if ( this.getPolygonTopologyMax() > 3 ) {

			var indexInfo = this.convertPolyIndicesToTri(
								this.indices, this.getPolygonTopologyArray() );
			this.indices = indexInfo.res;
			this.polyIndices = indexInfo.polyIndices;

		}

		return this;

	};


	Geometry.prototype.getVertices = function () {

		if ( this.node.__cache_vertices ) {

			return this.node.__cache_vertices;

		}

		if ( this.node.subNodes.Vertices === undefined ) {

			console.warn( 'this.node: ' + this.node.attrName + "(" + this.node.id + ") does not have Vertices" );
			this.node.__cache_vertices = undefined;
			return null;

		}

		var rawTextVert	= this.node.subNodes.Vertices.properties.a;
		var vertices = rawTextVert.split( ',' ).map( function ( element ) {

			return parseFloat( element );

		} );

		this.node.__cache_vertices = vertices;
		return this.node.__cache_vertices;

	};

	Geometry.prototype.getPolygonVertexIndices = function () {

		if ( this.node.__cache_indices && this.node.__cache_poly_topology_max ) {

			return this.node.__cache_indices;

		}

		if ( this.node.subNodes === undefined ) {

			console.error( 'this.node.subNodes undefined' );
			console.log( this.node );
			return;

		}

		if ( this.node.subNodes.PolygonVertexIndex === undefined ) {

			console.warn( 'this.node: ' + this.node.attrName + "(" + this.node.id + ") does not have PolygonVertexIndex " );
			this.node.__cache_indices = undefined;
			return;

		}

		var rawTextIndices = this.node.subNodes.PolygonVertexIndex.properties.a;
		var indices = rawTextIndices.split( ',' );

		var currentTopo = 1;
		var topologyN = null;
		var topologyArr = [];

		// The indices that make up the polygon are in order and a negative index
		// means that it’s the last index of the polygon. That index needs
		// to be made positive and then you have to subtract 1 from it!
		for ( var i = 0; i < indices.length; ++ i ) {

			var tmpI = parseInt( indices[ i ] );
			// found n
			if ( tmpI < 0 ) {

				if ( currentTopo > topologyN ) {

					topologyN = currentTopo;

				}

				indices[ i ] = tmpI ^ - 1;
				topologyArr.push( currentTopo );
				currentTopo = 1;

			} else {

				indices[ i ] = tmpI;
				currentTopo ++;

			}

		}

		if ( topologyN === null ) {

			console.warn( "FBXLoader: topology N not found: " + this.node.attrName );
			console.warn( this.node );
			topologyN = 3;

		}

		this.node.__cache_poly_topology_max = topologyN;
		this.node.__cache_poly_topology_arr = topologyArr;
		this.node.__cache_indices = indices;

		return this.node.__cache_indices;

	};

	Geometry.prototype.getPolygonTopologyMax = function () {

		if ( this.node.__cache_indices && this.node.__cache_poly_topology_max ) {

			return this.node.__cache_poly_topology_max;

		}

		this.getPolygonVertexIndices( this.node );
		return this.node.__cache_poly_topology_max;

	};

	Geometry.prototype.getPolygonTopologyArray = function () {

		if ( this.node.__cache_indices && this.node.__cache_poly_topology_max ) {

			return this.node.__cache_poly_topology_arr;

		}

		this.getPolygonVertexIndices( this.node );
		return this.node.__cache_poly_topology_arr;

	};

	// a - d
	// |   |
	// b - c
	//
	// [( a, b, c, d ) ...........
	// [( a, b, c ), (a, c, d )....

	// Also keep track of original poly index.
	Geometry.prototype.convertPolyIndicesToTri = function ( indices, strides ) {

		var res = [];

		var i = 0;
		var currentPolyNum = 0;
		var currentStride = 0;
		var polyIndices = [];

		while ( i < indices.length ) {

			currentStride = strides[ currentPolyNum ];

			// CAUTIN: NG over 6gon
			for ( var j = 0; j <= ( currentStride - 3 ); j ++ ) {

				res.push( indices[ i ] );
				res.push( indices[ i + ( currentStride - 2 - j ) ] );
				res.push( indices[ i + ( currentStride - 1 - j ) ] );

				polyIndices.push(currentPolyNum);
			}

			currentPolyNum ++;
			i += currentStride;
		}

		return {res: res, polyIndices: polyIndices};

	};

	Geometry.prototype.addBones = function ( bones ) {

		this.bones = bones;

	};


	function UV() {

		this.uv = null;
		this.map = null;
		this.ref = null;
		this.node = null;
		this.index = null;

	}

	UV.prototype.getUV = function ( node ) {

		if ( this.node && this.uv && this.map && this.ref ) {

			return this.uv;

		} else {

			return this._parseText( node );

		}

	};

	UV.prototype.getMap = function ( node ) {

		if ( this.node && this.uv && this.map && this.ref ) {

			return this.map;

		} else {

			this._parseText( node );
			return this.map;

		}

	};

	UV.prototype.getRef = function ( node ) {

		if ( this.node && this.uv && this.map && this.ref ) {

			return this.ref;

		} else {

			this._parseText( node );
			return this.ref;

		}

	};

	UV.prototype.getIndex = function ( node ) {

		if ( this.node && this.uv && this.map && this.ref ) {

			return this.index;

		} else {

			this._parseText( node );
			return this.index;

		}

	};

	UV.prototype.getNode = function ( topnode ) {

		if ( this.node !== null ) {

			return this.node;

		}

		this.node = topnode.subNodes.LayerElementUV;
		return this.node;

	};

	UV.prototype._parseText = function ( node ) {

		var uvNode = this.getNode( node );
		if ( uvNode === undefined ) {

			// console.log( node.attrName + "(" + node.id + ")" + " has no LayerElementUV." );
			return [];

		}

		var count = 0;
		var x = '';
		for ( var n in uvNode ) {

			if ( n.match( /^\d+$/ ) ) {

				count ++;
				x = n;

			}

		}

		if ( count > 0 ) {

			console.warn( 'multi uv not supported' );
			uvNode = uvNode[ n ];

		}

		var uvIndex = uvNode.subNodes.UVIndex.properties.a;
		var uvs = uvNode.subNodes.UV.properties.a;
		var uvMap = uvNode.properties.MappingInformationType;
		var uvRef = uvNode.properties.ReferenceInformationType;


		this.uv	= toFloat( uvs.split( ',' ) );
		this.index = toInt( uvIndex.split( ',' ) );

		this.map = uvMap; // TODO: normalize notation shaking... FOR BLENDER
		this.ref = uvRef;

		return this.uv;

	};

	UV.prototype.parse = function ( node, geo ) {

		this.uvNode = this.getNode( node );

		this.uv = this.getUV( node );
		var mappingType = this.getMap( node );
		var refType = this.getRef( node );
		var indices = this.getIndex( node );

		var strides = geo.getPolygonTopologyArray();

		// it means that there is a normal for every vertex of every polygon of the model.
		// For example, if the models has 8 vertices that make up four quads, then there
		// will be 16 normals (one normal * 4 polygons * 4 vertices of the polygon). Note
		// that generally a game engine needs the vertices to have only one normal defined.
		// So, if you find a vertex has more tha one normal, you can either ignore the normals
		// you find after the first, or calculate the mean from all of them (normal smoothing).
		//if ( mappingType == "ByPolygonVertex" ){
		switch ( mappingType ) {

			case "ByPolygonVertex":

				switch ( refType ) {

					// Direct
					// The this.uv are in order.
					case "Direct":
						this.uv = this.parseUV_ByPolygonVertex_Direct( this.uv, indices, strides, 2 );
						break;

					// IndexToDirect
					// The order of the this.uv is given by the uvsIndex property.
					case "IndexToDirect":
						this.uv = this.parseUV_ByPolygonVertex_IndexToDirect( this.uv, indices );
						break;

				}

				// convert from by polygon(vert) data into by verts data
				this.uv = mapByPolygonVertexToByVertex( this.uv, geo.getPolygonVertexIndices( node ), 2 );
				break;

			case "ByPolygon":

				switch ( refType ) {

					// Direct
					// The this.uv are in order.
					case "Direct":
						this.uv = this.parseUV_ByPolygon_Direct();
						break;

					// IndexToDirect
					// The order of the this.uv is given by the uvsIndex property.
					case "IndexToDirect":
						this.uv = this.parseUV_ByPolygon_IndexToDirect();
						break;

				}
				break;
		}

		return this.uv;

	};

	UV.prototype.parseUV_ByPolygonVertex_Direct = function ( node, indices, strides, itemSize ) {

		return parse_Data_ByPolygonVertex_Direct( node, indices, strides, itemSize );

	};

	UV.prototype.parseUV_ByPolygonVertex_IndexToDirect = function ( node, indices ) {

		return parse_Data_ByPolygonVertex_IndexToDirect( node, indices, 2 );

	};

	UV.prototype.parseUV_ByPolygon_Direct = function ( node ) {

		console.warn( "not implemented" );
		return node;

	};

	UV.prototype.parseUV_ByPolygon_IndexToDirect = function ( node ) {

		console.warn( "not implemented" );
		return node;

	};

	UV.prototype.parseUV_ByVertex_Direct = function ( node ) {

		console.warn( "not implemented" );
		return node;

	};


	function Normal() {

		this.normal = null;
		this.map	= null;
		this.ref	= null;
		this.node = null;
		this.index = null;

	}

	Normal.prototype.getNormal = function ( node ) {

		if ( this.node && this.normal && this.map && this.ref ) {

			return this.normal;

		} else {

			this._parseText( node );
			return this.normal;

		}

	};

	// mappingType: possible variant
	//	  ByPolygon
	//	  ByPolygonVertex
	//	  ByVertex (or also ByVertice, as the Blender exporter writes)
	//	  ByEdge
	//	  AllSame
	//	var mappingType = node.properties.MappingInformationType;
	Normal.prototype.getMap = function ( node ) {

		if ( this.node && this.normal && this.map && this.ref ) {

			return this.map;

		} else {

			this._parseText( node );
			return this.map;

		}

	};

	// refType: possible variants
	//	  Direct
	//	  IndexToDirect (or Index for older versions)
	// var refType	 = node.properties.ReferenceInformationType;
	Normal.prototype.getRef = function ( node ) {

		if ( this.node && this.normal && this.map && this.ref ) {

			return this.ref;

		} else {

			this._parseText( node );
			return this.ref;

		}

	};

	Normal.prototype.getNode = function ( node ) {

		if ( this.node ) {

			return this.node;

		}

		this.node = node.subNodes.LayerElementNormal;
		return this.node;

	};

	Normal.prototype._parseText = function ( node ) {

		var normalNode = this.getNode( node );

		if ( normalNode === undefined ) {

			console.warn( 'node: ' + node.attrName + "(" + node.id + ") does not have LayerElementNormal" );
			return;

		}

		var mappingType = normalNode.properties.MappingInformationType;
		var refType = normalNode.properties.ReferenceInformationType;

		var rawTextNormals = normalNode.subNodes.Normals.properties.a;
		this.normal = toFloat( rawTextNormals.split( ',' ) );

		// TODO: normalize notation shaking, vertex / vertice... blender...
		this.map	= mappingType;
		this.ref	= refType;

	};

	Normal.prototype.parse = function ( topnode, geo ) {

		var normals = this.getNormal( topnode );
		var normalNode = this.getNode( topnode );
		var mappingType = this.getMap( topnode );
		var refType = this.getRef( topnode );

		var indices = geo.getPolygonVertexIndices( topnode );
		var strides = geo.getPolygonTopologyArray( topnode );

		// it means that there is a normal for every vertex of every polygon of the model.
		// For example, if the models has 8 vertices that make up four quads, then there
		// will be 16 normals (one normal * 4 polygons * 4 vertices of the polygon). Note
		// that generally a game engine needs the vertices to have only one normal defined.
		// So, if you find a vertex has more tha one normal, you can either ignore the normals
		// you find after the first, or calculate the mean from all of them (normal smoothing).
		//if ( mappingType == "ByPolygonVertex" ){
		switch ( mappingType ) {

			case "ByPolygonVertex":

				switch ( refType ) {

					// Direct
					// The normals are in order.
					case "Direct":
						normals = this.parseNormal_ByPolygonVertex_Direct( normals, indices, strides, 3 );
						break;

					// IndexToDirect
					// The order of the normals is given by the NormalsIndex property.
					case "IndexToDirect":
						normals = this.parseNormal_ByPolygonVertex_IndexToDirect();
						break;

				}
				break;

			case "ByPolygon":

				switch ( refType ) {

					// Direct
					// The normals are in order.
					case "Direct":
						normals = this.parseNormal_ByPolygon_Direct();
						break;

					// IndexToDirect
					// The order of the normals is given by the NormalsIndex property.
					case "IndexToDirect":
						normals = this.parseNormal_ByPolygon_IndexToDirect();
						break;

				}
				break;
		}

		return normals;

	};

	Normal.prototype.parseNormal_ByPolygonVertex_Direct = function ( node, indices, strides, itemSize ) {

		return parse_Data_ByPolygonVertex_Direct( node, indices, strides, itemSize );

	};

	Normal.prototype.parseNormal_ByPolygonVertex_IndexToDirect = function ( node ) {

		console.warn( "not implemented" );
		return node;

	};

	Normal.prototype.parseNormal_ByPolygon_Direct = function ( node ) {

		console.warn( "not implemented" );
		return node;

	};

	Normal.prototype.parseNormal_ByPolygon_IndexToDirect = function ( node ) {

		console.warn( "not implemented" );
		return node;

	};

	Normal.prototype.parseNormal_ByVertex_Direct = function ( node ) {

		console.warn( "not implemented" );
		return node;

	};

	function AnimationCurve() {

		this.version = null;

		this.id = null;
		this.internalId = null;
		this.times = null;
		this.values = null;

		this.attrFlag = null; // tangeant
		this.attrData = null; // slope, weight

	}

	AnimationCurve.prototype.fromNode = function ( curveNode ) {

		this.id = curveNode.id;
		this.internalId = curveNode.id;
		this.times = curveNode.subNodes.KeyTime.properties.a;
		this.values = curveNode.subNodes.KeyValueFloat.properties.a;

		this.attrFlag = curveNode.subNodes.KeyAttrFlags.properties.a;
		this.attrData = curveNode.subNodes.KeyAttrDataFloat.properties.a;

		this.times = toFloat( this.times.split(	',' ) );
		this.values = toFloat( this.values.split( ',' ) );
		this.attrData = toFloat( this.attrData.split( ',' ) );
		this.attrFlag = toInt( this.attrFlag.split( ',' ) );

		this.times = this.times.map( function ( element ) {

			return FBXTimeToSeconds( element );

		} );

		return this;

	};

	AnimationCurve.prototype.getLength = function () {

		return this.times[ this.times.length - 1 ];

	};

	function AnimationNode() {

		this.id = null;
		this.attr = null; // S, R, T
		this.attrX = false;
		this.attrY = false;
		this.attrZ = false;
		this.internalId = null;
		this.containerInternalId = null; // bone, null etc Id
		this.containerBoneId = null; // bone, null etc Id
		this.curveIdx = null; // AnimationCurve's indices
		this.curves = [];	// AnimationCurve refs

	}

	AnimationNode.prototype.fromNode = function ( allNodes, node, bones ) {

		this.id = node.id;
		this.attr = node.attrName;
		this.internalId = node.id;

		if ( this.attr.match( /S|R|T/ ) ) {

			for ( var attrKey in node.properties ) {

				if ( attrKey.match( /X/ ) ) {

					this.attrX = true;

				}
				if ( attrKey.match( /Y/ ) ) {

					this.attrY = true;

				}
				if ( attrKey.match( /Z/ ) ) {

					this.attrZ = true;

				}

			}

		} else {

			// may be deform percent nodes
			return null;

		}

		this.containerIndices = allNodes.searchConnectionParent( this.id );
		this.curveIdx	= allNodes.searchConnectionChildren( this.id );

		for ( var i = this.containerIndices.length - 1; i >= 0; -- i ) {

			var boneId = bones.searchRealId( this.containerIndices[ i ] );
			if ( boneId >= 0 ) {

				this.containerBoneId = boneId;
				this.containerId = this.containerIndices [ i ];

			}

			if ( boneId >= 0 ) {

				break;

			}

		}
		// this.containerBoneId = bones.searchRealId( this.containerIndices );

		return this;

	};

	AnimationNode.prototype.setCurve = function ( curve ) {

		this.curves.push( curve );

	};

	function Animation() {

		this.curves = {};
		this.length = 0.0;
		this.fps	= 30.0;
		this.frames = 0.0;

	}

	Animation.prototype.parse = function ( node, bones ) {

		var rawNodes = node.Objects.subNodes.AnimationCurveNode;
		var rawCurves = node.Objects.subNodes.AnimationCurve;

		// first: expand AnimationCurveNode into curve nodes
		var curveNodes = [];
		for ( var key in rawNodes ) {

			if ( key.match( /\d+/ ) ) {

				var a = ( new AnimationNode() ).fromNode( node, rawNodes[ key ], bones );
				curveNodes.push( a );

			}

		}

		// second: gen dict, mapped by internalId
		var tmp = {};
		for ( var i = 0; i < curveNodes.length; ++ i ) {

			if ( curveNodes[ i ] === null ) {

				continue;

			}

			tmp[ curveNodes[ i ].id ] = curveNodes[ i ];

		}

		// third: insert curves into the dict
		var ac = [];
		var max = 0.0;
		for ( key in rawCurves ) {

			if ( key.match( /\d+/ ) ) {

				var c = ( new AnimationCurve() ).fromNode( rawCurves[ key ] );
				ac.push( c );
				max = c.getLength() ? c.getLength() : max;

				var parentId = node.searchConnectionParent( c.id )[ 0 ];
				var axis = node.searchConnectionType( c.id, parentId );

				if ( axis.match( /X/ ) ) {

					axis = 'x';

				}
				if ( axis.match( /Y/ ) ) {

					axis = 'y';

				}
				if ( axis.match( /Z/ ) ) {

					axis = 'z';

				}

				tmp[ parentId ].curves[ axis ] = c;

			}

		}

		// forth:
		for ( var t in tmp ) {

			var id = tmp[ t ].containerBoneId;
			if ( this.curves[ id ] === undefined ) {

				this.curves[ id ] = {};

			}

			this.curves[ id ][ tmp[ t ].attr ] = tmp[ t ];

		}

		this.length = max;
		this.frames = this.length * this.fps;

		return this;

	};


	function Textures() {

		this.textures = [];
		this.perGeoMap = {};

	}

	Textures.prototype.add = function ( tex ) {

		if ( this.textures === undefined ) {

			this.textures = [];

		}

		this.textures.push( tex );

		for ( var i = 0; i < tex.parentIds.length; ++ i ) {

			if ( this.perGeoMap[ tex.parentIds[ i ] ] === undefined ) {

				this.perGeoMap[ tex.parentIds[ i ] ] = [];

			}

			this.perGeoMap[ tex.parentIds[ i ] ].push( this.textures[ this.textures.length - 1 ] );

		}

	};

	Textures.prototype.parse = function ( node, bones ) {

		var rawNodes = node.Objects.subNodes.Texture;

		for ( var n in rawNodes ) {

			var tex = ( new Texture() ).parse( rawNodes[ n ], node );
			this.add( tex );

		}

		return this;

	};

	Textures.prototype.getById = function ( id ) {

		return this.perGeoMap[ id ];

	};

	function Texture() {

		this.fileName = "";
		this.name = "";
		this.id = null;
		this.parentIds = [];

	}

	Texture.prototype.parse = function ( node, nodes ) {

		this.id = node.id;
		this.name = node.attrName;
		this.fileName = this.parseFileName( node.properties.FileName );

		this.parentIds = this.searchParents( this.id, nodes );

		return this;

	};

	// TODO: support directory
	Texture.prototype.parseFileName = function ( fname ) {

		if ( fname === undefined ) {

			return "";

		}

		// ignore directory structure, flatten path
		var splitted = fname.split( /[\\\/]/ );
		if ( splitted.length > 0 ) {

			return splitted[ splitted.length - 1 ];

		} else {

			return fname;

		}

	};

	Texture.prototype.searchParents = function ( id, nodes ) {

		var p = nodes.searchConnectionParent( id );

		return p;

	};

	function Materials() {
		this.materials = [];
		this.perGeoMap = {};
	}

	Materials.prototype.add = function ( mat ) {

		if ( this.materials === undefined ) {

			this.materials = [];

		}

		this.materials.push( mat );

		for ( var i = 0; i < mat.parentIds.length; ++ i ) {

			if ( this.perGeoMap[ mat.parentIds[ i ] ] === undefined ) {

				this.perGeoMap[ mat.parentIds[ i ] ] = [];

			}

			this.perGeoMap[ mat.parentIds[ i ] ].push( this.materials[ this.materials.length - 1 ] );

		}

	};

	Materials.prototype.parse = function ( node, bones ) {

		var rawNodes = node.Objects.subNodes.Material;

		for ( var n in rawNodes ) {

			var mat = ( new Material() ).parse( rawNodes[ n ], node );
			this.add( mat );

		}

		return this;

	};

	Materials.prototype.getById = function ( id ) {

		return this.perGeoMap[ id ];

	};

	function Material() {

		this.fileName = "";
		this.name = "";
		this.id = null;
		this.parentIds = [];

	}

	Material.prototype.parse = function ( node, nodes ) {

		this.id = node.id;
		this.name = node.attrName;
		this.type = node.properties.ShadingModel;

		this.parameters = this.getParameters( node.properties );

		this.parentIds = this.searchParents( this.id, nodes );

		return this;

	};

	Material.prototype.getParameters = function( properties ) {
		var parameters = {};

		//TODO: Missing parameters:
		// - Ambient
		// - AmbientColor
		// - (Diffuse?) Using DiffuseColor, which has same value, so I dunno.
		// - (Emissive?) Same as above)
		// - MultiLayer
		// - ShininessExponent (Same vals as Shininess)
		// - Specular (Same vals as SpecularColor)
		// - TransparencyFactor (Maybe same as Opacity?).

		parameters.color = new THREE.Color().fromArray(toFloat([properties.DiffuseColor.value.x, properties.DiffuseColor.value.y, properties.DiffuseColor.value.z]));
		parameters.specular = new THREE.Color().fromArray(toFloat([properties.SpecularColor.value.x, properties.SpecularColor.value.y, properties.SpecularColor.value.z]));
		parameters.shininess = properties.Shininess.value;
		parameters.emissive = new THREE.Color().fromArray(toFloat([properties.EmissiveColor.value.x, properties.EmissiveColor.value.y, properties.EmissiveColor.value.z]));
		parameters.emissiveIntensity = properties.EmissiveFactor.value;
		parameters.reflectivity = properties.Reflectivity.value;
		parameters.opacity = properties.Opacity.value;
		if(parameters.opacity < 1.0) {
			parameters.transparent = true;
		}

		return parameters;
	};

	Material.prototype.searchParents = function ( id, nodes ) {

		var p = nodes.searchConnectionParent( id );

		return p;

	};


	/* --------------------------------------------------------------------- */
	/* --------------------------------------------------------------------- */
	/* --------------------------------------------------------------------- */
	/* --------------------------------------------------------------------- */

	function loadTextureImage( texture, url ) {

		var loader = new THREE.ImageLoader();

		loader.load( url, function ( image ) {


		} );

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needUpdate = true;
			console.log( 'tex load done' );

		},

		// Function called when download progresses
			function ( xhr ) {

				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},

			// Function called when download errors
			function ( xhr ) {

				console.log( 'An error happened' );

			}
		);

	}

	// LayerElementUV: 0 {
	// 	Version: 101
	//	Name: "Texture_Projection"
	//	MappingInformationType: "ByPolygonVertex"
	//	ReferenceInformationType: "IndexToDirect"
	//	UV: *1746 {
	//	UVIndex: *7068 {
	//
	//	The order of the uvs is given by the UVIndex property.
	function parse_Data_ByPolygonVertex_IndexToDirect( node, indices, itemSize ) {

		var res = [];

		for ( var i = 0; i < indices.length; ++ i ) {

			for ( var j = 0; j < itemSize; ++ j ) {

				res.push( node[ ( indices[ i ] * itemSize ) + j ] );

			}

		}

		return res;

	}


	// what want:　normal per vertex, order vertice
	// i have: normal per polygon
	// i have: indice per polygon
	var parse_Data_ByPolygonVertex_Direct = function ( node, indices, strides, itemSize ) {

		// *21204 > 3573
		// Geometry: 690680816, "Geometry::", "Mesh" {
		//  Vertices: *3573 {
		//  PolygonVertexIndex: *7068 {

		var tmp = [];
		var currentIndex = 0;

		// first: sort to per vertex
		for ( var i = 0; i < indices.length; ++ i ) {

			tmp[ indices[ i ] ] = [];

			// TODO: duped entry? blend or something?
			for ( var s = 0; s < itemSize; ++ s ) {

				tmp[ indices[ i ] ][ s ] = node[ currentIndex + s ];

			}

			currentIndex += itemSize;

		}

		// second: expand x,y,z into serial array
		var res = [];
		for ( var jj = 0; jj < tmp.length; ++ jj ) {

			if ( tmp[ jj ] === undefined ) {

				continue;

			}

			for ( var t = 0; t < itemSize; ++ t ) {

				if ( tmp[ jj ][ t ] === undefined ) {

					continue;

				}
				res.push( tmp[ jj ][ t ] );

			}

		}

		return res;

	};

	// convert from by polygon(vert) data into by verts data
	function mapByPolygonVertexToByVertex( data, indices, stride ) {

		var tmp = {};
		var res = [];
		var max = 0;

		for ( var i = 0; i < indices.length; ++ i ) {

			if ( indices[ i ] in tmp ) {

				continue;

			}

			tmp[ indices[ i ] ] = {};

			for ( var j = 0; j < stride; ++ j ) {

				tmp[ indices[ i ] ][ j ] = data[ i * stride + j ];

			}

			max = max < indices[ i ] ? indices[ i ] : max;

		}

		try {

			for ( i = 0; i <= max; i ++ ) {

				for ( var s = 0; s < stride; s ++ ) {

					res.push( tmp[ i ][ s ] );

				}

			}

		} catch ( e ) {
			//console.log( max );
			//console.log( tmp );
			//console.log( i );
			//console.log( e );
		}

		return res;

	}

	// AUTODESK uses broken clock. i guess
	var FBXTimeToSeconds = function ( adskTime ) {

		return adskTime / 46186158000;

	};

	var degToRad = function ( degrees ) {

		return degrees * Math.PI / 180;

	};

	var radToDeg = function ( radians ) {

		return radians * 180 / Math.PI;

	};

	var quatFromVec = function ( x, y, z ) {

		var euler = new THREE.Euler( x, y, z, 'ZYX' );
		var quat = new THREE.Quaternion();
		quat.setFromEuler( euler );

		return quat;

	};


	// extend Array.prototype ?  ....uuuh
	var toInt = function ( arr ) {

		return arr.map( function ( element ) {

			return parseInt( element );

		} );

	};

	var toFloat = function ( arr ) {

		return arr.map( function ( element ) {

			return parseFloat( element );

		} );

	};

	var toRad = function ( arr ) {

		return arr.map( function ( element ) {

			return degToRad( element );

		} );

	};

	var toMat44 = function ( arr ) {

		var mat = new THREE.Matrix4();
		mat.set(
			arr[ 0 ], arr[ 4 ], arr[ 8 ], arr[ 12 ],
			arr[ 1 ], arr[ 5 ], arr[ 9 ], arr[ 13 ],
			arr[ 2 ], arr[ 6 ], arr[ 10 ], arr[ 14 ],
			arr[ 3 ], arr[ 7 ], arr[ 11 ], arr[ 15 ]
		);

		/*
		mat.set(
			arr[ 0], arr[ 1], arr[ 2], arr[ 3],
			arr[ 4], arr[ 5], arr[ 6], arr[ 7],
			arr[ 8], arr[ 9], arr[10], arr[11],
			arr[12], arr[13], arr[14], arr[15]
		);
		// */

		return mat;

	};

} )();
