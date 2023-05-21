import { OBJLoader } from "../examples/jsm/loaders/OBJLoaderStartsWith.js";
import cube from "./cube.js";
import cubeHalfTriangles from "./cubeHalfTriangles.js";

const objLoader = new OBJLoader();

const numberOfTrials = 100_000;
for (let i = 1; i <= numberOfTrials; i++) {
	objLoader.parse(cube);
	objLoader.parse(cubeHalfTriangles);
}

/*
three.js/test$ time node startsWithSpeedTest.js

real    0m9.323s
user    0m9.427s
sys     0m0.152s

three.js/test$ time node startsWithSpeedTest.js

real    0m10.647s
user    0m10.761s
sys     0m0.151s

three.js/test$ time node startsWithSpeedTest.js

real    0m8.328s
user    0m8.454s
sys     0m0.091s
 */
