import { DoubleSide } from 'three/webgpu';
import { MaterialXLogCodes } from './MaterialXLog.js';
import { float, mul, clamp, vec2, cos, sin, pow, mix, element, transformNormalToView } from 'three/tsl';

const mappedStandardSurfaceInputs = new Set( [
	'base',
	'base_color',
	'specular_roughness',
	'metalness',
	'specular',
	'specular_color',
	'specular_anisotropy',
	'specular_rotation',
	'transmission',
	'transmission_color',
	'transmission_depth',
	'thin_film_thickness',
	'thin_film_IOR',
	'sheen',
	'sheen_color',
	'sheen_roughness',
	'coat',
	'coat_color',
	'coat_roughness',
	'coat_normal',
	'normal',
	'opacity',
	'specular_IOR',
	'emission',
	'emission_color',
] );

const mappedGltfPbrInputs = new Set( [
	'base_color',
	'occlusion',
	'roughness',
	'metallic',
	'normal',
	'transmission',
	'specular',
	'specular_color',
	'ior',
	'alpha',
	'alpha_mode',
	'alpha_cutoff',
	'iridescence',
	'iridescence_ior',
	'iridescence_thickness',
	'sheen_color',
	'sheen_roughness',
	'clearcoat',
	'clearcoat_roughness',
	'clearcoat_normal',
	'emissive',
	'emissive_strength',
	'attenuation_distance',
	'attenuation_color',
	'thickness',
	'dispersion',
	'anisotropy_strength',
	'anisotropy_rotation',
] );

const mappedOpenPbrInputs = new Set( [
	'base_weight',
	'base_color',
	'specular_weight',
	'specular_color',
	'specular_roughness',
	'base_metalness',
	'specular_roughness_anisotropy',
	'specular_ior',
	'coat_weight',
	'coat_ior',
	'coat_color',
	'coat_roughness',
	'geometry_coat_normal',
	'fuzz_weight',
	'fuzz_color',
	'fuzz_roughness',
	'transmission_weight',
	'transmission_color',
	'transmission_depth',
	'transmission_dispersion_scale',
	'transmission_dispersion_abbe_number',
	'geometry_normal',
	'geometry_opacity',
	'geometry_thin_walled',
	'thin_film_weight',
	'thin_film_thickness',
	'thin_film_ior',
	'emission_color',
	'emission_luminance',
] );

function warnIgnoredInputs( inputs, mappedInputs, log, surfaceCategory, nodeName ) {

	for ( const inputName of Object.keys( inputs ) ) {

		if ( mappedInputs.has( inputName ) === false ) {

			log.add(
				MaterialXLogCodes.IGNORED_SURFACE_INPUT,
				`${surfaceCategory} input "${inputName}" is currently ignored in MaterialX translation.`,
				nodeName,
			);

		}

	}

}

function hasNodeValue( value ) {

	return value !== undefined && value !== null;

}

function getConstNumber( node ) {

	if ( typeof node === 'number' ) return node;
	if ( ! node || typeof node !== 'object' ) return null;

	let cursor = node;
	const visited = new Set();
	while ( cursor && typeof cursor === 'object' ) {

		if ( visited.has( cursor ) ) break;
		visited.add( cursor );
		if ( typeof cursor.value === 'number' ) return cursor.value;
		if ( cursor.value && cursor.value.isColor && cursor.value.r === cursor.value.g && cursor.value.g === cursor.value.b ) return cursor.value.r;
		cursor = cursor.node;

	}

	return null;

}

function isConstNear( node, target, epsilon = 1e-6 ) {

	const value = getConstNumber( node );
	if ( value === null ) return false;
	return Math.abs( value - target ) <= epsilon;

}

function isEffectivelyZero( node, epsilon = 1e-6 ) {

	return isConstNear( node, 0, epsilon );

}

// True when `node` has an authored value that differs from `target` (default 0),
// i.e. it's worth wiring into the material instead of relying on the default.
function isMeaningfulNode( node, target = 0 ) {

	return hasNodeValue( node ) && isConstNear( node, target ) === false;

}

function isEnabledWeightNode( node ) {

	return isMeaningfulNode( node );

}

function setAnisotropy( material, strengthNode, rotationNode ) {

	if ( ! hasNodeValue( strengthNode ) && ! hasNodeValue( rotationNode ) ) return;
	if ( isEffectivelyZero( strengthNode ) && isEffectivelyZero( rotationNode ) ) return;
	const strength = hasNodeValue( strengthNode ) ? strengthNode : float( 0 );
	const rotation = hasNodeValue( rotationNode ) ? rotationNode : float( 0 );
	material.anisotropyNode = vec2( cos( rotation ), sin( rotation ) ).mul( strength );
	material.anisotropyRotationNode = rotation;

}

