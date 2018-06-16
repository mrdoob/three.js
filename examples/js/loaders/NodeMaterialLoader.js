/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeMaterialLoader = function ( manager, library ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	this.nodes = {};
	this.materials = {};
	this.passes = {};
	this.names = {};
	this.library = library || {};

};

THREE.NodeMaterialLoaderUtils = {

	replaceUUIDObject: function ( object, uuid, value, recursive ) {

		recursive = recursive !== undefined ? recursive : true;

		if ( typeof uuid === "object" ) uuid = uuid.uuid;

		if ( typeof object === "object" ) {

			var keys = Object.keys( object );

			for ( var i = 0; i < keys.length; i ++ ) {

				var key = keys[ i ];

				if ( recursive ) {

					object[ key ] = this.replaceUUIDObject( object[ key ], uuid, value );

				}

				if ( key === uuid ) {

					object[ uuid ] = object[ key ];

					delete object[ key ];

				}

			}

		}

		return object === uuid ? value : object;

	},

	replaceUUID: function ( json, uuid, value ) {

		this.replaceUUIDObject( json, uuid, value, false );
		this.replaceUUIDObject( json.nodes, uuid, value );
		this.replaceUUIDObject( json.materials, uuid, value );
		this.replaceUUIDObject( json.passes, uuid, value );
		this.replaceUUIDObject( json.library, uuid, value, false );

		return json;

	}

};

