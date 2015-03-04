var canvas;
var sr;

function start() {
    canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);      // Initialize the GL context

    // Only continue if WebGL is available and working

    if (gl) {
        initShaders();
        sr = new SpriteRenderer();
        var level = new Level();

        aClient = new HttpClient();
        aClient.get("levels/level0.txt", function(answer) {
            level.build(answer);
            sr.sprites = sr.sprites.concat(level.sprites);
            console.debug(sr.sprites.length);
        });

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

