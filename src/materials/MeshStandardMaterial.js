/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  roughness: <float>,
 *  metalness: <float>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *  lightMapIntensity: <float>
 *
 *  aoMap: new THREE.Texture( <Image> ),
 *  aoMapIntensity: <float>
 *
 *  emissive: <hex>,
 *  emissiveIntensity: <float>
 *  emissiveMap: new THREE.Texture( <Image> ),
 *
 *  bumpMap: new THREE.Texture( <Image> ),
 *  bumpScale: <float>,
 *
 *  normalMap: new THREE.Texture( <Image> ),
 *  normalScale: <Vector2>,
 *
 *  displacementMap: new THREE.Texture( <Image> ),
 *  displacementScale: <float>,
 *  displacementBias: <float>,
 *
 *  roughnessMap: new THREE.Texture( <Image> ),
 *
 *  metalnessMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.CubeTexture( [posx, negx, posy, negy, posz, negz] ),
 *  envMapIntensity: <float>
 *
 *  refractionRatio: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>
 * }
 */

THREE.MeshStandardMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.MeshStandardMaterial, THREE.Material, {

	type: 'MeshStandardMaterial',

	DefaultState: {

		defines: { 'STANDARD': '' },
		color: new THREE.Color( 0xffffff ), // diffuse
		roughness: 0.5,
		metalness: 0.5,

		map: null,

		lightMap: null,
		lightMapIntensity: 1.0,

		aoMap: null,
		aoMapIntensity: 1.0,

		emissive: new THREE.Color( 0x000000 ),
		emissiveIntensity: 1.0,
		emissiveMap: null,

		bumpMap: null,
		bumpScale: 1,

		normalMap: null,
		normalScale: new THREE.Vector2( 1, 1 ),

		displacementMap: null,
		displacementScale: 1,
		displacementBias: 0,

		roughnessMap: null,

		metalnessMap: null,

		alphaMap: null,

		envMap: null,
		envMapIntensity: 1.0,

		refractionRatio: 0.98,

		wireframe: false,
		wireframeLinewidth: 1,
		wireframeLinecap: 'round',
		wireframeLinejoin: 'round',

		skinning: false,
		morphTargets: false,
		morphNormals: false

	}

} );
