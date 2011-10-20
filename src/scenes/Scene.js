/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.fog = null;

	this.matrixAutoUpdate = false;

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

THREE.Scene.prototype.add = function ( object ) {

	this.supr.add.call( this, object );
	this.addChildRecurse( object );

}

THREE.Scene.prototype.addChildRecurse = function ( child ) {

	if ( child instanceof THREE.Light ) {

		if ( this.lights.indexOf( child ) === - 1 ) {

			this.lights.push( child );

		}

	} else if ( !( child instanceof THREE.Camera || child instanceof THREE.Bone ) ) {

		if ( this.objects.indexOf( child ) === - 1 ) {

			this.objects.push( child );
			this.__objectsAdded.push( child );

			// check if previously removed

			var i = this.__objectsRemoved.indexOf( child );

			if ( i !== -1 ) {

				this.__objectsRemoved.splice( i, 1 );

			}

		}

	}

	for ( var c = 0; c < child.children.length; c ++ ) {

		this.addChildRecurse( child.children[ c ] );

	}

}

THREE.Scene.prototype.remove = function ( object ) {

	this.supr.remove.call( this, object );
	this.removeChildRecurse( object );

}

THREE.Scene.prototype.removeChildRecurse = function ( child ) {

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

			// check if previously added

			var ai = this.__objectsAdded.indexOf( child );

			if ( ai !== -1 ) {

				this.__objectsAdded.splice( ai, 1 );

			}
		}

	}

	for ( var c = 0; c < child.children.length; c ++ ) {

		this.removeChildRecurse( child.children[ c ] );

	}

}

// DEPRECATED

THREE.Scene.prototype.addChild = function ( child ) {

	console.warn( 'DEPRECATED: Scene.addChild() is now Scene.add().' );
	this.add( child );

}

THREE.Scene.prototype.addObject = function ( child ) {

	console.warn( 'DEPRECATED: Scene.addObject() is now Scene.add().' );
	this.add( child );

}

THREE.Scene.prototype.addLight = function ( child ) {

	console.warn( 'DEPRECATED: Scene.addLight() is now Scene.add().' );
	this.add( child );

}

THREE.Scene.prototype.removeChild = function ( child ) {

	console.warn( 'DEPRECATED: Scene.removeChild() is now Scene.remove().' );
	this.remove( child );

}

THREE.Scene.prototype.removeObject = function ( child ) {

	console.warn( 'DEPRECATED: Scene.removeObject() is now Scene.remove().' );
	this.remove( child );

}

THREE.Scene.prototype.removeLight = function ( child ) {

	console.warn( 'DEPRECATED: Scene.removeLight() is now Scene.remove().' );
	this.remove( child );

}