Object.assign( THREE.NodeMaterialLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

		return this;

	},

	getObjectByName: function ( uuid ) {

		return this.names[ uuid ];

	},

	getObjectById: function ( uuid ) {

		return this.library[ uuid ] || this.nodes[ uuid ] || this.names[ uuid ];

	},

	getNode: function ( uuid ) {

		var object = this.getObjectById( uuid );

		if ( ! object ) {

			console.warn( "Node \"" + uuid + "\" not found." );

		}

		return object;

	},

	parse: function ( json ) {

		var uuid, node, object, prop, i;

		for ( uuid in json.nodes ) {

			node = json.nodes[ uuid ];

			object = new THREE[ node.type ]();

			if ( node.name ) {

				object.name = node.name;

				this.names[ object.name ] = object;

			} else {

				// ignore "uniform" shader input ( for optimization )
				object.readonly = true;

			}

			if ( node.readonly !== undefined ) object.readonly = node.readonly;

			this.nodes[ uuid ] = object;

		}

		for ( uuid in json.materials ) {

			node = json.materials[ uuid ];

			object = new THREE[ node.type ]();

			if ( node.name ) {

				object.name = node.name;

				this.names[ object.name ] = object;

			}

			this.materials[ uuid ] = object;

		}

		for ( uuid in json.passes ) {

			node = json.passes[ uuid ];

			object = new THREE[ node.type ]();

			if ( node.name ) {

				object.name = node.name;

				this.names[ object.name ] = object;

			}

			this.passes[ uuid ] = object;

		}

		if ( json.material ) this.material = this.materials[ uuid ];
		if ( json.pass ) this.pass = this.passes[ uuid ];

		for ( uuid in json.nodes ) {

			node = json.nodes[ uuid ];
			object = this.nodes[ uuid ];

			switch ( node.type ) {

				case "IntNode":
				case "FloatNode":

					object.value = node.value;

					break;

				case "ColorNode":

					object.value.copy( node );

					break;

				case "Vector2Node":

					object.x = node.x;
					object.y = node.y;

					break;


				case "Vector3Node":

					object.x = node.x;
					object.y = node.y;
					object.z = node.z;

					break;

				case "Vector4Node":

					object.x = node.x;
					object.y = node.y;
					object.z = node.z;
					object.w = node.w;

					break;

				case "Matrix3Node":
				case "Matrix4Node":

					object.value.fromArray( node.elements );

					break;

				case "OperatorNode":

					object.a = this.getNode( node.a );
					object.b = this.getNode( node.b );
					object.op = node.op;

					break;

				case "Math1Node":

					object.a = this.getNode( node.a );
					object.method = node.method;

					break;

				case "Math2Node":

					object.a = this.getNode( node.a );
					object.b = this.getNode( node.b );
					object.method = node.method;

					break;

				case "Math3Node":

					object.a = this.getNode( node.a );
					object.b = this.getNode( node.b );
					object.c = this.getNode( node.c );
					object.method = node.method;

					break;

				case "UVNode":
				case "ColorsNode":

					object.index = node.index;

					break;


				case "LuminanceNode":

					object.rgb = this.getNode( node.rgb );

					break;

				case "PositionNode":
				case "NormalNode":
				case "ReflectNode":
				case "LightNode":

					object.scope = node.scope;

					break;

				case "SwitchNode":

					object.node = this.getNode( node.node );
					object.components = node.components;

					break;

				case "JoinNode":

					for ( prop in node.inputs ) {

						object[ prop ] = this.getNode( node.inputs[ prop ] );

					}

					break;

				case "CameraNode":

					object.setScope( node.scope );

					if ( node.camera ) object.setCamera( this.getNode( node.camera ) );

					switch ( node.scope ) {

						case THREE.CameraNode.DEPTH:

							object.near.number = node.near;
							object.far.number = node.far;

							break;

					}

					break;

				case "ColorAdjustmentNode":

					object.rgb = this.getNode( node.rgb );
					object.adjustment = this.getNode( node.adjustment );
					object.method = node.method;

					break;

				case "UVTransformNode":

					object.uv = this.getNode( node.uv );
					object.transform = this.getNode( node.transform );

					break;

				case "BumpNode":

					object.value = this.getNode( node.value );
					object.coord = this.getNode( node.coord );
					object.scale = this.getNode( node.scale );

					break;

				case "BlurNode":

					object.value = this.getNode( node.value );
					object.coord = this.getNode( node.coord );
					object.scale = this.getNode( node.scale );

					object.value = this.getNode( node.value );
					object.coord = this.getNode( node.coord );
					object.radius = this.getNode( node.radius );

					if ( node.size !== undefined ) object.size = new THREE.Vector2( node.size.x, node.size.y );

					object.blurX = node.blurX;
					object.blurY = node.blurY;

					break;

				case "ResolutionNode":

					object.renderer = this.getNode( node.renderer );

					break;

				case "ScreenUVNode":

					object.resolution = this.getNode( node.resolution );

					break;

				case "VelocityNode":

					if ( node.target ) object.setTarget( this.getNode( node.target ) );
					object.setParams( node.params );

					break;

				case "TimerNode":

					object.scope = node.scope;
					object.scale = node.scale;

					break;

				case "ConstNode":

					object.name = node.name;
					object.type = node.out;
					object.value = node.value;
					object.useDefine = node.useDefine === true;

					break;

				case "AttributeNode":
				case "VarNode":

					object.type = node.out;

					break;


				case "ReflectorNode":

					object.setMirror( this.getNode( node.mirror ) );

					if ( node.offset ) object.offset = this.getNode( node.offset );

					break;

				case "NoiseNode":

					object.coord = this.getNode( node.coord );

					break;

				case "FunctionNode":

					object.isMethod = node.isMethod;
					object.useKeywords = node.useKeywords;

					object.extensions = node.extensions;
					object.keywords = {};

					for ( prop in node.keywords ) {

						object.keywords[ prop ] = this.getNode( node.keywords[ prop ] );

					}

					if ( node.includes ) {

						for ( i = 0; i < node.includes.length; i ++ ) {

							object.includes.push( this.getNode( node.includes[ i ] ) );

						}

					}

					object.eval( node.src, object.includes, object.extensions, object.keywords );

					if ( ! object.isMethod ) object.type = node.out;

					break;

				case "FunctionCallNode":

					for ( prop in node.inputs ) {

						object.inputs[ prop ] = this.getNode( node.inputs[ prop ] );

					}

					object.value = this.getNode( node.value );

					break;

				case "TextureNode":
				case "CubeTextureNode":
				case "ScreenNode":

					if ( node.value ) object.value = this.getNode( node.value );

					object.coord = this.getNode( node.coord );

					if ( node.bias ) object.bias = this.getNode( node.bias );
					if ( object.project !== undefined ) object.project = node.project;

					break;

				case "RoughnessToBlinnExponentNode":
					break;

				case "RawNode":

					object.value = this.getNode( node.value );

					break;

				case "StandardNode":
				case "PhongNode":
				case "SpriteNode":

					object.color = this.getNode( node.color );

					if ( node.alpha ) object.alpha = this.getNode( node.alpha );

					if ( node.specular ) object.specular = this.getNode( node.specular );
					if ( node.shininess ) object.shininess = this.getNode( node.shininess );

					if ( node.roughness ) object.roughness = this.getNode( node.roughness );
					if ( node.metalness ) object.metalness = this.getNode( node.metalness );

					if ( node.reflectivity ) object.reflectivity = this.getNode( node.reflectivity );

					if ( node.clearCoat ) object.clearCoat = this.getNode( node.clearCoat );
					if ( node.clearCoatRoughness ) object.clearCoatRoughness = this.getNode( node.clearCoatRoughness );

					if ( node.normal ) object.normal = this.getNode( node.normal );
					if ( node.normalScale ) object.normalScale = this.getNode( node.normalScale );

					if ( node.emissive ) object.emissive = this.getNode( node.emissive );
					if ( node.ambient ) object.ambient = this.getNode( node.ambient );

					if ( node.shadow ) object.shadow = this.getNode( node.shadow );
					if ( node.light ) object.light = this.getNode( node.light );

					if ( node.ao ) object.ao = this.getNode( node.ao );

					if ( node.environment ) object.environment = this.getNode( node.environment );
					if ( node.environmentAlpha ) object.environmentAlpha = this.getNode( node.environmentAlpha );

					if ( node.transform ) object.transform = this.getNode( node.transform );

					if ( node.spherical === false ) object.spherical = false;

					break;

				default:

					console.warn( node.type, "not supported." );

			}

		}

		for ( uuid in json.materials ) {

			node = json.materials[ uuid ];
			object = this.materials[ uuid ];

			if ( node.name !== undefined ) object.name = node.name;

			if ( node.blending !== undefined ) object.blending = node.blending;
			if ( node.flatShading !== undefined ) object.flatShading = node.flatShading;
			if ( node.side !== undefined ) object.side = node.side;

			object.depthFunc = node.depthFunc;
			object.depthTest = node.depthTest;
			object.depthWrite = node.depthWrite;

			if ( node.wireframe !== undefined ) object.wireframe = node.wireframe;
			if ( node.wireframeLinewidth !== undefined ) object.wireframeLinewidth = node.wireframeLinewidth;
			if ( node.wireframeLinecap !== undefined ) object.wireframeLinecap = node.wireframeLinecap;
			if ( node.wireframeLinejoin !== undefined ) object.wireframeLinejoin = node.wireframeLinejoin;

			if ( node.skinning !== undefined ) object.skinning = node.skinning;
			if ( node.morphTargets !== undefined ) object.morphTargets = node.morphTargets;

			if ( node.visible !== undefined ) object.visible = node.visible;
			if ( node.userData !== undefined ) object.userData = node.userData;

			object.vertex = this.getNode( node.vertex );
			object.fragment = this.getNode( node.fragment );

			if ( object.vertex === object.fragment ) {

				// replace main node

				object.node = object.vertex;

			}

			if ( node.fog !== undefined ) object.fog = node.fog;
			if ( node.lights !== undefined ) object.lights = node.lights;

			if ( node.transparent !== undefined ) object.transparent = node.transparent;

		}

		for ( uuid in json.passes ) {

			node = json.passes[ uuid ];
			object = this.passes[ uuid ];

			object.value = this.getNode( node.value );

		}

		return this.material || this.pass || this;

	}

} );
