import { readFile } from 'node:fs/promises';

let pageURL, pageSource, imports;

export function initialize( data ) {

	( { pageURL, pageSource, imports } = data );

}

export function resolve( specifier, context, nextResolve ) {

	for ( const key of Object.keys( imports ).sort( ( a, b ) => b.length - a.length ) ) {

		if ( specifier === key || key.endsWith( '/' ) && specifier.startsWith( key ) ) {

			return nextResolve( new URL( imports[ key ] + specifier.slice( key.length ), pageURL ).href, context );

		}

	}

	if ( context.parentURL?.startsWith( 'https:' ) && /^[./]/.test( specifier ) ) specifier = new URL( specifier, context.parentURL ).href;
	return nextResolve( specifier, context );

}

export async function load( moduleURL, context, nextLoad ) {

	let source;
	if ( moduleURL.startsWith( 'https:' ) ) {

		const response = await fetch( moduleURL );
		if ( ! response.ok ) throw new Error( `Module ${ moduleURL }: HTTP ${ response.status }` );
		// HTTP imports are browser modules, including browser-compiled WASM loaders.
		source = 'const process = undefined;\n' + ( await response.text() ).replaceAll( 'globalThis.process', 'process' );

	} else if ( moduleURL === pageURL ) source = pageSource;
	else if ( moduleURL.endsWith( '/libs/lil-gui.module.min.js' ) ) source = 'export const GUI = globalThis._nativeGUI;';
	else if ( moduleURL.endsWith( '/libs/stats.module.js' ) ) source = 'export default class Stats { dom = document.createElement("div"); domElement = this.dom; begin() {} end() {} update() {} showPanel() {} }';
	// Inspector creates five List IDs using Math.random(); preserve the scene's seed.
	else if ( moduleURL.endsWith( '/inspector/Inspector.js' ) ) source = 'import { InspectorBase } from "three/webgpu"; export class Inspector extends InspectorBase { constructor() { super(); for ( let i = 0; i < 5; i ++ ) Math.random(); this.domElement = document.createElement("div"); } createParameters() { return new globalThis._nativeGUI(); } hide() {} }';
	else if ( /\/build\/three\.(core|module|webgpu)\.js$/.test( moduleURL ) ) {

		source = ( await readFile( new URL( moduleURL ), 'utf8' ) )
			.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' )
			.replace( /this\.trackTimestamp\s*=\s*\(\s*parameters\.trackTimestamp\s*===\s*true\s*\);/g, 'Object.defineProperty(this, "trackTimestamp", { get: () => false, set: () => {} });' )
			.replace( 'this.itemStart = function ( url ) {', 'this.itemStart = function ( url ) { globalThis._nativeLoading(1);' )
			.replace( 'this.itemEnd = function ( url ) {', 'this.itemEnd = function ( url ) { globalThis._nativeLoading(-1);' )
			.replace( 'this.itemError = function ( url ) {', 'this.itemError = function ( url ) { globalThis._nativeLoadError(url);' );

	}

	return source === undefined ? nextLoad( moduleURL, context ) : { format: 'module', source, shortCircuit: true };

}
