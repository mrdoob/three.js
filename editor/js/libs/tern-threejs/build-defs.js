// Builds Tern definitions for the three.js API by scanning the JSDoc comments
// in a three.js build file (e.g. build/three.core.js).
//
// The build output is machine-formatted (one declaration per line, tab
// indentation, every documented symbol preceded by a `/** ... */` block), so a
// lightweight line scanner is enough — no full JS parser is required.
//
// Usage:  const defs = buildDefs( sourceText );
//
// `defs` is a Tern definitions object of the shape consumed by the editor's
// TernServer:  { "!name": "threejs", "THREE": { Box3: { prototype: { ... } } } }

// --- JSDoc type -> Tern type ------------------------------------------------

function mapType( raw, classes ) {

	if ( ! raw ) return null;

	let type = raw.trim();

	// strip a single leading/trailing brace pair if present
	type = type.replace( /^\{/, '' ).replace( /\}$/, '' ).trim();

	// unions: Tern has no union type, take the first member
	if ( type.includes( '|' ) ) type = type.split( '|' )[ 0 ].trim();

	// nullable / non-nullable / rest markers
	type = type.replace( /^[?!]/, '' ).replace( /^\.\.\./, '' ).trim();

	// Array forms: Array<X>, Array.<X>, X[]
	let m = type.match( /^Array\.?<(.+)>$/ );
	if ( m ) return '[' + ( mapType( m[ 1 ], classes ) || '?' ) + ']';
	m = type.match( /^(.+)\[\]$/ );
	if ( m ) return '[' + ( mapType( m[ 1 ], classes ) || '?' ) + ']';

	switch ( type ) {

		case 'number': case 'string': case 'boolean': return type;
		case 'function': case 'Function': return 'fn()';
		case '*': case 'any': case 'Object': case 'object':
		case 'undefined': case 'null': case 'void': return '?';

	}

	if ( classes.has( type ) ) return '+THREE.' + type;

	return '?'; // unknown (TypedArray, external types, generics, …)

}

// --- JSDoc block parser -----------------------------------------------------

function parseDoc( lines ) {

	const params = [];
	let returns = null, atType = null, readonly = false;
	const desc = [];

	for ( let raw of lines ) {

		const line = raw.replace( /^\s*\*?\s?/, '' ); // strip ` * `

		const pm = line.match( /^@param\s+(\{[^}]*\})?\s*\[?([\w.]+)/ );
		if ( pm ) { params.push( { type: pm[ 1 ] || null, name: pm[ 2 ].split( '.' )[ 0 ] } ); continue; }

		const rm = line.match( /^@returns?\s+(\{[^}]*\})/ );
		if ( rm ) { returns = rm[ 1 ]; continue; }

		const tm = line.match( /^@type\s+(\{[^}]*\})/ );
		if ( tm ) { atType = tm[ 1 ]; continue; }

		if ( /^@readonly/.test( line ) ) { readonly = true; continue; }
		if ( /^@/.test( line ) ) continue; // other tags ignored

		if ( line.trim() ) desc.push( line.trim() );

	}

	// de-duplicate rest params that share a base name
	const seen = new Set(), uniqueParams = [];
	for ( const p of params ) if ( ! seen.has( p.name ) ) { seen.add( p.name ); uniqueParams.push( p ); }

	return { params: uniqueParams, returns, atType, readonly, doc: desc.join( ' ' ) };

}

function fnType( doc, classes ) {

	const args = doc.params.map( p => p.name + ': ' + ( mapType( p.type, classes ) || '?' ) ).join( ', ' );
	let t = 'fn(' + args + ')';
	const ret = mapType( doc.returns, classes );
	if ( ret ) t += ' -> ' + ret;
	return t;

}

function entry( type, doc ) {

	const e = { '!type': type };
	if ( doc.doc ) e[ '!doc' ] = doc.doc;
	return e;

}

// --- main scan --------------------------------------------------------------

export default function buildDefs( source ) {

	const lines = source.split( '\n' );

	// pass 1: collect class names (so types can resolve to +THREE.X)
	const classes = new Set();
	for ( const line of lines ) {

		const m = line.match( /^class\s+(\w+)/ );
		if ( m ) classes.add( m[ 1 ] );

	}

	const THREE = {};
	let cur = null;        // current class def object
	let curName = null;    // current class name
	let pending = null;    // most recent parsed JSDoc block

	for ( let i = 0; i < lines.length; i ++ ) {

		const line = lines[ i ];

		// JSDoc block: collect then resolve against the next code line below
		const t = line.trim();
		if ( t.startsWith( '/**' ) ) {

			const block = [];
			if ( ! t.endsWith( '*/' ) ) {

				i ++;
				for ( ; i < lines.length; i ++ ) {

					if ( lines[ i ].trim().endsWith( '*/' ) ) break;
					block.push( lines[ i ] );

				}

			}

			pending = parseDoc( block );
			continue;

		}

		// class declaration
		const cm = line.match( /^class\s+(\w+)(?:\s+extends\s+(\w+))?/ );
		if ( cm ) {

			curName = cm[ 1 ];
			cur = THREE[ curName ] || ( THREE[ curName ] = {} );
			// Declaring the class with a function `!type` makes Tern treat it as a
			// constructor, so `new THREE.X()` resolves to X.prototype. The signature
			// is refined once the constructor's JSDoc is read.
			cur[ '!type' ] = 'fn()';
			cur.prototype = cur.prototype || {};
			if ( cm[ 2 ] && classes.has( cm[ 2 ] ) ) cur.prototype[ '!proto' ] = 'THREE.' + cm[ 2 ] + '.prototype';
			if ( pending && pending.doc ) cur[ '!doc' ] = pending.doc;
			pending = null;
			continue;

		}

		// end of a top-level class
		if ( line === '}' ) { cur = null; curName = null; pending = null; continue; }

		if ( ! cur || ! pending ) { if ( t === '' ) continue; pending = null; continue; }

		// inside a class, the line right after a JSDoc block:

		// instance field:  \t\tthis.name =
		let m = line.match( /^\t\tthis\.(\w+)\s*=/ );
		if ( m ) {

			const ty = mapType( pending.atType, classes ) || '?';
			cur.prototype[ m[ 1 ] ] = entry( ty, pending );
			pending = null;
			continue;

		}

		// static method:  \tstatic name(
		m = line.match( /^\tstatic\s+(\w+)\s*\(/ );
		if ( m ) {

			cur[ m[ 1 ] ] = entry( fnType( pending, classes ), pending );
			pending = null;
			continue;

		}

		// accessor:  \tget name()  /  \tset name(
		m = line.match( /^\t(?:get|set)\s+(\w+)\s*\(/ );
		if ( m ) {

			const ty = mapType( pending.atType || pending.returns, classes ) || '?';
			if ( ! cur.prototype[ m[ 1 ] ] ) cur.prototype[ m[ 1 ] ] = entry( ty, pending );
			pending = null;
			continue;

		}

		// constructor:  \tconstructor(   -> refine the class signature
		if ( /^\tconstructor\s*\(/.test( line ) ) {

			cur[ '!type' ] = 'fn(' + pending.params.map( p => p.name + ': ' + ( mapType( p.type, classes ) || '?' ) ).join( ', ' ) + ')';
			pending = null;
			continue;

		}

		// instance method:  \t[async ]name(
		m = line.match( /^\t(?:async\s+)?(\w+)\s*\(/ );
		if ( m ) {

			cur.prototype[ m[ 1 ] ] = entry( fnType( pending, classes ), pending );
			pending = null;
			continue;

		}

		pending = null;

	}

	return { '!name': 'threejs', THREE };

}
