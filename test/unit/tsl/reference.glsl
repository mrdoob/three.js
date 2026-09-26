// constants

vec4( vec3( 1.0, 0.5, 0.0 ), 1.0 )

// arithmetic

( ( ( ( 2.0 + 3.0 ) * 4.0 ) / 2.0 ) - 1.0 )

// swizzle

( vec3( 1.0, 2.0, 3.0 ).zyx * vec3( 0.5 ) )

// auto convert int to float

( 0.5 + 2.0 )

// auto convert float to int

( 2 + 1 )

// auto promote int to float

( 2.0 + 0.5 )

// auto convert uint to float

( 0.5 * 3.0 )

// auto convert scalar to vector

( vec3( 1.0, 2.0, 3.0 ) + vec3( 0.5 ) )

// auto convert vector to float

( vec3( 0.5, 0.5, 0.5 ) + vec3( ivec3( 1, 2, 3 ) ) )

// auto convert vector to int

( ivec3( 1, 2, 3 ) + ivec3( int( 1.0 ) ) )

// auto promote int vector to float

( vec3( ivec3( 1, 2, 3 ) ) + vec3( 0.5, 0.5, 0.5 ) )

// weak uint index math

( ( ( nodeUniform0 % 64u ) + ( ( nodeUniform0 / 64u ) * 2u ) ) - 1u )

// weak promote out of range

vec4( float( ( nodeUniform0 * 1u ) ), float( ( int( nodeUniform0 ) < -1 ) ), ( float( nodeUniform0 ) + 4294967296.0 ), float( ( 3 * 2 ) ) )

// weak shared constant

vec2( float( ( nodeUniform0 + 1u ) ), ( nodeVarying0.x + 1.0 ) )

// weak math functions

vec4( float( clamp( nodeUniform0, 0u, 64u ) ), float( clamp( 0u, nodeUniform0, 64u ) ), float( max( 3, -1 ) ), float( max( 3, 1 ) ) )

// float only math functions

( vec4( pow( 2.0, 2.0 ), smoothstep( 0.0, 1.0, 2.0 ), atan( 1.0, 2.0 ), dot( vec3( ivec3( 1, 2, 3 ) ), vec3( ivec3( 1, 2, 3 ) ) ) ) + vec4( floor( float( nodeUniform0 ) ), step( 1.0, 2.0 ), sqrt( 2.0 ), length( vec3( ivec3( 1, 2, 3 ) ) ) ) )

// integer math functions

uint countTrailingZeros_base_uint ( uint value ) {

	if ( ( value == 0u ) ) {

		return 32u;

	}

	uint nodeVar0 = 0u;
	nodeVar0 = value;

	return ( ( floatBitsToUint( float( ( nodeVar0 & ( - nodeVar0 ) ) ) ) >> 23u ) - 127u );

}

uint countOneBits_base_uint ( uint value ) {

	uint nodeVar0 = 0u;
	nodeVar0 = value;
	nodeVar0 = ( nodeVar0 - ( ( nodeVar0 >> 1u ) & 1431655765u ) );
	nodeVar0 = ( ( nodeVar0 & 858993459u ) + ( ( nodeVar0 >> 2u ) & 858993459u ) );

	return ( ( ( ( nodeVar0 + ( nodeVar0 >> 4u ) ) & 252645135u ) * 16843009u ) >> 24u );

}

uint countTrailingZeros_uint ( uint value ) {

	return countTrailingZeros_base_uint( value );

}

uint countOneBits_uint ( uint value ) {

	return countOneBits_base_uint( value );

}

uvec3( countTrailingZeros_uint( nodeUniform0 ), countOneBits_uint( ( nodeUniform0 + 1u ) ), max( nodeUniform0, 64u ) )

// square matrix functions

determinant( transpose( inverse( mat2( 1.0, 3.0, 2.0, 4.0 ) ) ) )

// vector composition

vec4( vec2( 1.0, 2.0 ), float( 3 ), float( 4u ) )

// vector resize

vec4( vec3( 1.0, 2.0, 3.0 ).xy, 0.0, 1.0 )

// conversion cache

vec3 nodeConst0 = vec3( ( nodeUniform0 * 0.5 ) );

vec4( ( nodeConst0 + nodeConst0 ), 1.0 )

// boolean conversion

vec2( float( true ), float( false ) )

// local mutable cache

vec3 nodeConst0 = vec3( ( nodeUniform0 * 0.5 ) );
vec3 nodeVar0 = ( nodeConst0 + nodeConst0 );
nodeVar0 = ( nodeVar0 * vec3( 0.001 ) );

