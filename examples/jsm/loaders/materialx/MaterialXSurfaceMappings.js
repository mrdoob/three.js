import { DoubleSide } from 'three/webgpu';
import { MaterialXLogCodes } from './MaterialXLog.js';
import { float, color, mul, clamp, vec2, cos, sin, pow, mix, transformNormalToView } from 'three/tsl';

const mappedStandardSurfaceInputs = new Set( [
	'base',
	'base_color',
	'roughness',
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
	'thin_film_ior',
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
	'ior',
	'specular_IOR',
	'emission',
	'emissionColor',
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
	'specular_ior_level',
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

function isEffectivelyOne( node, epsilon = 1e-6 ) {

	return isConstNear( node, 1, epsilon );

}

function isEnabledWeightNode( node ) {

	if ( hasNodeValue( node ) === false ) return false;
	return isEffectivelyZero( node ) === false;

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

	if ( allowOpacityTransparency && hasNodeValue( opacityNode ) && isEffectivelyOne( opacityNode ) === false ) {

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

function buildGltfOpacityNode( alphaNode, alphaModeNode ) {

	const alphaMode = getConstNumber( alphaModeNode );
	const roundedMode = alphaMode === null ? 2 : Math.round( alphaMode );
	const alpha = alphaNode ?? float( 1 );

	if ( roundedMode === 0 ) return float( 1 );
	if ( roundedMode === 1 ) return alpha;
	return alpha;

}

function applyStandardSurface( material, inputs, log, nodeName ) {

	let colorNode = null;
	if ( inputs.base && inputs.base_color ) colorNode = mul( inputs.base, inputs.base_color );
	else if ( inputs.base ) colorNode = inputs.base;
	else if ( inputs.base_color ) colorNode = inputs.base_color;

	if ( inputs.coat_color ) {

		colorNode = colorNode ? mul( colorNode, inputs.coat_color ) : colorNode;

	}

	const roughnessNode = inputs.specular_roughness ?? inputs.roughness;
	const opacityNode = inputs.opacity;
	const transmissionNode = inputs.transmission;
	const transmissionColorNode = inputs.transmission_color;
	const transmissionEnabled = isEnabledWeightNode( transmissionNode );
	const sheenEnabled = isEnabledWeightNode( inputs.sheen );
	const clearcoatEnabled = isEnabledWeightNode( inputs.coat );

	let emissiveNode = inputs.emission;
	const emissionColorNode = inputs.emission_color ?? inputs.emissionColor;
	if ( hasNodeValue( emissionColorNode ) ) {

		emissiveNode = emissiveNode ? mul( emissiveNode, emissionColorNode ) : emissionColorNode;

	}

	const thinFilmThicknessNode = inputs.thin_film_thickness;
	const thinFilmIorNode = clamp( inputs.thin_film_ior || inputs.thin_film_IOR || float( 1.5 ), float( 1.0 ), float( 2.333 ) );
	const thinFilmEnabled = isEnabledWeightNode( thinFilmThicknessNode );
	const transmissionTintNode = hasNodeValue( transmissionColorNode ) ? transmissionColorNode : color( 1, 1, 1 );

	if ( transmissionEnabled ) {

		const baseForTransmissionMix = colorNode || color( 0.8, 0.8, 0.8 );
		// Suppress diffuse/base tint as transmission ramps up.
		colorNode = mix( baseForTransmissionMix, transmissionTintNode, transmissionNode );

	}

	material.colorNode = colorNode || color( 0.8, 0.8, 0.8 );
	if ( hasNodeValue( opacityNode ) && isEffectivelyOne( opacityNode ) === false ) {

		material.opacityNode = opacityNode;

	}

	material.roughnessNode = roughnessNode || float( 0.2 );
	if ( hasNodeValue( inputs.metalness ) && isEffectivelyZero( inputs.metalness ) === false ) {

		material.metalnessNode = inputs.metalness;

	}

	if ( hasNodeValue( inputs.specular ) && isEffectivelyOne( inputs.specular ) === false ) {

		material.specularIntensityNode = inputs.specular;

	}

	material.specularColorNode = inputs.specular_color || color( 1, 1, 1 );
	const iorNode = inputs.specular_IOR || inputs.ior;
	if ( hasNodeValue( iorNode ) && isConstNear( iorNode, 1.5 ) === false ) {

		material.iorNode = iorNode;

	}

	setAnisotropy( material, inputs.specular_anisotropy, inputs.specular_rotation );

	if ( transmissionEnabled ) {

		material.transmissionNode = transmissionNode;
		if ( hasNodeValue( transmissionColorNode ) ) material.transmissionColorNode = transmissionColorNode;
		if ( hasNodeValue( inputs.transmission_depth ) && isEffectivelyZero( inputs.transmission_depth ) === false ) {

			material.thicknessNode = inputs.transmission_depth;

		} else {

			// Keep transmissive standard_surface materials volumetric when
			// transmission_depth is omitted or authored as zero.
			material.thickness = 1;

		}

	}

	if ( thinFilmEnabled ) {

		material.iridescenceThicknessNode = thinFilmThicknessNode;
		material.iridescenceIORNode = thinFilmIorNode;
		material.iridescenceNode = float( 1 );

	}

	const sheenColor = inputs.sheen_color || color( 1, 1, 1 );
	if ( sheenEnabled ) {

		const sheenRoughness = hasNodeValue( inputs.sheen_roughness ) ? inputs.sheen_roughness : float( 0.3 );
		material.sheenNode = mul( inputs.sheen, sheenColor );
		material.sheenRoughnessNode = sheenRoughness;

	}

	if ( clearcoatEnabled ) {

		material.clearcoatNode = inputs.coat;
		if ( hasNodeValue( inputs.coat_roughness ) ) {

			material.clearcoatRoughnessNode = inputs.coat_roughness;

		}

	}

	if ( clearcoatEnabled && hasNodeValue( inputs.coat_normal ) ) {

		material.clearcoatNormalNode = transformNormalToView( inputs.coat_normal );

	}

	if ( hasNodeValue( inputs.normal ) ) material.normalNode = transformNormalToView( inputs.normal );
	if ( hasNodeValue( emissiveNode ) ) material.emissiveNode = emissiveNode;

	setTransmissionFlags( material, transmissionNode, opacityNode );
	warnIgnoredInputs( inputs, mappedStandardSurfaceInputs, log, 'standard_surface', nodeName );

}

function applyGltfPbrSurface( material, inputs, log, nodeName ) {

	const alphaModeLiteral = getConstNumber( inputs.alpha_mode );
	const alphaMode = alphaModeLiteral === null ? 2 : Math.round( alphaModeLiteral );
	const isAlphaMaskMode = alphaMode === 1;
	const isAlphaBlendMode = alphaMode === 2;
	const opacityNode = buildGltfOpacityNode( inputs.alpha, inputs.alpha_mode );
	const alphaCutoffNode = inputs.alpha_cutoff ?? float( 0.5 );
	const hasAttenuationColorInput = Object.prototype.hasOwnProperty.call( inputs, 'attenuation_color' );
	const transmissionEnabled = isEnabledWeightNode( inputs.transmission );
	const clearcoatEnabled = isEnabledWeightNode( inputs.clearcoat );
	const sheenEnabled = hasNodeValue( inputs.sheen_color ) || isEnabledWeightNode( inputs.sheen_roughness );
	const iridescenceEnabled = isEnabledWeightNode( inputs.iridescence );

	material.colorNode = inputs.base_color || color( 1, 1, 1 );
	if ( hasNodeValue( inputs.occlusion ) ) material.aoNode = inputs.occlusion;
	material.roughnessNode = inputs.roughness || float( 1 );
	material.metalnessNode = inputs.metallic || float( 1 );
	if ( hasNodeValue( inputs.specular ) && isEffectivelyOne( inputs.specular ) === false ) {

		material.specularIntensityNode = inputs.specular;

	}

	material.specularColorNode = inputs.specular_color || color( 1, 1, 1 );
	if ( hasNodeValue( inputs.ior ) && isConstNear( inputs.ior, 1.5 ) === false ) {

		material.iorNode = inputs.ior;

	}

	if ( hasNodeValue( opacityNode ) && isEffectivelyOne( opacityNode ) === false ) {

		material.opacityNode = opacityNode;

	}

	if ( isAlphaMaskMode ) {

		material.alphaTestNode = alphaCutoffNode;
		const alphaCutoff = getConstNumber( alphaCutoffNode );
		if ( alphaCutoff !== null ) material.alphaTest = alphaCutoff;

	}

	if ( transmissionEnabled ) {

		material.transmissionNode = inputs.transmission;

	}

	if ( clearcoatEnabled ) {

		material.clearcoatNode = inputs.clearcoat;
		if ( hasNodeValue( inputs.clearcoat_roughness ) && isEffectivelyZero( inputs.clearcoat_roughness ) === false ) {

			material.clearcoatRoughnessNode = inputs.clearcoat_roughness;

		}

	}

	if ( sheenEnabled ) {

		const sheenColor = hasNodeValue( inputs.sheen_color ) ? inputs.sheen_color : color( 0, 0, 0 );
		const sheenRoughness = hasNodeValue( inputs.sheen_roughness ) ? inputs.sheen_roughness : float( 0 );
		material.sheenRoughnessNode = sheenRoughness;
		material.sheenNode = sheenColor;

	}

	if ( iridescenceEnabled ) {

		material.iridescenceNode = inputs.iridescence;
		if ( hasNodeValue( inputs.iridescence_ior ) && isConstNear( inputs.iridescence_ior, 1.3 ) === false ) {

			material.iridescenceIORNode = inputs.iridescence_ior;

		}

		if ( hasNodeValue( inputs.iridescence_thickness ) && isConstNear( inputs.iridescence_thickness, 100 ) === false ) {

			material.iridescenceThicknessNode = inputs.iridescence_thickness;

		}

	}

	material.attenuationDistanceNode = toAttenuationDistance( inputs.attenuation_distance, hasAttenuationColorInput );
	material.attenuationColorNode = inputs.attenuation_color || color( 1, 1, 1 );
	if ( hasNodeValue( inputs.thickness ) ) {

		if ( isEffectivelyZero( inputs.thickness ) === false ) {

			material.thicknessNode = inputs.thickness;

		}

	} else if ( transmissionEnabled ) {

		// Keep transmissive glTF materials volumetric even when thickness is omitted.
		material.thickness = 1;

	}

	if ( hasNodeValue( inputs.dispersion ) && isEffectivelyZero( inputs.dispersion ) === false ) {

		material.dispersionNode = inputs.dispersion;

	}

	const anisotropyStrength = inputs.anisotropy_strength;
	const anisotropyRotation = inputs.anisotropy_rotation;
	setAnisotropy( material, anisotropyStrength, anisotropyRotation );

	if ( hasNodeValue( inputs.normal ) ) material.normalNode = transformNormalToView( inputs.normal );
	if ( hasNodeValue( inputs.clearcoat_normal ) ) {

		material.clearcoatNormalNode = transformNormalToView( inputs.clearcoat_normal );

	}

	if ( hasNodeValue( inputs.emissive ) && hasNodeValue( inputs.emissive_strength ) )
		material.emissiveNode = mul( inputs.emissive, inputs.emissive_strength );
	else if ( hasNodeValue( inputs.emissive ) ) material.emissiveNode = inputs.emissive;

	setTransmissionFlags( material, inputs.transmission, opacityNode, isAlphaBlendMode );
	warnIgnoredInputs( inputs, mappedGltfPbrInputs, log, 'gltf_pbr', nodeName );

}

function applyOpenPbrSurface( material, inputs, log, nodeName ) {

	const baseWeight = inputs.base_weight || float( 1 );
	const baseColor = inputs.base_color || color( 0.8, 0.8, 0.8 );
	const coatEnabled = isEnabledWeightNode( inputs.coat_weight );
	const fuzzEnabled = isEnabledWeightNode( inputs.fuzz_weight );
	const transmissionEnabled = isEnabledWeightNode( inputs.transmission_weight );
	const thinFilmEnabled = isEnabledWeightNode( inputs.thin_film_weight );
	material.colorNode = mul( baseWeight, baseColor );

	if ( hasNodeValue( inputs.base_metalness ) && isEffectivelyZero( inputs.base_metalness ) === false ) {

		material.metalnessNode = inputs.base_metalness;

	}

	material.roughnessNode = inputs.specular_roughness || float( 0.3 );
	if ( hasNodeValue( inputs.specular_weight ) && isEffectivelyOne( inputs.specular_weight ) === false ) {

		material.specularIntensityNode = inputs.specular_weight;

	}

	material.specularColorNode = inputs.specular_color || color( 1, 1, 1 );
	const openPbrIorNode = inputs.specular_ior || inputs.specular_ior_level;
	if ( hasNodeValue( openPbrIorNode ) && isConstNear( openPbrIorNode, 1.5 ) === false ) {

		material.iorNode = openPbrIorNode;

	}

	setAnisotropy( material, inputs.specular_roughness_anisotropy, float( 0 ) );

	if ( coatEnabled ) {

		const coatWeightNode = inputs.coat_weight || float( 0 );
		if ( hasNodeValue( inputs.coat_ior ) ) {

			const coatIorNode = inputs.coat_ior;
			const coatIorMinusOne = coatIorNode.sub( float( 1 ) );
			const coatIorPlusOne = coatIorNode.add( float( 1 ) );
			const coatF0Node = coatIorMinusOne.div( coatIorPlusOne );
			const normalizedClearcoatNode = coatF0Node.mul( coatF0Node ).div( float( 0.04 ) );
			material.clearcoatNode = clamp( coatWeightNode.mul( normalizedClearcoatNode ), float( 0 ), float( 1 ) );

		} else {

			material.clearcoatNode = coatWeightNode;

		}

		if ( hasNodeValue( inputs.coat_roughness ) && isEffectivelyZero( inputs.coat_roughness ) === false ) {

			material.clearcoatRoughnessNode = inputs.coat_roughness;

		}

		if ( hasNodeValue( inputs.geometry_coat_normal ) ) {

			material.clearcoatNormalNode = transformNormalToView( inputs.geometry_coat_normal );

		}

	}

	const fuzzWeight = inputs.fuzz_weight || float( 0 );
	const fuzzColor = inputs.fuzz_color || color( 1, 1, 1 );
	if ( fuzzEnabled ) {

		material.sheenNode = mul( fuzzWeight, fuzzColor );
		if ( hasNodeValue( inputs.fuzz_roughness ) ) {

			material.sheenRoughnessNode = pow( inputs.fuzz_roughness, float( 1.5 ) );

		}

	}

	if ( transmissionEnabled ) {

		material.transmissionNode = inputs.transmission_weight;
		if ( hasNodeValue( inputs.transmission_color ) ) material.attenuationColorNode = inputs.transmission_color;

	}

	const transmissionDepthNode = inputs.transmission_depth;
	if ( transmissionEnabled && hasNodeValue( transmissionDepthNode ) && isEffectivelyZero( transmissionDepthNode ) === false ) {

		material.thicknessNode = hasNodeValue( inputs.geometry_thin_walled )
			? inputs.geometry_thin_walled.select( float( 0 ), transmissionDepthNode )
			: transmissionDepthNode;
		material.attenuationDistanceNode = transmissionDepthNode;

	} else if ( transmissionEnabled ) {

		// Keep transmissive OpenPBR materials volumetric even when depth is omitted.
		material.thickness = 1;

	}

	const transmissionDispersionAbbe = inputs.transmission_dispersion_abbe_number || float( 20 );
	if ( transmissionEnabled && hasNodeValue( inputs.transmission_dispersion_scale ) && isEffectivelyZero( inputs.transmission_dispersion_scale ) === false ) {

		material.dispersionNode = inputs.transmission_dispersion_scale.mul( float( 20 ) ).div( transmissionDispersionAbbe );

	}

	if ( hasNodeValue( inputs.geometry_opacity ) && isEffectivelyOne( inputs.geometry_opacity ) === false ) {

		material.opacityNode = inputs.geometry_opacity;

	}

	if ( hasNodeValue( inputs.geometry_normal ) ) material.normalNode = transformNormalToView( inputs.geometry_normal );

	if ( thinFilmEnabled ) {

		material.iridescenceNode = inputs.thin_film_weight;
		if ( hasNodeValue( inputs.thin_film_thickness ) && isConstNear( inputs.thin_film_thickness, 0.5 ) === false ) {

			material.iridescenceThicknessNode = inputs.thin_film_thickness.mul( float( 1000 ) );

		}

		if ( hasNodeValue( inputs.thin_film_ior ) && isConstNear( inputs.thin_film_ior, 1.4 ) === false ) {

			material.iridescenceIORNode = inputs.thin_film_ior;

		}

	}

	const emissionColor = hasNodeValue( inputs.emission_color ) ? inputs.emission_color : color( 1, 1, 1 );
	const emissionLuminance = hasNodeValue( inputs.emission_luminance ) ? inputs.emission_luminance : float( 0 );
	if ( isEffectivelyZero( emissionLuminance ) === false ) {

		material.emissiveNode = mul( emissionColor, emissionLuminance );

	}

	if ( hasNodeValue( inputs.geometry_opacity ) && isEffectivelyOne( inputs.geometry_opacity ) === false ) material.transparent = true;
	if ( transmissionEnabled ) material.transparent = true;

	setTransmissionFlags( material, inputs.transmission_weight, inputs.geometry_opacity );
	warnIgnoredInputs( inputs, mappedOpenPbrInputs, log, 'open_pbr_surface', nodeName );

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
