import { Break, Continue, Fn, If, Loop, Switch, array, bool, clamp, color, determinant, float, grayscale, hue, int, inverse, ivec3, mat2, mat3, mat4, mix, mul, overloadingFn, saturation, select, time, transpose, uint, uniform, uv, vec2, vec3, vec4, vibrance } from '../../../src/Three.TSL.js';

// Create a fresh graph for every test and backend.
export const cases = {

	constants: () => vec4( vec3( 1, 0.5, 0 ), 1 ),

	arithmetic: () => float( 2 ).add( 3 ).mul( 4 ).div( 2 ).sub( 1 ),

	swizzle: () => vec3( 1, 2, 3 ).zyx.mul( 0.5 ),

	// Explicit types promote to the broader component type in either operand order.
	autoConvertIntToFloat: () => float( 0.5 ).mul( int( 1 ) ),

	// An implicit integer-valued number adapts to int; an explicit float promotes it.
	autoConvertFloatToInt: () => int( 2 ).add( 1 ),

	autoPromoteIntToFloat: () => int( 1 ).mul( float( 0.5 ) ),

	autoConvertUintToFloat: () => float( 0.5 ).mul( uint( 1 ) ),

	autoPromoteUintToFloat: () => uint( 1 ).mul( float( 0.5 ) ),

	autoPromoteUintToInt: () => uint( 1 ).add( int( - 1 ) ),

	autoPromoteIntAndUint: () => int( - 1 ).add( uint( 1 ) ),

	// Equality uses the same common type in either operand order.
	equalFloatInt: () => float( 1.5 ).equal( int( 1 ) ),

	equalIntFloat: () => int( 1 ).equal( float( 1.5 ) ),

	equalBoolUint: () => bool( true ).equal( uint( 1 ) ),

	equalUintBool: () => uint( 1 ).equal( bool( true ) ),

	equalBoolFloat: () => bool( true ).equal( float( 1.5 ) ),

	equalFloatBool: () => float( 1.5 ).equal( bool( true ) ),

	equalFloatIntVector: () => vec3( 1.5 ).equal( ivec3( 1 ) ),

	equalIntFloatVector: () => ivec3( 1 ).equal( vec3( 1.5 ) ),

	// Explicit integer constants truncate before promotion to float, including cached values.
	truncatedUintToFloat: () => float( 1 ).mul( uint( 0.4 ) ),

	truncatedUintConstants: () => uint( 1.5 ),

	truncatedIntConstants: () => int( - 1.5 ),

	truncatedUintFraction: () => uint( 0.6 ),

	truncatedIntFraction: () => int( - 0.6 ),

	clampedNegativeUint: () => uint( - 0.4 ),

	autoConvertScalarToVector: () => vec3( 1, 2, 3 ).add( 0.5 ),

	autoConvertVectorToFloat: () => vec3( 0.5 ).add( ivec3( 1, 2, 3 ) ),

	// A weak scalar adapts to the integer vector; an explicit float vector promotes it.
	autoConvertVectorToInt: () => ivec3( 1, 2, 3 ).add( 1 ),

	autoPromoteIntVectorToFloat: () => ivec3( 1, 2, 3 ).add( vec3( 0.5 ) ),

	// Integer-valued weak numbers keep unsigned index math in uint.
	weakUintIndexMath: () => uint( 70 ).div( 64 ),

	weakFloatDefault: () => mul( 1, 2 ),

	// Weak numbers adopt the explicit integer type, truncated if needed; values out of its range promote it.
	weakUintFraction: () => uint( 1 ).mul( 0.5 ),

	weakIntFraction: () => int( 3 ).mul( 1.5 ),

	weakPromoteNegative: () => uint( 1 ).add( - 1 ),

	weakPromoteOutOfRange: () => uint( 1 ).add( 0x100000000 ),

	// A shared weak constant adapts independently to each use.
	weakSharedConstant: () => uint( 1 ).add( 1 ).add( float( 1 ).add( 1 ) ),

	// Math functions promote across all arguments, regardless of their order.
	weakMathFunctions: () => clamp( uint( 1 ), 0, 2 ),

	weakMathFunctionsReordered: () => clamp( 0, uint( 1 ), 2 ),

	// Float-only math functions promote integer arguments to float.
	floatOnlyMathFunctions: () => int( 2 ).pow( 2 ),

	// Integer math functions keep integer arguments.
	integerMathFunctions: () => uint( 1 ).max( 2 ),

	// Matrix functions keep the matrix type.
	squareMatrixFunctions: () => determinant( transpose( inverse( mat2( 1, 2, 3, 4 ) ) ) ),

	vectorComposition: () => vec4( vec2( 1, 2 ), int( 3 ), uint( 4 ) ),

	vectorResize: () => vec4( vec2( vec3( 1, 2, 3 ) ), 0, 1 ),

	conversionCache: () => {

		const value = vec3( time.mul( 0.5 ) );
		return vec4( value.add( value ), 1 );

	},

	booleanConversion: () => vec2( float( bool( true ) ), float( bool( false ) ) ),

	localMutableCache: () => {

		const scaledTime = vec3( time.mul( 0.5 ) );
		const testValue = scaledTime.add( scaledTime );

		return vec4( Fn( () => {

			testValue.mulAssign( 0.001 );

			return testValue;

		} )(), 1 );

	},

	indexedMutableCache: () => Fn( () => {

		const matrix = mat4( 1 ).mul( mat4( 2 ) );
		const before = matrix[ 0 ][ 0 ].add( matrix[ 1 ][ 1 ] );

		matrix[ 0 ][ 0 ] = 3;
		matrix[ 1 ].xy = vec2( 4, 5 );

		return matrix.mul( vec4( before ) );

	} )(),

	loopLocalCache: () => Fn( () => {

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

	sharedLocalAcrossBlocks: () => Fn( () => {

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

	externalVariableInLoop: () => {

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

	variableIntentScope: () => Fn( () => {

		const explicit = float( 1 ).toVar( 'explicitGlobal' );
		const inferred = float( 2 );

		inferred.addAssign( explicit );
		explicit.addAssign( inferred );

		return explicit.add( inferred );

	} )(),

	comparisonAndLogic: () => int( 3 ).greaterThan( 1 ).and( float( 0.5 ).lessThanEqual( 1 ) ).or( bool( false ).not() ),

	vectorComparison: () => vec3( 1, 2, 3 ).greaterThan( 1 ).all(),

	selectAutoConversion: () => Fn( () => select( bool( true ), vec3( 1, 2, 3 ), int( 0 ) ) )(),

	bitwise: () => uint( 5 ).bitAnd( uint( 3 ) ).bitOr( uint( 8 ) ).bitXor( uint( 1 ) ).shiftLeft( 2 ).shiftRight( 1 ),

	mathFunctions: () => mix( vec3( - 0.5, 0.25, 2 ).abs().clamp( 0, 1 ), vec3( 1 ), 0.25 ),

	vectorMath: () => vec3( 1, 2, 3 ).normalize().dot( vec3( 0, 1, 0 ).cross( vec3( 1, 0, 0 ) ) ),

	matrixVector: () => mat3( 1, 2, 3, 4, 5, 6, 7, 8, 9 ).mul( vec3( 1, 2, 3 ) ),

	matrixMatrix: () => mat3( 1, 2, 3, 4, 5, 6, 7, 8, 9 ).mul( mat3( 2, 0, 0, 0, 2, 0, 0, 0, 2 ) ),

	autoConvertAssignment: () => Fn( () => {

		const value = float( 0 );
		value.assign( int( 3 ) );
		value.addAssign( uint( 2 ) );

		return value;

	} )(),

	autoConvertVectorAssignment: () => Fn( () => {

		const value = vec3( 0 );
		value.assign( int( 2 ) );
		value.addAssign( ivec3( 1, 2, 3 ) );

		return value;

	} )(),

	swizzleAssignment: () => Fn( () => {

		const value = vec3( 1, 2, 3 );
		value.xy.assign( value.yx );
		value.z.assign( int( 4 ) );

		return value;

	} )(),

	arrayIndex: () => array( [ 1, 2, 3 ] ).element( int( 1 ) ),

	arrayLoop: () => Fn( () => {

		const values = array( [ 1, 2, 3 ] );
		const sum = float( 0 );

		Loop( 3, ( { i } ) => {

			sum.addAssign( values.element( i ) );

		} );

		return sum;

	} )(),

	elseIf: () => Fn( () => {

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

	switchCase: () => Fn( () => {

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

	loopBreakContinue: () => Fn( () => {

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

	loopDescending: () => Fn( () => {

		const sum = float( 0 );

		Loop( { start: 6, end: 0, condition: '>', update: '-= 2' }, ( { i } ) => {

			sum.addAssign( i );

		} );

		return sum;

	} )(),

	loopNested: () => Fn( () => {

		const sum = float( 0 );

		Loop( 3, 2, ( { i, j } ) => {

			sum.addAssign( i.mul( j ) );

		} );

		return sum;

	} )(),

	loopWhile: () => Fn( () => {

		const value = int( 0 );

		Loop( value.lessThan( 3 ), () => {

			value.addAssign( 1 );

		} );

		return value;

	} )(),

	functionInlineReuse: () => Fn( () => {

		const square = Fn( ( [ value ] ) => value.mul( value ) );
		const value = square( float( 3 ) );

		return value.add( value );

	} )(),

	functionInsideLoop: () => Fn( () => {

		const square = Fn( ( [ value ] ) => value.mul( value ) );
		const sum = float( 0 );

		Loop( 4, ( { i } ) => {

			sum.addAssign( square( i ) );

		} );

		return sum;

	} )(),

	functionResultConversion: () => Fn( () => {

		const integerResult = Fn( () => int( 3 ) );

		return float( 0.5 ).add( integerResult() );

	} )(),

	complexMatrixConditional: () => Fn( () => {

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

	conditional: () => Fn( () => {

		const value = float( 0.5 );

		If( value.greaterThan( 0 ), () => {

			value.mulAssign( 2 );

		} ).Else( () => {

			value.assign( 0 );

		} );

		return value;

	} )(),

	loop: () => Fn( () => {

		const sum = float( 0 );

		Loop( 4, ( { i } ) => {

			sum.addAssign( i );

		} );

		return sum;

	} )(),

	cachedFlipAfterLoop: () => Fn( () => {

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

	cachedExpressionAfterLoop: () => Fn( () => {

		const value = uv().x.add( 1 );
		const sum = float( 0 );

		Loop( 2, () => {

			sum.addAssign( value.mul( value ) );

		} );

		return vec2( value, sum );

	} )(),

	cachedExpressionBeforeLoop: () => Fn( () => {

		const value = uv().x.add( 1 );
		const sum = value.mul( value );

		Loop( 2, () => {

			sum.addAssign( value );

		} );

		return sum;

	} )(),

	cachedExpressionInSiblingLoops: () => Fn( () => {

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

	cachedBooleanUniformAfterLoop: () => Fn( () => {

		const enabled = uniform( true );
		const sum = float( 0 );

		Loop( 0, () => {

			sum.addAssign( float( enabled ) );

		} );

		return vec2( float( enabled ), sum );

	} )(),

	cachedConditionalAfterLoop: () => Fn( () => {

		const value = select( uv().x.lessThan( 0.5 ), float( 1 ), float( 2 ) );
		const sum = float( 0 );

		Loop( 0, () => {

			sum.addAssign( value );

		} );

		return vec2( value, sum );

	} )(),

	functionOutsideLoop: () => Fn( () => {

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

	functionOutsideSequentialLoops: () => Fn( () => {

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

	functionWithLoopInsideLoop: () => Fn( () => {

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

	functionOutsideConditional: () => Fn( () => {

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

	functionWithoutStackSingleConditionalUse: () => {

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

	functionWithoutStackSharedConditionalUse: () => {

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

	functionWithLoopWithoutStack: () => {

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

	wrappedFunctionOutsideLoop: () => Fn( () => {

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

	functionLoopDefaultParameter: () => Fn( () => {

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

	cachedValueAfterFunctionLoop: () => Fn( () => {

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

	cachedValueAfterFunctionConditional: () => Fn( () => {

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

	functionAssignOutsideLoop: () => Fn( () => {

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

	functionConditionalOutsideLoop: () => Fn( () => {

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

	functionReadBeforeAssign: () => Fn( () => {

		const x = float( 1 ).toVar( 'x' );
		const double = Fn( () => x.mul( 2 ).toVar( 'doubled' ) );

		const value = double();
		x.assign( 100 );

		return value;

	} )(),

	functionExpressionInConditional: () => Fn( () => {

		const double = Fn( () => uv().x.mul( 2 ) );

		const value = double();
		const result = float( 0 ).toVar( 'result' );

		If( uv().y.greaterThan( 0.5 ), () => {

			result.assign( value );

		} );

		return result;

	} )(),

	functionReturnsVariable: () => Fn( () => {

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

	function: () => {

		const square = Fn( ( { value } ) => value.mul( value ), { value: 'float', return: 'float' } );

		return square( float( 3 ) );

	},

	// Variables created in a function with layout are local to that function.

	layoutLocalVariables: () => {

		const smooth = Fn( ( [ value ] ) => {

			const result = value.toVar();
			result.assign( result.mul( result ).mul( float( 3 ).sub( result.mul( 2 ) ) ) );

			return result;

		}, { value: 'float', return: 'float' } );

		return smooth( uv().x );

	},

	layoutConditional: () => {

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

	layoutLoop: () => {

		const sumSteps = Fn( ( [ count ] ) => {

			const sum = float( 0 ).toVar();

			Loop( count, ( { i } ) => {

				sum.addAssign( float( i ) );

			} );

			return sum;

		}, { count: 'int', return: 'float' } );

		return sumSteps( int( 4 ) );

	},

	layoutInsideLoop: () => Fn( () => {

		const square = Fn( ( [ value ] ) => value.mul( value ), { value: 'float', return: 'float' } );
		const total = float( 0 ).toVar();

		Loop( 3, ( { i } ) => {

			total.addAssign( square( float( i ) ) );

		} );

		return total;

	} )(),

	// A function with layout is emitted once, before the functions that call it.

	layoutNestedCalls: () => {

		const square = Fn( ( [ value ] ) => value.mul( value ), { value: 'float', return: 'float' } );
		const sumOfSquares = Fn( ( [ a, b ] ) => square( a ).add( square( b ) ), { a: 'float', b: 'float', return: 'float' } );
		const lengthSquared = Fn( ( [ v ] ) => sumOfSquares( v.x, v.y ), { v: 'vec2', return: 'float' } );

		return lengthSquared( uv() ).add( sumOfSquares( 1, 2 ) ).add( square( 3 ) );

	},

	layoutSharedInclude: () => {

		const half = Fn( ( [ value ] ) => value.mul( 0.5 ), { value: 'float', return: 'float' } );
		const left = Fn( ( [ value ] ) => half( value ).add( half( value.add( 1 ) ) ), { value: 'float', return: 'float' } );
		const right = Fn( ( [ value ] ) => half( value ).sub( 1 ), { value: 'float', return: 'float' } );

		return left( uv().x ).add( right( uv().y ) );

	},

	layoutCalledTwice: () => {

		const scale = Fn( ( [ value, factor ] ) => value.mul( factor ), { value: 'vec2', factor: 'float', return: 'vec2' } );

		return scale( uv(), 2 ).add( scale( uv().yx, 0.5 ) );

	},

	// Inputs are converted to the layout types at the call site.

	layoutInputConversion: () => {

		const lengthOf = Fn( ( [ v ] ) => v.length(), { v: 'vec3', return: 'float' } );

		return lengthOf( float( 2 ) ).add( lengthOf( vec4( 1, 2, 3, 4 ) ) ).add( lengthOf( int( 1 ) ) );

	},

	// Missing inputs are passed as the default values of the parameters.

	layoutDefaultParameter: () => {

		const scale = Fn( ( [ value, factor = float( 2 ) ] ) => value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } );

		return scale( uv().x ).add( scale( uv().y, 3 ) );

	},

	layoutDefaultObjectParameter: () => {

		const scale = Fn( ( { value, factor = float( 2 ) } ) => value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } );

		return scale( { value: uv().x } ).add( scale( { value: uv().y, factor: 3 } ) );

	},

	// A default value like uv() is evaluated at the call site and passed to the function.

	layoutDefaultBuiltinValue: () => {

		const offsetUV = Fn( ( [ coord = uv(), offset = vec2( 0.5 ) ] ) => coord.add( offset ), { coord: 'vec2', offset: 'vec2', return: 'vec2' } );

		return offsetUV().add( offsetUV( vec2( 1 ) ) );

	},

	// A default value shared by all calls is declared once per build, outside of the function.

	layoutDefaultSharedVariable: () => {

		const sharedWeights = Fn( () => vec3( 0.2, 0.7, 0.1 ) ).once()().toVar( 'sharedWeights' );
		const weighted = Fn( ( [ value, weights = sharedWeights ] ) => value.dot( weights ), { value: 'vec3', weights: 'vec3', return: 'float' } );

		return weighted( vec3( uv(), 1 ) ).add( weighted( vec3( 1 ) ) );

	},

	// A default value that depends on another parameter can't be passed at the call site,
	// so that call is expanded inline.

	layoutDefaultDependsOnParameter: () => {

		const average = Fn( ( [ a, b = a.mul( 2 ) ] ) => a.add( b ).mul( 0.5 ), { a: 'float', b: 'float', return: 'float' } );

		return average( uv().x ).add( average( uv().x, 1 ) );

	},

	// An input missing in the middle of the call is also completed with its default value.

	layoutDefaultMissingMiddle: () => {

		const weightedSum = Fn( ( [ a, weight = float( 0.5 ), b ] ) => a.add( b ).mul( weight ), { a: 'float', weight: 'float', b: 'float', return: 'float' } );

		return weightedSum( uv().x, undefined, uv().y );

	},

	// A null default can't be passed as an argument, so that call is expanded inline.

	layoutDefaultNull: () => {

		const scale = Fn( ( [ value, factor = null ] ) => factor === null ? value : value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } );

		return scale( uv().x ).add( scale( uv().x, 3 ) );

	},

	// A function with layout and once() doesn't resolve defaults, a call with missing inputs is expanded inline.

	layoutOnceDefaultParameter: () => {

		const scale = Fn( ( [ value, factor = float( 2 ) ] ) => value.mul( factor ), { value: 'float', factor: 'float', return: 'float' } ).once();

		return scale( uv().x );

	},

	// Built-in functions with layout, with and without their optional parameters.

	layoutColorAdjustmentDefaults: () => saturation( vec3( 1, 0.5, 0 ) ).add( hue( vec3( 1, 0.5, 0 ) ) ).add( grayscale( vec3( 1, 0.5, 0 ) ) ),

	layoutColorAdjustmentExplicit: () => saturation( vec3( 1, 0.5, 0 ), 2 ).add( hue( vec3( 1, 0.5, 0 ), 0.5 ) ).add( vibrance( vec3( 1, 0.5, 0 ), 0.5 ) ),

	// Overloads are chosen by vector type, so a color matches a vec3 input.

	layoutOverloadingColor: () => {

		const brightness = overloadingFn( [
			Fn( ( [ value ] ) => value, { value: 'float', return: 'float' } ),
			Fn( ( [ value ] ) => value.x.add( value.y ).add( value.z ).div( 3 ), { value: 'vec3', return: 'float' } )
		] );

		return brightness( color( 0xff8800 ) );

	}

};
