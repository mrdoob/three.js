/**
 * @typedef {Object} MaterialXPortSpec
 * @property {string} name
 * @property {string | undefined} [type]
 */

/**
 * @typedef {Object} MaterialXNodeSpec
 * @property {string} category
 * @property {string | undefined} [nodeDefName]
 * @property {string | undefined} [type]
 * @property {MaterialXPortSpec[]} inputs
 * @property {MaterialXPortSpec[]} outputs
 * @property {MaterialXPortSpec[]} parameters
 */

/**
 * @typedef {Object} MaterialXSurfaceMapperSpec
 * @property {string} category
 * @property {string[]} mappedInputs
 * @property {(material: unknown, inputs: Record<string, unknown>, issueCollector: unknown, nodeName: string | null) => void} apply
 */

/**
 * @typedef {Object} MaterialXCompileHandlerSpec
 * @property {string} category
 * @property {(nodeX: unknown, compileContext: unknown) => unknown} compile
 */

/**
 * @template T
 * @param {readonly T[]} entries
 * @param {(entry: T) => string} keySelector
 * @param {string} label
 * @returns {Map<string, T>}
 */
function toRegistryMap( entries, keySelector, label ) {

	const map = new Map();
	for ( const entry of entries ) {

		const key = keySelector( entry );
		if ( map.has( key ) ) {

			throw new Error( `Duplicate ${label} registry key "${key}".` );

		}

		map.set( key, entry );

	}

	return map;

}

export { toRegistryMap };
