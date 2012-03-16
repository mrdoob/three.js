/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 *	modified from the TorusKnotGeometry by @oosmoxiecode
 *
 * Creates a tube which extrudes along a 3d spline
 */

THREE.TubeGeometry = function(radius, segments, segmentsRadius, path) {

	THREE.Geometry.call(this);

	var scope = this;

	this.radius = radius || 40;
	this.segments = segments || 64;
	this.segmentsRadius = segmentsRadius || 8;
	this.grid = new Array(this.segments);
	this.path = path;

	var tang = new THREE.Vector3();

	var binormal = new THREE.Vector3();

	var normal = new THREE.Vector3();

	var pos = new THREE.Vector3();

	var epsilon = 0.001;

	var u, v;

	var p1, p2;
	var cx, cy;

	var oldB;

	for (var i = 0; i < this.segments; ++i) {

		this.grid[i] = new Array(this.segmentsRadius);

		u = i / this.segments;

		var pos = this.path.getPointAt(u);
		tang = this.path.getTangentAt(u);

		if (oldB === undefined) {
			//arbitrary vector
			//oldB = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
			//oldB = new THREE.Vector3( 0, -1, 0 ); // test to see what happens to a known binormal vector

			// Find the smallest componenet of the tangent vector (x, y, or z) and set the binormal
			// equal to the unit vector in that direction ((1, 0, 0), (0, 1, 0), or (0, 0, 1))
			var smallest = Number.MAX_VALUE;
			var x, y, z;
			var tx = Math.abs(tang.x);
			var ty = Math.abs(tang.y);
			var tz = Math.abs(tang.z);

			if (tx <= smallest) {
				smallest = tx;

				x = 1;
				y = 0;
				z = 0;
			}

			if (ty <= smallest) {
				smallest = ty;

				x = 0;
				y = 1;
				z = 0;
			}

			if (tz <= smallest) {

				x = 0;
				y = 0;
				z = 1;
			}

			oldB = new THREE.Vector3(x, y, z);
		}
		normal.cross(oldB, tang).normalize();
		binormal.cross(tang, normal).normalize();
		oldB = binormal;


		addArrow(parent, pos, normal, radius * 2, 0xffff00);

		for (var j = 0; j < this.segmentsRadius; ++j) {

			v = j / this.segmentsRadius * 2 * Math.PI;

			cx = this.radius * Math.cos(v); // TODO: Hack: Negating it so it faces outside.
			cy = this.radius * Math.sin(v);

            var pos2 = new THREE.Vector3().copy(pos);
            pos2.x += cx * normal.x + cy * binormal.x;
            pos2.y += cx * normal.y + cy * binormal.y;
            pos2.z += cx * normal.z + cy * binormal.z;

            this.grid[i][j] = vert(pos2.x, pos2.y, pos2.z);

		}
	}

	for (var i = 0; i < this.segments - 1; ++i) {

		for (var j = 0; j < this.segmentsRadius; ++j) {

			var ip = (i + 1) % this.segments;
			var jp = (j + 1) % this.segmentsRadius;

			var a = this.grid[i][j];
			var b = this.grid[ip][j];
			var c = this.grid[ip][jp];
			var d = this.grid[i][jp];

			var uva = new THREE.UV(i / this.segments, j / this.segmentsRadius);
			var uvb = new THREE.UV((i + 1) / this.segments, j / this.segmentsRadius);
			var uvc = new THREE.UV((i + 1) / this.segments, (j + 1) / this.segmentsRadius);
			var uvd = new THREE.UV(i / this.segments, (j + 1) / this.segmentsRadius);

			this.faces.push(new THREE.Face4(a, b, c, d));
			this.faceVertexUvs[0].push([uva, uvb, uvc, uvd]);

		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	function vert(x, y, z) {
		return scope.vertices.push(new THREE.Vertex(new THREE.Vector3(x, y, z))) - 1;
	}

	function getPathPos(u, path) {
		return path.getPoint(u);
	}

};

THREE.TubeGeometry.prototype = new THREE.Geometry();
THREE.TubeGeometry.prototype.constructor = THREE.TubeGeometry;