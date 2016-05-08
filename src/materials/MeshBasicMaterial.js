/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  aoMap: new THREE.Texture( <Image> ),
 *  aoMapIntensity: <float>
 *
 *  specularMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>
 * }
 */

THREE.MeshBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.MeshBasicMaterial, THREE.Material, {

	type: 'MeshBasicMaterial',

	DefaultState: {

		color: new THREE.Color( 0xffffff ), // emissive

		map: null,

		aoMap: null,
		aoMapIntensity: 1.0,

		specularMap: null,

		alphaMap: null,

		envMap: null,
		combine: THREE.MultiplyOperation,
		reflectivity: 1,
		refractionRatio: 0.98,

		wireframe: false,
		wireframeLinewidth: 1,
		wireframeLinecap: 'round',
		wireframeLinejoin: 'round',

		skinning: false,
		morphTargets: false,

		lights: false

	}

} );