function setTransmissionFlags( material, transmissionNode, opacityNode, allowOpacityTransparency = true ) {

	if ( allowOpacityTransparency && isMeaningfulNode( opacityNode, 1 ) ) {

		material.transparent = true;

	}

	if ( isEnabledWeightNode( transmissionNode ) ) {

		material.side = DoubleSide;
		material.transparent = true;

	}

}

function toAttenuationDistance( distanceNode, hasAttenuationColorInput ) {

	if ( hasNodeValue( distanceNode ) ) return distanceNode;
	// When attenuation tint is authored without a distance, default to a
	// finite value so absorption tinting is visible.
	return hasAttenuationColorInput ? float( 1 ) : undefined;

}

// Every mapper receives `inputs` pre-filled with the nodedef defaults of the surface shader,
// so an omitted input and one authored at its default value take the same path. `authored`
// holds only the inputs present in the document.
function applyStandardSurface( material, inputs, log, nodeName, authored ) {

	const coatEnabled = isEnabledWeightNode( inputs.coat );
	const sheenEnabled = isEnabledWeightNode( inputs.sheen );
	const transmissionEnabled = isEnabledWeightNode( inputs.transmission );
	const thinFilmEnabled = isEnabledWeightNode( inputs.thin_film_thickness );

	let colorNode = mul( inputs.base, inputs.base_color );
	if ( coatEnabled ) colorNode = mul( colorNode, inputs.coat_color );

	if ( transmissionEnabled ) {

		// Suppress diffuse/base tint as transmission ramps up.
		colorNode = mix( colorNode, inputs.transmission_color, inputs.transmission );

	}

	const opacityNode = element( inputs.opacity, 0 );

	material.colorNode = colorNode;
	material.roughnessNode = inputs.specular_roughness;
	material.specularColorNode = inputs.specular_color;

	if ( isMeaningfulNode( opacityNode, 1 ) ) material.opacityNode = opacityNode;
	if ( isMeaningfulNode( inputs.metalness ) ) material.metalnessNode = inputs.metalness;
	if ( isMeaningfulNode( inputs.specular, 1 ) ) material.specularIntensityNode = inputs.specular;
	if ( isMeaningfulNode( inputs.specular_IOR, 1.5 ) ) material.iorNode = inputs.specular_IOR;

	setAnisotropy( material, inputs.specular_anisotropy, inputs.specular_rotation );

	if ( transmissionEnabled ) {

		material.transmissionNode = inputs.transmission;
		material.transmissionColorNode = inputs.transmission_color;

		if ( isMeaningfulNode( inputs.transmission_depth ) ) {

			material.thicknessNode = inputs.transmission_depth;

		} else {

			// Keep transmissive standard_surface materials volumetric when
			// transmission_depth is omitted or authored as zero.
			material.thickness = 1;

		}

	}

	if ( thinFilmEnabled ) {

		material.iridescenceNode = float( 1 );
		material.iridescenceThicknessNode = inputs.thin_film_thickness;
		material.iridescenceIORNode = clamp( inputs.thin_film_IOR, float( 1.0 ), float( 2.333 ) );

	}

	if ( sheenEnabled ) {

		material.sheenNode = mul( inputs.sheen, inputs.sheen_color );
		material.sheenRoughnessNode = inputs.sheen_roughness;

	}

	if ( coatEnabled ) {

		material.clearcoatNode = inputs.coat;
		material.clearcoatRoughnessNode = inputs.coat_roughness;
		if ( hasNodeValue( inputs.coat_normal ) ) material.clearcoatNormalNode = transformNormalToView( inputs.coat_normal );

	}

	if ( hasNodeValue( inputs.normal ) ) material.normalNode = transformNormalToView( inputs.normal );
	if ( isEffectivelyZero( inputs.emission ) === false ) material.emissiveNode = mul( inputs.emission, inputs.emission_color );

	setTransmissionFlags( material, inputs.transmission, opacityNode );
	warnIgnoredInputs( authored, mappedStandardSurfaceInputs, log, 'standard_surface', nodeName );

}

