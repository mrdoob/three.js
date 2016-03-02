uniform vec2 <SLOT_NAME>TexelTransformParams;

vec4 <SLOT_NAME>TexelTransform( vec4 value ) {
    value.rgb *= <SLOT_NAME>TexelTransformParams.x;
    value.rgb += vec3( <SLOT_NAME>TexelTransformParams.y );
    return value;
}
