import {
	applyStandardSurface,
	applyGltfPbrSurface,
	applyOpenPbrSurface,
	mappedStandardSurfaceInputs,
	mappedGltfPbrInputs,
	mappedOpenPbrInputs,
} from './MaterialXSurfaceMappings.js';
import { toRegistryMap } from './MaterialXTranslatorTypes.js';

const surfaceMapperSpecs = [
	{
		category: 'standard_surface',
		mappedInputs: mappedStandardSurfaceInputs,
		apply: applyStandardSurface,
	},
	{
		category: 'gltf_pbr',
		mappedInputs: mappedGltfPbrInputs,
		apply: applyGltfPbrSurface,
	},
	{
		category: 'open_pbr_surface',
		mappedInputs: mappedOpenPbrInputs,
		apply: applyOpenPbrSurface,
	},
];

const surfaceMapperRegistry = toRegistryMap( surfaceMapperSpecs, ( entry ) => entry.category, 'surface' );

function getSurfaceMapper( category ) {

	return surfaceMapperRegistry.get( category );

}

function getSupportedSurfaceCategories() {

	return [ ...surfaceMapperRegistry.keys() ];

}

export { surfaceMapperSpecs, surfaceMapperRegistry, getSurfaceMapper, getSupportedSurfaceCategories };
