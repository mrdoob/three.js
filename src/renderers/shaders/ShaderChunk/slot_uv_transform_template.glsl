uniform vec4 $SLOT_NAME$UVTransformParams;

vec2 $SLOT_NAME$UV() {
  vec2 value = $UV_VAR_NAME$;
  value.xy *= $SLOT_NAME$UVTransformParams.xy;
  value.xy += $SLOT_NAME$UVTransformParams.zw;
  return value;
}
