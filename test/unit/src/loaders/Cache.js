/**
 * @author Philip Frank / https://github.com/bananer
 */
(function () {

	'use strict';

	QUnit.module('Loaders - Cache', {
		before: function () {
			THREE.Cache.enabled = true;
		},
		after: function () {
			THREE.Cache.enabled = false;
		}
	});

	QUnit.test('simple', function (assert) {
		var done = assert.async();
		THREE.Cache.retrieve('simple', function (onLoad) {
			setTimeout(function () {
				onLoad('result');
			}, 1);
		}, function (result) {
			assert.equal(result, 'result');
			done();
		})
	});

	QUnit.test('multiple', function (assert) {
		var resolverDone = assert.async();
		var resolver = function (onLoad) {
			setTimeout(function () {
				onLoad('result');
				resolverDone();
			}, 1);
		};

		var retriever1Done = assert.async();
		THREE.Cache.retrieve('multiple', resolver, function (result) {
			assert.equal(result, 'result');
			retriever1Done();
		});

		var retriever2Done = assert.async();
		THREE.Cache.retrieve('multiple', resolver, function (result) {
			assert.equal(result, 'result');
			retriever2Done();
		});

		var retriever3Done = assert.async();
		THREE.Cache.retrieve('multiple', resolver, function (result) {
			assert.equal(result, 'result');
			retriever3Done();
		})
	});

	QUnit.test('multiple-delay', function (assert) {
		assert.timeout( 1000 );
		var resolverDone = assert.async();
		var resolver = function (onLoad) {
			setTimeout(function () {
				onLoad('result');
				resolverDone();
			}, 1);
		};

		var retriever1Done = assert.async();
		THREE.Cache.retrieve('multiple-delay', resolver, function (result) {
			assert.equal(result, 'result');
			retriever1Done();
		});

		var retriever2Done = assert.async();
		setTimeout(function () {
			THREE.Cache.retrieve('multiple-delay', resolver, function (result) {
				assert.equal(result, 'result');
				retriever2Done();
			});
		}, 10);
	});

	QUnit.test('progress-error', function(assert) {
		assert.timeout( 1000 );
		var progress1 = assert.async(2);
		var error1 = assert.async();
		var error2 = assert.async();
		var resolver = function (onLoad, onProgress, onError) {
			setTimeout(function () {
				onProgress(20);
			}, 1);
			setTimeout(function () {
				onProgress(80);
			}, 10);
			setTimeout(function () {
				onError('error');
			}, 20);
		};

		THREE.Cache.retrieve(
			'progress-error',
			resolver,
			assert.fail,
			progress1,
			function(error) {
				assert.equal(error, 'error');
				error1();
			}
		);
		setTimeout(function () {
			THREE.Cache.retrieve(
				'progress-error',
				resolver,
				assert.fail,
				undefined,
				function(error) {
					assert.equal(error, 'error');
					error2();
				});
		}, 10);
	});

	QUnit.test('disabled', function(assert) {
		assert.timeout( 1000 );
		THREE.Cache.enabled = false;

		var retriever1 = assert.async();
		var retriever2 = assert.async();

		THREE.Cache.retrieve(
			'disabled',
			function(onLoad) {
				setTimeout(function() {
					onLoad('result1');
				}, 1);
			},
			function(result) {
				assert.equal(result, 'result1');
				retriever1();
			}
		);

		THREE.Cache.retrieve(
			'disabled',
			function(onLoad) {
				setTimeout(function() {
					onLoad('result2');
				}, 1);
			},
			function(result) {
				assert.equal(result, 'result2');
				retriever2();
			}
		);
	});
})();