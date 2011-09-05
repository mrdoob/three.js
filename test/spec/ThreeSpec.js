describe('Three', function(){

    it('should exist', function(){
        expect(THREE).toBeDefined();
    });
    
    it('should define Typed Arrays', function(){
        expect(self.Int32Array).toBeDefined();
        expect(self.Float32Array).toBeDefined();
        expect(window.Int32Array).toBeDefined();
        expect(window.Float32Array).toBeDefined();
    });

});