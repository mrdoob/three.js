/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "Face3" );

test( "copy", function() {
	var instance = new THREE.Face3(0, 1, 2, new THREE.Vector3(0, 1, 0), new THREE.Color(0.25, 0.5, 0.75), 2);
	var copiedInstance = instance.copy(instance);

	checkCopy(copiedInstance);
	checkVertexAndColors(copiedInstance);
});

test( "copy", function() {
	var instance = new THREE.Face3(0, 1, 2,
		[new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 1)],
		[new THREE.Color(0.25, 0.5, 0.75), new THREE.Color(1, 0, 0.4)],
		2);
	var copiedInstance = instance.copy(instance);

	checkCopy(copiedInstance);
	checkVertexAndColorArrays(copiedInstance);
});

test( "clone", function() {
	var instance = new THREE.Face3(0, 1, 2, new THREE.Vector3(0, 1, 0), new THREE.Color(0.25, 0.5, 0.75), 2);
	var copiedInstance = instance.clone();

	checkCopy(copiedInstance);
	checkVertexAndColors(copiedInstance);
});

function checkCopy(copiedInstance) {
	ok( copiedInstance instanceof THREE.Face3, "copy created the correct type" );
	ok(
		copiedInstance.a === 0 &&
		copiedInstance.b === 1 &&
		copiedInstance.c === 2 &&
		copiedInstance.materialIndex === 2
		,"properties where copied" );
}

function checkVertexAndColors(copiedInstance) {
	ok(
		copiedInstance.normal.x === 0 && copiedInstance.normal.y === 1 && copiedInstance.normal.z === 0 &&
		copiedInstance.color.r === 0.25 && copiedInstance.color.g === 0.5 && copiedInstance.color.b === 0.75
		,"properties where copied" );
}

function checkVertexAndColorArrays(copiedInstance) {
	ok(
		copiedInstance.vertexNormals[0].x === 0 && copiedInstance.vertexNormals[0].y === 1 && copiedInstance.vertexNormals[0].z === 0 &&
		copiedInstance.vertexNormals[1].x === 1 && copiedInstance.vertexNormals[1].y === 0 && copiedInstance.vertexNormals[1].z === 1 &&
		copiedInstance.vertexColors[0].r === 0.25 && copiedInstance.vertexColors[0].g === 0.5 && copiedInstance.vertexColors[0].b === 0.75 &&
		copiedInstance.vertexColors[1].r === 1 && copiedInstance.vertexColors[1].g === 0 && copiedInstance.vertexColors[1].b === 0.4
		,"properties where copied" );
}
