import { Break, Continue, Fn, If, Loop, Switch, array, bool, clamp, color, context, determinant, float, grayscale, hue, int, inverse, ivec3, mat2, mat3, mat4, mix, mul, overloadingFn, overrideNode, saturation, select, time, transpose, uint, uniform, uv, vec2, vec3, vec4, vibrance } from '../../../src/Three.TSL.js';

// Create a fresh graph for every test and backend.
export const cases = {

	'constants': () => vec4( vec3( 1, 0.5, 0 ), 1 ),

	'arithmetic': () => float( 2 ).add( 3 ).mul( 4 ).div( 2 ).sub( 1 ),

	'swizzle': () => vec3( 1, 2, 3 ).zyx.mul( 0.5 ),

	// Explicit types promote to the broader component type in either operand order.
	'auto convert int to float': () => float( 0.5 ).mul( int( 1 ) ),

	// An implicit integer-valued number adapts to int; an explicit float promotes it.
	'auto convert float to int': () => int( 2 ).add( 1 ),

	'auto promote int to float': () => int( 1 ).mul( float( 0.5 ) ),

	'auto convert uint to float': () => float( 0.5 ).mul( uint( 1 ) ),

	'auto promote uint to float': () => uint( 1 ).mul( float( 0.5 ) ),

	'auto promote uint to int': () => uint( 1 ).add( int( - 1 ) ),

	'auto promote int and uint': () => int( - 1 ).add( uint( 1 ) ),

	// Equality uses the same common type in either operand order.
	'equal float int': () => float( 1.5 ).equal( int( 1 ) ),

	'equal int float': () => int( 1 ).equal( float( 1.5 ) ),

	'equal bool uint': () => bool( true ).equal( uint( 1 ) ),

	'equal uint bool': () => uint( 1 ).equal( bool( true ) ),

	'equal bool float': () => bool( true ).equal( float( 1.5 ) ),

	'equal float bool': () => float( 1.5 ).equal( bool( true ) ),

	'equal float int vector': () => vec3( 1.5 ).equal( ivec3( 1 ) ),

	'equal int float vector': () => ivec3( 1 ).equal( vec3( 1.5 ) ),

	// Explicit integer constants truncate before promotion to float, including cached values.
	'truncated uint to float': () => float( 1 ).mul( uint( 0.4 ) ),

	'truncated uint constants': () => uint( 1.5 ),

	'truncated int constants': () => int( - 1.5 ),

	'truncated uint fraction': () => uint( 0.6 ),

	'truncated int fraction': () => int( - 0.6 ),

	'clamped negative uint': () => uint( - 0.4 ),

	'auto convert scalar to vector': () => vec3( 1, 2, 3 ).add( 0.5 ),

	'auto convert vector to float': () => vec3( 0.5 ).add( ivec3( 1, 2, 3 ) ),

	// A weak scalar adapts to the integer vector; an explicit float vector promotes it.
	'auto convert vector to int': () => ivec3( 1, 2, 3 ).add( 1 ),

	'auto promote int vector to float': () => ivec3( 1, 2, 3 ).add( vec3( 0.5 ) ),

	// Integer-valued weak numbers keep unsigned index math in uint.
	'weak uint index math': () => uint( 70 ).div( 64 ),

	'weak float default': () => mul( 1, 2 ),

	// Weak numbers adopt the explicit integer type, truncated if needed; values out of its range promote it.
	'weak uint fraction': () => uint( 1 ).mul( 0.5 ),

	'weak int fraction': () => int( 3 ).mul( 1.5 ),

	'weak promote negative': () => uint( 1 ).add( - 1 ),

	'weak promote out of range': () => uint( 1 ).add( 0x100000000 ),

	// A shared weak constant adapts independently to each use.
	'weak shared constant': () => uint( 1 ).add( 1 ).add( float( 1 ).add( 1 ) ),

	// Math functions promote across all arguments, regardless of their order.
	'weak math functions': () => clamp( uint( 1 ), 0, 2 ),

	'weak math functions reordered': () => clamp( 0, uint( 1 ), 2 ),

	// Float-only math functions promote integer arguments to float.
	'float only math functions': () => int( 2 ).pow( 2 ),

	// Integer math functions keep integer arguments.
	'integer math functions': () => uint( 1 ).max( 2 ),

	// Matrix functions keep the matrix type.
	'square matrix functions': () => determinant( transpose( inverse( mat2( 1, 2, 3, 4 ) ) ) ),

	'vector composition': () => vec4( vec2( 1, 2 ), int( 3 ), uint( 4 ) ),

	'vector resize': () => vec4( vec2( vec3( 1, 2, 3 ) ), 0, 1 ),

	'conversion cache': () => {

		const value = vec3( time.mul( 0.5 ) );
		return vec4( value.add( value ), 1 );

	},

	'boolean conversion': () => vec2( float( bool( true ) ), float( bool( false ) ) ),

	'local mutable cache': () => {

		const scaledTime = vec3( time.mul( 0.5 ) );
		const testValue = scaledTime.add( scaledTime );

		return vec4( Fn( () => {

			testValue.mulAssign( 0.001 );

			return testValue;

		} )(), 1 );

	},

	'indexed mutable cache': () => Fn( () => {

		const matrix = mat4( 1 ).mul( mat4( 2 ) );
		const before = matrix[ 0 ][ 0 ].add( matrix[ 1 ][ 1 ] );

		matrix[ 0 ][ 0 ] = 3;
		matrix[ 1 ].xy = vec2( 4, 5 );

		return matrix.mul( vec4( before ) );

	} )(),

	'loop local cache': () => Fn( () => {

		const value = float( 2 ).add( 3 );
		const matrix = mat4( vec4( value, 0, 0, 0 ), vec4( 0, value, 0, 0 ), vec4( 0, 0, 1, 0 ), vec4( 0, 0, 0, 1 ) );
		const sum = float( 0 );

		If( bool( true ), () => {

			Loop( 2, () => {

				sum.addAssign( matrix[ 0 ][ 0 ].add( matrix[ 1 ][ 1 ] ) );

			} );

			sum.addAssign( matrix[ 0 ][ 0 ].add( matrix[ 1 ][ 1 ] ) );

		} );

		return sum;

	} )(),

	'shared local across blocks': () => Fn( () => {

		const sum = float( 0 );
		const shared = float( 2 ).add( 3 );

		If( bool( true ), () => {

			sum.addAssign( shared );

		} );

		If( bool( true ), () => {

			shared.addAssign( 1 );
			sum.addAssign( shared.add( shared ) );

			If( bool( true ), () => {

				sum.addAssign( shared );

			} );

		} );

		return sum;

	} )(),

	'external variable in loop': () => {

		const value = float( 2 ).add( 3 ).toVar( 'externalValue' );

		return Fn( () => {

			const sum = float( 0 );

			Loop( 0, () => {

				sum.addAssign( value );

			} );

			Loop( 2, () => {

				sum.addAssign( value );

			} );

			return sum.add( value );

		} )();

	},

	'assignable scope': () => Fn( () => {

		const explicit = float( 1 ).toVar( 'explicitGlobal' );
		const inferred = float( 2 );

		inferred.addAssign( explicit );
		explicit.addAssign( inferred );

		return explicit.add( inferred );

	} )(),

	'assignable shared constants': () => Fn( () => {

		const shared = float( 1 );
		const first = float( shared );
		const second = float( shared );

		first.assign( 2 );

		return vec3( first, second, shared );

	} )(),

	'assignable existing assignment': () => Fn( () => {

		const value = float( 1 );

		value.assign( 2 );

		return value;

	} )(),

	'comparison and logic': () => int( 3 ).greaterThan( 1 ).and( float( 0.5 ).lessThanEqual( 1 ) ).or( bool( false ).not() ),

	'vector comparison': () => vec3( 1, 2, 3 ).greaterThan( 1 ).all(),

	'select auto conversion': () => Fn( () => select( bool( true ), vec3( 1, 2, 3 ), int( 0 ) ) )(),

	'bitwise': () => uint( 5 ).bitAnd( uint( 3 ) ).bitOr( uint( 8 ) ).bitXor( uint( 1 ) ).shiftLeft( 2 ).shiftRight( 1 ),

	'math functions': () => mix( vec3( - 0.5, 0.25, 2 ).abs().clamp( 0, 1 ), vec3( 1 ), 0.25 ),

	'vector math': () => vec3( 1, 2, 3 ).normalize().dot( vec3( 0, 1, 0 ).cross( vec3( 1, 0, 0 ) ) ),

	'matrix vector': () => mat3( 1, 2, 3, 4, 5, 6, 7, 8, 9 ).mul( vec3( 1, 2, 3 ) ),

	'matrix matrix': () => mat3( 1, 2, 3, 4, 5, 6, 7, 8, 9 ).mul( mat3( 2, 0, 0, 0, 2, 0, 0, 0, 2 ) ),

	'auto convert assignment': () => Fn( () => {

		const value = float( 0 );
		value.assign( int( 3 ) );
		value.addAssign( uint( 2 ) );

		return value;

	} )(),

	'auto convert vector assignment': () => Fn( () => {

		const value = vec3( 0 );
		value.assign( int( 2 ) );
		value.addAssign( ivec3( 1, 2, 3 ) );

		return value;

	} )(),

	'swizzle assignment': () => Fn( () => {

		const value = vec3( 1, 2, 3 );
		value.xy.assign( value.yx );
		value.z.assign( int( 4 ) );

		return value;

	} )(),

	'array index': () => array( [ 1, 2, 3 ] ).element( int( 1 ) ),

	'array loop': () => Fn( () => {

		const values = array( [ 1, 2, 3 ] );
		const sum = float( 0 );

		Loop( 3, ( { i } ) => {

			sum.addAssign( values.element( i ) );

		} );

		return sum;

	} )(),

	'else if': () => Fn( () => {

		const value = float( 0.5 );

		If( value.lessThan( 0 ), () => {

			value.assign( - 1 );

		} ).ElseIf( value.greaterThan( 1 ), () => {

			value.assign( 1 );

		} ).Else( () => {

			value.mulAssign( 2 );

		} );

		return value;

	} )(),

	'switch case': () => Fn( () => {

		const value = float( 0 );

		Switch( int( 2 ) ).Case( 0, () => {

			value.assign( 1 );

		} ).Case( 1, 2, () => {

			value.assign( 2 );

		} ).Default( () => {

			value.assign( - 1 );

		} );

		return value;

	} )(),

	'loop break continue': () => Fn( () => {

		const sum = float( 0 );

		Loop( 8, ( { i } ) => {

			If( i.equal( 2 ), () => {

				Continue();

			} );

			If( i.greaterThan( 5 ), () => {

				Break();

			} );

			sum.addAssign( i );

		} );

		return sum;

	} )(),

	'loop descending': () => Fn( () => {

		const sum = float( 0 );

		Loop( { start: 6, end: 0, condition: '>', update: '-= 2' }, ( { i } ) => {

			sum.addAssign( i );

		} );

		return sum;

	} )(),

	'loop nested': () => Fn( () => {

		const sum = float( 0 );

		Loop( 3, 2, ( { i, j } ) => {

			sum.addAssign( i.mul( j ) );

		} );

		return sum;

	} )(),

	'loop while': () => Fn( () => {

		const value = int( 0 );

		Loop( value.lessThan( 3 ), () => {

			value.addAssign( 1 );

		} );

		return value;

	} )(),

	'function inline reuse': () => Fn( () => {

		const square = Fn( ( [ value ] ) => value.mul( value ) );
		const value = square( float( 3 ) );

		return value.add( value );

	} )(),

	'function inside loop': () => Fn( () => {

		const square = Fn( ( [ value ] ) => value.mul( value ) );
		const sum = float( 0 );

		Loop( 4, ( { i } ) => {

			sum.addAssign( square( i ) );

		} );

		return sum;

	} )(),

	'function result conversion': () => Fn( () => {

		const integerResult = Fn( () => int( 3 ) );

		return float( 0.5 ).add( integerResult() );

	} )(),

	'complex matrix conditional': () => Fn( () => {

		const matrix = mat4(
			1, 0, 0, 0,
			0.5, 1, 0, 0,
			0, 0.25, 1, 0,
			3, - 2, 1, 1
		);

		const product = mul( matrix, inverse( matrix ) );
		const color = vec4( 0, 0, 0, 1 );

		If( uv().x.lessThan( 0.33 ), () => {

			color.assign( vec4( product.element( 0 ).xyz, 1 ) );

		} ).ElseIf( uv().x.lessThan( 0.66 ), () => {

			color.assign( vec4( product.element( 1 ).xyz, 1 ) );

		} ).Else( () => {

			color.assign( vec4( product.element( 2 ).xyz, 1 ) );

			If( uv().x.lessThan( 0.33 ), () => {

				color.assign( vec4( product.element( 0 ).xyz, 1 ) );

			} ).ElseIf( uv().x.lessThan( 0.66 ), () => {

				color.assign( vec4( product.element( 1 ).xyz, 1 ) );

			} ).Else( () => {

				color.assign( vec4( product.element( 2 ).xyz, 1 ) );

			} );

		} );

		return color;

	} )(),

	'conditional': () => Fn( () => {

		const value = float( 0.5 );

		If( value.greaterThan( 0 ), () => {

			value.mulAssign( 2 );

		} ).Else( () => {

			value.assign( 0 );

		} );

		return value;

	} )(),

	'loop': () => Fn( () => {

		const sum = float( 0 );

		Loop( 4, ( { i } ) => {

			sum.addAssign( i );

		} );

		return sum;

	} )(),

	'cached flip after loop': () => Fn( () => {

		const flipped = uv().flipX();
		const accumulate = Fn( () => {

			const sum = vec2( 0 );
			Loop( 2, () => {

				sum.addAssign( flipped );

			} );
			return sum;

		} );
		const value = accumulate();

		return vec4( flipped, value );

	} )(),

	'cached expression after loop': () => Fn( () => {

		const value = uv().x.add( 1 );
		const sum = float( 0 );

		Loop( 2, () => {

			sum.addAssign( value.mul( value ) );

		} );

		return vec2( value, sum );

	} )(),

	'cached expression before loop': () => Fn( () => {

		const value = uv().x.add( 1 );
		const sum = value.mul( value );

		Loop( 2, () => {

			sum.addAssign( value );

		} );

		return sum;

	} )(),

	'cached expression in sibling loops': () => Fn( () => {

		const value = uv().x.add( 1 );
		const squared = value.mul( value );
		const first = float( 0 );
		const second = float( 0 );

		Loop( 2, () => {

			first.addAssign( squared );

		} );
		Loop( 3, () => {

			second.addAssign( squared );

		} );

		return vec2( first, second );

	} )(),

	'cached boolean uniform after loop': () => Fn( () => {

		const enabled = uniform( true );
		const sum = float( 0 );

		Loop( 0, () => {

			sum.addAssign( float( enabled ) );

		} );

		return vec2( float( enabled ), sum );

	} )(),

	'cached conditional after loop': () => Fn( () => {

		const value = select( uv().x.lessThan( 0.5 ), float( 1 ), float( 2 ) );
		const sum = float( 0 );

		Loop( 0, () => {

			sum.addAssign( value );

		} );

		return vec2( value, sum );

	} )(),

	'function outside loop': () => Fn( () => {

		const sumValues = Fn( () => {

			const sum = float( 0 );

			Loop( 3, ( { i } ) => {

				sum.addAssign( i );

			} );

			return sum;

		} );

		// The function's loop must run once, before the consuming loop.
		const value = sumValues();
		const total = float( 0 );

		Loop( 4, () => {

			total.addAssign( value );

		} );

		return total;

	} )(),

	'function outside sequential loops': () => Fn( () => {

		const accumulate = Fn( () => {

			const value = vec3( 0 );

			Loop( 10000, () => {

				value.addAssign( 0.0001 );

			} );

			return value;

		} );

		const sharedValue = accumulate();
		const total = vec3( 0 );

		Loop( 10, () => {

			total.addAssign( sharedValue );

		} );

		Loop( 10, () => {

			total.addAssign( sharedValue );

		} );

		return total;

	} )(),

	'function with loop inside loop': () => Fn( () => {

		const sumValues = Fn( ( [ value ] ) => {

			const sum = float( 0 );

			Loop( { end: 3, name: 'j' }, () => {

				sum.addAssign( value );

			} );

			return sum;

		} );

		const total = float( 0 );

		Loop( 4, ( { i } ) => {

			total.addAssign( sumValues( i ) );

		} );

		return total;

	} )(),

	'function outside conditional': () => Fn( () => {

		const sumValues = Fn( () => {

			const sum = float( 0 );

			Loop( 3, ( { i } ) => {

				sum.addAssign( i );

			} );

			return sum;

		} );

		const value = sumValues();
		const total = float( 0 );

		If( uv().x.greaterThan( 0.5 ), () => {

			total.assign( value );

		} );

		return total;

	} )(),

	'function without stack single conditional use': () => {

		const value = Fn( () => {

			const n = float( 2 );

			Loop( 1, () => {

				n.addAssign( 1 );

			} );

			return n.add( 2 );

		} )();

		return Fn( () => {

			const result = float( 0 );

			If( result, () => {

				result.assign( value );

			} ).Else( () => {

				result.assign( 1 );

			} );

			return vec3( result );

		} )();

	},

	'function without stack shared conditional use': () => {

		const value = Fn( () => {

			const n = float( 2 );

			Loop( 1, () => {

				n.addAssign( 1 );

			} );

			return n.add( 2 );

		} )();

		return Fn( () => {

			const result = float( 0 );

			If( result, () => {

				result.assign( value );

			} ).Else( () => {

				result.assign( value );

			} );

			return vec3( result );

		} )();

	},

	'function with loop without stack': () => {

		const value = Fn( () => {

			const sum = float( 0 );
			Loop( 3, ( { i } ) => {

				sum.addAssign( i );

			} );
			return sum;

		} )();

		return Fn( () => {

			const total = float( 0 );
			Loop( 4, () => {

				total.addAssign( value );

			} );
			return total;

		} )();

	},

	'wrapped function outside loop': () => Fn( () => {

		const sumValues = Fn( () => {

			const sum = float( 0 );
			Loop( 3, ( { i } ) => {

				sum.addAssign( i );

			} );
			return sum;

		} );
		const wrapped = Fn( () => sumValues() );
		const value = wrapped();
		const total = float( 0 );

		Loop( 4, () => {

			total.addAssign( value );

		} );
		return total;

	} )(),

	'function loop default parameter': () => Fn( () => {

		const sumValues = Fn( ( [ count = float( 5 ) ] ) => {

			const sum = float( 0 );
			Loop( count, ( { i } ) => {

				sum.addAssign( i );

			} );
			return sum;

		} );
		const explicitCount = sumValues( int( 3 ) );
		const defaultCount = sumValues();
		const total = float( 0 );

		Loop( 4, () => {

			total.addAssign( explicitCount.add( defaultCount ) );

		} );
		return total;

	} )(),

	'cached value after function loop': () => Fn( () => {

		const flipped = uv().flipX();
		const accumulate = Fn( () => {

			const sum = vec2( 0 );

			Loop( 2, () => {

				sum.addAssign( flipped.mul( flipped ) );

			} );

			return sum;

		} );

		const value = accumulate();
		const total = vec2( 0 );

		Loop( 3, () => {

			total.addAssign( value );

		} );

		return vec4( flipped, total );

	} )(),

	'cached value after function conditional': () => Fn( () => {

		const value = uv().x.add( 1 );
		const square = Fn( () => {

			const result = float( 0 );

			If( uv().y.greaterThan( 0.5 ), () => {

				result.assign( value.mul( value ) );

			} );

			return result;

		} );

		const squared = square();
		const total = float( 0 );

		Loop( 3, () => {

			total.addAssign( squared );

		} );

		return vec2( value.mul( value ), total );

	} )(),

	'function assign outside loop': () => Fn( () => {

		const counter = float( 0 ).toVar( 'counter' );
		const increment = Fn( () => {

			counter.addAssign( 1 );

			return counter.mul( 2 );

		} );

		const value = increment();
		const total = float( 0 ).toVar( 'total' );

		Loop( 4, () => {

			total.addAssign( value );

		} );

		return vec2( counter, total );

	} )(),

	'function conditional outside loop': () => Fn( () => {

		const counter = float( 0 ).toVar( 'counter' );
		const pick = Fn( () => {

			const result = float( 1 ).toVar( 'result' );

			If( uv().x.greaterThan( 0.5 ), () => {

				counter.addAssign( 1 );
				result.assign( 2 );

			} );

			return result;

		} );

		const value = pick();
		const total = float( 0 ).toVar( 'total' );

		Loop( 4, () => {

			total.addAssign( value );

		} );

		return vec2( counter, total );

	} )(),

	'function read before assign': () => Fn( () => {

		const x = float( 1 ).toVar( 'x' );
		const double = Fn( () => x.mul( 2 ).toVar( 'doubled' ) );

		const value = double();
		x.assign( 100 );

		return value;

	} )(),

	'function expression in conditional': () => Fn( () => {

		const double = Fn( () => uv().x.mul( 2 ) );

		const value = double();
		const result = float( 0 ).toVar( 'result' );

		If( uv().y.greaterThan( 0.5 ), () => {

			result.assign( value );

		} );

		return result;

	} )(),

	'function returns variable': () => Fn( () => {

		const clamped = Fn( () => {

			const result = uv().x.toVar( 'result' );

			If( result.greaterThan( 0.5 ), () => {

				result.assign( 0.5 );

			} );

			return result;

		} );

		const value = clamped();

		return value.add( value );

	} )(),

	'function': () => {

		const square = Fn( ( { value } ) => value.mul( value ), { value: 'float', return: 'float' } );

		return square( float( 3 ) );

	},

	// Assigning a constant must not change other uses of the same value.
	'shared constant assigned': () => Fn( () => {

		const a = float( 0 );
		const b = float( 0 );

		a.assign( 1 );

		return a.add( b );

	} )(),

	// A conversion of an existing node is a copy, assigning it must not change the source.
	'converted node assigned': () => Fn( () => {

		const x = uv().x.add( 1 );
		const copy = float( x );

		copy.assign( 5 );

		return copy.add( x );

	} )(),

	'converted uniform assigned': () => Fn( () => {

		const u = uniform( 1 );
		const v = float( u );

		v.addAssign( 1 );

		return v.add( u );

	} )(),

	// A node created outside of a function is declared where it is first used.
	'node outside function assigned': () => {

		const outside = float( 2 );

		return Fn( () => {

			outside.assign( 3 );

			return outside.mul( 2 );

		} )();

	},

	'operation swizzle assigned': () => Fn( () => {

		const v = vec3( uv(), 1 ).mul( 2 );

		v.y.assign( 0 );
		v.xz.addAssign( 1 );

		return vec4( v, 1 );

	} )(),

	'operation assigned inside and outside conditional': () => Fn( () => {

		const r = float( 0.25 ).mul( uv().y );

		If( uv().x.greaterThan( 0.5 ), () => {

			r.mulAssign( 2 );

		} );

		r.addAssign( 1 );

		return r;

	} )(),

	'join component assigned': () => Fn( () => {

		const v = vec3( uv().x, 0, 1 );

		v.z.assign( int( 2 ) );

		return v;

	} )(),

	'cached expression inside loop': () => Fn( () => {

		const sum = float( 0 );

		Loop( { start: int( 0 ), end: int( 3 ) }, ( { i } ) => {

			const t = float( i ).mul( 0.5 );

			sum.addAssign( t.mul( t ) );

		} );

		return sum;

	} )(),

	// Overriding a function call replaces it, like any other node.
	'overridden function call': () => {

		const value = Fn( () => uv().x.add( 1 ) )();

		return overrideNode( value, uv().y, value.mul( 2 ) );

	},

	// Nested contexts can override the same node with different nodes.
	'nested overrides': () => {

		const value = uv().x;

		// the inner context replaces value with 2, the outer context replaces value with 1: 1 + 2
		const inner = value.overrideNode( value, float( 2 ) );
		const outer = value.add( inner ).overrideNode( value, float( 1 ) );

		return outer;

	},

	// Contexts can provide the values of attributes, each context provides its own values.
	'context attributes': () => {

		const firstUV = vec2( 1, 2 );
		const secondUV = vec2( 3, 4 );

		const first = context( uv(), { getAttribute: ( name ) => name === 'uv' ? firstUV : null } );
		const second = context( uv(), { getAttribute: ( name ) => name === 'uv' ? secondUV : null } );

		return vec4( first.add( uv() ), second );

	},

	// Variables created in a function with layout are local to that function.

	'layout local variables': () => {

		const smooth = Fn( ( [ value ] ) => {

			const result = value.toVar();
			result.assign( result.mul( result ).mul( float( 3 ).sub( result.mul( 2 ) ) ) );

			return result;

		}, { value: 'float', return: 'float' } );

		return smooth( uv().x );

	},

	'layout conditional': () => {

		const clampHalf = Fn( ( [ value ] ) => {

			const result = value.toVar();

			If( result.greaterThan( 0.5 ), () => {

				result.assign( 0.5 );

			} ).Else( () => {

				result.mulAssign( 2 );

			} );

			return result;

		}, { value: 'float', return: 'float' } );

		return clampHalf( uv().x );

	},

	'layout loop': () => {

		const sumSteps = Fn( ( [ count ] ) => {

			const sum = float( 0 ).toVar();

			Loop( count, ( { i } ) => {

				sum.addAssign( float( i ) );

			} );

			return sum;

		}, { count: 'int', return: 'float' } );

		return sumSteps( int( 4 ) );

	},

	'layout inside loop': () => Fn( () => {

		const square = Fn( ( [ value ] ) => value.mul( value ), { value: 'float', return: 'float' } );
		const total = float( 0 ).toVar();

		Loop( 3, ( { i } ) => {

			total.addAssign( square( float( i ) ) );

		} );

		return total;

	} )(),

	// A function with layout is emitted once, before the functions that call it.

	'layout nested calls': () => {

		const square = Fn( ( [ value ] ) => value.mul( value ), { value: 'float', return: 'float' } );
		const sumOfSquares = Fn( ( [ a, b ] ) => square( a ).add( square( b ) ), { a: 'float', b: 'float', return: 'float' } );
		const lengthSquared = Fn( ( [ v ] ) => sumOfSquares( v.x, v.y ), { v: 'vec2', return: 'float' } );

		return lengthSquared( uv() ).add( sumOfSquares( 1, 2 ) ).add( square( 3 ) );

	},

	'layout shared include': () => {

		const half = Fn( ( [ value ] ) => value.mul( 0.5 ), { value: 'float', return: 'float' } );
		const left = Fn( ( [ value ] ) => half( value ).add( half( value.add( 1 ) ) ), { value: 'float', return: 'float' } );
		const right = Fn( ( [ value ] ) => half( value ).sub( 1 ), { value: 'float', return: 'float' } );

		return left( uv().x ).add( right( uv().y ) );

	},

	'layout called twice': () => {

		const scale = Fn( ( [ value, factor ] ) => value.mul( factor ), { value: 'vec2', factor: 'float', return: 'vec2' } );

		return scale( uv(), 2 ).add( scale( uv().yx, 0.5 ) );

	},

	// Inputs are converted to the layout types at the call site.

	'layout input conversion': () => {

		const lengthOf = Fn( ( [ v ] ) => v.length(), { v: 'vec3', return: 'float' } );

		return lengthOf( float( 2 ) ).add( lengthOf( vec4( 1, 2, 3, 4 ) ) ).add( lengthOf( int( 1 ) ) );

	},

	// Missing inputs are passed as the default values of the parameters.

	'layout default parameter': () => {

		const scale = Fn( ( [ value, factor = float( 2 ) ] ) => value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } );

		return scale( uv().x ).add( scale( uv().y, 3 ) );

	},

	'layout default object parameter': () => {

		const scale = Fn( ( { value, factor = float( 2 ) } ) => value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } );

		return scale( { value: uv().x } ).add( scale( { value: uv().y, factor: 3 } ) );

	},

	// A default value like uv() is evaluated at the call site and passed to the function.

	'layout default builtin value': () => {

		const offsetUV = Fn( ( [ coord = uv(), offset = vec2( 0.5 ) ] ) => coord.add( offset ), { coord: 'vec2', offset: 'vec2', return: 'vec2' } );

		return offsetUV().add( offsetUV( vec2( 1 ) ) );

	},

	// A default value shared by all calls is declared once per build, outside of the function.

	'layout default shared variable': () => {

		const sharedWeights = Fn( () => vec3( 0.2, 0.7, 0.1 ) ).once()().toVar( 'sharedWeights' );
		const weighted = Fn( ( [ value, weights = sharedWeights ] ) => value.dot( weights ), { value: 'vec3', weights: 'vec3', return: 'float' } );

		return weighted( vec3( uv(), 1 ) ).add( weighted( vec3( 1 ) ) );

	},

	// A default value that depends on another parameter can't be passed at the call site,
	// so that call is expanded inline.

	'layout default depends on parameter': () => {

		const average = Fn( ( [ a, b = a.mul( 2 ) ] ) => a.add( b ).mul( 0.5 ), { a: 'float', b: 'float', return: 'float' } );

		return average( uv().x ).add( average( uv().x, 1 ) );

	},

	// An input missing in the middle of the call is also completed with its default value.

	'layout default missing middle': () => {

		const weightedSum = Fn( ( [ a, weight = float( 0.5 ), b ] ) => a.add( b ).mul( weight ), { a: 'float', weight: 'float', b: 'float', return: 'float' } );

		return weightedSum( uv().x, undefined, uv().y );

	},

	// A null default can't be passed as an argument, so that call is expanded inline.

	'layout default null': () => {

		const scale = Fn( ( [ value, factor = null ] ) => factor === null ? value : value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } );

		return scale( uv().x ).add( scale( uv().x, 3 ) );

	},

	// A function with layout and once() doesn't resolve defaults, a call with missing inputs is expanded inline.

	'layout once default parameter': () => {

		const scale = Fn( ( [ value, factor = float( 2 ) ] ) => value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } ).once();

		return scale( uv().x );

	},

	// Built-in functions with layout, with and without their optional parameters.

	'layout color adjustment defaults': () => saturation( vec3( 1, 0.5, 0 ) ).add( hue( vec3( 1, 0.5, 0 ) ) ).add( grayscale( vec3( 1, 0.5, 0 ) ) ),

	'layout color adjustment explicit': () => saturation( vec3( 1, 0.5, 0 ), 2 ).add( hue( vec3( 1, 0.5, 0 ), 0.5 ) ).add( vibrance( vec3( 1, 0.5, 0 ), 0.5 ) ),

	// Overloads are chosen by vector type, so a color matches a vec3 input.

	'layout overloading color': () => {

		const brightness = overloadingFn( [
			Fn( ( [ value ] ) => value, { value: 'float', return: 'float' } ),
			Fn( ( [ value ] ) => value.x.add( value.y ).add( value.z ).div( 3 ), { value: 'vec3', return: 'float' } )
		] );

		return brightness( color( 0xff8800 ) );

	}

};
