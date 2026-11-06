import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, test } from 'vitest';
import { cases } from './cases.js';
import { builders, generateCode, normalizeCode } from './code.js';
import { parseReferences } from './references.js';

describe( 'TSL', () => {

	for ( const language of Object.keys( builders ) ) {

		describe( language.toUpperCase(), () => {

			let references;

			beforeAll( async () => {

				const url = new URL( `./reference.${ language }`, import.meta.url );
				references = parseReferences( await readFile( url, 'utf8' ) );

			} );

			for ( const [ name, createNode ] of Object.entries( cases ) ) {

				test( name, () => {

					expect( references.has( name ), `Missing reference: ${ name }. Run npm run make-tsl-reference.` ).toBe( true );
					expect( normalizeCode( generateCode( createNode, language ) ) ).toBe( references.get( name ) );

				} );

			}

		} );

	}

} );
