/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
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
 *  specularMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
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

THREE.MeshPhongMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

};

THREE.Asset.assignPrototype( THREE.MeshPhongMaterial, THREE.Material, {

	type: 'MeshPhongMaterial',

	DefaultState: {

		color: = new THREE.Color( 0xffffff ), // diffuse
		specular: new THREE.Color( 0x111111 ),
		shininess: 30,

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
		morphNormals: false

	}

} );
