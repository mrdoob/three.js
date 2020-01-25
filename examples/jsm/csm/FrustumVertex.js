export default class FrustumVertex {
	constructor(x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}

	fromLerp(v1, v2, amount) {
		this.x = (1 - amount) * v1.x + amount * v2.x;
		this.y = (1 - amount) * v1.y + amount * v2.y;
		this.z = (1 - amount) * v1.z + amount * v2.z;

		return this;
	}
}