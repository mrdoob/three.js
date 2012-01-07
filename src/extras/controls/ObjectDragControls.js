(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.ObjectDragControls = (function() {

    function ObjectDragControls(dragPlane, camera, container, width, height) {
      this.dragPlane = dragPlane;
      this.camera = camera;
      this.container = container;
      this.width = width;
      this.height = height;
      this.onDocumentMouseUp = __bind(this.onDocumentMouseUp, this);
      this.onDocumentMouseDown = __bind(this.onDocumentMouseDown, this);
      this.onDocumentMouseMove = __bind(this.onDocumentMouseMove, this);
      this.objects = [];
      this.mouse = new THREE.Vector2();
      this.projector = new THREE.Projector();
      this.selected = false;
      this.intersected = false;
      if (typeof jQuery !== 'undefined' && this.container instanceof jQuery) {
        this.container = this.container[0];
      }
    }

    ObjectDragControls.prototype.addObject = function(object) {
      return this.objects.push(object);
    };

    ObjectDragControls.prototype.attach = function(renderer) {
      this.renderer = renderer;
      this.renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
      this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
      return this.renderer.domElement.addEventListener('mouseup', this.onDocumentMouseUp, false);
    };

    ObjectDragControls.prototype.onDocumentMouseMove = function(event) {
      var intersectionPt, intersects, ray, vector;
      event.preventDefault();
      this.mouse.x = (event.clientX / this.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.height) * 2 + 1;
      vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
      this.projector.unprojectVector(vector, this.camera);
      ray = new THREE.Ray(this.camera.position, vector.subSelf(this.camera.position).normalize());
      if (this.selected) {
        intersectionPt = this.dragPlane.intersect(ray);
        this.selected.position.copy(intersectionPt);
        return;
      }
      intersects = ray.intersectObjects(this.objects);
      if (intersects.length > 0) {
        if (this.intersected !== intersects[0].object) {
          if (this.intersected) {
            this.intersected.material.color.setHex(this.intersected.currentHex);
          }
          this.intersected = intersects[0].object;
          this.intersected.currentHex = this.intersected.material.color.getHex();
        }
        return this.container.style.cursor = 'pointer';
      } else {
        if (this.intersected) {
          this.intersected.material.color.setHex(this.intersected.currentHex);
        }
        this.intersected = null;
        return this.container.style.cursor = 'auto';
      }
    };

    ObjectDragControls.prototype.onDocumentMouseDown = function(event) {
      var intersects, ray, vector;
      event.preventDefault();
      vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
      this.projector.unprojectVector(vector, this.camera);
      ray = new THREE.Ray(this.camera.position, vector.subSelf(this.camera.position).normalize());
      intersects = ray.intersectObjects(this.objects);
      if (intersects.length > 0) {
        this.selected = intersects[0].object;
        return this.container.style.cursor = 'move';
      }
    };

    ObjectDragControls.prototype.onDocumentMouseUp = function(event) {
      event.preventDefault();
      this.selected = null;
      return this.container.style.cursor = 'auto';
    };

    return ObjectDragControls;

  })();

}).call(this);
