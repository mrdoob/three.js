# THREEJS Benchmark Suite

## Setup

- Execute `npm install` from test/benchmark/ folder

## Run

The benchmarks are run in the browser.

- Browser: Execute `npm start` (or run any other local web sever) from root folder and access `https://localhost:8080/test/benchmark/benchmarks.html` on web browser. (See [How to run things locally](https://threejs.org/docs/#manual/introduction/How-to-run-things-locally))

### Example: Adding a New Suite

For adding a new Tests we need two things
 - Adding the Test File
 - Linking it on the benchmark.html page

Some example could be like this
```javascript
(function() {
  // We want to make sure THREE.JS is loaded for this Benchmark
  var THREE
  if (Bench.isTHREELoaded()) {
    THREE = Bench.THREE;
  } else {
    Bench.warning("Test Example Benchmark not loaded because THREEJS was not loaded");
    return;
  }

  var s = Bench.newSuite("Example Benchmark Distance Calculation");

  var v2a = new THREE.Vector2(3.0, 3.0);
  var v2b = new THREE.Vector2(9.0, -3.0);

  var v3a = new THREE.Vector3(3.0, 3.0, 0.0);
  var v3b = new THREE.Vector3(9.0, -3.0, 0.0);

  s.add("Vector3", function() {
    v3a.distanceTo(v3b);
  })

  s.add("Vector2", function() {
    v2a.distanceTo(v2b);

  })
})();
```

Remember that THREEJS library is only accesible via `Bench.THREE`
