import {
	Object3D,
	Quaternion,
	Vector3
} from 'three';

const _translationObject = new Vector3();
const _quaternionObject = new Quaternion();
const _scaleObject = new Vector3();

const _translationWorld = new Vector3();
const _quaternionWorld = new Quaternion();
const _scaleWorld = new Vector3();

/**
 * A special type of 3D object that takes a position from the scene graph hierarchy
 * but uses its local rotation as world rotation. It works like real-world gyroscope -
 * you can move it around using hierarchy while its orientation stays fixed with
 * respect to the world.
 *
 * @augments Object3D
 */
class Gyroscope extends Object3D {

	/**
	 * Constructs a new gyroscope.
	 */
	constructor() {

		super();

	}

	updateMatrixWorld( force ) {

		this.matrixAutoUpdate && this.updateMatrix();

		// update matrixWorld

		if ( this.matrixWorldNeedsUpdate || force ) {

			if ( this.parent !== null ) {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

				this.matrixWorld.decompose( _translationWorld, _quaternionWorld, _scaleWorld );
				this.matrix.decompose( _translationObject, _quaternionObject, _scaleObject );

				this.matrixWorld.compose( _translationWorld, _quaternionObject, _scaleWorld );


			} else {

				this.matrixWorld.copy( this.matrix );

			}


			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( let i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	}

}

export { Gyroscope };
