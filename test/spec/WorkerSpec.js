describe('Worker', function(){

    /**
     * This test will require local file since
     * the Web Worker if trying to access a 
     * file with the file:// protocol.
     * Skip if we don't have access, or if
     * Web Workers are not implemented.
     */
    it('should run', function(){
        var 
            result,
            worker,
            foo = false;
            
        if ( !self.Worker ) {
            return;
        }
        
        try {
            worker = new Worker('spec/HelperWorker.js');
            worker.postMessage('');
        } catch (e) {
            switch(e.message) {
                case 'SECURITY_ERR: DOM Exception 18':
                    return;
                    break;
                default:
                    throw e;
                    break;
            }
        }
        
        worker.onmessage = function(e) {
            foo = true;
            result = e.data;
        }
        
        waitsFor(function(){
            return foo === true;
        }, 'worker timed out', 5000);
        
        runs(function(){
            expect(result).toEqual('success');
        });
    });

});