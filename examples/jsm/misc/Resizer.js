import { Vector2 } from "../../../build/three.module.js";

/**
 * An auto sizing constant.
 *
 * @type {Number}
 * @private
 */

const AUTO_SIZE = -1;

/**
 * A resizer that can be used to store a base and a target resolution.
 *
 * The attached resizeable will be updated with the base resolution when the
 * target resolution changes. The new calculated resolution can then be
 * retrieved via {@link Resizer.width} and {@link Resizer.height}.
 */

export class Resizer {

	/**
	 * Constructs a new resizer.
	 *
	 * @param {Resizable} resizeable - A resizable object.
	 * @param {Number} [width=Resizer.AUTO_SIZE] - The width.
	 * @param {Number} [height=Resizer.AUTO_SIZE] - The height.
	 * @param {Number} [scale=1.0] - An alternative resolution scale.
	 */

	constructor(resizable, width = AUTO_SIZE, height = AUTO_SIZE, scale = 1.0) {

		/**
		 * A resizable object.
		 *
		 * @type {Resizable}
		 */

		this.resizable = resizable;

		/**
		 * The base size.
		 *
		 * This size will be passed to the resizable object every time the target
		 * width, height or scale is changed.
		 *
		 * @type {Vector2}
		 */

		this.base = new Vector2(1, 1);

		/**
		 * The target size.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.target = new Vector2(width, height);

		/**
		 * A scale.
		 *
		 * If both the width and the height are set to {@link Resizer.AUTO_SIZE},
		 * they will be scaled uniformly using this scalar.
		 *
		 * @type {Number}
		 * @private
		 */

		this.s = scale;

	}

	/**
	 * The current resolution scale.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.s;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * Also sets the width and height to {@link Resizer.AUTO_SIZE}.
	 *
	 * @type {Number}
	 */

	set scale(value) {

		this.s = value;

		this.target.x = AUTO_SIZE;
		this.target.y = AUTO_SIZE;

		this.resizable.setSize(this.base.x, this.base.y);

	}

	/**
	 * The calculated width.
	 *
	 * If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
	 * base width will be returned.
	 *
	 * @type {Number}
	 */

	get width() {

		const base = this.base;
		const target = this.target;

		let result;

		if(target.x !== AUTO_SIZE) {

			result = target.x;

		} else if(target.y !== AUTO_SIZE) {

			result = Math.round(target.y * (base.x / base.y));

		} else {

			result = Math.round(base.x * this.s);

		}

		return result;

	}

	/**
	 * Sets the target width.
	 *
	 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based
	 * on the height and the original aspect ratio.
	 *
	 * @type {Number}
	 */

	set width(value) {

		this.target.x = value;
		this.resizable.setSize(this.base.x, this.base.y);

	}

	/**
	 * The calculated height.
	 *
	 * If both the width and the height are set to {@link Resizer.AUTO_SIZE}, the
	 * base height will be returned.
	 *
	 * @type {Number}
	 */

	get height() {

		const base = this.base;
		const target = this.target;

		let result;

		if(target.y !== AUTO_SIZE) {

			result = target.y;

		} else if(target.x !== AUTO_SIZE) {

			result = Math.round(target.x / (base.x / base.y));

		} else {

			result = Math.round(base.y * this.s);

		}

		return result;

	}

	/**
	 * Sets the target height.
	 *
	 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based
	 * on the width and the original aspect ratio.
	 *
	 * @type {Number}
	 */

	set height(value) {

		this.target.y = value;
		this.resizable.setSize(this.base.x, this.base.y);

	}

	/**
	 * An auto sizing constant.
	 *
	 * Can be used to automatically calculate the width or height based on the
	 * original aspect ratio.
	 *
	 * @type {Number}
	 */

	static get AUTO_SIZE() {

		return AUTO_SIZE;

	}

}
