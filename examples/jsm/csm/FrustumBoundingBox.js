export default class FrustumBoundingBox {
	constructor() {
		this.min = {
			x: 0,
			y: 0,
			z: 0
		};
		this.max = {
			x: 0,
			y: 0,
			z: 0
		};
	}

	fromFrustum(frustum) {
		const vertices = [];

		for(let i = 0; i < 4; i++) {
			vertices.push(frustum.vertices.near[i]);
			vertices.push(frustum.vertices.far[i]);
		}

		this.min = {
			x: vertices[0].x,
			y: vertices[0].y,
			z: vertices[0].z
		};
		this.max = {
			x: vertices[0].x,
			y: vertices[0].y,
			z: vertices[0].z
		};

		for(let i = 1; i < 8; i++) {
			this.min.x = Math.min(this.min.x, vertices[i].x);
			this.min.y = Math.min(this.min.y, vertices[i].y);
			this.min.z = Math.min(this.min.z, vertices[i].z);
			this.max.x = Math.max(this.max.x, vertices[i].x);
			this.max.y = Math.max(this.max.y, vertices[i].y);
			this.max.z = Math.max(this.max.z, vertices[i].z);
		}
		
		return this;
	}

	getSize() {
		this.size = {
			x: this.max.x - this.min.x,
			y: this.max.y - this.min.y,
			z: this.max.z - this.min.z
		};

		return this.size;
	}

	getCenter(margin) {
		this.center = {
			x: (this.max.x + this.min.x) / 2,
			y: (this.max.y + this.min.y) / 2,
			z: this.max.z + margin
		};

		return this.center;
	}
}