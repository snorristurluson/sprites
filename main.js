var canvas;

var globals = {};
globals.debugRenderingEnabled = false;
globals.spriteRenderingEnabled = true;
globals.worldToSpriteScale = 100;
globals.resourceLoader = new ResourceLoader();
globals.state = "unknown";

function start() {
    canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);

    // Only continue if WebGL is available and working

    if (gl) {
        globals.state = "loading";
        globals.resourceLoader.load("res/shader-fs.glsl");
        globals.resourceLoader.load("res/shader-vs.glsl");
        globals.resourceLoader.load("levels/level0.txt");

        setInterval(tick, 16);
    }
}

function initAfterLoad() {
    initShaders();

    var level = new Level();
    level.setupDebugDraw();
    level.enableDebugDraw(true);

    var levelSource = globals.resourceLoader["levels/level0.txt"];
    level.build(levelSource);

    var player = new PlayerEntity();
    level.setPlayer(player);

    function handleKeyDown(event) {
        return player.handleKeyDown(event);
    }
    function handleKeyUp(event) {
        return player.handleKeyUp(event);
    }
    function handleMouseDown(event) {
        var coords = mouseCoordsToCanvas(event);
        if(coords.x < 0 || coords.x > canvas.width) {
            return;
        }
        if(coords.y < 0 || coords.y > canvas.height) {
            return;
        }
        return player.handleMouseDown(coords.x, coords.y);
    }
    function handleMouseUp(event) {
        var coords = mouseCoordsToCanvas(event);
        return player.handleMouseUp(coords.x, coords.y);
    }
    function handleMouseMove(event) {
        var coords = mouseCoordsToCanvas(event);
        return player.handleMouseMove(coords.x, coords.y);
    }
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);
    document.addEventListener("mousedown", handleMouseDown, false);
    document.addEventListener("mousemove", handleMouseMove, false);
    document.addEventListener("mouseup", handleMouseUp, false);

    globals.level = level;
}

function tick() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    switch(globals.state) {
        case "loading":
            if(!globals.resourceLoader.isLoading()) {
                initAfterLoad();
                globals.state = "running";
            }
            break;
        case "running":
            if(globals.level) {
                gl.uniform2fv(uDimensions, new Float32Array([canvas.width, canvas.height]));

                globals.level.update(0.016);
                globals.level.render();
            }
            break;
    }
}

function handleDebugRenderClick(cb) {
    globals.debugRenderingEnabled = cb.checked;
}

function handleSpriteRenderClick(cb) {
    globals.spriteRenderingEnabled = cb.checked;
}

function mouseCoordsToCanvas(event) {
    var bRect = canvas.getBoundingClientRect();
    var mouseX = (event.clientX - bRect.left) * (canvas.width / bRect.width);
    var mouseY = (event.clientY - bRect.top) * (canvas.height / bRect.height);
    return {x: mouseX, y: mouseY};
}
