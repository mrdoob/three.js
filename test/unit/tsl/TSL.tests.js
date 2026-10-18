import { cases } from './cases.js';
import { builders, generateCode, normalizeCode } from './code.js';
import { parseReferences } from './references.js';

QUnit.module( 'TSL', () => {

	for ( const language of Object.keys( builders ) ) {

		QUnit.module( language.toUpperCase(), ( hooks ) => {

			let references;

			hooks.before( async () => {

				const url = new URL( `./reference.${ language }`, import.meta.url );
				const response = await fetch( url );
				if ( ! response.ok ) throw new Error( `Missing reference.${ language }. Run npm run make-tsl-reference to generate references.` );
				references = parseReferences( await response.text() );

			} );

			for ( const [ name, createNode ] of Object.entries( cases ) ) {

				QUnit.test( name, ( assert ) => {

					const actual = generateCode( createNode, language );

					assert.ok( references.has( name ), `Reference exists: ${ name }. Run npm run make-tsl-reference to generate references.` );

					if ( references.has( name ) ) {

						assert.strictEqual( normalizeCode( actual ), references.get( name ), 'Generated code matches the reference' );

					}

				} );

			}

		} );

	}

} );
