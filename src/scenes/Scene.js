/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Scene = function () {

	this.ambientLight = null;
	this.fog = null;

	this.overrideMaterial = null;

	this.objects = [];
	this.lights = [];

	this.__objectsAdded = [];
	this.__objectsRemoved = [];

};

THREE.Scene.prototype.addObject = function ( object ) {

	if ( this.objects.indexOf( object ) === - 1 ) {

		this.objects.push( object );
		this.__objectsAdded.push( object );

	}

};

THREE.Scene.prototype.removeObject = function ( object ) {

	var index = this.objects.indexOf( object );

	if( index !== - 1 ) {

		this.objects.splice( index, 1 );
		this.__objectsRemoved.push( object );

	}

};

THREE.Scene.prototype.addLight = function ( light ) {

	if ( this.lights.indexOf( light ) === - 1 ) {

		this.lights.push( light );

	}

};

THREE.Scene.prototype.removeLight = function ( light ) {

	var index = this.lights.indexOf( light );

	if ( index !== - 1 ) {

		this.lights.splice( index, 1 );

	}

};

THREE.Scene.prototype.update = function () {

	for ( var i = 0; i < this.objects.length; i ++ ) {

		var object = this.objects[ i ];

		object.matrixAutoUpdate && object.updateMatrix();
		object.updateWorldMatrices( false );

	}

};
