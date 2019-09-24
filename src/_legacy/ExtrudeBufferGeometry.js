import { ExtrudeBufferGeometry } from "../geometries/ExtrudeGeometry.js";

Object.assign( ExtrudeBufferGeometry.prototype, {

	getArrays: function () {

		console.error( 'THREE.ExtrudeBufferGeometry: .getArrays() has been removed.' );

	},

	addShapeList: function () {

		console.error( 'THREE.ExtrudeBufferGeometry: .addShapeList() has been removed.' );

	},

	addShape: function () {

		console.error( 'THREE.ExtrudeBufferGeometry: .addShape() has been removed.' );

	}

} );
