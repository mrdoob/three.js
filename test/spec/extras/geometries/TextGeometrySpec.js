describe('Text Geometry', function(){

    it('should exist', function(){
        expect(THREE.TextGeometry).toBeDefined();
    });

    it('should hook up typeface.js API', function(){
        expect(window._typeface_js).toBeDefined();
    });

});