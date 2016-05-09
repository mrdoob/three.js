/*
 * Copyright (c) 2009 The Chromium Authors. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *    * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *    * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
//
// opt_canvas (an HTMLCanvasElement) and opt_context (a
// WebGLRenderingContext) can be passed in to make the hit detection
// more precise -- only opaque pixels will be considered as the start
// of a drag action.
function CameraController(element, opt_canvas, opt_context) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;

    if (opt_canvas)
        this.canvas_ = opt_canvas;

    if (opt_context)
        this.context_ = opt_context;

    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
    	// $(element).css("cursor", "url(images/blank.png), default");
        $(element).css("cursor", "none");

        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
        var dragging = false;
        if (controller.canvas_ && controller.context_) {
            var rect = controller.canvas_.getBoundingClientRect();
            // Transform the event's x and y coordinates into the coordinate
            // space of the canvas
            var canvasRelativeX = ev.pageX - rect.left;
            var canvasRelativeY = ev.pageY - rect.top;
            var canvasWidth = controller.canvas_.width;
            var canvasHeight = controller.canvas_.height;

            // Read back a small portion of the frame buffer around this point
            if (canvasRelativeX > 0 && canvasRelativeX < canvasWidth &&
                canvasRelativeY > 0 && canvasRelativeY < canvasHeight) {
                var pixels = new Uint8Array(1);
                controller.context_.readPixels(canvasRelativeX,
                                               canvasHeight - canvasRelativeY,
                                               1,
                                               1,
                                               controller.context_.RGBA,
                                               controller.context_.UNSIGNED_BYTE,
                                               pixels);
                // See whether this pixel has an alpha value of >= about 10%
                if (pixels[3] > (255.0 / 10.0)) {
                    dragging = true;
                }
            }
        } else {
            dragging = true;
        }

        controller.dragging = dragging;
    };

    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
    	$(element).css("cursor", "default");
        controller.dragging = false;
    };

    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}
