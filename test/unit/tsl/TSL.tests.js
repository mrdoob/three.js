import { Fn, glslFn, uv, wgslFn } from '../../../src/Three.TSL.js';
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

			// Function code is cached per backend, so the native functions it calls must be declared in every shader that reuses it.

			QUnit.test( 'cached functions declare native functions in every shader', ( assert ) => {

				const native = language === 'wgsl'
					? wgslFn( 'fn nativeScale( x : f32 ) -> f32 { return x * 2.0; }' )
					: glslFn( 'float nativeScale( float x ) { return x * 2.0; }' );

				const helpers = {
					layout: Fn( ( [ a ] ) => native( a ).add( 1 ) ).setLayout( { name: 'scaled', type: 'float', inputs: [ { name: 'a', type: 'float' } ] } ),
					auto: Fn( ( [ a ] ) => native( a ).add( 2 ) )
				};

				const declaration = language === 'wgsl' ? 'fn nativeScale (' : 'float nativeScale (';

				for ( const [ name, helper ] of Object.entries( helpers ) ) {

					const backend = {};

					for ( const shader of [ 'first', 'second' ] ) {

						const code = generateCode( () => helper( uv().x ), language, backend );

						assert.ok( code.includes( declaration ), `${ name }: nativeScale is declared in the ${ shader } shader` );

					}

				}

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
