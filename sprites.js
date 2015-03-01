var canvas;
var gl; // A global variable for the WebGL context
var sr;

function start() {
    canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);      // Initialize the GL context

    // Only continue if WebGL is available and working

    if (gl) {
        initShaders();
        sr = new SpriteRenderer();

        var i;
        for (i = 0; i < 2000; ++i) {
            s = new Sprite(Math.random() * 100, Math.random() * 100);
            s.dx = Math.random() * 100;
            s.dy = Math.random() * 100;

            s.color = new Color(Math.random(), Math.random(), Math.random(), 1)

            sr.sprites.push(s);
        }

        setInterval(tick, 16);
    }
}

function tick() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform2fv(uDimensions, new Float32Array([canvas.width, canvas.height]));

    sr.update(0.016);
    sr.render();
}

function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

SPRITE_VERTEX_SIZE = 6;
function Sprite(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;

    this.width = 32;
    this.height = 32;
    this.color = new Color(1, 1, 1, 1);

    this.getVertices = function(buffer, offset) {
        function addVertex(buffer, offset, x, y, color) {
            buffer[offset] = x;
            buffer[offset + 1] = y;
            buffer[offset + 2] = color.r;
            buffer[offset + 3] = color.g;
            buffer[offset + 4] = color.b;
            buffer[offset + 5] = color.a;

            return SPRITE_VERTEX_SIZE;
        }

        offset += addVertex(buffer, offset, this.x, this.y, this.color);
        offset += addVertex(buffer, offset, this.x + this.width, this.y, this.color);
        offset += addVertex(buffer, offset, this.x + this.width, this.y + this.height, this.color);

        offset += addVertex(buffer, offset, this.x, this.y, this.color);
        offset += addVertex(buffer, offset, this.x + this.width, this.y + this.height, this.color);
        offset += addVertex(buffer, offset, this.x, this.y + this.height, this.color);
        return offset;
    }

    this.update = function(td) {
        this.x += td * this.dx;
        this.y += td * this.dy;

        if(this.x < 0) {
            this.dx = -this.dx;
        }
        else if(this.x + this.width > canvas.width) {
            this.dx = -this.dx;
        }
        if(this.y < 0) {
            this.dy = -this.dy;
        }
        else if(this.y + this.height > canvas.height) {
            this.dy = -this.dy;
        }
    }
}

function SpriteRenderer() {
    this.vertexBuffer = gl.createBuffer();
    this.sprites = [];

    this.render = function() {
        var numVertices = this.sprites.length * 6;
        var data = new Float32Array(numVertices * SPRITE_VERTEX_SIZE);

        var i;
        var offset = 0;
        for(i = 0; i < this.sprites.length; ++i) {
            offset = this.sprites[i].getVertices(data, offset);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, SPRITE_VERTEX_SIZE * 4, 0);
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, SPRITE_VERTEX_SIZE * 4, 8);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    this.update = function (td) {
        var i;
        for (i = 0; i < this.sprites.length; ++i) {
            this.sprites[i].update(td);
        }
    }
}

function initWebGL(canvas) {
    gl = null;

    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch (e) { }

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }

    return gl;
}

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // Create the shader program

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(aVertexPosition);
    aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.enableVertexAttribArray(aColor);

    uDimensions = gl.getUniformLocation(shaderProgram, "uDimensions");
}

function getShader(gl, id) {
    var shaderScript, theSource, currentChild, shader;

    shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    theSource = "";
    currentChild = shaderScript.firstChild;

    while (currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
            theSource += currentChild.textContent;
        }

        currentChild = currentChild.nextSibling;
    }
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        // Unknown shader type
        return null;
    }
    gl.shaderSource(shader, theSource);
    
    // Compile the shader program
    gl.compileShader(shader);  
    
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
        return null;  
    }
    
    return shader;
}


