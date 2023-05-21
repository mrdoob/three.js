import { OBJLoader } from "../examples/jsm/loaders/OBJLoader.js";
import cube from "./cube.js";
import cubeHalfTriangles from "./cubeHalfTriangles.js";

const objLoader = new OBJLoader();

const numberOfTrials = 100_000;
for (let i = 1; i <= numberOfTrials; i++) {
	objLoader.parse(cube);
	objLoader.parse(cubeHalfTriangles);
}

/*
three.js/test$ time node charAtSpeedTest.js

real    0m10.305s
user    0m10.486s
sys     0m0.111s

three.js/test$ time node charAtSpeedTest.js

real    0m11.030s
user    0m11.179s
sys     0m0.131s

three.js/test$ time node charAtSpeedTest.js

real    0m8.776s
user    0m8.887s
sys     0m0.112s
*/
