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

// Mirrors `NodeDef::isVersionCompatible()`: an unversioned node takes the default version.
function isVersionCompatible( nodedef, version ) {

	if ( ( nodedef.version || '' ) === version ) return true;
	return nodedef.isdefaultversion === true && version === '';

}

/**
 * Resolves the nodedef of a node instance like `Node::getNodeDef()` in MaterialX.
 *
 * @param {MaterialXNode} nodeX - The node instance.
 * @return {?{name: string, node: string, inputs: Object, outputs: Object}} The resolved nodedef or `null`.
 */
function resolveNodeDef( nodeX ) {

	const documentNodeDefs = nodeX.materialX.getDocumentNodeDefs();

	const explicitName = nodeX.getAttribute( 'nodedef' );
	if ( explicitName ) {

		const nodedef = registryData.nodedefs[ explicitName ] || documentNodeDefs[ explicitName ];
		if ( nodedef ) return { name: explicitName, ...nodedef };

	}

	const version = nodeX.getAttribute( 'version' ) || '';
	const candidates = [
		...getNodeDefNames( nodeX.element ).map( ( name ) => [ name, registryData.nodedefs[ name ] ] ),
		...Object.entries( documentNodeDefs ).filter( ( [ , nodedef ] ) => nodedef.node === nodeX.element ),
	];

	let roughMatch = null;

	for ( const [ name, nodedef ] of candidates ) {

		if ( isVersionCompatible( nodedef, version ) === false ) continue;

		const outputType = getOutputType( nodedef );
		// multioutput nodedefs are matched by their input types only
		if ( nodeX.type && outputType !== 'multioutput' && outputType !== nodeX.type ) continue;
		if ( hasExactInputMatch( nodedef, nodeX ) ) return { name, ...nodedef };
		roughMatch ??= { name, ...nodedef };

	}

	return roughMatch;

}

export { resolveNodeDef, getNodeDefNames };
