// Code heavily referenced from gasket 5 sample code!

var canvas;
var gl;

var positions;
var numTimesToSubdivide = 0;

var bufferId;

var autoTimer = null;
function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Buffer is sized for 8 max levls
    // At level 8, 3^8 triangles
    // Each triangle has 3 vertices,, each point has 2 floats, so each float takes up 4 bytes
    // 8 bytes per point!
    gl.bufferData(gl.ARRAY_BUFFER, 8*Math.pow(3, 8), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    //prevent right-click from opening contextmenu
    canvas.addEventListener("contextmenu", function(e){ e.preventDefault(); });
    // Mouse click event
    canvas.onmousedown = function(event) {
        // left mouse button to start a single new subdivision (up to a maximum of 8)
        if (event.button === 0) { // left
            if (numTimesToSubdivide < 8) {
                numTimesToSubdivide++;
                render();
            }
        } else if (event.button === 1 || event.button === 2) {
            // the right (or middle) button to have it iterate through subdivisions displaying a new one every second until a maximum of 8 subdivisions
            if (autoTimer != null) {
                clearInterval(autoTimer);
            }
            autoTimer = setInterval(function() {
                if (numTimesToSubdivide < 8) {
                    numTimesToSubdivide++;
                    render();
                } else {
                    clearInterval(autoTimer);
                    autoTimer = null;
                }
            }, 1000); // 1 second per subdivision
        }
    }

    render();
};

function triangle(a, b, c)
{
    positions.push(a, b, c);
}

function divideTriangle(a, b, c, count)
{
    // the count is the amount of times to subdivide before drawing
    // ^ this decreases by 1 each call

    // check for end of recursion
    if (count == 0) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // three new triangles
        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
    }
}

window.onload = init;

function render()
{
    var vertices = [
        vec2(-1, -1),
        vec2(0,  1),
        vec2(1, -1)
    ];
    positions = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(positions));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, positions.length );
    positions = [];
}