vec4( nodeVar0, 1.0 )

// indexed mutable cache

mat4 nodeVar0 = ( mat4( 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ) * mat4( 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ) );
nodeVar0[ 0u ][ 0u ] = 3.0;
nodeVar0[ 1u ].xy = vec2( 4.0, 5.0 );

( nodeVar0 * vec4( ( nodeVar0[ 0u ][ 0u ] + nodeVar0[ 1u ][ 1u ] ) ) )

// loop local cache

float nodeVar0 = 0.0;

if ( true ) {

	for ( int i = 0; i < 2; i ++ ) {

		float nodeConst0 = ( 2.0 + 3.0 );
		mat4 nodeConst1 = mat4( vec4( nodeConst0, 0.0, 0.0, 0.0 ), vec4( 0.0, nodeConst0, 0.0, 0.0 ), vec4( 0.0, 0.0, 1.0, 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );
		nodeVar0 = ( nodeVar0 + ( nodeConst1[ 0u ][ 0u ] + nodeConst1[ 1u ][ 1u ] ) );

	}

	float nodeConst0 = ( 2.0 + 3.0 );
	mat4 nodeConst1 = mat4( vec4( nodeConst0, 0.0, 0.0, 0.0 ), vec4( 0.0, nodeConst0, 0.0, 0.0 ), vec4( 0.0, 0.0, 1.0, 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );
	nodeVar0 = ( nodeVar0 + ( nodeConst1[ 0u ][ 0u ] + nodeConst1[ 1u ][ 1u ] ) );

}

nodeVar0

// shared local across blocks

float nodeVar0 = 0.0;
float nodeVar1 = ( 2.0 + 3.0 );

if ( true ) {

	nodeVar0 = ( nodeVar0 + nodeVar1 );

}

if ( true ) {

	nodeVar1 = ( nodeVar1 + 1.0 );
	nodeVar0 = ( nodeVar0 + ( nodeVar1 + nodeVar1 ) );

	if ( true ) {

		nodeVar0 = ( nodeVar0 + nodeVar1 );

	}

}

nodeVar0

// external variable in loop

float externalValue;
float nodeVar0 = 0.0;

for ( int i = 0; i < 0; i ++ ) {

	externalValue = ( 2.0 + 3.0 );
	nodeVar0 = ( nodeVar0 + externalValue );

}

externalValue = ( 2.0 + 3.0 );

for ( int i = 0; i < 2; i ++ ) {

	nodeVar0 = ( nodeVar0 + externalValue );

}

( nodeVar0 + externalValue )

// variable intent scope

float explicitGlobal;
explicitGlobal = 1.0;
float nodeVar0 = 2.0;
nodeVar0 = ( nodeVar0 + explicitGlobal );
explicitGlobal = ( explicitGlobal + nodeVar0 );

( explicitGlobal + nodeVar0 )

// comparison and logic

( ( ( 3 > 1 ) && ( 0.5 <= 1.0 ) ) || ( ! false ) )

// vector comparison

all( ( vec3( 1.0, 2.0, 3.0 ) > vec3( 1.0 ) ) )

// select auto conversion

vec3 nodeVar0;

if ( true ) {

	nodeVar0 = vec3( 1.0, 2.0, 3.0 );

} else {

	nodeVar0 = vec3( float( 0 ) );

}

nodeVar0

// bitwise

( ( ( ( ( 5u & 3u ) | 8u ) ^ 1u ) << 2u ) >> 1u )

// math functions

mix( clamp( abs( vec3( -0.5, 0.25, 2.0 ) ), vec3( 0.0 ), vec3( 1.0 ) ), vec3( 1.0, 1.0, 1.0 ), 0.25 )

// vector math

dot( normalize( vec3( 1.0, 2.0, 3.0 ) ), cross( vec3( 0.0, 1.0, 0.0 ), vec3( 1.0, 0.0, 0.0 ) ) )

// matrix vector

( mat3( 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ) * vec3( 1.0, 2.0, 3.0 ) )

// matrix matrix

( mat3( 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ) * mat3( 2.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 2.0 ) )

// auto convert assignment

float nodeVar0 = 0.0;
nodeVar0 = 3.0;
nodeVar0 = ( nodeVar0 + 2.0 );

nodeVar0

// auto convert vector assignment

vec3 nodeVar0 = vec3( 0.0, 0.0, 0.0 );
nodeVar0 = vec3( float( 2 ) );
nodeVar0 = ( nodeVar0 + vec3( ivec3( 1, 2, 3 ) ) );

nodeVar0

// swizzle assignment

vec3 nodeVar0 = vec3( 1.0, 2.0, 3.0 );
nodeVar0.xy = nodeVar0.yx;
nodeVar0.z = 4.0;

nodeVar0

// array index

float[ 3 ]( 1.0, 2.0, 3.0 )[ 1 ]

// array loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 3; i ++ ) {

	nodeVar0 = ( nodeVar0 + float[ 3 ]( 1.0, 2.0, 3.0 )[ i ] );

}

nodeVar0

// else if

float nodeVar0 = 0.5;

if ( ( nodeVar0 < 0.0 ) ) {

	nodeVar0 = -1.0;

} else {

	if ( ( nodeVar0 > 1.0 ) ) {

		nodeVar0 = 1.0;

	} else {

		nodeVar0 = ( nodeVar0 * 2.0 );

	}

}

nodeVar0

// switch case

float nodeVar0 = 0.0;

if ( ( 2 == 0 ) ) {

	nodeVar0 = 1.0;

} else {

	if ( ( ( 2 == 1 ) || ( 2 == 2 ) ) ) {

		nodeVar0 = 2.0;

	} else {

		nodeVar0 = -1.0;

	}

}

nodeVar0

// loop break continue

float nodeVar0 = 0.0;

for ( int i = 0; i < 8; i ++ ) {

	if ( ( i == 2 ) ) {

		continue;

	}

	if ( ( i > 5 ) ) {

		break;

	}

	nodeVar0 = ( nodeVar0 + float( i ) );

}

nodeVar0

// loop descending

float nodeVar0 = 0.0;

for ( int i = 6; i > 0; i -= 2 ) {

	nodeVar0 = ( nodeVar0 + float( i ) );

}

nodeVar0

// loop nested

float nodeVar0 = 0.0;

for ( int i = 0; i < 3; i ++ ) {

	for ( int j = 0; j < 2; j ++ ) {

		nodeVar0 = ( nodeVar0 + float( ( i * j ) ) );

	}

}

nodeVar0

// loop while

int nodeVar0 = 0;

while ( ( nodeVar0 < 3 ) ) {

	nodeVar0 = ( nodeVar0 + 1 );

}

nodeVar0

// function inline reuse

float nodeConst0 = ( 3.0 * 3.0 );

( nodeConst0 + nodeConst0 )

// function inside loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	nodeVar0 = ( nodeVar0 + float( ( i * i ) ) );

}

