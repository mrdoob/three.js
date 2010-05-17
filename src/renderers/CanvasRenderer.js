/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CanvasRenderer = function () {

	THREE.Renderer.call(this);

	var _viewport = document.createElement("canvas"),
	_context = _viewport.getContext("2d"),
	_clipRect = new THREE.Rectangle(),
	_clearRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle();
	
	this.setSize = function (width, height) {
	
		_viewport.width = width;
		_viewport.height = height;
		
		_context.setTransform(1, 0, 0, 1, width / 2, height / 2);
		
		_clipRect.set(-width / 2, -height / 2, width / 2, height / 2);
	}
	
	this.domElement = _viewport;

	this.render = function (scene, camera) {
	
		var i, j, element, pi2 = Math.PI * 2,
		elementsLength, material, materialLength,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y,
		size;

		_context.clearRect(_clearRect.getX() - 1, _clearRect.getY() - 1, _clearRect.getWidth() + 2, _clearRect.getHeight() + 2);
		_clearRect.empty();

		/*
		_context.fillStyle = 'rgba(255, 255, 0, 0.5)';
		_context.fillRect(_clipRect.getX(), _clipRect.getY(), _clipRect.getWidth(), _clipRect.getHeight());
		*/
		
		this.project(scene, camera);

		elementsLength = this.renderList.length;
		
		for (i = 0; i < elementsLength; i++) {
		
			element = this.renderList[i];
			materialLength = element.material.length;
		
			for (j = 0; j < materialLength; j++) {
		
				material = element.material[j];
			
				_context.beginPath();
				
				_bboxRect.empty();

				if (element instanceof THREE.RenderableFace3) {
					
					v1x = element.v1.x; v1y = element.v1.y;
					v2x = element.v2.x; v2y = element.v2.y;
					v3x = element.v3.x; v3y = element.v3.y;
					
					_bboxRect.addPoint(v1x, v1y);
					_bboxRect.addPoint(v2x, v2y);
					_bboxRect.addPoint(v3x, v3y);
					
					if (!_clipRect.instersects(_bboxRect)) {
					
						continue;
					}
					
					_clearRect.addRectangle(_bboxRect);
					
					_context.moveTo(v1x, v1y);
					_context.lineTo(v2x, v2y);
					_context.lineTo(v3x, v3y);
					_context.lineTo(v1x, v1y);			
				
				} else if (element instanceof THREE.RenderableFace4) {

					v1x = element.v1.x; v1y = element.v1.y;
					v2x = element.v2.x; v2y = element.v2.y;
					v3x = element.v3.x; v3y = element.v3.y;
					v4x = element.v4.x; v4y = element.v4.y;
					
					_bboxRect.addPoint(v1x, v1y);
					_bboxRect.addPoint(v2x, v2y);
					_bboxRect.addPoint(v3x, v3y);
					_bboxRect.addPoint(v4x, v4y);

					if (!_clipRect.instersects(_bboxRect)) {
					
						continue;
					}

					_clearRect.addRectangle(_bboxRect);
					
					_context.moveTo(v1x, v1y);
					_context.lineTo(v2x, v2y);
					_context.lineTo(v3x, v3y);
					_context.lineTo(v4x, v4y);					
					_context.lineTo(v1x, v1y);					
				
				} else if (element instanceof THREE.RenderableParticle) {
					
					size = element.size * element.screenZ;
					
					_bboxRect.set(element.x - size, element.y - size, element.x + size, element.y + size);

					if (!_clipRect.instersects(_bboxRect)) {
					
						continue;
					}
					
					_clearRect.addRectangle(_bboxRect);
					
					_context.arc(element.x, element.y, size, 0, pi2, true);
				}
				
				
				if (material instanceof THREE.ColorFillMaterial) {
			
					_context.fillStyle = material.color.styleString;
					_context.fill();
			
				} else if (material instanceof THREE.FaceColorFillMaterial) {
			
					_context.fillStyle = element.color.styleString;
					_context.fill();

				} else if (material instanceof THREE.ColorStrokeMaterial) {
				
					_context.lineWidth = material.lineWidth;
					_context.lineJoin = "round";
					_context.lineCap = "round";

					_context.strokeStyle = material.color.styleString;
					_context.stroke();
				
				} else if (material instanceof THREE.FaceColorStrokeMaterial) {
				
					_context.lineWidth = material.lineWidth;
					_context.lineJoin = "round";
					_context.lineCap = "round";
					
					_context.strokeStyle = element.color.styleString;					
					_context.stroke();
				}
				
				_context.closePath();			
			}
		}
	}
}

THREE.CanvasRenderer.prototype = new THREE.Renderer();
THREE.CanvasRenderer.prototype.constructor = THREE.CanvasRenderer;
