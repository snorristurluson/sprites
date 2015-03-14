var gl; // A global variable for the WebGL context

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
    var fragmentShader = compileShader("res/shader-fs.glsl", gl.FRAGMENT_SHADER);
    var vertexShader = compileShader("res/shader-vs.glsl", gl.VERTEX_SHADER);

    // Create the shader program

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);

    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(aVertexPosition);
    aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.enableVertexAttribArray(aColor);

    uDimensions = gl.getUniformLocation(shaderProgram, "uDimensions");
}

function ResourceLoader() {
    this.pendingLoads = [];

    this.load = function(filename) {
        var downloader = new HttpClient();
        this.pendingLoads.push(filename);
        var rl = this;
        downloader.get(filename, function(name, contents) {
            console.log(name, "finished loading");
            rl[name] = contents;
            var index = rl.pendingLoads.indexOf(name);
            rl.pendingLoads.splice(index, 1);
        }, function(name, returnCode) {
            console.warn(name, "failed to load:", returnCode);
            var index = rl.pendingLoads.indexOf(name);
            rl.pendingLoads.splice(index, 1);
        });
        console.log(filename, "requested");
    };

    this.isLoading = function() {
        return this.pendingLoads.length > 0;
    }
}

function compileShader(name, type) {
    var theSource = globals.resourceLoader[name];
    var shader = gl.createShader(type);
    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling " + name + ": " + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}
