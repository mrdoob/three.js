/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

THREE.MeshNormalMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.MeshNormalMaterial, THREE.Material, {

	type: 'MeshNormalMaterial',

	DefaultState: {

		wireframe: false,
		wireframeLinewidth: 1,

		fog: false,
		lights: false,
		morphTargets: false

	}

} );
