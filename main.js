var canvas;

var globals = {};
globals.debugRenderingEnabled = false;
globals.spriteRenderingEnabled = true;
globals.worldToSpriteScale = 100;

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
            level.addEntity(player, level.worldCoordsFromTileCoords({x: 2, y: 2}));

            var monster1 = new Monster();
            monster1.behavior = new FollowEntity(monster1, player);
            level.addEntity(monster1, level.worldCoordsFromTileCoords({x: 5, y: 5}));

            var monster2 = new Monster();
            level.addEntity(monster2, level.worldCoordsFromTileCoords({x: 5, y: 6}));

            var monster3 = new Monster();
            level.addEntity(monster3, level.worldCoordsFromTileCoords({x: 6, y: 6}));

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

function mouseCoordsToCanvas(event) {
    var bRect = canvas.getBoundingClientRect();
    var mouseX = (event.clientX - bRect.left) * (canvas.width / bRect.width);
    var mouseY = (event.clientY - bRect.top) * (canvas.height / bRect.height);
    return {x: mouseX, y: mouseY};
}
