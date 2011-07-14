/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Object3D = function() {

	this.name = "";

	this.parent = undefined;
	this.children = [];

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.eulerOrder = 'XYZ';

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.scaleWorld = new THREE.Vector3( 1, 1, 1 );

	this.dynamic = false; // WebGLRenderer: when true it retains arrays so they can be updated with __dirty*
	
	this.doubleSided = false;
	this.flipSided = false;

	this.renderDepth = null;

	this.matrix = new THREE.Matrix4();
	this.matrixAutoUpdate = true;

	this.matrixWorld = new THREE.Matrix4();
	this.matrixRotationWorld = new THREE.Matrix4();
	this.matrixWorldNeedsUpdate = true;

	this.quaternion = new THREE.Quaternion();
	this.useQuaternion = false;

	this.boundRadius = 0.0;
	this.boundRadiusScale = 1.0;

	this.visible = true;

	this._vector = new THREE.Vector3();

};


THREE.Object3D.prototype = {

	translate : function ( distance, axis ) {

		this.matrix.rotateAxis( axis );
		this.position.addSelf( axis.multiplyScalar( distance ) );

	},

	translateX : function ( distance ) {

		this.translate( distance, this._vector.set( 1, 0, 0 ) );

	},

	translateY : function ( distance ) {

		this.translate( distance, this._vector.set( 0, 1, 0 ) );

	},

	translateZ : function ( distance ) {

		this.translate( distance, this._vector.set( 0, 0, 1 ) );

	},

	lookAt : function ( vector ) {

		// TODO: Add hierarchy support.

		this.matrix.lookAt( vector, this.position, this.up );
		this.rotation.setRotationFromMatrix( this.matrix );

	},

	addObject: function ( object ) {

		if ( this.children.indexOf( object ) === - 1 ) {

			if ( object.parent !== undefined ) {

				object.parent.removeObject( object );

			}

			object.parent = this;

			this.children.push( object );

		}		

	},

	removeObject: function ( object ) {

		var index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = undefined;

			this.children.splice( index, 1 );

		}

	},

	updateMatrix: function () {

		this.matrix.setPosition( this.position );

		if ( this.useQuaternion )  {

			this.matrix.setRotationFromQuaternion( this.quaternion );

		} else {

			this.matrix.setRotationFromEuler( this.rotation, this.eulerOrder );

		}

		if ( this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1 ) {

			this.matrix.scale( this.scale );
			this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ) );

		}

		this.matrixWorldNeedsUpdate = true;

	},

	updateWorldMatrices: function ( force ) {

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent ) {

				this.matrixWorld.multiply( this.parent.matrixWorld, this.matrix );
				this.scaleWorld.multiply( this.parent.scaleWorld, this.scale );

			} else {

				this.matrixWorld.copy( this.matrix );
				this.scaleWorld.copy( this.scale );

			}

			// TODO: This is not correct, but works on common cases.

			this.matrixRotationWorld.extractRotation( this.matrixWorld, this.scaleWorld );

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];
			
			child.matrixAutoUpdate && child.updateMatrix();
			child.updateWorldMatrices( force );

		}


	}

};
