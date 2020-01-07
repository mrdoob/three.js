import { InterleavedBuffer } from './InterleavedBuffer';
import { Matrix4 } from './../math/Matrix4';
/**
 * @see <a href="https://github.com/mrdoob/three.js/blob/master/src/core/InterleavedBufferAttribute.js">src/core/InterleavedBufferAttribute.js</a>
 */
export class InterleavedBufferAttribute {

	constructor(
		interleavedBuffer: InterleavedBuffer,
		itemSize: number,
		offset: number,
		normalized?: boolean
	);

	data: InterleavedBuffer;
	itemSize: number;
	offset: number;
	normalized: boolean;

	get count(): number;
	get array(): ArrayLike<number>;

	isInterleavedBufferAttribute: true;

	applyMatrix4( m: Matrix4 ): this;
	getX( index: number ): number;
	setX( index: number, x: number ): InterleavedBufferAttribute;
	getY( index: number ): number;
	setY( index: number, y: number ): InterleavedBufferAttribute;
	getZ( index: number ): number;
	setZ( index: number, z: number ): InterleavedBufferAttribute;
	getW( index: number ): number;
	setW( index: number, z: number ): InterleavedBufferAttribute;
	setXY( index: number, x: number, y: number ): InterleavedBufferAttribute;
	setXYZ(
		index: number,
		x: number,
		y: number,
		z: number
	): InterleavedBufferAttribute;
	setXYZW(
		index: number,
		x: number,
		y: number,
		z: number,
		w: number
	): InterleavedBufferAttribute;

}
