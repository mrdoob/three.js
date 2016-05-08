/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / https://clara.io
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  displacementMap: new THREE.Texture( <Image> ),
 *  displacementScale: <float>,
 *  displacementBias: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

Asset.assignPrototype( THREE.MeshDepthMaterial, THREE.Material, {

	type: 'MeshDepthMaterial',

	DefaultState: {

		depthPacking: THREE.BasicDepthPacking,

		skinning: false,
		morphTargets: false,

		map: null,

		alphaMap: null,

		displacementMap: null,
		displacementScale: 1,
		displacementBias: 0,

		wireframe: false,
		wireframeLinewidth: 1,

		fog: false,
		lights: false

	}

} );
