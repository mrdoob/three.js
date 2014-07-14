var Editor = function () {

	var SIGNALS = signals;

	this.signals = {

		// actions

		playAnimation: new SIGNALS.Signal(),
		stopAnimation: new SIGNALS.Signal(),

		// notifications

		themeChanged: new SIGNALS.Signal(),

		transformModeChanged: new SIGNALS.Signal(),
		snapChanged: new SIGNALS.Signal(),
		spaceChanged: new SIGNALS.Signal(),
		rendererChanged: new SIGNALS.Signal(),

		sceneGraphChanged: new SIGNALS.Signal(),

		cameraChanged: new SIGNALS.Signal(),

		objectSelected: new SIGNALS.Signal(),
		objectAdded: new SIGNALS.Signal(),
		objectChanged: new SIGNALS.Signal(),
		objectRemoved: new SIGNALS.Signal(),

		helperAdded: new SIGNALS.Signal(),
		helperRemoved: new SIGNALS.Signal(),

		materialChanged: new SIGNALS.Signal(),
		fogTypeChanged: new SIGNALS.Signal(),
		fogColorChanged: new SIGNALS.Signal(),
		fogParametersChanged: new SIGNALS.Signal(),
		windowResize: new SIGNALS.Signal()

	};

	this.data = {
		scene: new THREE.Scene(),
		helpersScene: new THREE.Scene(),

		geometries: {},
		materials: {},
		textures: {},
		helpers: {},

		selectedObject: null,
		object: {},
	};


	this.config = new Config();
	this.storage = new Storage();
	this.loader = new Loader( this );

	// this.scene = new THREE.Scene();
	// this.sceneHelpers = new THREE.Scene();

	// this.object = {};
	// this.geometries = {};
	// this.materials = {};
	// this.textures = {};

	// this.selected = null;
	// this.helpers = {};

	this.history = new Editor.ChangeHistory(this);

	// this creates the root history transaction.
	// this update is important when the last 
	// scene element leaves the scene, in order
	// to display the scene as 'empty'.
    var emptySceneTransaction = (function (scope) {
	    return function emptySceneTransaction() {
	        scope.signals.sceneGraphChanged.dispatch();
	        scope.select(null);
	    };
	})(this);
    this.history.addAndApplyChange(emptySceneTransaction);

	window.hist = this.history;

};

