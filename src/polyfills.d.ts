// log handlers
export function warn(message?: any, ...optionalParams: any[]): void;
export function error(message?: any, ...optionalParams: any[]): void;
export function log(message?: any, ...optionalParams: any[]): void;

// typed array parameters
type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;