function applyGltfPbrSurface( material, inputs, log, nodeName, authored ) {

	// alpha_mode: 0 = OPAQUE, 1 = MASK, 2 = BLEND. A connected alpha_mode is treated as BLEND.
	const alphaModeLiteral = getConstNumber( inputs.alpha_mode );
	const alphaMode = alphaModeLiteral === null ? 2 : Math.round( alphaModeLiteral );
	const isAlphaMaskMode = alphaMode === 1;
	const isAlphaBlendMode = alphaMode === 2;
	const opacityNode = alphaMode === 0 ? float( 1 ) : inputs.alpha;
	const hasAttenuationColorInput = hasNodeValue( authored.attenuation_color );
	const transmissionEnabled = isEnabledWeightNode( inputs.transmission );
	const clearcoatEnabled = isEnabledWeightNode( inputs.clearcoat );
	const sheenEnabled = isMeaningfulNode( inputs.sheen_color ) || isEnabledWeightNode( inputs.sheen_roughness );
	const iridescenceEnabled = isEnabledWeightNode( inputs.iridescence );

	material.colorNode = inputs.base_color;
	material.roughnessNode = inputs.roughness;
	material.metalnessNode = inputs.metallic;
	material.specularColorNode = inputs.specular_color;
	material.attenuationColorNode = inputs.attenuation_color;
	material.attenuationDistanceNode = toAttenuationDistance( inputs.attenuation_distance, hasAttenuationColorInput );

	if ( isMeaningfulNode( inputs.occlusion, 1 ) ) material.aoNode = inputs.occlusion;
	if ( isMeaningfulNode( inputs.specular, 1 ) ) material.specularIntensityNode = inputs.specular;
	if ( isMeaningfulNode( inputs.ior, 1.5 ) ) material.iorNode = inputs.ior;
	if ( isMeaningfulNode( opacityNode, 1 ) ) material.opacityNode = opacityNode;

	if ( isAlphaMaskMode ) {

		material.alphaTestNode = inputs.alpha_cutoff;
		const alphaCutoff = getConstNumber( inputs.alpha_cutoff );
		if ( alphaCutoff !== null ) material.alphaTest = alphaCutoff;

	}

	if ( transmissionEnabled ) material.transmissionNode = inputs.transmission;

	if ( clearcoatEnabled ) {

		material.clearcoatNode = inputs.clearcoat;
		material.clearcoatRoughnessNode = inputs.clearcoat_roughness;
		if ( hasNodeValue( inputs.clearcoat_normal ) ) material.clearcoatNormalNode = transformNormalToView( inputs.clearcoat_normal );

	}

	if ( sheenEnabled ) {

		material.sheenNode = inputs.sheen_color;
		material.sheenRoughnessNode = inputs.sheen_roughness;

	}

	if ( iridescenceEnabled ) {

		material.iridescenceNode = inputs.iridescence;
		material.iridescenceIORNode = inputs.iridescence_ior;
		material.iridescenceThicknessNode = inputs.iridescence_thickness;

	}

	if ( isMeaningfulNode( inputs.thickness ) ) {

		material.thicknessNode = inputs.thickness;

	} else if ( transmissionEnabled ) {

		// Keep transmissive glTF materials volumetric even when thickness is omitted.
		material.thickness = 1;

	}

	if ( isMeaningfulNode( inputs.dispersion ) ) material.dispersionNode = inputs.dispersion;

	setAnisotropy( material, inputs.anisotropy_strength, inputs.anisotropy_rotation );

	if ( hasNodeValue( inputs.normal ) ) material.normalNode = transformNormalToView( inputs.normal );
	if ( isEffectivelyZero( inputs.emissive ) === false ) material.emissiveNode = mul( inputs.emissive, inputs.emissive_strength );

	setTransmissionFlags( material, inputs.transmission, opacityNode, isAlphaBlendMode );
	warnIgnoredInputs( authored, mappedGltfPbrInputs, log, 'gltf_pbr', nodeName );

}

