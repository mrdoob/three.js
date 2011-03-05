/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Object3D = function() {

	this.id = THREE.Object3DCounter.value ++;

	this.parent = undefined;
	this.children = [];

	this.position = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1.0, 1.0, 1.0 );

	this.matrix = new THREE.Matrix4();
	this.matrixWorld = new THREE.Matrix4();
	this.matrixRotationWorld = new THREE.Matrix4();
	this.matrixNeedsUpdate = true;
	this.matrixAutoUpdate = true;

	this.quaternion = new THREE.Quaternion();
	this.useQuaternion = false;

	this.boundRadius = 0.0;
	this.boundRadiusScale = 1.0;

	this.visible = true;

};


THREE.Object3D.prototype = {

	translateX : function () {

		

	},

	translateY : function () {

		

	},

	translateZ : function () {

		

	},

	lookAt : function ( object ) {
	
		
	
	},

	addChild: function ( child ) {

		if ( this.children.indexOf( child ) === - 1 ) {

			if( child.parent !== undefined ) {

				child.parent.removeChild( child );

			}

			child.parent = this;
			this.children.push( child );

			// add to scene

			var scene = this;

			while( scene instanceof THREE.Scene === false && scene !== undefined )
				scene = scene.parent;

			if( scene !== undefined ) 
				scene.addChildRecurse( child );

		}

	},

	removeChild: function ( child ) {

		var childIndex = this.children.indexOf( child );

		if ( childIndex !== - 1 ) {

			child.parent = undefined;
			this.children.splice( childIndex, 1 );

		}

	},

	updateMatrix: function () {

		this.matrix.setPosition( this.position );

		if ( this.useQuaternion )  {

			this.matrix.setRotationFromQuaternion( this.quaternion );

		} else {

			this.matrix.setRotationFromEuler( this.rotation );

		}

		if ( this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1 ) {

			this.matrix.scale( this.scale );
			this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ) );

		}

		return true;

	},

	update: function ( parentMatrixWorld, forceUpdate, camera ) {

		if ( this.visible ) {

			if ( this.matrixAutoUpdate ) {

				forceUpdate |= this.updateMatrix();

			}

			// update matrixWorld

			if ( forceUpdate || this.matrixNeedsUpdate ) {

				if ( parentMatrixWorld ) {

					this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

				} else {

					this.matrixWorld.copy( this.matrix );

				}

				this.matrixRotationWorld.extractRotation( this.matrixWorld, this.scale );

				this.matrixNeedsUpdate = false;
				forceUpdate = true;

			}

			// update children

			for ( var i = 0, l = this.children.length; i < l; i ++ ) {

				this.children[ i ].update( this.matrixWorld, forceUpdate, camera );

			}

		}

	}

}

THREE.Object3DCounter = { value: 0 };
