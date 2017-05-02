function mirror_sample(canvasId, iterationCount) {
        //this.devicePixelRatio = 1 so that this works on retina devices
        this.devicePixelRatio = 1; // Won't work on firefox on macbook retina though.
        if (iterationCount == null)
            iterationCount = 2
        // scene size
        var WIDTH = 1400;
        var HEIGHT = 800;

        // camera
        var VIEW_ANGLE = 45;
        var ASPECT = WIDTH / HEIGHT;
        var NEAR = 1;
        var FAR = 500;

        var camera, scane, renderer;

        var verticalMirror, groundMirror;
        var sphereGroup, smallSphere;

        function init() {

            // renderer
            renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
            renderer.setSize( WIDTH, HEIGHT );

            renderer.autoClear = true;
            renderer.setClearColor( 0x000000, 1 );

            // scene
            scene = new THREE.Scene();

            // camera
            camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
            camera.position.set( 0, 75, 160 );

            camera.lookAt( new THREE.Vector3( 0, 40, 0));

            var container = document.body;
            var canvas = renderer.domElement;
            canvas.setAttribute("id", canvasId);
            container.appendChild( canvas );
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            

        }

        function fillScene() {

            var planeGeo = new THREE.PlaneGeometry( 100.1, 100.1 );
            
           //MIRORR planes
            groundMirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color: 0x777777 } );
            
            var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
            mirrorMesh.add( groundMirror );
            mirrorMesh.rotateX( - Math.PI / 2 );
            scene.add( mirrorMesh );

            verticalMirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color:0x889999 } );
            
            var verticalMirrorMesh = new THREE.Mesh( new THREE.PlaneGeometry( 60, 60 ), verticalMirror.material );
            verticalMirrorMesh.add( verticalMirror );
            verticalMirrorMesh.position.y = 35;
            verticalMirrorMesh.position.z = -45;
            scene.add( verticalMirrorMesh );

            sphereGroup = new THREE.Object3D();
            scene.add( sphereGroup );

            var geometry = new THREE.CylinderGeometry( 0.1, 15 * Math.cos( Math.PI / 180 * 30 ), 0.1, 24, 1 );
            var material = new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0x444444 } );
            var sphereCap = new THREE.Mesh( geometry, material );
            sphereCap.position.y = -15 * Math.sin( Math.PI / 180 * 30 ) - 0.05;
            sphereCap.rotateX(-Math.PI);
            
            var geometry = new THREE.SphereGeometry( 15, 24, 24, Math.PI / 2, Math.PI * 2, 0, Math.PI / 180 * 120 );
            var halfSphere = new THREE.Mesh( geometry, material );
            halfSphere.add( sphereCap );
            halfSphere.rotateX( - Math.PI / 180 * 135 ); 
            halfSphere.rotateZ( - Math.PI / 180 * 20 ); 
            halfSphere.position.y = 7.5 + 15 * Math.sin( Math.PI / 180 * 30 );
            
            sphereGroup.add( halfSphere );
            
            var geometry = new THREE.IcosahedronGeometry( 5, 0 );
            var material = new THREE.MeshLambertMaterial( { color: 0xffffff, emissive: 0x333333, shading: THREE.FlatShading } );
            smallSphere = new THREE.Mesh( geometry, material );
            scene.add(smallSphere); 
            
            // walls
            var planeTop = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
            planeTop.position.y = 100;
            planeTop.rotateX( Math.PI / 2 );
            scene.add( planeTop );
            
            var planeBack = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
            planeBack.position.z = -50;
            planeBack.position.y = 50;
            scene.add( planeBack );
            
            var planeFront = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x7f7fff } ) );
            planeFront.position.z = 50;
            planeFront.position.y = 50;
            planeFront.rotateY( Math.PI );
            scene.add( planeFront );
            
            var planeRight = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ) );
            planeRight.position.x = 50;
            planeRight.position.y = 50;
            planeRight.rotateY( - Math.PI / 2 );
            scene.add( planeRight );
            
            var planeLeft = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xff0000 } ) );
            planeLeft.position.x = -50;
            planeLeft.position.y = 50;
            planeLeft.rotateY( Math.PI / 2 );
            scene.add( planeLeft );
            
            // lights
            var mainLight = new THREE.PointLight( 0xcccccc, 1.5, 250 );
            mainLight.position.y = 60;
            scene.add( mainLight );

            var greenLight = new THREE.PointLight( 0x00ff00, 0.25, 1000 );
            greenLight.position.set( 550, 50, 0 );
            scene.add( greenLight );

            var redLight = new THREE.PointLight( 0xff0000, 0.25, 1000 );
            redLight.position.set( - 550, 50, 0 );
            scene.add( redLight );

            var blueLight = new THREE.PointLight( 0x7f7fff, 0.25, 1000 );
            blueLight.position.set( 0, 50, 550 );
            scene.add( blueLight );

        }

        function render() {

            // render (update) the mirrors
            groundMirror.renderWithMirror( verticalMirror );
            verticalMirror.renderWithMirror( groundMirror );
            
            renderer.render(scene, camera);

        }

        function update() {
            
            var timer = 1;

            sphereGroup.rotation.y -= 0.002;

            smallSphere.position.set(
                Math.cos( timer * 0.1 ) * 30,
                Math.abs( Math.cos( timer * 0.2 ) ) * 20 + 5,
                Math.sin( timer * 0.1 ) * 30
            );
            smallSphere.rotation.y = ( Math.PI / 2 ) - timer * 0.1;
            smallSphere.rotation.z = timer * 0.8;

            
            render();
        }

        init();
        fillScene();
        while (iterationCount-- > 0) {
            update();
        }
}