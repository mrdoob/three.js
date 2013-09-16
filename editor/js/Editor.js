var Editor = function () {

	var SIGNALS = signals;

	this.signals = {

		// actions

		playAnimations: new SIGNALS.Signal(),

		// notifications

		transformModeChanged: new SIGNALS.Signal(),
		snapChanged: new SIGNALS.Signal(),
		spaceChanged: new SIGNALS.Signal(),
		rendererChanged: new SIGNALS.Signal(),

		sceneGraphChanged: new SIGNALS.Signal(),

		objectSelected: new SIGNALS.Signal(),
		objectAdded: new SIGNALS.Signal(),
		objectChanged: new SIGNALS.Signal(),
		objectRemoved: new SIGNALS.Signal(),

		helperAdded: new SIGNALS.Signal(),
		helperRemoved: new SIGNALS.Signal(),

		materialChanged: new SIGNALS.Signal(),
		clearColorChanged: new SIGNALS.Signal(),
		fogTypeChanged: new SIGNALS.Signal(),
		fogColorChanged: new SIGNALS.Signal(),
		fogParametersChanged: new SIGNALS.Signal(),
		windowResize: new SIGNALS.Signal()

	};

	this.loader = new Loader( this );

	this.scene = new THREE.Scene();
	this.sceneHelpers = new THREE.Scene();

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};

	this.selected = null;
	this.helpers = {};

};

Editor.prototype = {

	setScene: function ( scene ) {

		this.scene.name = scene.name;
		this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		while ( scene.children.length > 0 ) {

			this.addObject( scene.children[ 0 ] );

		}

	},

	//

	addObject: function ( object ) {

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addHelper( child );

		} );

		this.scene.add( object );

		this.signals.objectAdded.dispatch( object );
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

		this.geometries[ geometry.uuid ] = geometry;

	},

	addMaterial: function ( material ) {

		this.materials[ material.uuid ] = material;

	},

	addTexture: function ( texture ) {

		this.textures[ texture.uuid ] = texture;

	},

	//

	addHelper: function () {

		var geometry = new THREE.SphereGeometry( 20, 4, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

		return function ( object ) {

			if ( object instanceof THREE.Camera ) {

				var picker = new THREE.Mesh( geometry, material );
				picker.name = 'picker';
				picker.userData.object = object;
				picker.visible = false;

				var helper = new THREE.CameraHelper( object, 10 );
				helper.add( picker );
			
				this.sceneHelpers.add( helper );
				this.helpers[ object.id ] = helper;

				this.signals.helperAdded.dispatch( helper );

			} else if ( object instanceof THREE.PointLight ) {

				var picker = new THREE.Mesh( geometry, material );
				picker.name = 'picker';
				picker.userData.object = object;
				picker.visible = false;

				var helper = new THREE.PointLightHelper( object, 10 );
				helper.add( picker );
			
				this.sceneHelpers.add( helper );
				this.helpers[ object.id ] = helper;

				this.signals.helperAdded.dispatch( helper );

			} else if ( object instanceof THREE.DirectionalLight ) {

				var picker = new THREE.Mesh( geometry, material );
				picker.name = 'picker';
				picker.userData.object = object;
				picker.visible = false;

				var helper = new THREE.DirectionalLightHelper( object, 20 );
				helper.add( picker );

				this.sceneHelpers.add( helper );
				this.helpers[ object.id ] = helper;

				this.signals.helperAdded.dispatch( helper );

			} else if ( object instanceof THREE.SpotLight ) {

				var picker = new THREE.Mesh( geometry, material );
				picker.name = 'picker';
				picker.userData.object = object;
				picker.visible = false;

				var helper = new THREE.SpotLightHelper( object, 10 );
				helper.add( picker );

				this.sceneHelpers.add( helper );
				this.helpers[ object.id ] = helper;

				this.signals.helperAdded.dispatch( helper );

			} else if ( object instanceof THREE.HemisphereLight ) {

				var picker = new THREE.Mesh( geometry, material );
				picker.name = 'picker';
				picker.userData.object = object;
				picker.visible = false;

				var helper = new THREE.HemisphereLightHelper( object, 10 );
				helper.add( picker );

				this.sceneHelpers.add( helper );
				this.helpers[ object.id ] = helper;

				this.signals.helperAdded.dispatch( helper );

			}

		};

	}(),

	removeHelper: function ( object ) {

		if ( this.helpers[ object.id ] !== undefined ) {

			var helper = this.helpers[ object.id ];
			helper.parent.remove( helper );

			delete this.helpers[ object.id ];

			this.signals.helperRemoved.dispatch( helper );

		}

	},

	//

	parent: function ( object, parent ) {

		if ( parent === undefined ) {

			parent = this.scene;

		}

		parent.add( object );

		this.signals.sceneGraphChanged.dispatch();

	},

	//

	select: function ( object ) {

		this.selected = object;
		this.signals.objectSelected.dispatch( object );

	},

	selectById: function ( id ) {

		var object = null;

		this.scene.traverse( function ( child ) {

			if ( child.id === id ) {

				object = child;

			}

		} );

		this.select( object );

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
			'Mesh': THREE.Mesh,
			'Object3D': THREE.Object3D

		};

		for ( var type in types ) {

			if ( object instanceof types[ type ] ) return type;

		}

	},

	getGeometryType: function ( geometry ) {

		var types = {

			'CircleGeometry': THREE.CircleGeometry,
			'CubeGeometry': THREE.CubeGeometry,
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
			'ParticleBasicMaterial': THREE.ParticleBasicMaterial,
			'ParticleCanvasMaterial': THREE.ParticleCanvasMaterial,
			'ShaderMaterial': THREE.ShaderMaterial,
			'Material': THREE.Material

		};

		for ( var type in types ) {

			if ( material instanceof types[ type ] ) return type;

		}

	}

}