Editor.prototype = {

	// getters and setters

	setTheme: function ( value ) {

		document.getElementById( 'theme' ).href = value;
		this.signals.themeChanged.dispatch( value );

	},

	getScene: function () {
		return this.data.scene;
	},

	setScene: function ( scene, silent ) {

		// this.scene.name = scene.name;
		// this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		// // avoid render per object

		// this.signals.sceneGraphChanged.active = false;

		// while ( scene.children.length > 0 ) {

		// 	this.addObject( scene.children[ 0 ] );

		// }
		
		this.data.scene = scene;
		window.sceneGraphChanged = this.signals.sceneGraphChanged;

		if(silent === false) {
			this.signals.sceneGraphChanged.active = true;
			this.signals.sceneGraphChanged.dispatch();
		}
	},

	setHelpersScene: function ( scene ) {
		this.data.helpersScene = scene;
	},

	getHelpersScene: function () {
		return this.data.helpersScene;
	},

	setGeometries: function ( geometries ) {
		this.data.geometries = geometries;
	},

	getGeometries: function () {
		return this.data.geometries;
	},

	setMaterials: function ( materials ) {
		this.data.materials = materials;
	},

	getMaterials: function () {
		return this.data.materials;
	},

	setTextures: function( textures ) {
		this.data.textures = textures;
	},

	getTextures: function() {
		return this.data.textures;
	},

	setSelectedObject: function( selected ) {
		this.data.selected = selected;
	},

	getSelectedObject: function() {
		return this.data.selected;
	},

	setHelpers: function ( helpers ) {
		this.data.helpers = helpers;
	},

	getHelpers: function () {
		return this.data.helpers;
	},


	// complex helpers

	addObject: function ( object ) {
		var scope       = this,
			addedObject = object;

		addedObject.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addHelper( child );

		} );

		scope.getScene().add( addedObject );

		// scope.signals.objectAdded.dispatch( addedObject );
		scope.signals.sceneGraphChanged.dispatch();
	},

	addAndSelectObject: function( object ) {
		var transaction;

		// use scope isolation to make a 'frozen' transaction,
		// that can be applied any time again, without
		// the need to know detailed parameters

		transaction = (function (scope, addedObject) {

			return function addAndSelectObject() {
				scope.addObject(addedObject);
				scope.select(addedObject);
			};

		})(this, object);

		this.history.addAndApplyChange(transaction);
	},

	setObjectName: function ( object, name ) {

		object.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	removeObject: function ( object ) {

		if ( object.parent === undefined ) return; // avoid deleting the camera or scene

		if ( confirm( 'Delete ' + object.name + '?' ) === false ) return;

		var scope = this;

		object.traverse( function ( child ) {

			scope.removeHelper( child );

		} );

		object.parent.remove( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	addGeometry: function ( geometry ) {

		var geometries = this.getGeometries();
		geometries[ geometry.uuid ] = geometry;

	},

	setGeometryName: function ( geometry, name ) {

		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addMaterial: function ( material ) {

		var materials = this.getMaterials();
		materials[ material.uuid ] = material;

	},

	setMaterialName: function ( material, name ) {

		material.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addTexture: function ( texture ) {

		var textures = this.getTextures();
		textures[ texture.uuid ] = texture;

	},

	//

	addHelper: function () {
		var scope,
			geometry,
			material;

		scope    = this; 
		geometry = new THREE.SphereGeometry( 20, 4, 2 );
		material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

		return function ( object ) {

			var helper;

			if ( object instanceof THREE.Camera ) {

				helper = new THREE.CameraHelper( object, 10 );

			} else if ( object instanceof THREE.PointLight ) {

				helper = new THREE.PointLightHelper( object, 10 );

			} else if ( object instanceof THREE.DirectionalLight ) {

				helper = new THREE.DirectionalLightHelper( object, 20 );

			} else if ( object instanceof THREE.SpotLight ) {

				helper = new THREE.SpotLightHelper( object, 10 );

			} else if ( object instanceof THREE.HemisphereLight ) {

				helper = new THREE.HemisphereLightHelper( object, 10 );

			} else if ( object instanceof THREE.SkinnedMesh ) {

				helper = new THREE.SkeletonHelper( object );

			} else {

				// no helper for this object type
				return;

			}

			var picker = new THREE.Mesh( geometry, material );
			picker.name = 'picker';
			picker.userData.object = object;
			picker.visible = false;
			helper.add( picker );

			scope.sceneHelpers.add( helper );
			scope.helpers[ object.id ] = helper;

			scope.signals.helperAdded.dispatch( helper );

		};

	}(),

	removeHelper: function ( object ) {

		var helpers,
			helper;

		helpers = this.getHelpers();

		if ( helpers !== undefined) {
			helper = helpers[ object.id ];

			helper.parent.remove( helper );
			delete helpers[ object.id ];

			this.signals.helperRemoved.dispatch( helper );
		}

	},

	//

	parent: function ( object, parent ) {

		if ( parent === undefined ) {

			parent = this.getScene();

		}

		parent.add( object );

		this.signals.sceneGraphChanged.dispatch();

	},

	//

	select: function ( object ) {

		this.setSelectedObject( object );

		// if ( object !== null ) {

		// 	this.config.setKey( 'selected', object.uuid );

		// } else {

		// 	this.config.setKey( 'selected', null );

		// }

		this.signals.objectSelected.dispatch( object );

	},

	selectById: function ( id ) {

		var scope,
			scene;

		scope = this;
		scene = scope.getScene();

		scene.traverse( function ( child ) {

			if ( child.id === id ) {

				scope.select( child );

			}

		} );

	},

	selectByUuid: function ( uuid ) {

		var scope,
			scene;

		scope = this;
		scene = scope.getScene();

		scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				scope.select( child );

			}

		} );

	},

	deselect: function () {

		this.select( null );

	},

	// utils

	getObjectType: function ( object ) {

		var types = {

			'Scene': THREE.Scene,
			'PerspectiveCamera': THREE.PerspectiveCamera,
			'AmbientLight': THREE.AmbientLight,
			'DirectionalLight': THREE.DirectionalLight,
			'HemisphereLight': THREE.HemisphereLight,
			'PointLight': THREE.PointLight,
			'SpotLight': THREE.SpotLight,
			'SkinnedMesh': THREE.SkinnedMesh,
			'Mesh': THREE.Mesh,
			'Sprite': THREE.Sprite,
			'Object3D': THREE.Object3D

		};

		for ( var type in types ) {

			if ( object instanceof types[ type ] ) return type;

		}

	},

	getGeometryType: function ( geometry ) {

		var types = {

			'BoxGeometry': THREE.BoxGeometry,
			'CircleGeometry': THREE.CircleGeometry,
			'CylinderGeometry': THREE.CylinderGeometry,
			'ExtrudeGeometry': THREE.ExtrudeGeometry,
			'IcosahedronGeometry': THREE.IcosahedronGeometry,
			'LatheGeometry': THREE.LatheGeometry,
			'OctahedronGeometry': THREE.OctahedronGeometry,
			'ParametricGeometry': THREE.ParametricGeometry,
			'PlaneGeometry': THREE.PlaneGeometry,
			'PolyhedronGeometry': THREE.PolyhedronGeometry,
			'ShapeGeometry': THREE.ShapeGeometry,
			'SphereGeometry': THREE.SphereGeometry,
			'TetrahedronGeometry': THREE.TetrahedronGeometry,
			'TextGeometry': THREE.TextGeometry,
			'TorusGeometry': THREE.TorusGeometry,
			'TorusKnotGeometry': THREE.TorusKnotGeometry,
			'TubeGeometry': THREE.TubeGeometry,
			'Geometry': THREE.Geometry,
			'BufferGeometry': THREE.BufferGeometry

		};

		for ( var type in types ) {

			if ( geometry instanceof types[ type ] ) return type;

		}

	},

	getMaterialType: function ( material ) {

		var types = {

			'LineBasicMaterial': THREE.LineBasicMaterial,
			'LineDashedMaterial': THREE.LineDashedMaterial,
			'MeshBasicMaterial': THREE.MeshBasicMaterial,
			'MeshDepthMaterial': THREE.MeshDepthMaterial,
			'MeshFaceMaterial': THREE.MeshFaceMaterial,
			'MeshLambertMaterial': THREE.MeshLambertMaterial,
			'MeshNormalMaterial': THREE.MeshNormalMaterial,
			'MeshPhongMaterial': THREE.MeshPhongMaterial,
			'PointCloudMaterial': THREE.PointCloudMaterial,
			'ShaderMaterial': THREE.ShaderMaterial,
			'SpriteCanvasMaterial': THREE.SpriteCanvasMaterial,
			'SpriteMaterial': THREE.SpriteMaterial,
			'Material': THREE.Material

		};

		for ( var type in types ) {

			if ( material instanceof types[ type ] ) return type;

		}

	}

}