nodeVar0

// function result conversion

( 0.5 + 3.0 )

// complex matrix conditional

vec4 nodeVar0 = vec4( 0.0, 0.0, 0.0, 1.0 );

if ( ( nodeVarying0.x < 0.33 ) ) {

	mat4 nodeConst0 = ( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * inverse( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) );
	nodeVar0 = vec4( nodeConst0[ 0u ].xyz, 1.0 );

} else {

	if ( ( nodeVarying0.x < 0.66 ) ) {

		mat4 nodeConst0 = ( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * inverse( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) );
		nodeVar0 = vec4( nodeConst0[ 1u ].xyz, 1.0 );

	} else {

		mat4 nodeConst0 = ( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * inverse( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) );
		nodeVar0 = vec4( nodeConst0[ 2u ].xyz, 1.0 );

		if ( ( nodeVarying0.x < 0.33 ) ) {

			nodeVar0 = vec4( nodeConst0[ 0u ].xyz, 1.0 );

		} else {

			if ( ( nodeVarying0.x < 0.66 ) ) {

				nodeVar0 = vec4( nodeConst0[ 1u ].xyz, 1.0 );

			} else {

				nodeVar0 = vec4( nodeConst0[ 2u ].xyz, 1.0 );

			}

		}

	}

}

nodeVar0

// conditional

float nodeVar0 = 0.5;

if ( ( nodeVar0 > 0.0 ) ) {

	nodeVar0 = ( nodeVar0 * 2.0 );

} else {

	nodeVar0 = 0.0;

}

nodeVar0

// loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	nodeVar0 = ( nodeVar0 + float( i ) );

}

nodeVar0

// cached flip after loop

vec2 nodeVar0;
nodeVar0 = nodeVarying0;
vec2 nodeConst0 = vec2( 1.0 - nodeVar0.x, nodeVar0.y );
vec2 nodeVar1 = vec2( 0.0, 0.0 );

for ( int i = 0; i < 2; i ++ ) {

	nodeVar1 = ( nodeVar1 + nodeConst0 );

}

