const materials = [
	{
		name: 'MeshBasicMaterial',
		shortName: 'Basic',
		properties: [
			'alphaMap',
			'aoMap',
			'aoMapIntensity',
			'color',
			'combine',
			'envMap',
			'envMapRotation',
			'fog',
			'lightMap',
			'lightMapIntensity',
			'map',
			'reflectivity',
			'refractionRatio',
			'specularMap',
			'wireframe',
			'wireframeLinecap',
			'wireframeLinejoin',
			'wireframeLinewidth'
		],
	},
	{
		name: 'MeshLambertMaterial',
		shortName: 'Lambert',
		properties: [
			'alphaMap',
			'aoMap',
			'aoMapIntensity',
			'bumpMap',
			'bumpScale',
			'color',
			'combine',
			'displacementBias',
			'displacementMap',
			'displacementScale',
			'emissive',
			'emissiveIntensity',
			'emissiveMap',
			'envMap',
			'envMapRotation',
			'flatShading',
			'fog',
			'lightMap',
			'lightMapIntensity',
			'map',
			'normalMap',
			'normalMapType',
			'normalScale',
			'reflectivity',
			'refractionRatio',
			'specularMap',
			'wireframe',
			'wireframeLinecap',
			'wireframeLinejoin',
			'wireframeLinewidth'
		],
	},
	{
		name: 'MeshPhongMaterial',
		shortName: 'Phong',
		properties: [
			'alphaMap',
			'aoMap',
			'aoMapIntensity',
			'bumpMap',
			'bumpScale',
			'color',
			'combine',
			'displacementBias',
			'displacementMap',
			'displacementScale',
			'emissive',
			'emissiveIntensity',
			'emissiveMap',
			'envMap',
			'envMapRotation',
			'flatShading',
			'fog',
			'lightMap',
			'lightMapIntensity',
			'map',
			'normalMap',
			'normalMapType',
			'normalScale',
			'reflectivity',
			'refractionRatio',
			'shininess',
			'specular',
			'specularMap',
			'wireframe',
			'wireframeLinecap',
			'wireframeLinejoin',
			'wireframeLinewidth'
		],
	},
	{
		name: 'MeshStandardMaterial',
		shortName: 'Standard',
		properties: [
			'alphaMap',
			'aoMap',
			'aoMapIntensity',
			'bumpMap',
			'bumpScale',
			'color',
			'displacementBias',
			'displacementMap',
			'displacementScale',
			'emissive',
			'emissiveIntensity',
			'emissiveMap',
			'envMap',
			'envMapIntensity',
			'envMapRotation',
			'flatShading',
			'fog',
			'lightMap',
			'lightMapIntensity',
			'map',
			'metalness',
			'metalnessMap',
			'normalMap',
			'normalMapType',
			'normalScale',
			'roughness',
			'roughnessMap',
			'wireframe',
			'wireframeLinecap',
			'wireframeLinejoin',
			'wireframeLinewidth'
		],
	},
	{
		name: 'MeshPhysicalMaterial',
		shortName: 'Physical',
		properties: [
			'alphaMap',
			'aoMap',
			'aoMapIntensity',
			'anisotropy',
			'anisotropyRotation',
			'anisotropyMap',
			'attenuationColor',
			'attenuationDistance',
			'bumpMap',
			'bumpScale',
			'clearcoat',
			'clearcoatMap',
			'clearcoatNormalMap',
			'clearcoatNormalScale',
			'clearcoatRoughness',
			'clearcoatRoughnessMap',
			'color',
			'displacementBias',
			'displacementMap',
			'displacementScale',
			'emissive',
			'emissiveIntensity',
			'emissiveMap',
			'envMap',
			'envMapIntensity',
			'envMapRotation',
			'flatShading',
			'fog',
			'ior',
			'iridescence',
			'iridescenceIOR',
			'iridescenceMap',
			'iridescenceThicknessMap',
			'iridescenceThicknessRange',
			'lightMap',
			'lightMapIntensity',
			'map',
			'metalness',
			'metalnessMap',
			'normalMap',
			'normalMapType',
			'normalScale',
			'reflectivity',
			'roughness',
			'roughnessMap',
			'sheen',
			'sheenColor',
			'sheenColorMap',
			'sheenRoughness',
			'sheenRoughnessMap',
			'specularColor',
			'specularColorMap',
			'specularIntensity',
			'specularIntensityMap',
			'thickness',
			'thicknessMap',
			'transmission',
			'transmissionMap',
			'wireframe',
			'wireframeLinecap',
			'wireframeLinejoin',
			'wireframeLinewidth'
		],
	},
];

const allProperties = new Set();
materials.forEach( ( material ) => {

	material.properties.forEach( ( property ) => {

		allProperties.add( property );

	} );

} );

function addElem( type, parent, content ) {

	const elem = document.createElement( type );
	if ( content ) {

		elem.textContent = content;

	}

	if ( parent ) {

		parent.appendChild( elem );

	}

	return elem;

}

const table = document.createElement( 'table' );
const thead = addElem( 'thead', table );
{

	addElem( 'td', thead );
	materials.forEach( ( material ) => {

		const td = addElem( 'td', thead );
		const a = addElem( 'a', td, material.shortName );
		a.href = `https://threejs.org/docs/#api/materials/${material.name}`;

	} );

}

Array.from( allProperties ).sort().forEach( ( property ) => {

	const tr = addElem( 'tr', table );
	addElem( 'td', tr, property );
	materials.forEach( ( material ) => {

		const hasProperty = material.properties.indexOf( property ) >= 0;
		const td = addElem( 'td', tr );
		const a = addElem( 'a', td, hasProperty ? '•' : '' );
		a.href = `https://threejs.org/docs/#api/materials/${material.name}.${property}`;

	} );

} );
document.querySelector( '#material-table' ).appendChild( table );
