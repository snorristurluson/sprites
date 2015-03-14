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
}

function tick() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    switch(globals.state) {
        case "loading":
            if(!globals.resourceLoader.isLoading()) {
                initAfterLoad();
                globals.state = "ready";
            }
            break;

        case "ready":
            break;

        case "running":
            var level = globals.level;
            if(level) {
                gl.uniform2fv(uDimensions, new Float32Array([canvas.width, canvas.height]));

                var td = 0.016;
                globals.eventTranslator.update(td);
                level.update(td);
                level.render();

                if(level.player.reachedExit) {
                    globals.state = "finished";
                }
            }
            break;

        case "finished":
            globals.eventTranslator.stop();
            globals.state = "ready";
    }
}

function handleDebugRenderClick(cb) {
    globals.debugRenderingEnabled = cb.checked;
}

function handleSpriteRenderClick(cb) {
    globals.spriteRenderingEnabled = cb.checked;
}

function handlePlayClick() {
    var level = new Level();
    level.setupDebugDraw();
    level.enableDebugDraw(true);

    var levelSource = globals.resourceLoader["levels/level0.txt"];
    level.build(levelSource);

    var player = new PlayerEntity();
    level.setPlayer(player);

    var translator = new EventTranslator(player, canvas);
    translator.setEventListeners(document);
    globals.eventTranslator = translator;

    var recorder = new Recorder(player);
    translator.recorder = recorder;
    globals.recorder = recorder;

    globals.level = level;

    globals.state = "running";
}

function handleViewReplayClick() {
    if(!globals.recorder) {
        alert("Replay is not available");
        return;
    }

    var level = new Level();
    level.setupDebugDraw();
    level.enableDebugDraw(true);

    var levelSource = globals.resourceLoader["levels/level0.txt"];
    level.build(levelSource);

    var player = new PlayerEntity();
    level.setPlayer(player);

    globals.recorder.player = player;
    globals.recorder.rewind();
    globals.eventTranslator = globals.recorder;

    globals.level = level;

    globals.state = "running";
}