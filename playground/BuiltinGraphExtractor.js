/**
 * Utility to extract built-in shader graphs from Three.js materials
 * for use in the node playground.
 */

import * as TSL from 'three/tsl';

// Note: Materials are imported dynamically in getBuiltinMaterialTypes()
// to handle cases where webgpu module might not be available

/**
 * Extracts the node graph from a material's customization points.
 * This creates a simplified representation of the material's shader graph
 * that can be loaded into the playground.
 *
 * @param {NodeMaterial} material - The node material to extract the graph from.
 * @param {Object} options - Extraction options.
 * @param {boolean} [options.includeDefaults=true] - Whether to include default nodes.
 * @return {Object} A JSON-serializable representation of the material's node graph.
 */
export function extractMaterialGraph( material, options = {} ) {

	const { includeDefaults = true } = options;

	if ( ! material || ! material.isNodeMaterial ) {

		throw new Error( 'Material must be a NodeMaterial instance' );

	}

	// Get all node properties from the material
	const nodeProperties = material._getNodeChildren ? material._getNodeChildren() : [];

	if ( ! Array.isArray( nodeProperties ) ) {

		return {
			materialType: material.type,
			nodes: [],
			connections: [],
			properties: {}
		};

	}

	const graph = {
		materialType: material.type,
		nodes: [],
		connections: [],
		properties: {}
	};

	// Extract node properties that can be customized
	const customizationPoints = [
		'colorNode', 'opacityNode', 'normalNode', 'emissiveNode',
		'metalnessNode', 'roughnessNode', 'positionNode', 'alphaTestNode',
		'lightMapNode', 'aoNode', 'envNode', 'fragmentNode', 'vertexNode'
	];

	for ( const { property, childNode } of nodeProperties ) {

		if ( customizationPoints.includes( property ) && childNode ) {

			try {

				const nodeJSON = childNode.toJSON();
				graph.properties[ property ] = nodeJSON.uuid;

				// Collect all nodes from the graph
				collectNodes( childNode, nodeJSON, graph );

			} catch ( e ) {

				console.warn( `Failed to extract node for property ${property}:`, e );

			}

		}

	}

	// If no custom nodes, create default material representation
	if ( Object.keys( graph.properties ).length === 0 && includeDefaults ) {

		graph.properties = createDefaultMaterialGraph( material );

	}

	return graph;

}

/**
 * Recursively collects all nodes from a node graph.
 *
 * @param {Node} node - The root node.
 * @param {Object} nodeJSON - The serialized node JSON.
 * @param {Object} graph - The graph object to populate.
 */
function collectNodes( node, nodeJSON, graph ) {

	if ( ! node || ! nodeJSON ) return;

	// Add node to graph if not already present
	const existingNode = graph.nodes.find( n => n.uuid === nodeJSON.uuid );

	if ( ! existingNode ) {

		graph.nodes.push( nodeJSON );

	}

	// Recursively collect child nodes
	if ( nodeJSON.inputNodes ) {

		for ( const [ property, childUUID ] of Object.entries( nodeJSON.inputNodes ) ) {

			// Find the child node in the meta
			if ( nodeJSON.meta && nodeJSON.meta.nodes ) {

				const childNodeData = nodeJSON.meta.nodes[ childUUID ];

				if ( childNodeData ) {

					// Add connection
					graph.connections.push( {
						from: childUUID,
						to: nodeJSON.uuid,
						property: property
					} );

					// Recursively collect child nodes
					collectNodes( null, childNodeData, graph );

				}

			}

		}

	}

}

/**
 * Creates a default material graph representation for materials without custom nodes.
 *
 * @param {NodeMaterial} material - The material.
 * @return {Object} Default graph properties.
 */
function createDefaultMaterialGraph( material ) {

	const properties = {};

	// Create placeholder nodes for common material properties
	const nodeTypes = {
		colorNode: 'vec3',
		opacityNode: 'float',
		normalNode: 'vec3',
		emissiveNode: 'vec3',
		metalnessNode: 'float',
		roughnessNode: 'float'
	};

	for ( const [ property ] of Object.entries( nodeTypes ) ) {

		if ( material[ property.replace( 'Node', '' ) ] !== undefined ) {

			// Create a material property reference node
			const node = TSL.materialReference( property.replace( 'Node', '' ) );
			const nodeJSON = node.toJSON();

			properties[ property ] = nodeJSON.uuid;

		}

	}

	return properties;

}

/**
 * Gets a list of available built-in material types that can be loaded.
 * This returns material type information that can be used to create
 * Material Editor instances in the playground.
 *
 * @return {Array<Object>} Array of material type information.
 */
export function getBuiltinMaterialTypes() {

	return [
		{
			name: 'MeshStandardNodeMaterial',
			label: 'Standard Material',
			icon: 'ti ti-inner-shadow-top-left',
			editorClass: 'StandardMaterialEditor'
		},
		{
			name: 'MeshBasicNodeMaterial',
			label: 'Basic Material',
			icon: 'ti ti-circle',
			editorClass: 'BasicMaterialEditor'
		},
		{
			name: 'MeshPhongNodeMaterial',
			label: 'Phong Material',
			icon: 'ti ti-circle-dotted',
			editorClass: 'PhongMaterialEditor'
		},
		{
			name: 'MeshPhysicalNodeMaterial',
			label: 'Physical Material',
			icon: 'ti ti-circle-half',
			editorClass: 'PhysicalMaterialEditor'
		},
		{
			name: 'MeshLambertNodeMaterial',
			label: 'Lambert Material',
			icon: 'ti ti-circle-half-2',
			editorClass: 'LambertMaterialEditor'
		},
		{
			name: 'MeshToonNodeMaterial',
			label: 'Toon Material',
			icon: 'ti ti-circle-half-vertical',
			editorClass: 'ToonMaterialEditor'
		}
	];

}
