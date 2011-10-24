/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.fog = null;
	this.overrideMaterial = null;

	this.matrixAutoUpdate = false;

	this.objects = [];
	this.lights = [];

	this.__objectsAdded = [];
	this.__objectsRemoved = [];

};

THREE.Scene.prototype = new THREE.Object3D();
THREE.Scene.prototype.constructor = THREE.Scene;

THREE.Scene.prototype.addObject = function ( object ) {

	if ( object instanceof THREE.Light ) {

		if ( this.lights.indexOf( object ) === - 1 ) {

			this.lights.push( object );

		}

	} else if ( !( object instanceof THREE.Camera || object instanceof THREE.Bone ) ) {

		if ( this.objects.indexOf( object ) === - 1 ) {

			this.objects.push( object );
			this.__objectsAdded.push( object );

			// check if previously removed

			var i = this.__objectsRemoved.indexOf( object );

			if ( i !== -1 ) {

				this.__objectsRemoved.splice( i, 1 );

			}

		}

	}

	for ( var c = 0; c < object.children.length; c ++ ) {

		this.addObject( object.children[ c ] );

	}

};

THREE.Scene.prototype.removeObject = function ( object ) {

	if ( object instanceof THREE.Light ) {

		var i = this.lights.indexOf( object );

		if ( i !== -1 ) {

			this.lights.splice( i, 1 );

		}

	} else if ( !( object instanceof THREE.Camera ) ) {

		var i = this.objects.indexOf( object );

		if( i !== -1 ) {

			this.objects.splice( i, 1 );
			this.__objectsRemoved.push( object );

			// check if previously added

			var ai = this.__objectsAdded.indexOf( object );

			if ( ai !== -1 ) {

				this.__objectsAdded.splice( ai, 1 );

			}

		}

	}

	for ( var c = 0; c < object.children.length; c ++ ) {

		this.removeObject( object.children[ c ] );

	}

};