vec4( nodeConst0, nodeVar1 )

// cached expression after loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 2; i ++ ) {

	float nodeConst0 = ( nodeVarying0.x + 1.0 );
	nodeVar0 = ( nodeVar0 + ( nodeConst0 * nodeConst0 ) );

}

float nodeConst0 = ( nodeVarying0.x + 1.0 );

vec2( nodeConst0, nodeVar0 )

// cached expression before loop

float nodeConst0 = ( nodeVarying0.x + 1.0 );
float nodeVar0 = ( nodeConst0 * nodeConst0 );

for ( int i = 0; i < 2; i ++ ) {

	nodeVar0 = ( nodeVar0 + nodeConst0 );

}

nodeVar0

// cached expression in sibling loops

float nodeVar0 = 0.0;
float nodeVar1 = 0.0;

for ( int i = 0; i < 2; i ++ ) {

	float nodeConst0 = ( nodeVarying0.x + 1.0 );
	float nodeConst1 = ( nodeConst0 * nodeConst0 );
	nodeVar0 = ( nodeVar0 + nodeConst1 );

}

for ( int i = 0; i < 3; i ++ ) {

	float nodeConst0 = ( nodeVarying0.x + 1.0 );
	float nodeConst1 = ( nodeConst0 * nodeConst0 );
	nodeVar1 = ( nodeVar1 + nodeConst1 );

}

vec2( nodeVar0, nodeVar1 )

// cached boolean uniform after loop

bool nodeVar1;
float nodeVar0 = 0.0;

for ( int i = 0; i < 0; i ++ ) {

	nodeVar1 = bool( nodeUniform0 );
	nodeVar0 = ( nodeVar0 + float( nodeVar1 ) );

}

nodeVar1 = bool( nodeUniform0 );

vec2( float( nodeVar1 ), nodeVar0 )

// cached conditional after loop

float nodeVar1;
float nodeVar2;
float nodeVar0 = 0.0;

for ( int i = 0; i < 0; i ++ ) {

	if ( ( nodeVarying0.x < 0.5 ) ) {

		nodeVar1 = 1.0;

	} else {

		nodeVar1 = 2.0;

	}

	nodeVar0 = ( nodeVar0 + nodeVar1 );

}

if ( ( nodeVarying0.x < 0.5 ) ) {

	nodeVar2 = 1.0;

} else {

	nodeVar2 = 2.0;

}

vec2( nodeVar2, nodeVar0 )

// function outside loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 3; i ++ ) {

	nodeVar0 = ( nodeVar0 + float( i ) );

}

float nodeVar1 = nodeVar0;
float nodeVar2 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	nodeVar2 = ( nodeVar2 + nodeVar1 );

}

nodeVar2

// function outside sequential loops

vec3 nodeVar0 = vec3( 0.0, 0.0, 0.0 );

for ( int i = 0; i < 10000; i ++ ) {

	nodeVar0 = ( nodeVar0 + vec3( 0.0001 ) );

}

vec3 nodeVar1 = nodeVar0;
vec3 nodeVar2 = vec3( 0.0, 0.0, 0.0 );

for ( int i = 0; i < 10; i ++ ) {

	nodeVar2 = ( nodeVar2 + nodeVar1 );

}

for ( int i = 0; i < 10; i ++ ) {

	nodeVar2 = ( nodeVar2 + nodeVar1 );

}

nodeVar2

// function with loop inside loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	float nodeVar1 = 0.0;

	for ( int j = 0; j < 3; j ++ ) {

		nodeVar1 = ( nodeVar1 + float( i ) );

	}

	nodeVar0 = ( nodeVar0 + nodeVar1 );

}

nodeVar0

// function outside conditional

float nodeVar0 = 0.0;

if ( ( nodeVarying0.x > 0.5 ) ) {

	float nodeVar1 = 0.0;

	for ( int i = 0; i < 3; i ++ ) {

		nodeVar1 = ( nodeVar1 + float( i ) );

	}

	nodeVar0 = nodeVar1;

}

nodeVar0

// function without stack single conditional use

float nodeVar0 = 0.0;

if ( bool( nodeVar0 ) ) {

	float nodeVar1 = 2.0;

	for ( int i = 0; i < 1; i ++ ) {

		nodeVar1 = ( nodeVar1 + 1.0 );

	}

	nodeVar0 = ( nodeVar1 + 2.0 );

} else {

	nodeVar0 = 1.0;

}

vec3( nodeVar0 )

// function without stack shared conditional use

