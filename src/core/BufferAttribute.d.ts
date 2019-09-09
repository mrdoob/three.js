/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/BufferAttribute.js">src/core/BufferAttribute.js</a>
 */
export class BufferAttribute {

	constructor( array: ArrayLike<number>, itemSize: number, normalized?: boolean ); // array parameter should be TypedArray.

	name: string;
	array: ArrayLike<number>;
	itemSize: number;
	dynamic: boolean;
	updateRange: { offset: number; count: number };
	version: number;
	normalized: boolean;
	needsUpdate: boolean;
	count: number;
	onUpload: Function;

	setArray( array?: ArrayBufferView ): void;
	setDynamic( dynamic: boolean ): BufferAttribute;
	clone(): this;
	copy( source: BufferAttribute ): this;
	copyAt(
		index1: number,
		attribute: BufferAttribute,
		index2: number
	): BufferAttribute;
	copyArray( array: ArrayLike<number> ): BufferAttribute;
	copyColorsArray(
		colors: { r: number; g: number; b: number }[]
	): BufferAttribute;
	copyVector2sArray( vectors: { x: number; y: number }[] ): BufferAttribute;
	copyVector3sArray(
		vectors: { x: number; y: number; z: number }[]
	): BufferAttribute;
	copyVector4sArray(
		vectors: { x: number; y: number; z: number; w: number }[]
	): BufferAttribute;
	set(
		value: ArrayLike<number> | ArrayBufferView,
		offset?: number
	): BufferAttribute;
	getX( index: number ): number;
	setX( index: number, x: number ): BufferAttribute;
	getY( index: number ): number;
	setY( index: number, y: number ): BufferAttribute;
	getZ( index: number ): number;
	setZ( index: number, z: number ): BufferAttribute;
	getW( index: number ): number;
	setW( index: number, z: number ): BufferAttribute;
	setXY( index: number, x: number, y: number ): BufferAttribute;
	setXYZ( index: number, x: number, y: number, z: number ): BufferAttribute;
	setXYZW(
		index: number,
		x: number,
		y: number,
		z: number,
		w: number
	): BufferAttribute;
	/**
	 * @deprecated Use {@link BufferAttribute#count .count} instead.
	 */
	length: number;

}

/**
 * @deprecated THREE.Int8Attribute has been removed. Use new THREE.Int8BufferAttribute() instead.
 */
export class Int8Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Uint8Attribute has been removed. Use new THREE.Uint8BufferAttribute() instead.
 */
export class Uint8Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Uint8ClampedAttribute has been removed. Use new THREE.Uint8ClampedBufferAttribute() instead.
 */
export class Uint8ClampedAttribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Int16Attribute has been removed. Use new THREE.Int16BufferAttribute() instead.
 */
export class Int16Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Uint16Attribute has been removed. Use new THREE.Uint16BufferAttribute() instead.
 */
export class Uint16Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Int32Attribute has been removed. Use new THREE.Int32BufferAttribute() instead.
 */
export class Int32Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Uint32Attribute has been removed. Use new THREE.Uint32BufferAttribute() instead.
 */
export class Uint32Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Float32Attribute has been removed. Use new THREE.Float32BufferAttribute() instead.
 */
export class Float32Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

/**
 * @deprecated THREE.Float64Attribute has been removed. Use new THREE.Float64BufferAttribute() instead.
 */
export class Float64Attribute extends BufferAttribute {

	constructor( array: any, itemSize: number );

}

export class Int8BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Uint8BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Uint8ClampedBufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Int16BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Uint16BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Int32BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Uint32BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Float32BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}

export class Float64BufferAttribute extends BufferAttribute {

	constructor(
		array: Iterable<number> | ArrayLike<number> | ArrayBuffer,
		itemSize: number,
		normalized?: boolean
	);

}
