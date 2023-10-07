import {
	Object3D,
	Quaternion,
	Vector3
} from 'three';

const _translationObject = /* @__PURE__ */ new Vector3();
const _quaternionObject = /* @__PURE__ */ new Quaternion();
const _scaleObject = /* @__PURE__ */ new Vector3();

const _translationWorld = /* @__PURE__ */ new Vector3();
const _quaternionWorld = /* @__PURE__ */ new Quaternion();
const _scaleWorld = /* @__PURE__ */ new Vector3();

class Gyroscope extends Object3D {

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