float nodeVar0 = 0.0;

if ( bool( nodeVar0 ) ) {

	float nodeVar1 = 2.0;

	for ( int i = 0; i < 1; i ++ ) {

		nodeVar1 = ( nodeVar1 + 1.0 );

	}

	float nodeConst0 = ( nodeVar1 + 2.0 );
	nodeVar0 = nodeConst0;

} else {

	float nodeVar1 = 2.0;

	for ( int i = 0; i < 1; i ++ ) {

		nodeVar1 = ( nodeVar1 + 1.0 );

	}

	float nodeConst0 = ( nodeVar1 + 2.0 );
	nodeVar0 = nodeConst0;

}

vec3( nodeVar0 )

// function with loop without stack

float nodeVar0 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	float nodeVar1 = 0.0;

	for ( int i = 0; i < 3; i ++ ) {

		nodeVar1 = ( nodeVar1 + float( i ) );

	}

	nodeVar0 = ( nodeVar0 + nodeVar1 );

}

nodeVar0

// wrapped function outside loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 3; i ++ ) {

	nodeVar0 = ( nodeVar0 + float( i ) );

}

float nodeVar1 = nodeVar0;
float nodeVar2 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	nodeVar2 = ( nodeVar2 + nodeVar1 );

}

nodeVar2

// function loop default parameter

float nodeVar0 = 0.0;

for ( int i = 0; i < 3; i ++ ) {

	nodeVar0 = ( nodeVar0 + float( i ) );

}

float nodeVar1 = nodeVar0;
float nodeVar2 = 0.0;

for ( int i = 0; i < 5; i ++ ) {

	nodeVar2 = ( nodeVar2 + float( i ) );

}

float nodeVar3 = nodeVar2;
float nodeVar4 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	nodeVar4 = ( nodeVar4 + ( nodeVar1 + nodeVar3 ) );

}

nodeVar4

// cached value after function loop

vec2 nodeVar1;
vec2 nodeVar0 = vec2( 0.0, 0.0 );

for ( int i = 0; i < 2; i ++ ) {

	nodeVar1 = nodeVarying0;
	vec2 nodeConst0 = vec2( 1.0 - nodeVar1.x, nodeVar1.y );
	nodeVar0 = ( nodeVar0 + ( nodeConst0 * nodeConst0 ) );

}

vec2 nodeVar2 = nodeVar0;
vec2 nodeVar3 = vec2( 0.0, 0.0 );

for ( int i = 0; i < 3; i ++ ) {

	nodeVar3 = ( nodeVar3 + nodeVar2 );

}

nodeVar1 = nodeVarying0;
vec2 nodeConst0 = vec2( 1.0 - nodeVar1.x, nodeVar1.y );

vec4( nodeConst0, nodeVar3 )

// cached value after function conditional

float nodeVar0 = 0.0;

if ( ( nodeVarying0.y > 0.5 ) ) {

	float nodeConst0 = ( nodeVarying0.x + 1.0 );
	nodeVar0 = ( nodeConst0 * nodeConst0 );

}

float nodeVar1 = nodeVar0;
float nodeVar2 = 0.0;

for ( int i = 0; i < 3; i ++ ) {

	nodeVar2 = ( nodeVar2 + nodeVar1 );

}

float nodeConst0 = ( nodeVarying0.x + 1.0 );

vec2( ( nodeConst0 * nodeConst0 ), nodeVar2 )

// function assign outside loop

float counter;
float total;
counter = 0.0;
counter = ( counter + 1.0 );
float nodeVar0 = ( counter * 2.0 );
total = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	total = ( total + nodeVar0 );

}

vec2( counter, total )

// function conditional outside loop

float counter;
float result;
float total;
counter = 0.0;
result = 1.0;

if ( ( nodeVarying0.x > 0.5 ) ) {

	counter = ( counter + 1.0 );
	result = 2.0;

}

float nodeVar0 = result;
total = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	total = ( total + nodeVar0 );

}

vec2( counter, total )

// function read before assign

float x;
float doubled;
x = 1.0;
x = 100.0;
doubled = ( x * 2.0 );

doubled

// function expression in conditional

float result;
result = 0.0;

if ( ( nodeVarying0.y > 0.5 ) ) {

	result = ( nodeVarying0.x * 2.0 );

}

result

// function returns variable

float result;
result = nodeVarying0.x;

if ( ( result > 0.5 ) ) {

	result = 0.5;

}

( result + result )

// function

float fn3 ( float value ) {

	return ( value * value );

}

fn3( 3.0 )
