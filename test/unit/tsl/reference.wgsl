// constants

vec4<f32>( vec3<f32>( 1.0, 0.5, 0.0 ), 1.0 )

// arithmetic

( ( ( ( 2.0 + 3.0 ) * 4.0 ) / 2.0 ) - 1.0 )

// swizzle

( vec3<f32>( 1.0, 2.0, 3.0 ).zyx * vec3<f32>( 0.5 ) )

// auto convert int to float

var nodeVar0 : i32;

nodeVar0 = 2;

( 0.5 + f32( nodeVar0 ) )

// auto convert float to int

var nodeVar0 : f32;

nodeVar0 = 0.5;

( 2 + i32( nodeVar0 ) )

// auto convert uint to float

var nodeVar0 : u32;

nodeVar0 = 3u;

( 0.5 * f32( nodeVar0 ) )

// auto convert scalar to vector

( vec3<f32>( 1.0, 2.0, 3.0 ) + vec3<f32>( 0.5 ) )

// auto convert vector to float

( vec3<f32>( 0.5, 0.5, 0.5 ) + vec3<f32>( vec3<i32>( 1, 2, 3 ) ) )

// auto convert vector to int

( vec3<i32>( 1, 2, 3 ) + vec3<i32>( vec3<f32>( 0.5, 0.5, 0.5 ) ) )

// vector composition

vec4<f32>( vec2<f32>( 1.0, 2.0 ), f32( 3 ), f32( 4u ) )

// vector resize

vec4<f32>( vec3<f32>( 1.0, 2.0, 3.0 ).xy, 0.0, 1.0 )

// boolean conversion

vec2<f32>( f32( true ), f32( false ) )

// comparison and logic

( ( ( 3.0 > 1.0 ) && ( 0.5 <= 1.0 ) ) || ( ! false ) )

// vector comparison

all( ( vec3<f32>( 1.0, 2.0, 3.0 ) > vec3<f32>( 1.0 ) ) )

// select auto conversion

var nodeVar0 : vec3<f32>;

if ( true ) {

	nodeVar0 = vec3<f32>( 1.0, 2.0, 3.0 );

} else {

	nodeVar0 = vec3<f32>( f32( 0 ) );

}

nodeVar0

// bitwise

( ( ( ( ( 5u & 3u ) | 8u ) ^ 1u ) << 2u ) >> 1u )

// math functions

mix( clamp( abs( vec3<f32>( -0.5, 0.25, 2.0 ) ), vec3<f32>( 0.0 ), vec3<f32>( 1.0 ) ), vec3<f32>( 1.0, 1.0, 1.0 ), 0.25 )

// vector math

dot( normalize( vec3<f32>( 1.0, 2.0, 3.0 ) ), cross( vec3<f32>( 0.0, 1.0, 0.0 ), vec3<f32>( 1.0, 0.0, 0.0 ) ) )

// matrix vector

( mat3x3<f32>( 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ) * vec3<f32>( 1.0, 2.0, 3.0 ) )

// matrix matrix

( mat3x3<f32>( 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ) * mat3x3<f32>( 2.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 2.0 ) )

// auto convert assignment

var nodeVar0 : f32;

nodeVar0 = 0.0;
nodeVar0 = 3.0;
nodeVar0 = ( nodeVar0 + 2.0 );

nodeVar0

// auto convert vector assignment

var nodeVar0 : vec3<f32>;

nodeVar0 = vec3<f32>( 0.0, 0.0, 0.0 );
nodeVar0 = vec3<f32>( f32( 2 ) );
nodeVar0 = ( nodeVar0 + vec3<f32>( vec3<i32>( 1, 2, 3 ) ) );

nodeVar0

// swizzle assignment

var nodeVar0 : vec3<f32>;
var nodeVar1 : vec2<f32>;

