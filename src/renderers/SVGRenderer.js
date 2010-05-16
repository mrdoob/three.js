/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SVGRenderer = function () {

	THREE.Renderer.call(this);
	
	var viewport = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
	svgPathPool = [], svgCirclePool = [];

	this.setSize = function (width, height) {
	
		viewport.setAttribute('viewBox', (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height );
		viewport.setAttribute('width', width);
		viewport.setAttribute('height', height);
	}
	
	this.domElement = viewport;

	this.render = function (scene, camera) {
	
		var i, j, element, elementsLength, material, materialLength,
		pathCount = 0, circleCount = 0, svgNode;
	
		this.project(scene, camera);
	
		while (viewport.childNodes.length > 0) {
		
			viewport.removeChild(viewport.childNodes[0]);
		}
		
		elementsLength = this.renderList.length;
		
		for (i = 0; i < elementsLength; i++) {
			
			element = this.renderList[i];
			materialLength = element.material.length;
			
			for (j = 0; j < materialLength; j++) {
			
				material = element.material[j];

				if (element instanceof THREE.RenderableFace3) {
					
					svgNode = getPathNode(pathCount++);
					svgNode.setAttribute('d', 'M ' + element.v1.x + ' ' + element.v1.y + ' L ' + element.v2.x + ' ' + element.v2.y + ' L ' + element.v3.x + ',' + element.v3.y + 'z');
					
				} else if (element instanceof THREE.RenderableFace4) {
				
					svgNode = getPathNode(pathCount++);
					svgNode.setAttribute('d', 'M ' + element.v1.x + ' ' + element.v1.y + ' L ' + element.v2.x + ' ' + element.v2.y + ' L ' + element.v3.x + ',' + element.v3.y + ' L ' + element.v4.x + ',' + element.v4.y + 'z');
					
				} else if (element instanceof THREE.RenderableParticle) {
				
					svgNode = getCircleNode(circleCount++);
					svgNode.setAttribute('cx', element.x);
					svgNode.setAttribute('cy', element.y);
					svgNode.setAttribute('r', element.size * element.screenZ);
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
				

				viewport.appendChild(svgNode);
			}
		}	
	}
	
	function getPathNode(id) {
	
		if (svgPathPool[id] == null) {
		
			svgPathPool[id] = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			// svgPathPool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
			return svgPathPool[id];
		}
		
		return svgPathPool[id];
	}
	
	function getCircleNode(id) {
	
		if (svgCirclePool[id] == null) {
		
			svgCirclePool[id] = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			// svgCirclePool[id].setAttribute('shape-rendering', 'crispEdges'); //optimizeSpeed
			// svgCirclePool[id].setAttribute('fill', 'red');
			return svgCirclePool[id];
		}
		
		return svgCirclePool[id];
	}	
}

THREE.SVGRenderer.prototype = new THREE.Renderer();
THREE.SVGRenderer.prototype.constructor = THREE.CanvasRenderer;
