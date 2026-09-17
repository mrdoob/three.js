import registryData from './MaterialXNodeInterfaceRegistry.js';

// Nodedef names grouped by node category, in registry (alphabetical) order.
const nodedefNamesByCategory = new Map();

for ( const [ name, nodedef ] of Object.entries( registryData.nodedefs ) ) {

	if ( nodedefNamesByCategory.has( nodedef.node ) === false ) nodedefNamesByCategory.set( nodedef.node, [] );
	nodedefNamesByCategory.get( nodedef.node ).push( name );

}

/**
 * Returns the names of the stdlib nodedefs that implement a node category.
 *
 * @param {string} category - The node category, e.g. `'multiply'`.
 * @return {Array<string>} The nodedef names, empty when the category is unknown.
 */
function getNodeDefNames( category ) {

	return nodedefNamesByCategory.get( category ) || [];

}

function getOutputType( nodedef ) {

	const outputNames = Object.keys( nodedef.outputs );
	if ( outputNames.length > 1 ) return 'multioutput';
	return nodedef.outputs.out ?? nodedef.outputs[ outputNames[ 0 ] ] ?? null;

}

function hasExactInputMatch( nodedef, nodeX ) {

	for ( const child of nodeX.children ) {

		if ( child.element !== 'input' ) continue;

		const declared = nodedef.inputs[ child.name ];
		if ( ! declared ) return false;
		if ( child.type && declared.type !== child.type ) return false;

	}

	return true;

}

/**
 * Resolves the stdlib nodedef of a node instance, mirroring `Node::getNodeDef()` in the
 * MaterialX reference implementation: an explicit `nodedef` attribute wins, otherwise the
 * first nodedef of the same category whose output type matches and whose declared input
 * types match every authored input, otherwise the first nodedef whose output type matches.
 *
 * @param {MaterialXNode} nodeX - The node instance.
 * @return {?{name: string, node: string, inputs: Object, outputs: Object}} The resolved nodedef or `null`.
 */
function resolveNodeDef( nodeX ) {

	const explicitName = nodeX.getAttribute( 'nodedef' );
	if ( explicitName && registryData.nodedefs[ explicitName ] ) {

		return { name: explicitName, ...registryData.nodedefs[ explicitName ] };

	}

	let roughMatch = null;

	for ( const name of getNodeDefNames( nodeX.element ) ) {

		const nodedef = registryData.nodedefs[ name ];
		if ( nodeX.type && getOutputType( nodedef ) !== nodeX.type ) continue;
		if ( hasExactInputMatch( nodedef, nodeX ) ) return { name, ...nodedef };
		roughMatch ??= { name, ...nodedef };

	}

	return roughMatch;

}

export { resolveNodeDef, getNodeDefNames };
