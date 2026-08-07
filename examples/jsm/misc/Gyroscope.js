import {
	Object3D,
	mat4Compose,
	mat4Copy,
	mat4Decompose,
	mat4MultiplyMatrices,
	quatCreate,
	vec3Create
} from 'three';

const _translationObject = /*@__PURE__*/ vec3Create();
const _quaternionObject = /*@__PURE__*/ quatCreate();
const _scaleObject = /*@__PURE__*/ vec3Create();

const _translationWorld = /*@__PURE__*/ vec3Create();
const _quaternionWorld = /*@__PURE__*/ quatCreate();
const _scaleWorld = /*@__PURE__*/ vec3Create();

/**
 * A special type of 3D object that takes a position from the scene graph hierarchy
 * but uses its local rotation as world rotation. It works like real-world gyroscope -
 * you can move it around using hierarchy while its orientation stays fixed with
 * respect to the world.
 *
 * @augments Object3D
 * @three_import import { Gyroscope } from 'three/addons/misc/Gyroscope.js';
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

				mat4MultiplyMatrices( this.parent.matrixWorld, this.matrix, this.matrixWorld );

				mat4Decompose( this.matrixWorld, _translationWorld, _quaternionWorld, _scaleWorld );
				mat4Decompose( this.matrix, _translationObject, _quaternionObject, _scaleObject );

				mat4Compose( _translationWorld, _quaternionObject, _scaleWorld, this.matrixWorld );


			} else {

				mat4Copy( this.matrix, this.matrixWorld );

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
