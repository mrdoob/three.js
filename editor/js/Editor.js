var Editor = function () {

	var SIGNALS = signals;

	this.signals = {

		// actions

		flattenSelectedObject: new SIGNALS.Signal(),
		cloneSelectedObject: new SIGNALS.Signal(),
		removeSelectedObject: new SIGNALS.Signal(),
		playAnimations: new SIGNALS.Signal(),

		// notifications

		transformModeChanged: new SIGNALS.Signal(),
		snapChanged: new SIGNALS.Signal(),
		rendererChanged: new SIGNALS.Signal(),
		sceneAdded: new SIGNALS.Signal(),
		sceneChanged: new SIGNALS.Signal(),
		objectAdded: new SIGNALS.Signal(),
		objectSelected: new SIGNALS.Signal(),
		objectChanged: new SIGNALS.Signal(),
		materialChanged: new SIGNALS.Signal(),
		clearColorChanged: new SIGNALS.Signal(),
		fogTypeChanged: new SIGNALS.Signal(),
		fogColorChanged: new SIGNALS.Signal(),
		fogParametersChanged: new SIGNALS.Signal(),
		windowResize: new SIGNALS.Signal()

	};

	this.scene = new THREE.Scene();

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};

};

Editor.prototype = {

	setScene: function ( scene ) {

	},

	//

	addObject: function ( object, parent ) {

	},

	addGeometry: function ( geometry  ) {

	},

	addMaterial: function ( material ) {

	},

	addTexture: function ( texture ) {

	},

	//

	addHelper: function ( object ) {

	},

	removeHelper: function ( object ) {

	},

	//

	select: function ( object ) {

	},

	deselect: function ( object ) {

	},

	//

	cloneObject: function ( object ) {

	},

	flattenObject: function ( object ) {

	},

	deleteObject: function ( object ) {

	}

}
