/**
 *
 * Type and stride descriptors for math primitives
 *
 * @author bhouston / http://clara.io
 */

Object.assign( THREE.Color.prototype, {
  TypedArray: Float32Array,
  TypedStride: 3
});

Object.assign( THREE.Matrix3.prototype, {
  TypedArray: Float32Array,
  TypedStride: 9
});

Object.assign( THREE.Matrix4.prototype, {
  TypedArray: Float32Array,
  TypedStride: 16
});

Object.assign( THREE.Quaternion.prototype, {
  TypedArray: Float32Array,
  TypedStride: 4
});

Object.assign( THREE.Vector2.prototype, {
  TypedArray: Float32Array,
  TypedStride: 2
});

Object.assign( THREE.Vector3.prototype, {
  TypedArray: Float32Array,
  TypedStride: 3
});

Object.assign( THREE.Vector4.prototype, {
  TypedArray: Float32Array,
  TypedStride: 4
});
