import { Break, Continue, Fn, If, Loop, Switch, array, bool, float, int, inverse, ivec3, mat3, mat4, mix, mul, select, time, uint, uniform, uv, vec2, vec3, vec4 } from '../../../src/Three.TSL.js';

// Create a fresh graph for every test and backend.
export const cases = {

	constants: () => vec4( vec3( 1, 0.5, 0 ), 1 ),

	arithmetic: () => float( 2 ).add( 3 ).mul( 4 ).div( 2 ).sub( 1 ),

	swizzle: () => vec3( 1, 2, 3 ).zyx.mul( 0.5 ),

	// Operand order matters: scalar operators infer their type from the left operand.
	autoConvertIntToFloat: () => Fn( () => float( 0.5 ).add( int( 2 ) ) )(),

	autoConvertFloatToInt: () => Fn( () => int( 2 ).add( float( 0.5 ) ) )(),

	autoConvertUintToFloat: () => Fn( () => float( 0.5 ).mul( uint( 3 ) ) )(),

	autoConvertScalarToVector: () => vec3( 1, 2, 3 ).add( 0.5 ),

	autoConvertVectorToFloat: () => vec3( 0.5 ).add( ivec3( 1, 2, 3 ) ),

	autoConvertVectorToInt: () => ivec3( 1, 2, 3 ).add( vec3( 0.5 ) ),

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

	function: () => {

		const square = Fn( ( { value } ) => value.mul( value ), { value: 'float', return: 'float' } );

		return square( float( 3 ) );

	}

};
