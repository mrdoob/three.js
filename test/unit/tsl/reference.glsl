// constants

vec4( vec3( 1.0, 0.5, 0.0 ), 1.0 )

// arithmetic

( ( ( ( 2.0 + 3.0 ) * 4.0 ) / 2.0 ) - 1.0 )

// swizzle

( vec3( 1.0, 2.0, 3.0 ).zyx * vec3( 0.5 ) )

// auto convert int to float

int nodeVar0;
nodeVar0 = 2;

( 0.5 + float( nodeVar0 ) )

// auto convert float to int

float nodeVar0;
nodeVar0 = 0.5;

( 2 + int( nodeVar0 ) )

// auto convert uint to float

uint nodeVar0;
nodeVar0 = 3u;

( 0.5 * float( nodeVar0 ) )

// auto convert scalar to vector

( vec3( 1.0, 2.0, 3.0 ) + vec3( 0.5 ) )

// auto convert vector to float

( vec3( 0.5, 0.5, 0.5 ) + vec3( ivec3( 1, 2, 3 ) ) )

// auto convert vector to int

( ivec3( 1, 2, 3 ) + ivec3( vec3( 0.5, 0.5, 0.5 ) ) )

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

	float nodeConst2 = ( 2.0 + 3.0 );
	mat4 nodeConst3 = mat4( vec4( nodeConst2, 0.0, 0.0, 0.0 ), vec4( 0.0, nodeConst2, 0.0, 0.0 ), vec4( 0.0, 0.0, 1.0, 0.0 ), vec4( 0.0, 0.0, 0.0, 1.0 ) );
	nodeVar0 = ( nodeVar0 + ( nodeConst3[ 0u ][ 0u ] + nodeConst3[ 1u ][ 1u ] ) );

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

( ( ( 3.0 > 1.0 ) && ( 0.5 <= 1.0 ) ) || ( ! false ) )

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

if ( ( 2.0 == 0.0 ) ) {

	nodeVar0 = 1.0;

} else {

	if ( ( ( 2.0 == 1.0 ) || ( 2.0 == 2.0 ) ) ) {

		nodeVar0 = 2.0;

	} else {

		nodeVar0 = -1.0;

	}

}

nodeVar0

// loop break continue

float nodeVar0 = 0.0;

for ( int i = 0; i < 8; i ++ ) {

	if ( ( float( i ) == 2.0 ) ) {

		continue;

	}

	if ( ( float( i ) > 5.0 ) ) {

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

while ( ( float( nodeVar0 ) < 3.0 ) ) {

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

int nodeVar0;
nodeVar0 = 3;

( 0.5 + float( nodeVar0 ) )

// complex matrix conditional

vec4 nodeVar0 = vec4( 0.0, 0.0, 0.0, 1.0 );

if ( ( nodeVarying0.x < 0.33 ) ) {

	nodeVar0 = vec4( ( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * inverse( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) )[ 0u ].xyz, 1.0 );

} else {

	if ( ( nodeVarying0.x < 0.66 ) ) {

		nodeVar0 = vec4( ( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * inverse( mat4( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) )[ 1u ].xyz, 1.0 );

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

// function outside loop

float nodeVar0 = 0.0;

for ( int i = 0; i < 4; i ++ ) {

	float nodeVar1 = 0.0;

	for ( int i = 0; i < 3; i ++ ) {

		nodeVar1 = ( nodeVar1 + float( i ) );

	}

	nodeVar0 = ( nodeVar0 + nodeVar1 );

}

nodeVar0

// function

float fn3 ( float value ) {

	return ( value * value );

}

fn3( 3.0 )
