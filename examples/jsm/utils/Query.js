
const topLevelKeywords = [ 'SELECT', 'WHERE', 'ORDER', ',' ];
const orderKeywords = [ 'ASC', 'DESC' ];

const addTokenToScript = ( script, token ) => {

	if ( /^W/i.test( token ) === false ) {

		script += token;

	} else {

		script += token + ' ';

	}

	return script;

};

class Query {

	constructor( query = '' ) {

		query = query.replace( /\bAND\b/g, '&&' ).replace( /\bOR\b/g, '||' );
		const tokens = query.match( /[\w\d\.]+|[\?\!\=\<\>\&\|\+\-\*\/\%\"\'\(\)]+|[\,]/g );

		this.select = [];
		this.where = [];
		this.order = [];

		this._index = 0;
		this._tokens = tokens;

		this._parse( query );

	}

	from( object3d ) {

		// COLLECT

		const objects = [];

		object3d.traverse( obj3d => {

			objects.push( obj3d );

			if ( obj3d.isMesh ) {

				objects.push( obj3d.material );

			}

		} );

		// SELECT

		let result = [];

		for ( const obj of objects ) {

			for ( const className of this.select ) {

				if ( obj[ 'is' + className ] === true ) {

					result.push( obj );

				}

			}

		}

		// WHERE

		for ( const method of this.where ) result = result.filter( method );

		// ORDER

		for ( const method of this.order ) result = result.sort( method );

		return result;

	}

	_parseSelect() {

		const select = [];

		let token = null;

		while ( token = this._nextLiteralString() ) {

			select.push( token );

		}

		return select;

	}

	_parseWhere() {

		let script = '';
		let token = null;

		while ( token = this._nextLiteralString( orderKeywords ) ) {

			script = addTokenToScript( script, token );

		}

		console.log( script );
		return eval( '( self ) => ' + script );

	}

	_parseOrder() {

		let script = '';
		let token = null;
		let orderBy = null;

		while ( token = this._nextLiteralString() ) {

			if ( orderKeywords.includes( token ) ) {

				orderBy = token;

			} else {

				script = addTokenToScript( script, token );

			}

		}

		let a = script;
		let b = script.replace( /\bself\b/g, 'target' );

		if ( orderBy === 'DESC' ) {

			a = b;
			b = script;

		}

		return eval( '( self, target ) => ' + a + ' - ' + b );

	}

	_parse() {

		let token = null;

		while ( token = this._nextToken() ) {

			if ( token === 'SELECT' ) {

				this.select.push( ...this._parseSelect() );

			} else if ( token === 'WHERE' ) {

				do {

					this.where.push( this._parseWhere() );

				} while ( this._token() === ',' && this._nextToken() );

			} else if ( token === 'ORDER' ) {

				do {

					this.order.push( this._parseOrder() );

				} while ( this._token() === ',' && this._nextToken() );

			}

		}

	}

	_token( offset = 0 ) {

		return this._tokens[ this._index + offset ];

	}

	_nextToken() {

		return this._index < this._tokens.length ? this._tokens[ this._index ++ ] : null;

	}

	_nextLiteralString( exceptions = null ) {

		const { _tokens, _index } = this;

		if ( topLevelKeywords.includes( _tokens[ _index ] ) === false ||
			( exceptions !== null && exceptions.includes( _tokens[ _index ] ) ) ) {

			return this._nextToken();

		}

	}

}

export { Query };
