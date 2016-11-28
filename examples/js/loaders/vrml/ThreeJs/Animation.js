/**
 * @author Bart McLeod, mcleod@spaceweb.nl
 * @since May 25, 2016
 *
 * @todo: Understand http://threejs.org/docs/#Reference/Extras.Animation/AnimationHandler, this code might duplicate for example removing an animation from the update loop
 *
 * Adds animation and interaction support to the VrmlParser.Renderer.ThreeJs
 */

/**
 * Offers support for interaction and animation.
 *
 * Currently support clicking an object and seeing a log message for that.
 *
 * Also, in debug mode, a blue line will be drawn from the perspective camera to the clicked point.
 * You can see this line when zooming out after clicking and object.
 *
 * @param debug
 * @constructor
 */
VrmlParser.Renderer.ThreeJs['Animation'] = function (debug) {
  // use global camera, scene and renderer ( a weakness, I think )
  this.debug = debug ? true : false;
  this.animations = {};
};

VrmlParser.Renderer.ThreeJs.Animation.prototype = {
  /**
   * Updates or registered animations with a delta from the global clock.
   *
   * @param delta
   */
  update: function (delta) {
    for ( var a in this.animations ) {
      if ( !this.animations.hasOwnProperty(a) ) {
        continue;
      }
      var callback = this.animations[a];
      callback(delta);
    }
  },

  /**
   * Register a callback for the animations, it will be called at each tick with a delta
   * from the global clock.
   *
   * @param name
   * @param callback
   */
  addAnimation: function (name, callback) {
    this.animations[name] = callback;
  },

  /**
   * Unregister a callback for the animations.
   * @param name
   */
  removeAnimation: function (name) {
    delete this.animations[name];
  },

  /**
   * Gets all routes that were registered for a sensor in the original VRML world.
   *
   * Returned routes have a source and target object. Each have a name and event property.
   *
   * @param string name Name of the source node of the event.
   * @returns {*}
   */
  getRoutesForEvent: function (name) {
    var routesRegistry = scene.userData.routes;
    var routes = routesRegistry[name];
    //this.log('The routes are:');

    for ( var r = 0; r < routes.length; r++ ) {
      //this.log(routes[r]);
    }
    return routes;
  },

  /**
   * Recursively finds all targetroutes for a given route.
   *
   * @param triggerRoute
   * @returns {boolean}
   */
  findTargetRoutes: function (triggerRoute) {
    var targetRoutes = [];

    if ( 'undefined' === typeof triggerRoute ) {
      return targetRoutes;
    }

    var routesRegistry = scene.userData.routes;

    if ( 'undefined' === typeof routesRegistry[triggerRoute.target.name] ) {
      // this is the leaf route
      return triggerRoute;
    }

    // 1. Find first level of targetRoutes (they can be chained)
    var routes = routesRegistry[triggerRoute.target.name];

    // find all the target routes of intermediate routes
    for ( var i = 0; i < routes.length; i++ ) {

      var route = routes[i];

      // verify if the route has yet another target (it is an intermediate route)

      // 2. Find targetroutes of intermediate route, create a nested array
      var nestedTargetRoutes = this.findTargetRoutes(route);
      targetRoutes.push(nestedTargetRoutes);
    }

    // 3. Return targetroute
    return targetRoutes;
  },

  /**
   * Utility to easily switch logging on and off with the debug flag.
   * @param obj
   */
  log: function (obj) {
    if ( this.debug ) {
      console.log(obj);
    }
  },

  /**
   * Goes up the object tree recursively to find an object with an originalVrmlNode that is of a sensorType,
   * for example a TouchSensor.
   *
   * @param Object3D the clicked shape.
   * @param string sensorType
   * @returns {boolean}|{string} name of the sensor or false.
   */
  findSensor: function (object, sensorType) {
    var scope = this;

    /**
     * Will find a sensor in the children of obj, if any.
     *
     * It will do so recursively going down the object tree.
     * It will not search up the tree to avoid infinite recursion.
     *
     * @param obj
     * @param sensorType
     */
    function findSensorinChildrenOf(obj, sensorType) {
      if ( undefined === obj.children ) {
        return false;
      }

      for ( var b = 0; b < obj.children.length; b++ ) {
        var checkNode = obj.children[b];

        if ( undefined === checkNode ) {
          continue;
        }

        var eventName;

        // check this node
        if ( 'undefined' !== typeof checkNode.userData.originalVrmlNode
          && sensorType === checkNode.userData.originalVrmlNode.node ) {
          // find the first route, we only use TimeSensor to get from one to the next
          eventName = checkNode.name;
          scope.log(sensorType + ': ' + eventName);
          return eventName;
        }

        // var foundItInChildren
        //
        // // recurse
        // if ( foundItInChildren = findSensorinChildrenOf(checkNode, sensorType) ) {
        //   return foundItInChildren;
        // }

      }

      return false;
    }

    if ( null === object ) {
      this.log('Cannot find a sensor of type ' + sensorType + ' in null');
      return false;
    }

    var foundItInChildren;

    if ( foundItInChildren = findSensorinChildrenOf(object, sensorType) ) {
      return foundItInChildren;
    }

    this.log('No ' + sensorType + ' found amongst the children of the following  node:');
    this.log(object);

    if ( 'undefined' === typeof object.parent || null === object.parent ) {
      this.log('We cannot go up the tree any further');
      // we're out of parents, there's not a single sensorType to be found here.
      return false;
    }

    this.log('Searching up the tree');
    // not found in the parent object, look in its parent in turn (go up the object tree recursively)
    return this.findSensor(object.parent, sensorType);
  },

  // @todo: support more interactions than just clicking

  /**
   * Support clicking the scene.
   *
   * If an object is clicked, it will show up in here. If a handler was registered for it,
   * we can execute the handler.
   *
   * Handlers will be registered by parsing VRML ROUTES for TouchSensors.
   *
   * Example:
   * ROUTE klikopdeur.touchTime TO TimeSource.startTime
   * ROUTE TimeSource.fraction_changed TO Deuropen.set_fraction
   * ROUTE Deuropen.value_changed TO deur.rotation
   *
   * @todo: translate event names to English, so that they make sense to people who are not able to read Dutch
   * The example is a three-step animation script:
   * 1. The touchTime of the touch sensor is routed to the time source. We can translate this step, since we have
   * a clock and a click event
   */
  addClickSupport: function (camera, renderer) {
    var localCamera = camera;
    var localRenderer = renderer;
    // clicking: enable clicking on the screen to interact with objects in the 3D world
    projector = new THREE.Projector();
    var line;
    var scope = this;

    renderer.domElement.addEventListener('mousedown', function (event) {
        // use global camera, scene and renderer
        var x = event.offsetX == undefined ? event.layerX : event.offsetX;
        var y = event.offsetY == undefined ? event.layerY : event.offsetY;

        var vector = new THREE.Vector3();
        vector.set(( x / localRenderer.domElement.width ) * 2 - 1, -( y / localRenderer.domElement.height ) * 2 + 1, 0.5);

        vector.unproject(localCamera);

        var raycaster = new THREE.Raycaster(localCamera.position, vector.sub(localCamera.position).normalize());

        var objects = scene.children;
        var intersects = raycaster.intersectObjects(objects, true);

        if ( intersects.length ) {
          var firstIntersect = intersects[0].object;

          var touch = scope.findSensor(firstIntersect, 'TouchSensor');

          if ( false === touch ) {
            // no touch sensor found
            return;
          }

          // work on a clone [slice(0)] of the routes, otherwise, using pop() will make the array useless for next time
          var routes = scope.getRoutesForEvent(touch).slice(0);

          // naive, only use first
          var targetRoutes = scope.findTargetRoutes(routes.pop());

          // again, naive (good usecase for map reduce?
          var targetRoute = targetRoutes;

          while ( 'function' === typeof targetRoute.pop ) {
            targetRoute = targetRoute.pop();

            if ( 'undefined' === typeof targetRoute ) {
              scope.log('no target route found for ' + touch);
              return;
            }
          }

          // we found the leaf targetRoute
          scope.log(targetRoute);

          var originalNode = scene.getObjectByName(targetRoute.source.name).userData.originalVrmlNode;

          // any supported interpolator will work, for now, only OrientationInterpolator
          if ( undefined === VrmlParser.Renderer.ThreeJs.Animation[originalNode.node] ) {
            scope.log(originalNode.node + ' is not yet supported');
            return;
          }

          var interpolator = new VrmlParser.Renderer.ThreeJs.Animation[originalNode.node](originalNode, scope.debug);

          var name = 'surrounding_' + targetRoute.target.name;
          var target = scene.getObjectByName(name);

          // cleanup method for when the callback wants to be removed because it's done.
          var finish = function () {
            scope.removeAnimation(touch);
          };

          var callback = interpolator.getCallback(target, finish);
          scope.addAnimation(touch, callback);
        }

        // drawing a line for diagnostic purposes.
        // keep this disabled, unless you really, really need it.
        // The problem is: the line can prevent finding your sensor if the line is clicked instead of your object.
        // if ( true === scope.debug ) {
        //   // draw a line where the object was clicked
        //   if ( null !== line ) {
        //     scene.remove(line);
        //   }
        //
        //   var lineMaterial = new THREE.LineBasicMaterial({
        //     color: 0x0000ff
        //   });
        //   var geometry = new THREE.Geometry();
        //
        //   geometry.vertices.push(new THREE.Vector3(raycaster.ray.origin.x, raycaster.ray.origin.y, raycaster.ray.origin.z));
        //   geometry.vertices.push(new THREE.Vector3(raycaster.ray.origin.x + (raycaster.ray.direction.x * 100000), raycaster.ray.origin.y + (raycaster.ray.direction.y * 100000), raycaster.ray.origin.z + (raycaster.ray.direction.z * 100000)));
        //   line = new THREE.Line(geometry, lineMaterial);
        //   scene.add(line);
        //   // / draw a line
        // }

      }
      ,
      false
    );
    // / clicking

  }
};