nodeVar0 = vec3<f32>( 1.0, 2.0, 3.0 );
nodeVar1 = nodeVar0.yx;
nodeVar0.x = nodeVar1[ 0 ];
nodeVar0.y = nodeVar1[ 1 ];
nodeVar0.z = 4.0;

nodeVar0

// array index

array< f32, 3 >( 1.0, 2.0, 3.0 )[ 1 ]

// array loop

var nodeVar0 : f32;

nodeVar0 = 0.0;

for ( var i : i32 = 0; i < 3; i ++ ) {

	nodeVar0 = ( nodeVar0 + array< f32, 3 >( 1.0, 2.0, 3.0 )[ i ] );

}

nodeVar0

// else if

var nodeVar0 : f32;

nodeVar0 = 0.5;

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

var nodeVar0 : f32;

nodeVar0 = 0.0;

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

var nodeVar0 : f32;

nodeVar0 = 0.0;

for ( var i : i32 = 0; i < 8; i ++ ) {

	if ( ( f32( i ) == 2.0 ) ) {

		continue;

	}

	if ( ( f32( i ) > 5.0 ) ) {

		break;

	}

	nodeVar0 = ( nodeVar0 + f32( i ) );

}

nodeVar0

// loop descending

var nodeVar0 : f32;

nodeVar0 = 0.0;

for ( var i : i32 = 6; i > 0; i -= 2 ) {

	nodeVar0 = ( nodeVar0 + f32( i ) );

}

nodeVar0

// loop nested

var nodeVar0 : f32;

nodeVar0 = 0.0;

for ( var i : i32 = 0; i < 3; i ++ ) {

	for ( var j : i32 = 0; j < 2; j ++ ) {

		nodeVar0 = ( nodeVar0 + f32( ( i * j ) ) );

	}

}

nodeVar0

// loop while

var nodeVar0 : i32;

nodeVar0 = 0;

while ( ( f32( nodeVar0 ) < 3.0 ) ) {

	nodeVar0 = ( nodeVar0 + 1 );

}

nodeVar0

// function inline reuse

var nodeVar0 : f32;

nodeVar0 = ( 3.0 * 3.0 );

( nodeVar0 + nodeVar0 )

// function inside loop

var nodeVar0 : f32;

nodeVar0 = 0.0;

for ( var i : i32 = 0; i < 4; i ++ ) {

	nodeVar0 = ( nodeVar0 + f32( ( i * i ) ) );

}

nodeVar0

// function result conversion

var nodeVar0 : i32;

nodeVar0 = 3;

( 0.5 + f32( nodeVar0 ) )

// complex matrix conditional

fn tsl_inverse_mat4( m : mat4x4<f32> ) -> mat4x4<f32> {

	let a00 = m[ 0 ][ 0 ]; let a01 = m[ 0 ][ 1 ]; let a02 = m[ 0 ][ 2 ]; let a03 = m[ 0 ][ 3 ];
	let a10 = m[ 1 ][ 0 ]; let a11 = m[ 1 ][ 1 ]; let a12 = m[ 1 ][ 2 ]; let a13 = m[ 1 ][ 3 ];
	let a20 = m[ 2 ][ 0 ]; let a21 = m[ 2 ][ 1 ]; let a22 = m[ 2 ][ 2 ]; let a23 = m[ 2 ][ 3 ];
	let a30 = m[ 3 ][ 0 ]; let a31 = m[ 3 ][ 1 ]; let a32 = m[ 3 ][ 2 ]; let a33 = m[ 3 ][ 3 ];

	let b00 = a00 * a11 - a01 * a10;
	let b01 = a00 * a12 - a02 * a10;
	let b02 = a00 * a13 - a03 * a10;
	let b03 = a01 * a12 - a02 * a11;
	let b04 = a01 * a13 - a03 * a11;
	let b05 = a02 * a13 - a03 * a12;
	let b06 = a20 * a31 - a21 * a30;
	let b07 = a20 * a32 - a22 * a30;
	let b08 = a20 * a33 - a23 * a30;
	let b09 = a21 * a32 - a22 * a31;
	let b10 = a21 * a33 - a23 * a31;
	let b11 = a22 * a33 - a23 * a32;

	let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	return mat4x4<f32>(
		a11 * b11 - a12 * b10 + a13 * b09,
		a02 * b10 - a01 * b11 - a03 * b09,
		a31 * b05 - a32 * b04 + a33 * b03,
		a22 * b04 - a21 * b05 - a23 * b03,
		a12 * b08 - a10 * b11 - a13 * b07,
		a00 * b11 - a02 * b08 + a03 * b07,
		a32 * b02 - a30 * b05 - a33 * b01,
		a20 * b05 - a22 * b02 + a23 * b01,
		a10 * b10 - a11 * b08 + a13 * b06,
		a01 * b08 - a00 * b10 - a03 * b06,
		a30 * b04 - a31 * b02 + a33 * b00,
		a21 * b02 - a20 * b04 - a23 * b00,
		a11 * b07 - a10 * b09 - a12 * b06,
		a00 * b09 - a01 * b07 + a02 * b06,
		a31 * b01 - a30 * b03 - a32 * b00,
		a20 * b03 - a21 * b01 + a22 * b00
	) * ( 1.0 / det );

}

