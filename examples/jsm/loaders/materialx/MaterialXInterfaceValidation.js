import { MtlXLibrary } from './MaterialXNodeLibrary.js';
import { MaterialXLogCodes } from './MaterialXLog.js';

const SKIP_ELEMENTS = new Set( [ 'materialx', 'input', 'output' ] );
const CONTAINER_ELEMENTS = new Set( [ 'nodegraph' ] );


function formatElement( nodeX, attrNames, tagName = nodeX.element ) {

	const attrs = [];
	for ( const name of attrNames ) {

		const value = nodeX.getAttribute( name );
		if ( value !== null && value !== '' ) {

			attrs.push( `${name}="${value}"` );

		}

	}

	return `<${tagName} ${attrs.join( ' ' )}>`;

}

function formatInputElement( inputNodeX ) {

	return formatElement( inputNodeX, [ 'name', 'type', 'nodename', 'nodegraph', 'interfacename', 'output', 'value' ], 'input' );

}

function formatNodeElement( nodeX ) {

	return formatElement( nodeX, [ 'name', 'type', 'nodedef' ] );

}

function resolveInterface( nodeX ) {

	const nodeDef = nodeX.nodeDef;
	if ( nodeDef ) {

		const inputs = Object.fromEntries( Object.entries( nodeDef.inputs ).map( ( [ name, input ] ) => [ name, input.type ] ) );
		return { name: nodeDef.name, node: nodeDef.node, inputs, outputs: nodeDef.outputs };

	}

	return null;

}

function resolveReferencedNode( inputNodeX ) {

	const materialX = inputNodeX.materialX;
	const referencePath = inputNodeX.referencePath;
	if ( ! referencePath ) return null;

	return materialX.getMaterialXNode( referencePath ) || null;

}

function resolveSourceOutputType( sourceNodeX, outputName ) {

	if ( sourceNodeX.element === 'output' ) {

		return {
			interface: null,
			outputType: sourceNodeX.type,
			outputName: sourceNodeX.name || 'out',
		};

	}

	const sourceInterface = resolveInterface( sourceNodeX );
	if ( ! sourceInterface ) return { interface: null, outputType: null, outputName };

	if ( outputName ) {

		if ( sourceInterface.outputs[ outputName ] ) {

			return {
				interface: sourceInterface,
				outputType: sourceInterface.outputs[ outputName ],
				outputName,
			};

		}

		return {
			interface: sourceInterface,
			outputType: null,
			outputName,
		};

	}

	if ( sourceNodeX.type && sourceNodeX.type !== 'multioutput' ) {

		return {
			interface: sourceInterface,
			outputType: sourceNodeX.type,
			outputName: 'out',
		};

	}

	if ( sourceInterface.outputs.out ) {

		return {
			interface: sourceInterface,
			outputType: sourceInterface.outputs.out,
			outputName: 'out',
		};

	}

	const declaredOutputs = Object.entries( sourceInterface.outputs );
	if ( declaredOutputs.length === 1 ) {

		const [ singleName, singleType ] = declaredOutputs[ 0 ];
		return {
			interface: sourceInterface,
			outputType: singleType,
			outputName: singleName,
		};

	}

	if ( sourceNodeX.type ) {

		return {
			interface: sourceInterface,
			outputType: sourceNodeX.type,
			outputName: null,
		};

	}

	return { interface: sourceInterface, outputType: null, outputName: null };

}

function typesCompatible( expectedType, actualType ) {

	if ( ! expectedType || ! actualType ) return true;
	if ( expectedType === actualType ) return true;
	if ( ( expectedType === 'float' && actualType === 'integer' ) || ( expectedType === 'integer' && actualType === 'float' ) ) {

		return true;

	}

	return false;

}

function validatePortConnection( inputNodeX, parentNodeX, log ) {

	const sourceNodeX = resolveReferencedNode( inputNodeX );
	if ( ! sourceNodeX ) return;

	const { outputType } = resolveSourceOutputType( sourceNodeX, inputNodeX.output );
	const inputSnippet = formatInputElement( inputNodeX );

	if ( inputNodeX.output && outputType === null ) {

		log.add(
			MaterialXLogCodes.INVALID_OUTPUT_CONNECTION,
			`No output found for port connection: ${inputSnippet}`,
			parentNodeX.name,
		);
		return;

	}

	const inputType = inputNodeX.type;
	if ( inputType && outputType && typesCompatible( inputType, outputType ) === false ) {

		log.add(
			MaterialXLogCodes.TYPE_MISMATCH,
			`Mismatched types in port connection: ${inputSnippet}`,
			parentNodeX.name,
		);

	}

}

function validateNodeInputs( nodeX, log ) {

	if ( nodeX.element === 'materialx' ) {

		for ( const child of nodeX.children ) {

			validateNodeInputs( child, log );

		}

		return;

	}

	if ( SKIP_ELEMENTS.has( nodeX.element ) ) return;
	if ( CONTAINER_ELEMENTS.has( nodeX.element ) ) {

		for ( const child of nodeX.children ) {

			validateNodeInputs( child, log );

		}

		return;

	}

	const nodeInterface = resolveInterface( nodeX );
	if ( nodeInterface ) {

		for ( const child of nodeX.children ) {

			if ( child.element !== 'input' ) continue;

			const inputName = child.name;
			if ( ! inputName ) continue;

			if ( nodeInterface.inputs[ inputName ] === undefined ) {

				log.add(
					MaterialXLogCodes.UNKNOWN_INPUT,
					`Node interface error: Input '${inputName}' doesn't match declaration: ${formatNodeElement( nodeX )}`,
					nodeX.name,
				);

			} else if (
				child.type &&
				nodeInterface.inputs[ inputName ] &&
				child.hasReference === false &&
				typesCompatible( nodeInterface.inputs[ inputName ], child.type ) === false
			) {

				log.add(
					MaterialXLogCodes.TYPE_MISMATCH,
					`Input '${inputName}' type '${child.type}' doesn't match nodedef type '${nodeInterface.inputs[ inputName ]}' on ${formatNodeElement( nodeX )}`,
					nodeX.name,
				);

			}

			if ( child.hasReference ) {

				validatePortConnection( child, nodeX, log );

			}

		}

	} else if ( MtlXLibrary[ nodeX.element ] === undefined && nodeX.element !== 'surfacematerial' ) {

		// Defer unsupported-node warnings to compile-time behavior.
		for ( const child of nodeX.children ) {

			if ( child.element === 'input' && child.hasReference ) {

				validatePortConnection( child, nodeX, log );

			}

		}

	}

	for ( const child of nodeX.children ) {

		if ( child.element !== 'input' && child.element !== 'output' ) {

			validateNodeInputs( child, log );

		}

	}

}

function createStrictInterfaceValidator() {

	return function validateMaterialXInterfaces( rootNode, log ) {

		validateNodeInputs( rootNode, log );

	};

}

export { createStrictInterfaceValidator };
