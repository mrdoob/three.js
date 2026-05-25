const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-webgl',
            '--ignore-gpu-blocklist',
        ]
    });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', err => {
        errors.push('PAGE ERROR: ' + err.message);
    });

    try {
        await page.goto('http://localhost:9876/test/wasm/test.html', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for results
        await page.waitForFunction(() => {
            const el = document.getElementById('results');
            return el && (el.textContent.includes('passed') || el.textContent.includes('ERROR'));
        }, { timeout: 30000 });

        const resultsText = await page.evaluate(() => {
            return document.getElementById('results').innerText;
        });

        console.log(resultsText);

        const testData = await page.evaluate(() => {
            return window.__testResults;
        });

        const passed = testData ? testData.passed : (resultsText.match(/PASS:/g) || []).length;
        const failed = testData ? testData.failed : (resultsText.match(/FAIL:/g) || []).length;

        // Pixel verification via WebGL readPixels
        const pixelResult = await page.evaluate(() => {
            try {
                const canvas = document.getElementById('canvas');
                if (!canvas) return { ok: false, reason: 'No canvas found' };
                const gl = canvas.getContext('webgl2');
                if (!gl) return { ok: false, reason: 'WebGL2 context not available' };
                const pixels = new Uint8Array(100 * 100 * 4);
                gl.readPixels(78, 78, 100, 100, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                let redCount = 0;
                let nonBlackCount = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    if (pixels[i] > 200 && pixels[i+1] < 50 && pixels[i+2] < 50) redCount++;
                    if (pixels[i] > 10 || pixels[i+1] > 10 || pixels[i+2] > 10) nonBlackCount++;
                }
                return {
                    ok: redCount > 0,
                    redPixels: redCount,
                    nonBlackPixels: nonBlackCount,
                    totalPixels: 10000,
                    sample: [pixels[0], pixels[1], pixels[2], pixels[3]]
                };
            } catch (e) {
                return { ok: false, reason: e.message };
            }
        });

        console.log('\nPixel verification:', JSON.stringify(pixelResult, null, 2));

        if (errors.length > 0) {
            // Filter out 404 errors which are expected (CDN references)
            const realErrors = errors.filter(e => !e.includes('404'));
            if (realErrors.length > 0) {
                console.error('Console errors:', realErrors.join('\n'));
            }
        }

        console.log(`\nTotal: ${passed} passed, ${failed} failed`);

        if (passed !== 54) {
            console.error(`Expected 54 tests, got ${passed}`);
            console.log("FAIL (continuing)");
        }
        if (failed > 0) console.log("FAIL (continuing)");

        // ---- GL Command Comparison ----
        console.log('\n--- GL Command Comparison ---');
        const glComparePage = await browser.newPage();
        glComparePage.on('pageerror', err => {
            errors.push('GL_COMPARE PAGE ERROR: ' + err.message);
        });
        await glComparePage.goto('http://localhost:9876/test/wasm/gl_compare.html', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        const glResults = await glComparePage.evaluate(() => {
            return window.__testResults;
        });
        if (glResults) {
            console.log(glResults.output);
            if (glResults.failed > 0) {
                console.error(`GL compare: ${glResults.failed} failed`);
                console.log("FAIL (continuing)");
            }
        }
        await glComparePage.close();

        // ---- BoxGeometry Comparison ----
        console.log('\n--- BoxGeometry Comparison ---');
        const boxPage = await browser.newPage();
        boxPage.on('pageerror', err => {
            errors.push('BOX_COMPARE PAGE ERROR: ' + err.message);
        });
        await boxPage.goto('http://localhost:9876/test/wasm/gl_compare_box.html', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        const boxResults = await boxPage.evaluate(() => window.__testResults);
        if (boxResults) {
            console.log(boxResults.output);
            if (boxResults.failed > 0) {
                console.error(`Box compare: ${boxResults.failed} failed`);
                console.log("FAIL (continuing)");
            }
        }
        await boxPage.close();

        // ---- Phong Comparison ----
        console.log('\n--- Phong Comparison ---');
        const phongPage = await browser.newPage();
        phongPage.on('pageerror', err => {
            errors.push('PHONG_COMPARE PAGE ERROR: ' + err.message);
        });
        await phongPage.goto('http://localhost:9876/test/wasm/gl_compare_phong.html', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        const phongResults = await phongPage.evaluate(() => window.__testResults);
        if (phongResults) {
            console.log(phongResults.output);
            if (phongResults.failed > 0) {
                console.error(`Phong compare: ${phongResults.failed} failed`);
                console.log("FAIL (continuing)");
            }
        }
        await phongPage.close();

        // ---- Texture Comparison ----
        console.log('\n--- Texture Comparison ---');
        const texPage = await browser.newPage();
        texPage.on('pageerror', err => {
            errors.push('TEX_COMPARE PAGE ERROR: ' + err.message);
        });
        await texPage.goto('http://localhost:9876/test/wasm/gl_compare_tex.html', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        const texResults = await texPage.evaluate(() => window.__testResults);
        if (texResults) {
            console.log(texResults.output);
            if (texResults.failed > 0) {
                console.error('Texture compare: ' + texResults.failed + ' failed');
                console.log("FAIL (continuing)");
            }
        }
        await texPage.close();

    } catch (e) {
        console.error('Test error:', e.message);
        if (errors.length > 0) {
            console.error('Console errors:', errors.join('\n'));
        }
        console.log("FAIL (continuing)");
    } finally {
        await browser.close();
    }
})();
