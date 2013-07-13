var Editor = function () {

	var SIGNALS = signals;

	this.signals = {

		// actions

		playAnimations: new SIGNALS.Signal(),

		// notifications

		transformModeChanged: new SIGNALS.Signal(),
		snapChanged: new SIGNALS.Signal(),
		rendererChanged: new SIGNALS.Signal(),
		sceneChanged: new SIGNALS.Signal(),

		objectAdded: new SIGNALS.Signal(),
		objectChanged: new SIGNALS.Signal(),
		objectRemoved: new SIGNALS.Signal(),
		objectSelected: new SIGNALS.Signal(),

		materialChanged: new SIGNALS.Signal(),
		clearColorChanged: new SIGNALS.Signal(),
		fogTypeChanged: new SIGNALS.Signal(),
		fogColorChanged: new SIGNALS.Signal(),
		fogParametersChanged: new SIGNALS.Signal(),
		windowResize: new SIGNALS.Signal()

	};

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

		this.signals.sceneChanged.dispatch( this.scene );

	},

	//

	addObject: function ( object ) {

		this.scene.add( object );
		this.addHelper( object );

		this.signals.objectAdded.dispatch( object );
		this.signals.sceneChanged.dispatch();

	},

	removeObject: function ( object ) {

		if ( object === this.scene ) return;

		var name = object.name ?  '"' + object.name + '"': "selected object";

		if ( confirm( 'Delete ' + name + '?' ) === false ) return;

		this.scene.remove( object );
		this.removeHelper( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneChanged.dispatch();

	},

	addGeometry: function ( geometry  ) {

	},

	removeGeometry: function ( geometry  ) {

	},

	addMaterial: function ( material ) {

	},

	removeMaterial: function ( material ) {

	},

	addTexture: function ( texture ) {

	},

	removeTexture: function ( texture ) {

	},

	//

	addHelper: function ( object ) {

		if ( object instanceof THREE.PointLight ) {

			this.helpers[ object.id ] = new THREE.PointLightHelper( object, 10 );
			this.sceneHelpers.add( this.helpers[ object.id ] );
			this.helpers[ object.id ].lightSphere.id = object.id;

		} else if ( object instanceof THREE.DirectionalLight ) {

			this.helpers[ object.id ] = new THREE.DirectionalLightHelper( object, 10 );
			this.sceneHelpers.add( this.helpers[ object.id ] );
			this.helpers[ object.id ].lightSphere.id = object.id;

		} else if ( object instanceof THREE.SpotLight ) {

			this.helpers[ object.id ] = new THREE.SpotLightHelper( object, 10 );
			this.sceneHelpers.add( this.helpers[ object.id ] );
			// this.helpers[ object.id ].lightSphere.id = object.id;

		} else if ( object instanceof THREE.HemisphereLight ) {

			this.helpers[ object.id ] = new THREE.HemisphereLightHelper( object, 10 );
			this.sceneHelpers.add( this.helpers[ object.id ] );
			this.helpers[ object.id ].lightSphere.id = object.id;

		}

		this.signals.sceneChanged.dispatch();

	},

	removeHelper: function ( object ) {

		if ( this.helpers[ object.id ] !== undefined ) {

			this.helpers[ object.id ].parent.remove( this.helpers[ object.id ] );
			delete this.helpers[ object.id ];

		}

	},

	//

	select: function ( object ) {

		this.selected = object;
		this.signals.objectSelected.dispatch( object );

	},

	selectById: function ( id ) {

		var scope = this;

		this.scene.traverse( function ( node ) {

			if ( node.id === id ) {

				scope.select( node );

			}

		} );

	},

	deselect: function () {

		this.selected = null;

	},

	//

	cloneObject: function ( object ) {

		this.addObject( object.clone() );

	},

	flattenObject: function ( object ) {

		var name = object.name ?  '"' + object.name + '"': "selected object";

		if ( confirm( 'Flatten ' + name + '?' ) === false ) return;

		delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

		var geometry = object.geometry.clone();
		geometry.applyMatrix( object.matrix );

		object.geometry = geometry;

		object.position.set( 0, 0, 0 );
		object.rotation.set( 0, 0, 0 );
		object.scale.set( 1, 1, 1 );

		this.signals.objectChanged.dispatch( object );

	}

}
