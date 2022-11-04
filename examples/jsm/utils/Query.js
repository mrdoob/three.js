
const topLevelKeywords = [ 'SELECT', 'WHERE', 'ORDER', ',' ];
const orderKeywords = [ 'ASC', 'DESC' ];

const addTokenToScript = ( script, token ) => {

	if ( /^[a-z]/i.test( token ) && /^(window|Math)\./i.test( token ) === false ) {

		token = 'self.' + token;

	}

	script += token;

	return script;

};

class Query {

	constructor( query = '' ) {

		query = query.replace( /\bAND\b/g, '&&' ).replace( /\bOR\b/g, '||' );
		const tokens = query.match( /[\w\d\.\?]+|[\?\!\=\<\>\&\|\+\-\*\/\%]+|[\,\(\)]|"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g );

		this.select = [];
		this.where = [];
		this.order = [];

		this._index = 0;
		this._tokens = tokens;

		this._parse( query );

	}

	from( object3d ) {

		// COLLECT

		const uniques = new Set();

		object3d.traverse( obj3d => {

			uniques.add( obj3d );

			if ( obj3d.isMesh ) {

				uniques.add( obj3d.material );
				uniques.add( obj3d.geometry );

			}

		} );

		const objects = [ ...uniques ];
		const result = [];

		// SELECT

		for ( let i = 0; i < this.select.length; i ++ ) {

			const select = this.select[ i ];
			const where = this.where[ i ];
			const order = this.order[ i ];

			let queryObjects = [];

			for ( const obj of objects ) {

				if ( obj[ 'is' + select ] === true ) {

					queryObjects.push( obj );

				}

			}

			// WHERE

			if ( where !== undefined ) queryObjects = queryObjects.filter( where );

			// ORDER

			if ( order !== undefined ) queryObjects = queryObjects.sort( order );

			//

			result.push( ...queryObjects );

		}

		return result;

	}

	_parseWhere() {

		let script = '';
		let token = null;

		while ( token = this._nextLiteralString( orderKeywords ) ) {

			script = addTokenToScript( script, token );

		}

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

				do {

					this.select.push( this._nextLiteralString() );

				} while ( this._token() === ',' && this._nextToken() );

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