function applyOpenPbrSurface( material, inputs, log, nodeName, authored ) {

	const coatEnabled = isEnabledWeightNode( inputs.coat_weight );
	const fuzzEnabled = isEnabledWeightNode( inputs.fuzz_weight );
	const transmissionEnabled = isEnabledWeightNode( inputs.transmission_weight );
	const thinFilmEnabled = isEnabledWeightNode( inputs.thin_film_weight );

	material.colorNode = mul( inputs.base_weight, inputs.base_color );
	material.roughnessNode = inputs.specular_roughness;
	material.specularColorNode = inputs.specular_color;

	if ( isMeaningfulNode( inputs.base_metalness ) ) material.metalnessNode = inputs.base_metalness;
	if ( isMeaningfulNode( inputs.specular_weight, 1 ) ) material.specularIntensityNode = inputs.specular_weight;
	if ( isMeaningfulNode( inputs.specular_ior, 1.5 ) ) material.iorNode = inputs.specular_ior;

	setAnisotropy( material, inputs.specular_roughness_anisotropy, float( 0 ) );

	if ( coatEnabled ) {

		// Scale the coat weight by the coat's Fresnel reflectance at normal incidence relative
		// to the fixed F0 of 0.04 that the three.js clearcoat model assumes.
		const coatF0Node = inputs.coat_ior.sub( float( 1 ) ).div( inputs.coat_ior.add( float( 1 ) ) );
		const normalizedClearcoatNode = coatF0Node.mul( coatF0Node ).div( float( 0.04 ) );
		material.clearcoatNode = clamp( inputs.coat_weight.mul( normalizedClearcoatNode ), float( 0 ), float( 1 ) );
		material.clearcoatRoughnessNode = inputs.coat_roughness;
		if ( hasNodeValue( inputs.geometry_coat_normal ) ) material.clearcoatNormalNode = transformNormalToView( inputs.geometry_coat_normal );

	}

	if ( fuzzEnabled ) {

		material.sheenNode = mul( inputs.fuzz_weight, inputs.fuzz_color );
		material.sheenRoughnessNode = pow( inputs.fuzz_roughness, float( 1.5 ) );

	}

	if ( transmissionEnabled ) {

		material.transmissionNode = inputs.transmission_weight;
		material.attenuationColorNode = inputs.transmission_color;

		if ( isMeaningfulNode( inputs.transmission_depth ) ) {

			material.thicknessNode = hasNodeValue( inputs.geometry_thin_walled )
				? inputs.geometry_thin_walled.select( float( 0 ), inputs.transmission_depth )
				: inputs.transmission_depth;
			material.attenuationDistanceNode = inputs.transmission_depth;

		} else {

			// Keep transmissive OpenPBR materials volumetric even when depth is omitted.
			material.thickness = 1;

		}

		if ( isMeaningfulNode( inputs.transmission_dispersion_scale ) ) {

			material.dispersionNode = inputs.transmission_dispersion_scale.mul( float( 20 ) ).div( inputs.transmission_dispersion_abbe_number );

		}

	}

	if ( isMeaningfulNode( inputs.geometry_opacity, 1 ) ) material.opacityNode = inputs.geometry_opacity;
	if ( hasNodeValue( inputs.geometry_normal ) ) material.normalNode = transformNormalToView( inputs.geometry_normal );

	if ( thinFilmEnabled ) {

		material.iridescenceNode = inputs.thin_film_weight;
		// OpenPBR thin film thickness is in micrometers, three.js expects nanometers.
		material.iridescenceThicknessNode = inputs.thin_film_thickness.mul( float( 1000 ) );
		material.iridescenceIORNode = inputs.thin_film_ior;

	}

	if ( isEffectivelyZero( inputs.emission_luminance ) === false ) material.emissiveNode = mul( inputs.emission_color, inputs.emission_luminance );

	if ( isMeaningfulNode( inputs.geometry_opacity, 1 ) ) material.transparent = true;
	if ( transmissionEnabled ) material.transparent = true;

	setTransmissionFlags( material, inputs.transmission_weight, inputs.geometry_opacity );
	warnIgnoredInputs( authored, mappedOpenPbrInputs, log, 'open_pbr_surface', nodeName );

}

const MaterialXSurfaceMappings = {
	standard_surface: applyStandardSurface,
	gltf_pbr: applyGltfPbrSurface,
	open_pbr_surface: applyOpenPbrSurface,
};

const surfaceMapperRegistry = new Map( Object.entries( MaterialXSurfaceMappings ).map( ( [ category, apply ] ) => [
	category,
	{ category, apply },
] ) );

function getSurfaceMapper( category ) {

	return surfaceMapperRegistry.get( category );

}

function getSupportedSurfaceCategories() {

	return [ ...surfaceMapperRegistry.keys() ];

}

export {
	MaterialXSurfaceMappings,
	surfaceMapperRegistry,
	getSurfaceMapper,
	getSupportedSurfaceCategories,
	applyStandardSurface,
	applyGltfPbrSurface,
	applyOpenPbrSurface,
	mappedStandardSurfaceInputs,
	mappedGltfPbrInputs,
	mappedOpenPbrInputs,
};
