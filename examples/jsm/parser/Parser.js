/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Tokenizer } from './Tokenizer.js';
import { Analyzer } from './Analyzer.js';
import { Emitter } from './Emitter.js';

function parseDefines( source ) {
		
	const pattern = /^[ \t]*#define +([\w]+) +(.*)/gm;

	var matches = [];
	var match;

	while ( match = pattern.exec( source ) ) matches.push( match );

	function replace( m ) {

		return m.substr(0, 1) + match[2] + m.substr(-1);

	}

	for ( var i = 0; i < matches.length; i ++ ) {
		
		match = matches[i];
		
		source = source.replace( new RegExp( '\\W' + match[1] + '\\W', 'g' ), replace );

	}
		
	return source.replace( /^[ \t]*#define +.*/gm, '' );

}

function parseIncludes( source, libs ) {
	
	function replace( match, include ) {

		var replace;

		for( var i = 0; i < libs.length; i++ ) {
			
			replace = libs[i][ include ];
			
			if ( replace === undefined ) break;
			
		}

		if ( replace === undefined ) {

			throw new Error( 'Can not resolve #include <' + include + '>' );

		}

		return parseIncludes( replace, libs );

	}

	return source.replace( /^[ \t]*#include +<([\w./]+)>/gm, replace );
	
}




class ParsePreprocessor {
	
	constructor( source ) {
		
		this.source = source;
		this.libraries = [];
		
	}
	
	setLibraries( libraries ) {
		
		this.libraries = libraries;
		
		return this;
		
	}

	parse() {

		this.source = parseIncludes( this.source, this.libraries );
		this.source = parseDefines( this.source );

		return this;

	}
	
}

export default class Parser {

	constructor( method = 'emit' ) {
		
		this.method = method;
		this.libraries = [];
		
	}
	
	addLibrary( lib ) {
		
		this.libraries.push( lib );
		
	}
	
	compile( source ) {
		
		source = new ParsePreprocessor( source ).setLibraries( this.libraries ).parse().source;
		
		var tokenizer = new Tokenizer( source ).tokenize();
		var analyzer = new Analyzer( tokenizer ).analyze();
		var emitter = new Emitter( analyzer );

		if (this.method === Parser.UNEMIT) emitter.unemit();
		else emitter.emit();

		return emitter.source;
		
	}
	
}

Parser.EMIT = 'emit';
Parser.UNEMIT = 'unemit';
