import { Matrix4 } from '../math/Matrix4';
import { Object3D } from '../core/Object3D';
import { Quaternion } from '../math/Quaternion';
import { Vector3 } from '../math/Vector3';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
 */

function Camera() {

	Object3D.call( this );

	this.type = 'Camera';

	this.matrixWorldInverse = new Matrix4();
	this.projectionMatrix = new Matrix4();

}

Camera.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Camera,

	isCamera: true,

	getWorldDirection: function () {

		var quaternion = new Quaternion();

		return function getWorldDirection( optionalTarget ) {

			var result = optionalTarget || new Vector3();

			this.getWorldQuaternion( quaternion );

			return result.set( 0, 0, - 1 ).applyQuaternion( quaternion );

		};

	}(),

	lookAt: function () {

		// This routine does not support cameras with rotated and/or translated parent(s)

		var m1 = new Matrix4();

		return function lookAt( vector ) {

			m1.lookAt( this.position, vector, this.up );

			this.quaternion.setFromRotationMatrix( m1 );

		};

	}(),

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );
		this.projectionMatrix.copy( source.projectionMatrix );

		return this;

	}

} );

export { Camera };
