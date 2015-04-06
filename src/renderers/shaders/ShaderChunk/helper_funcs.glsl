float square( in float a ) { return a * a; }
vec2  square( in vec2 a )  { return a * a; }
vec3  square( in vec3 a )  { return a * a; }
vec4  square( in vec4 a )  { return a * a; }
float saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }
vec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }
vec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }
vec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }
float average( in float a ) { return a; }
float average( in vec2 a )  { return ( a.x + a.y) * 0.5; }
float average( in vec3 a )  { return ( a.x + a.y + a.z) / 3.0; }
float average( in vec4 a )  { return ( a.x + a.y + a.z + a.w) * 0.25; }
float whiteCompliment( in float a ) { return saturate( 1.0 - a ); }
vec2  whiteCompliment( in vec2 a )  { return saturate( 1.0 - a ); }
vec3  whiteCompliment( in vec3 a )  { return saturate( 1.0 - a ); }
vec4  whiteCompliment( in vec4 a )  { return saturate( 1.0 - a ); }