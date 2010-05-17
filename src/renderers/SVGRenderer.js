/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SVGRenderer = function () {

	THREE.Renderer.call(this);
	
	var _viewport = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
	_clipRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),
	_svgPathPool = [], _svgCirclePool = [];

	this.setSize = function (width, height) {
	
		_viewport.setAttribute('viewBox', (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height );
		_viewport.setAttribute('width', width);
		_viewport.setAttribute('height', height);
		
		_clipRect.set(-width / 2, -height / 2, width / 2, height / 2);
	}
	
	this.domElement = _viewport;

	this.render = function (scene, camera) {
	
		var i, j, element, elementsLength, material, materialLength,
		pathCount = 0, circleCount = 0, svgNode,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y,
		size;
	
		this.project(scene, camera);
	
		while (_viewport.childNodes.length > 0) {
		
			_viewport.removeChild(_viewport.childNodes[0]);
		}
		
		elementsLength = this.renderList.length;
		
		for (i = 0; i < elementsLength; i++) {
			
			element = this.renderList[i];
			materialLength = element.material.length;
			
			for (j = 0; j < materialLength; j++) {
			
				material = element.material[j];
				
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
					
					svgNode = getPathNode(pathCount++);
					svgNode.setAttribute('d', 'M ' + v1x + ' ' + v1y + ' L ' + v2x + ' ' + v2y + ' L ' + v3x + ',' + v3y + 'z');
					
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
									
					svgNode = getPathNode(pathCount++);
					svgNode.setAttribute('d', 'M ' + v1x + ' ' + v1y + ' L ' + v2x + ' ' + v2y + ' L ' + v3x + ',' + v3y + ' L ' + v4x + ',' + v4y + 'z');
					
				} else if (element instanceof THREE.RenderableParticle) {
				
					size = element.size * element.screenZ;
					
					_bboxRect.set(element.x - size, element.y - size, element.x + size, element.y + size);

					if (!_clipRect.instersects(_bboxRect)) {
					
						continue;
					}
				
					svgNode = getCircleNode(circleCount++);
					svgNode.setAttribute('cx', element.x);
					svgNode.setAttribute('cy', element.y);
					svgNode.setAttribute('r', size);
				}

				if (material instanceof THREE.ColorFillMaterial) {
				
					svgNode.setAttribute('style', 'fill: ' + material.color.styleString + '; stroke-width:10');
					
				} else if (material instanceof THREE.FaceColorFillMaterial) {
				
					svgNode.setAttribute('style', 'fill: ' + element.color.styleString + '; stroke-width:10');
					
				} else if (material instanceof THREE.ColorStrokeMaterial) {
				
					svgNode.setAttribute('style', 'fill: none; stroke: ' + material.color.styleString + '; stroke-width: ' + material.lineWidth + '; stroke-linecap: round; stroke-linejoin: round');
				
				} else if (material instanceof THREE.FaceColorStrokeMaterial) {
				
					svgNode.setAttribute('style', 'fill: none; stroke: ' + element.color.styleString + '; stroke-width: ' + material.lineWidth + '; stroke-linecap: round; stroke-linejoin: round');
				}
				

				_viewport.appendChild(svgNode);
			}
		}	
	}
	
	function getPathNode(id) {
	
		if (_svgPathPool[id] == null) {
		
			_svgPathPool[id] = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			// _svgPathPool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
			return _svgPathPool[id];
		}
		
		return _svgPathPool[id];
	}
	
	function getCircleNode(id) {
	
		if (_svgCirclePool[id] == null) {
		
			_svgCirclePool[id] = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			// _svgCirclePool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
			// _svgCirclePool[id].setAttribute('fill', 'red');
			return _svgCirclePool[id];
		}
		
		return _svgCirclePool[id];
	}	
}

THREE.SVGRenderer.prototype = new THREE.Renderer();
THREE.SVGRenderer.prototype.constructor = THREE.CanvasRenderer;
