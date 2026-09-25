function isPropertyMethod( proto, name ) {

	let current = proto;
	while ( current && current !== Object.prototype ) {

		const desc = Object.getOwnPropertyDescriptor( current, name );
		if ( desc ) {

			if ( desc.get || desc.set ) return false;
			return typeof desc.value === 'function';

		}

		current = Object.getPrototypeOf( current );

	}

	return false;

}

function getPrototypeProperties( proto ) {

	const propNames = new Set();
	let current = proto;
	while ( current && current !== Object.prototype ) {

		Object.getOwnPropertyNames( current ).forEach( name => {

			propNames.add( name );

		} );
		current = Object.getPrototypeOf( current );

	}

	return Array.from( propNames )
		.filter( name => name !== 'constructor' && ! name.startsWith( '_' ) )
		.sort();

}

function generateClassProperties( classProto ) {

	let dts = '';
	if ( ! classProto ) return dts;

	const props = getPrototypeProperties( classProto );
	props.forEach( prop => {

		try {

			if ( isPropertyMethod( classProto, prop ) ) {

				dts += `    ${prop}( ...args: any[] ): any;\n`;

			} else {

				dts += `    ${prop}: any;\n`;

			}

		} catch ( e ) {}

	} );

	return dts;

}

function generateNodeInterface( THREE ) {

	let dts = '  export interface Node {\n';
	const proto = THREE.Node.prototype;
	const props = getPrototypeProperties( proto );

	props.forEach( name => {

		try {

			if ( isPropertyMethod( proto, name ) ) {

				dts += `    ${name}( ...args: any[] ): Node;\n`;

			} else {

				dts += `    ${name}: Node;\n`;

			}

		} catch ( e ) {

			dts += `    ${name}: any;\n`;

		}

	} );

	dts += '  }\n\n';
	return dts;

}

function generateThreeDeclarations( THREE ) {

	let dts = 'declare module \'three\' {\n\n';

	dts += generateNodeInterface( THREE );

	Object.keys( THREE ).forEach( key => {

		if ( key === 'Node' ) return; // already declared as interface

		if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( key ) ) {

			const val = THREE[ key ];
			if ( typeof val === 'function' ) {

				if ( key[ 0 ] === key[ 0 ].toUpperCase() ) {

					// Class
					dts += `  export class ${key} {\n`;
					dts += '    constructor( ...args: any[] );\n';
					dts += generateClassProperties( val.prototype );
					dts += '  }\n';

				} else {

					// Function
					dts += `  export function ${key}( ...args: any[] ): any;\n`;

				}

			} else {

				// Variable/Constant
				dts += `  export const ${key}: any;\n`;

			}

		}

	} );

	dts += '}\n\n';
	return dts;

}

function generateTslDeclarations( TSL ) {

	let dts = 'declare module \'three/tsl\' {\n';
	dts += '  import { Node } from \'three\';\n\n';

	Object.keys( TSL ).forEach( key => {

		if ( /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test( key ) ) {

			const val = TSL[ key ];

			if ( typeof val === 'function' ) {

				if ( key[ 0 ] === key[ 0 ].toUpperCase() ) {

					dts += `  export class ${key} {\n`;
					dts += '    constructor( ...args: any[] );\n';
					dts += generateClassProperties( val.prototype );
					dts += '  }\n';

				} else {

					dts += `  export function ${key}( ...args: any[] ): Node;\n`;

				}

			} else {

				// For TSL constants/variables, type them as Node to allow chaining.
				dts += `  export const ${key}: Node;\n`;

			}

		}

	} );

	dts += '}\n';
	return dts;

}

function generateAddonDeclarations( ADDONS_TSL_IMPORTS ) {

	if ( ! ADDONS_TSL_IMPORTS ) return '';

	let dts = '';
	Object.entries( ADDONS_TSL_IMPORTS ).forEach( ( [ key, modulePath ] ) => {

		dts += `declare module '${modulePath}' {\n`;
		dts += '  import { Node } from \'three\';\n';
		dts += `  export const ${key}: any;\n`;
		dts += '}\n\n';

	} );

	return dts;

}

function generateDeclarations( THREE, TSL, ADDONS_TSL_IMPORTS ) {

	return generateThreeDeclarations( THREE ) + generateTslDeclarations( TSL ) + generateAddonDeclarations( ADDONS_TSL_IMPORTS );

}

export { generateDeclarations };
