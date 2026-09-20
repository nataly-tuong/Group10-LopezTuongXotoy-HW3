//
// HW3A.js
//
// HW3A - Moving RGB Square Avatar
//
// W = move up
// A = move left
// S = move down
// D = move right
// 1 = return to origin
//
// The avatar is a square divided into three colors:
// RED, GREEN, and BLUE.
//

"use strict";


var gl;
var program;

var positionBuffer;
var colorBuffer;

var positionAttribute;
var colorAttribute;
var translationUniform;


// ------------------------------------------------------------
// Avatar position
// ------------------------------------------------------------

var avatarX = 0.0;
var avatarY = 0.0;


// How far the avatar moves per key press.
var moveAmount = 0.05;


// The square extends 0.25 units from its center.
var halfSize = 0.25;


// ------------------------------------------------------------
// Initialization
// ------------------------------------------------------------

window.onload = function()
{
    var canvas = document.getElementById("gl-canvas");

    // Get WebGL 2.0 context.
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl)
    {
        alert("Unable to initialize WebGL 2.0.");
        return;
    }


    // Set viewport.
    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Dark background.
    gl.clearColor(
        0.05,
        0.05,
        0.05,
        1.0
    );


    // Load shaders.
    program = initShaders(
        gl,
        "vertex-shader",
        "fragment-shader"
    );


    if (program === -1)
    {
        return;
    }


    gl.useProgram(program);


    // Get shader locations.
    positionAttribute =
        gl.getAttribLocation(
            program,
            "aPosition"
        );


    colorAttribute =
        gl.getAttribLocation(
            program,
            "aColor"
        );


    translationUniform =
        gl.getUniformLocation(
            program,
            "uTranslation"
        );


    // Create square.
    createAvatar();


    // Keyboard controls.
    window.addEventListener(
        "keydown",
        keyboard
    );


    // Initial drawing.
    render();
};


// ------------------------------------------------------------
// Create RGB square
// ------------------------------------------------------------

function createAvatar()
{
    /*
        Square dimensions:

             -0.25             +0.25
                 ┌─────────────┐
                 │             │
                 │             │
                 │             │
                 └─────────────┘
             -0.25             +0.25

        The square is divided into:

             RED | GREEN | BLUE
    */


    var left = -halfSize;
    var right = halfSize;

    var bottom = -halfSize;
    var top = halfSize;


    // Divide square into three equal sections.
    var sectionWidth =
        (right - left) / 3.0;


    var redRight =
        left + sectionWidth;

    var greenRight =
        left + (2.0 * sectionWidth);


    // --------------------------------------------------------
    // Vertex positions
    // --------------------------------------------------------

    var positions = [

        // ==========================
        // RED SECTION
        // ==========================

        left,    bottom,
        redRight, bottom,
        redRight, top,

        left,    bottom,
        redRight, top,
        left,    top,


        // ==========================
        // GREEN SECTION
        // ==========================

        redRight,    bottom,
        greenRight,  bottom,
        greenRight,  top,

        redRight,    bottom,
        greenRight,  top,
        redRight,    top,


        // ==========================
        // BLUE SECTION
        // ==========================

        greenRight, bottom,
        right,       bottom,
        right,       top,

        greenRight, bottom,
        right,       top,
        greenRight, top
    ];


    // --------------------------------------------------------
    // Vertex colors
    // --------------------------------------------------------

    var colors = [

        // RED section
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,


        // GREEN section
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,


        // BLUE section
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];


    // --------------------------------------------------------
    // Position buffer
    // --------------------------------------------------------

    positionBuffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        positionBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
    );


    // --------------------------------------------------------
    // Color buffer
    // --------------------------------------------------------

    colorBuffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        colorBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colors),
        gl.STATIC_DRAW
    );
}


// ------------------------------------------------------------
// Keyboard controls
// ------------------------------------------------------------

function keyboard(event)
{
    var key =
        event.key.toLowerCase();


    if (key === "w")
    {
        avatarY += moveAmount;
    }

    else if (key === "a")
    {
        avatarX -= moveAmount;
    }

    else if (key === "s")
    {
        avatarY -= moveAmount;
    }

    else if (key === "d")
    {
        avatarX += moveAmount;
    }

    else if (key === "1")
    {
        // Return to origin.
        avatarX = 0.0;
        avatarY = 0.0;
    }

    else
    {
        return;
    }


    // Stop avatar from leaving canvas.
    checkBounds();


    // Draw updated position.
    render();
}


// ------------------------------------------------------------
// Keep avatar inside [-1,+1]
// ------------------------------------------------------------

function checkBounds()
{
    /*
        The square is 0.5 units wide.

        Therefore its center can only go from:

            -0.75 to +0.75

        This keeps the entire square visible.
    */


    var minPosition =
        -1.0 + halfSize;

    var maxPosition =
        1.0 - halfSize;


    if (avatarX < minPosition)
    {
        avatarX = minPosition;
    }


    if (avatarX > maxPosition)
    {
        avatarX = maxPosition;
    }


    if (avatarY < minPosition)
    {
        avatarY = minPosition;
    }


    if (avatarY > maxPosition)
    {
        avatarY = maxPosition;
    }
}


// ------------------------------------------------------------
// Draw everything
// ------------------------------------------------------------

function render()
{
    // Clear canvas.
    gl.clear(
        gl.COLOR_BUFFER_BIT
    );


    gl.useProgram(program);


    // Send current avatar position
    // to the vertex shader.
    gl.uniform2f(
        translationUniform,
        avatarX,
        avatarY
    );


    // --------------------------------------------------------
    // Position attribute
    // --------------------------------------------------------

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        positionBuffer
    );


    gl.enableVertexAttribArray(
        positionAttribute
    );


    gl.vertexAttribPointer(
        positionAttribute,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );


    // --------------------------------------------------------
    // Color attribute
    // --------------------------------------------------------

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        colorBuffer
    );


    gl.enableVertexAttribArray(
        colorAttribute
    );


    gl.vertexAttribPointer(
        colorAttribute,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );


    // --------------------------------------------------------
    // Draw 18 vertices = 6 triangles = RGB square
    // --------------------------------------------------------

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        18
    );
}