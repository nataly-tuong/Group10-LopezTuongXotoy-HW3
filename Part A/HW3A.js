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
// The avatar is a square divided into three colors: Red, Green, and Blue
/*
Nataly Tuong
Joshua Xotoy
William Lopez
9-20-2026 
*/
"use strict";


var gl;
var program;

var positionBuffer;
var colorBuffer;

var positionAttribute;
var colorAttribute;
var translationUniform;

// Avatar position
var avatarX = 0.0;
var avatarY = 0.0;


// Distance avatar moves for each key press
var moveAmount = 0.05;


// The square extends 0.25 units from its center
var halfSize = 0.25;

window.onload = function()
{
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl)
    {
        alert("Unable to initialize WebGL 2.0.");
        return;
    }

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Dark background
    gl.clearColor(
        0.05,
        0.05,
        0.05,
        1.0
    );

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


    // Creates square
    createAvatar();


    // Keyboard controls
    window.addEventListener(
        "keydown",
        keyboard
    );

    render();
};

function createAvatar()
{
    // The avatar is a square, it spans from -0.25 to +0.25 on both x and y axes, it's also split into 3 diff sections such as red, green, and blue
    var left = -halfSize;
    var right = halfSize;

    var bottom = -halfSize;
    var top = halfSize;

    // Divide square into three equal sections
    var sectionWidth = (right - left) / 3.0;


    var redRight = left + sectionWidth;

    var greenRight = left + (2.0 * sectionWidth);

    // Vertex positions
    var positions = [
        // Red
        left,    bottom,
        redRight, bottom,
        redRight, top,

        left,    bottom,
        redRight, top,
        left,    top,

        // Green
        redRight,    bottom,
        greenRight,  bottom,
        greenRight,  top,

        redRight,    bottom,
        greenRight,  top,
        redRight,    top,

        // Blue
        greenRight, bottom,
        right,       bottom,
        right,       top,

        greenRight, bottom,
        right,       top,
        greenRight, top
    ];

    // Vertex colors
    var colors = [
        // Red
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Green
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Blue 
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];

    // Position buffer
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


    // Color buffer
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


// Keyboard controls
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
        // Return to origin
        avatarX = 0.0;
        avatarY = 0.0;
    }

    else
    {
        return;
    }


    // Stops the avatar from leaving canvas
    checkBounds();

    render();
}

// Keep avatar inside [-1,+1]
function checkBounds()
{
    // The square is 0.5 units wide.
    // The center can only go from -0.75 to +0.75
    // Keeps the entire square visible.


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

function render()
{
    gl.clear(
        gl.COLOR_BUFFER_BIT
    );


    gl.useProgram(program);

    gl.uniform2f(
        translationUniform,
        avatarX,
        avatarY
    );

    // Position attribute
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


    // Color attribute
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

    // Draw 18 vertices = 6 triangles = RGB square
    gl.drawArrays(
        gl.TRIANGLES,
        0,
        18
    );
}