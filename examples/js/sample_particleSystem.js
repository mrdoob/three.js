var scene, camera, renderer, ray, controls, plot,
    particleSystem, projector, intersects, INTERSECTED, SELECTEDITEMS = [];
var mouseDowned = false;
var data = [];
var lengthOfItems = 70000;
var itemSize = 3, particleSize = 8;
var bounds =
{
    'maxx' : 500,
    'minx' : -500,
    'maxy' : 500,
    'miny' : -500,
    'maxz' : 500,
    'minz' : -500
};
var positionStartEnd = {
    'sx': 0,
    'sy': 0,
    'sz': 0,
    'ex': 0,
    'ey': 0,
    'ez': 0
};
var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    OFFSETTOP = 0,
    OFFSETLEFT = 0;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 50000;
var RADIUS = ( SCREEN_WIDTH + SCREEN_HEIGHT ) / 4;
var mouse = new THREE.Vector3();
var xAxisGeo = new THREE.Geometry();
var yAxisGeo = new THREE.Geometry();
var zAxisGeo = new THREE.Geometry();
var boundaryGeo = new THREE.Geometry();

var fovMAX = 160;
var fovMIN = 1;
var Scube, Sball;
var rotateValue = 65000;
var gui_options = {
  Lasso:false,
	clearSelection: function() {
		try {
			plot.remove(Sball);
		} catch(e) {
			console.log(e);
		}
		SELECTEDITEMS = [];
	},
	resetCamera : function() {
		controls.reset();
	}
}
var gui = new dat.GUI({resizable:false});
gui.add(gui_options, "Lasso");
gui.add(gui_options, "clearSelection").name("Clear Selection");
gui.add(gui_options, "resetCamera").name("Reset Camera");

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.z = bounds.maxz * 4;
    camera.position.x = 0;
    camera.position.y = bounds.maxy * 1.25;
    camera.lookAt(scene.position);
    controls = new THREE.TrackballControls(camera);
    scene.add(camera);
    plot = new THREE.Object3D();
	scene.add(plot);
    
    var xAxisGeo = new THREE.Geometry();
	var yAxisGeo = new THREE.Geometry();
	var zAxisGeo = new THREE.Geometry();
	var boundaryGeo = new THREE.Geometry();
	
	xAxisGeo.vertices.push(v(bounds.minx, 0, 0), v(bounds.maxx, 0, 0));
	yAxisGeo.vertices.push(v(0, bounds.miny, 0), v(0, bounds.maxy, 0));
	zAxisGeo.vertices.push(v(0, 0, bounds.minz), v(0, 0, bounds.maxz));
	boundaryGeo.vertices.push(
        v(bounds.minx, bounds.maxy, bounds.minz), v(bounds.maxx, bounds.maxy, bounds.minz),
        v(bounds.minx, bounds.miny, bounds.minz), v(bounds.maxx, bounds.miny, bounds.minz),
        v(bounds.minx, bounds.maxy, bounds.maxz), v(bounds.maxx, bounds.maxy, bounds.maxz),
        v(bounds.minx, bounds.miny, bounds.maxz), v(bounds.maxx, bounds.miny, bounds.maxz),
      
        v(bounds.minx, 0, bounds.maxz), v(bounds.maxx, 0, bounds.maxz),
        v(bounds.minx, 0, bounds.minz), v(bounds.maxx, 0, bounds.minz),
        v(bounds.minx, bounds.maxy, 0), v(bounds.maxx, bounds.maxy, 0),
        v(bounds.minx, bounds.miny, 0), v(bounds.maxx, bounds.miny, 0),
      
        v(bounds.maxx, bounds.miny, bounds.minz), v(bounds.maxx, bounds.maxy, bounds.minz),
        v(bounds.minx, bounds.miny, bounds.minz), v(bounds.minx, bounds.maxy, bounds.minz),
        v(bounds.maxx, bounds.miny, bounds.maxz), v(bounds.maxx, bounds.maxy, bounds.maxz),
        v(bounds.minx, bounds.miny, bounds.maxz), v(bounds.minx, bounds.maxy, bounds.maxz),
      
        v(0, bounds.miny, bounds.maxz), v(0, bounds.maxy, bounds.maxz),
        v(0, bounds.miny, bounds.minz), v(0, bounds.maxy, bounds.minz),
        v(bounds.maxx, bounds.miny, 0), v(bounds.maxx, bounds.maxy, 0),
        v(bounds.minx, bounds.miny, 0), v(bounds.minx, bounds.maxy, 0),
      
        v(bounds.maxx, bounds.maxy, bounds.minz), v(bounds.maxx, bounds.maxy, bounds.maxz),
        v(bounds.maxx, bounds.miny, bounds.minz), v(bounds.maxx, bounds.miny, bounds.maxz),
        v(bounds.minx, bounds.maxy, bounds.minz), v(bounds.minx, bounds.maxy, bounds.maxz),
        v(bounds.minx, bounds.miny, bounds.minz), v(bounds.minx, bounds.miny, bounds.maxz),
      
        v(bounds.minx, 0, bounds.minz), v(bounds.minx, 0, bounds.maxz),
        v(bounds.maxx, 0, bounds.minz), v(bounds.maxx, 0, bounds.maxz),
        v(0, bounds.maxy, bounds.minz), v(0, bounds.maxy, bounds.maxz),
        v(0, bounds.miny, bounds.minz), v(0, bounds.miny, bounds.maxz)
	);
	
	//DRAWING LINES
  	var xAxisMat = new THREE.LineBasicMaterial({color: 0xff0000, lineWidth: 1});
	var xAxis = new THREE.Line(xAxisGeo, xAxisMat);
	xAxis.type = THREE.Lines;
	plot.add(xAxis);
	
	var yAxisMat = new THREE.LineBasicMaterial({color: 0x0000ff, lineWidth: 1});
	var yAxis = new THREE.Line(yAxisGeo, yAxisMat);
	yAxis.type = THREE.Lines;
	plot.add(yAxis);
		  
	var zAxisMat = new THREE.LineBasicMaterial({color: 0x00ff00, lineWidth: 1});
	var zAxis = new THREE.Line(zAxisGeo, zAxisMat);
	zAxis.type = THREE.Lines;
	plot.add(zAxis);
	
	var boundaryMat = new THREE.LineBasicMaterial({color: 0x090909, lineWidth: 1, transparent: true});
	var boundary = new THREE.Line(boundaryGeo, boundaryMat);
	boundary.type = THREE.Lines;
    plot.add(boundary);
    
    projector = new THREE.Projector();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);
    ray = new THREE.Raycaster();
    var particles = data.length;
    
    var radius = 1;
	var geometry = new THREE.Geometry();
    var zes = [], nn = 0, nu = 0;
    var z1 = particleSize;
    for ( var i = 0; i < lengthOfItems; i++ ) {
        var x1 = data[i][0];
        var y1 = data[i][1];
        var intX1 = parseInt(x1);
        var intY1 = parseInt(y1);
        if (zes[intX1, intY1] != null) {
            //nn += 1;
            z1 = zes[intX1, intY1] + particleSize;
        } else {
            //nu += 1;
            z1 = particleSize;
        }
        zes[intX1, intY1] = z1;
        var vertex = new THREE.Vector3();
        vertex.x = x1;
        vertex.y = y1;
        vertex.z = z1;
        vertex.multiplyScalar(radius);
        geometry.vertices.push( vertex );
    }

    var sprite = THREE.ImageUtils.loadTexture("ball.png");
    var material = new THREE.ParticleBasicMaterial( { size: particleSize, depthTest: false, transparent : true, map: sprite });
    particleSystem = new THREE.ParticleSystem( geometry, material );
    plot.add( particleSystem );
    
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
}

