/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.matrixAutoUpdate = false;

	this.fog = null;

	this.overrideMaterial = null;

	this.collisions = null;

	this.objects = [];
	this.lights = [];

	this.__objectsAdded = [];
	this.__objectsRemoved = [];

};

THREE.Scene.prototype = new THREE.Object3D();
THREE.Scene.prototype.constructor = THREE.Scene;
THREE.Scene.prototype.supr = THREE.Object3D.prototype;

THREE.Scene.prototype.addChild = function( child ) {

	this.supr.addChild.call( this, child );
	this.addChildRecurse( child );

}

THREE.Scene.prototype.addChildRecurse = function( child ) {

	if ( child instanceof THREE.Light ) {

		if ( this.lights.indexOf( child ) === -1 ) {

			this.lights.push( child );

		}

	} else if ( !( child instanceof THREE.Camera || child instanceof THREE.Bone ) ) {

		if ( this.objects.indexOf( child ) === -1 ) {

			this.objects.push( child );
			this.__objectsAdded.push( child );

		}

	}

	for ( var c = 0; c < child.children.length; c++ ) {

		this.addChildRecurse( child.children[ c ] );

	}

}


THREE.Scene.prototype.removeChild = function( child ) {

	this.supr.removeChild.call( this, child );
	this.removeChildRecurse( child );

}

THREE.Scene.prototype.removeChildRecurse = function( child ) {

	if ( child instanceof THREE.Light ) {

		var i = this.lights.indexOf( child );

		if ( i !== -1 ) {

			this.lights.splice( i, 1 );

		}

	} else if ( !( child instanceof THREE.Camera ) ) {

		var i = this.objects.indexOf( child );

		if( i !== -1 ) {

			this.objects.splice( i, 1 );
			this.__objectsRemoved.push( child );

		}

	}

	for ( var c = 0; c < child.children.length; c++ ) {

		this.removeChildRecurse( child.children[ c ] );

	}

}

THREE.Scene.prototype.addObject = THREE.Scene.prototype.addChild;
THREE.Scene.prototype.removeObject = THREE.Scene.prototype.removeChild;
THREE.Scene.prototype.addLight = THREE.Scene.prototype.addChild;
THREE.Scene.prototype.removeLight = THREE.Scene.prototype.removeChild;
