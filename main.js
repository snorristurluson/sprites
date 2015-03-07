var canvas;
var sr;
var dr;
var level;
var player;

var debugRenderingEnabled = false;
var spriteRenderingEnabled = true;

function start() {
    canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);

    // Only continue if WebGL is available and working

    if (gl) {
        initShaders();
        sr = new SpriteRenderer();
        dr = new DebugRenderer();
        level = new Level();
        level.setupDebugDraw();
        level.enableDebugDraw(true);

        aClient = new HttpClient();
        aClient.get("levels/level0.txt", function(answer) {
            level.build(answer);

            player = new PlayerEntity();
            level.addEntity(player, 2, 2);

            monster1 = new Monster();
            monster1.behavior = new FollowEntity(monster1, player);
            level.addEntity(monster1, 5, 5);

            monster2 = new Monster();
            level.addEntity(monster2, 6, 5);

            monster3 = new Monster();
            level.addEntity(monster3, 5, 6);

            sr.sprites = sr.sprites.concat(level.sprites);

            function handleKeyDown(event) {
                return player.handleKeyDown(event);
            }
            function handleKeyUp(event) {
                return player.handleKeyUp(event);
            }
            document.addEventListener("keydown", handleKeyDown, false);
            document.addEventListener("keyup", handleKeyUp, false);
        });

        setInterval(tick, 16);
    }
}

function tick() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform2fv(uDimensions, new Float32Array([canvas.width, canvas.height]));

    dr.lineSegments = [];
    dr.triangles = [];

    // dr.addTriangle({x:0, y:0}, {x:100, y:0}, {x:100, y:100}, new Color(1,1,1,1));

    level.update(0.016);

    if(spriteRenderingEnabled) {
        sr.render();
    }

    if(debugRenderingEnabled) {
        dr.render();
    }
}

function handleDebugRenderClick(cb) {
    debugRenderingEnabled = cb.checked;
}

function handleSpriteRenderClick(cb) {
    spriteRenderingEnabled = cb.checked;
}