function main() {
    data = generateData(lengthOfItems);
    console.log("Data generated!");
    init();
    console.log("Initialized!");
    run();
}

function run()
{
    requestAnimationFrame(run);
    render();
    update();
}

function captureParticle() {
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
    projector.unprojectVector( vector, camera );
    var origin = camera.position;
    var direction = vector.sub(camera.position).normalize();
	ray.set(origin, direction);

    var intersects = ray.intersectObjects([particleSystem]);
	return intersects;
}

function render()
{   
    renderer.render( scene, camera );
}

function update()
{
	if (gui_options.Lasso == false) {
		controls.update();
	}
}

function generateData(count) {
    var randomData = [];
    for (var i = 0;i < count; i++)
    {
        randomData.push([Math.random() * 500, Math.random() * 500]);
    }
    return randomData;
}

function onMouseMove(event) {
	if (gui_options.Lasso && mouseDowned) {
		event.preventDefault();
		mouse = getMousePosition(event.clientX, event.clientY);
		var tmp_intersected = captureParticle();
		if (tmp_intersected.length > 0) {
			SELECTEDITEMS = SELECTEDITEMS.concat(tmp_intersected);
		}
	}
}

function onMouseDown(event) {
	if (gui_options.Lasso) {
		
		mouseDowned = true;
		event.preventDefault();
		mouse = getMousePosition(event.clientX, event.clientY);

		var tmp_intersected = captureParticle();
		if (tmp_intersected.length > 0) {

			SELECTEDITEMS = SELECTEDITEMS.concat(tmp_intersected);

		}
	}
}

function onMouseUp(event) {
	if (gui_options.Lasso) {
		console.log("finished!");
		mouseDowned = false;
		event.preventDefault();
		mouse = getMousePosition(event.clientX, event.clientY);
		var tmp_intersected = captureParticle();

		if (tmp_intersected.length > 0) {
			
			var SIgeometry = new THREE.Geometry();
			var SIsprite = THREE.ImageUtils.loadTexture("ball.blue1.png");
			var SImaterial = new THREE.ParticleBasicMaterial( { size: particleSize, depthTest: false, transparent: true, map: SIsprite });
			
			SELECTEDITEMS = SELECTEDITEMS.concat(tmp_intersected);
			SIgeometry.vertices = collectVertices(SELECTEDITEMS);
			
			try {
				plot.remove(Sball);
			} catch(e) {
				console.log(e);
			}
			
			Sball = new THREE.ParticleSystem(SIgeometry, SImaterial);
			plot.add(Sball);
		}
	}
}

function collectVertices(items) {
	var tmp_v = [];
	for (var i = 0; i < items.length; i++) {
		tmp_v.push(items[i].point);
	}
	return tmp_v;
}

function getCalculatedPosition(clientX, clientY) {
    var vector = new THREE.Vector3((clientX / SCREEN_WIDTH ) * 2 - 1,
        - (clientY / SCREEN_HEIGHT) * 2 + 1,
        0.5);
    projector.unprojectVector(vector, camera);
    var dir = vector.sub(camera.position).normalize();
    var ray = new THREE.Raycaster(camera.position, dir);
    var distance = - camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    return pos;
}

function getMousePosition(clientX, clientY) {
	var vector = new THREE.Vector3((clientX / SCREEN_WIDTH ) * 2 - 1,
        - (clientY / SCREEN_HEIGHT) * 2 + 1,
        0.5);
	return vector;
}

function v(x,y,z){
  return new THREE.Vector3(x,y,z);
}

main();
