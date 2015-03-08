var canvas;

var globals = {};
globals.debugRenderingEnabled = false;
globals.spriteRenderingEnabled = true;

function start() {
    canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);

    // Only continue if WebGL is available and working

    if (gl) {
        initShaders();
        var level = new Level();
        level.setupDebugDraw();
        level.enableDebugDraw(true);

        var aClient = new HttpClient();
        aClient.get("levels/level0.txt", function(answer) {
            level.build(answer);

            var player = new PlayerEntity();
            level.addEntity(player, 2, 2);

            var monster1 = new Monster();
            monster1.behavior = new FollowEntity(monster1, player);
            level.addEntity(monster1, 5, 5);

            var monster2 = new Monster();
            level.addEntity(monster2, 6, 5);

            var monster3 = new Monster();
            level.addEntity(monster3, 5, 6);

            function handleKeyDown(event) {
                return player.handleKeyDown(event);
            }
            function handleKeyUp(event) {
                return player.handleKeyUp(event);
            }
            document.addEventListener("keydown", handleKeyDown, false);
            document.addEventListener("keyup", handleKeyUp, false);

            globals.level = level;
        });

        setInterval(tick, 16);
    }
}

function tick() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform2fv(uDimensions, new Float32Array([canvas.width, canvas.height]));

    if(globals.level) {
        globals.level.update(0.016);
        globals.level.render();
    }
}

function handleDebugRenderClick(cb) {
    globals.debugRenderingEnabled = cb.checked;
}

function handleSpriteRenderClick(cb) {
    globals.spriteRenderingEnabled = cb.checked;
}

