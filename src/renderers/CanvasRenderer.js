/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CanvasRenderer = function () {

	THREE.Renderer.call(this);

	var viewport = document.createElement("canvas"),
	context = viewport.getContext("2d");
	
	this.setSize = function (width, height) {
	
		viewport.width = width;
		viewport.height = height;
		
		context.setTransform(1, 0, 0, 1, width / 2, height / 2);
	}
	
	this.domElement = viewport;

	this.render = function (scene, camera) {
	
		var i, j, element, pi2 = Math.PI * 2,
		elementsLength, material, materialLength;

		context.clearRect (-viewport.width / 2, -viewport.height / 2, viewport.width, viewport.height);

		this.project(scene, camera);

		elementsLength = this.renderList.length;
		
		for (i = 0; i < elementsLength; i++) {
		
			element = this.renderList[i];
			materialLength = element.material.length;
		
			for (j = 0; j < materialLength; j++) {
		
				material = element.material[j];
			
				context.beginPath();

				if (element instanceof THREE.RenderableFace3) {
			
					context.moveTo(element.v1.x, element.v1.y);
					context.lineTo(element.v2.x, element.v2.y);
					context.lineTo(element.v3.x, element.v3.y);
					context.lineTo(element.v1.x, element.v1.y);
				
				} else if (element instanceof THREE.RenderableFace4) {

					context.moveTo(element.v1.x, element.v1.y);
					context.lineTo(element.v2.x, element.v2.y);
					context.lineTo(element.v3.x, element.v3.y);
					context.lineTo(element.v4.x, element.v4.y);
					context.lineTo(element.v1.x, element.v1.y);
				
				} else if (element instanceof THREE.RenderableParticle) {
			
					context.arc(element.x, element.y, element.size * element.screenZ, 0, pi2, true);
				}
				
				
				if (material instanceof THREE.ColorFillMaterial) {
			
					context.fillStyle = material.color.styleString;
					context.fill();
			
				} else if (material instanceof THREE.FaceColorFillMaterial) {
			
					context.fillStyle = element.color.styleString;
					context.fill();

				} else if (material instanceof THREE.ColorStrokeMaterial) {
				
					context.lineWidth = material.lineWidth;
					context.lineJoin = "round";
					context.lineCap = "round";

					context.strokeStyle = material.color.styleString;
					context.stroke();
				
				} else if (material instanceof THREE.FaceColorStrokeMaterial) {
				
					context.lineWidth = material.lineWidth;
					context.lineJoin = "round";
					context.lineCap = "round";
					
					context.strokeStyle = element.color.styleString;					
					context.stroke();
				}
				
				context.closePath();			
			}
		}
	}
}

THREE.CanvasRenderer.prototype = new THREE.Renderer();
THREE.CanvasRenderer.prototype.constructor = THREE.CanvasRenderer;