var nodeVar0 : vec4<f32>;
var nodeVar1 : mat4x4<f32>;

nodeVar0 = vec4<f32>( 0.0, 0.0, 0.0, 1.0 );

if ( ( nodeVarying0.x < 0.33 ) ) {

	nodeVar0 = vec4<f32>( ( mat4x4<f32>( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * tsl_inverse_mat4( mat4x4<f32>( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) )[ 0u ].xyz, 1.0 );

} else {

	if ( ( nodeVarying0.x < 0.66 ) ) {

		nodeVar0 = vec4<f32>( ( mat4x4<f32>( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * tsl_inverse_mat4( mat4x4<f32>( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) )[ 1u ].xyz, 1.0 );

	} else {

		nodeVar1 = ( mat4x4<f32>( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) * tsl_inverse_mat4( mat4x4<f32>( 1.0, 0.5, 0.0, 3.0, 0.0, 1.0, 0.25, -2.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0 ) ) );
		nodeVar0 = vec4<f32>( nodeVar1[ 2u ].xyz, 1.0 );

		if ( ( nodeVarying0.x < 0.33 ) ) {

			nodeVar0 = vec4<f32>( nodeVar1[ 0u ].xyz, 1.0 );

		} else {

			if ( ( nodeVarying0.x < 0.66 ) ) {

				nodeVar0 = vec4<f32>( nodeVar1[ 1u ].xyz, 1.0 );

			} else {

				nodeVar0 = vec4<f32>( nodeVar1[ 2u ].xyz, 1.0 );

			}

		}

	}

}

nodeVar0

// conditional

var nodeVar0 : f32;

nodeVar0 = 0.5;

if ( ( nodeVar0 > 0.0 ) ) {

	nodeVar0 = ( nodeVar0 * 2.0 );

} else {

	nodeVar0 = 0.0;

}

nodeVar0

// loop

var nodeVar0 : f32;

nodeVar0 = 0.0;

for ( var i : i32 = 0; i < 4; i ++ ) {

	nodeVar0 = ( nodeVar0 + f32( i ) );

}

nodeVar0

// function outside loop

var nodeVar0 : f32;
var nodeVar1 : f32;

nodeVar0 = 0.0;

for ( var i : i32 = 0; i < 4; i ++ ) {

	nodeVar1 = 0.0;

	for ( var i : i32 = 0; i < 3; i ++ ) {

		nodeVar1 = ( nodeVar1 + f32( i ) );

	}

	nodeVar0 = ( nodeVar0 + nodeVar1 );

}

nodeVar0

// function

fn fn2 ( value : f32 ) -> f32 {

	return ( value * value );

}

fn2( 3.0 )
