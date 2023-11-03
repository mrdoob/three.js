class Info {

	constructor() {

		this.autoReset = true;

		this.frame = 0;
		this.calls = 0;

		this.render = {
			calls: 0,
			drawCalls: 0,
			triangles: 0,
			points: 0,
			lines: 0
		};

		this.compute = {
			calls: 0
		};

		this.memory = {
			geometries: 0,
			textures: 0
		};

	}

	update( object, count, instanceCount ) {

		this.render.drawCalls ++;

		if ( object.isMesh || object.isSprite ) {

			this.render.triangles += instanceCount * ( count / 3 );

		} else if ( object.isPoints ) {

			this.render.points += instanceCount * count;

		} else if ( object.isLineSegments ) {

			this.render.lines += instanceCount * ( count / 2 );

		} else if ( object.isLine ) {

			this.render.lines += instanceCount * ( count - 1 );

		} else {

			console.error( 'THREE.WebGPUInfo: Unknown object type.' );

		}

	}

	reset() {

		this.render.drawCalls = 0;
		this.render.triangles = 0;
		this.render.points = 0;
		this.render.lines = 0;

	}

	dispose() {

		this.reset();

		this.calls = 0;

		this.render.calls = 0;
		this.compute.calls = 0;

		this.memory.geometries = 0;
		this.memory.textures = 0;

	}

}


export default Info;
