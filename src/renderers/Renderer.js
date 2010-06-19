/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Renderer = function() {

	var face3Pool = [],
	face4Pool = [],
	linePool = [],
	particlePool = [],

	matrix = new THREE.Matrix4();

	function painterSort(a, b) {

		return a.screenZ - b.screenZ;

	}

	this.renderList = null;

	this.project = function (scene, camera) {

		var i, j, vertex, vertex2, face, object, v1, v2, v3, v4,
		face3count = 0, face4count = 0, lineCount = 0, particleCount = 0,
		camerafocus = camera.focus, focuszoom = camera.focus * camera.zoom,
		verticesLength = 0, facesLength = 0;

		this.renderList = [];

		if(camera.autoUpdateMatrix) {

			camera.updateMatrix();

		}

		for (i = 0; i < scene.objects.length; i++) {

			object = scene.objects[i];

			if(object.autoUpdateMatrix) {

				object.updateMatrix();

			}

			if (object instanceof THREE.Mesh) {

				matrix.multiply(camera.matrix, object.matrix);

				// vertices

				verticesLength = object.geometry.vertices.length;

				for (j = 0; j < verticesLength; j++) {

					vertex = object.geometry.vertices[j];

					vertex.screen.copy(vertex.position);

					matrix.transform(vertex.screen);

					vertex.screen.z = focuszoom / (camerafocus + vertex.screen.z);

					vertex.__visible = vertex.screen.z > 0;

					vertex.screen.x *= vertex.screen.z;
					vertex.screen.y *= vertex.screen.z; 

				}

				// faces

				facesLength = object.geometry.faces.length;

				for (j = 0; j < facesLength; j++) {

					face = object.geometry.faces[j];

					// TODO: Use normals for culling

					if (face instanceof THREE.Face3) {

						v1 = object.geometry.vertices[face.a];
						v2 = object.geometry.vertices[face.b];
						v3 = object.geometry.vertices[face.c];

						if (v1.__visible && v2.__visible && v3.__visible && (object.doubleSided ||
						   (v3.screen.x - v1.screen.x) * (v2.screen.y - v1.screen.y) -
						   (v3.screen.y - v1.screen.y) * (v2.screen.x - v1.screen.x) > 0) ) {

							face.screen.z = (v1.screen.z + v2.screen.z + v3.screen.z) * 0.3;

							if (!face3Pool[face3count]) {

								face3Pool[face3count] = new THREE.RenderableFace3();

							}

							face3Pool[face3count].v1.x = v1.screen.x;
							face3Pool[face3count].v1.y = v1.screen.y;
							face3Pool[face3count].v2.x = v2.screen.x;
							face3Pool[face3count].v2.y = v2.screen.y;
							face3Pool[face3count].v3.x = v3.screen.x;
							face3Pool[face3count].v3.y = v3.screen.y;
							face3Pool[face3count].screenZ = face.screen.z;

							face3Pool[face3count].material = object.material;
							face3Pool[face3count].uvs = object.geometry.uvs[j];
							face3Pool[face3count].color = face.color;

							this.renderList.push(face3Pool[face3count]);

							face3count++;
						}

					} else if (face instanceof THREE.Face4) {

						v1 = object.geometry.vertices[face.a];
						v2 = object.geometry.vertices[face.b];
						v3 = object.geometry.vertices[face.c];
						v4 = object.geometry.vertices[face.d];

						if (v1.__visible && v2.__visible && v3.__visible && v4.__visible && (object.doubleSided ||
						   ((v4.screen.x - v1.screen.x) * (v2.screen.y - v1.screen.y) -
						   (v4.screen.y - v1.screen.y) * (v2.screen.x - v1.screen.x) > 0 ||
						   (v2.screen.x - v3.screen.x) * (v4.screen.y - v3.screen.y) -
						   (v2.screen.y - v3.screen.y) * (v4.screen.x - v3.screen.x) > 0)) ) {

							face.screen.z = (v1.screen.z + v2.screen.z + v3.screen.z + v4.screen.z) * 0.25;

							if (!face4Pool[face4count]) {

								face4Pool[face4count] = new THREE.RenderableFace4();

							}

							face4Pool[face4count].v1.x = v1.screen.x;
							face4Pool[face4count].v1.y = v1.screen.y;
							face4Pool[face4count].v2.x = v2.screen.x;
							face4Pool[face4count].v2.y = v2.screen.y;
							face4Pool[face4count].v3.x = v3.screen.x;
							face4Pool[face4count].v3.y = v3.screen.y;
							face4Pool[face4count].v4.x = v4.screen.x;
							face4Pool[face4count].v4.y = v4.screen.y;
							face4Pool[face4count].screenZ = face.screen.z;

							face4Pool[face4count].material = object.material;
							face4Pool[face4count].uvs = object.geometry.uvs[j];
							face4Pool[face4count].color = face.color;

							this.renderList.push(face4Pool[face4count]);

							face4count++;
						}
					}
				}

			} else if (object instanceof THREE.Line) {

				matrix.multiply(camera.matrix, object.matrix);

				verticesLength = object.geometry.vertices.length;

				for (j = 0; j < verticesLength; j++) {

					vertex = object.geometry.vertices[j];

					vertex.screen.copy(vertex.position);

					matrix.transform(vertex.screen);

					vertex.screen.z = focuszoom / (camerafocus + vertex.screen.z);

					vertex.visible = vertex.screen.z > 0;

					vertex.screen.x *= vertex.screen.z;
					vertex.screen.y *= vertex.screen.z;

					if (j > 0) {

						vertex2 = object.geometry.vertices[j-1];

						if (!vertex.visible || !vertex2.visible) {

							continue;
						}

						if (!linePool[lineCount]) {

							linePool[lineCount] = new THREE.RenderableLine();

						}

						linePool[lineCount].v1.x = vertex.screen.x;
						linePool[lineCount].v1.y = vertex.screen.y;
						linePool[lineCount].v2.x = vertex2.screen.x;
						linePool[lineCount].v2.y = vertex2.screen.y;
						linePool[lineCount].screenZ = (vertex.screen.z + vertex2.screen.z) * 0.5;
						linePool[lineCount].material = object.material;

						this.renderList.push( linePool[lineCount] );

						lineCount++;
					}
				}

			} else if (object instanceof THREE.Particle) {

				object.screen.copy(object.position);

				camera.matrix.transform(object.screen);

				object.screen.z = focuszoom / (camerafocus + object.screen.z);

				if (object.screen.z < 0) {

					continue;
				}

				object.screen.x *= object.screen.z;
				object.screen.y *= object.screen.z;

				if (!particlePool[particleCount]) {

					particlePool[particleCount] = new THREE.RenderableParticle();

				}

				particlePool[particleCount].x = object.screen.x;
				particlePool[particleCount].y = object.screen.y;
				particlePool[particleCount].screenZ = object.screen.z;

				particlePool[particleCount].size = object.size;
				particlePool[particleCount].material = object.material;
				particlePool[particleCount].color = object.color;

				this.renderList.push( particlePool[particleCount] );

				particleCount++;
			}
		}

		this.renderList.sort(painterSort);

	};

};
