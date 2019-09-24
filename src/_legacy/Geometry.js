import { Geometry } from "../core/Geometry.js";

Object.assign( Geometry.prototype, {

	computeTangents: function () {

		console.error( 'THREE.Geometry: .computeTangents() has been removed.' );

	},
	computeLineDistances: function () {

		console.error( 'THREE.Geometry: .computeLineDistances() has been removed. Use THREE.Line.computeLineDistances() instead.' );

	}

} );
