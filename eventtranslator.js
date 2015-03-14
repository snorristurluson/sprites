function EventTranslator(player, canvas) {
    this.player = player;
    this.canvas = canvas;

    this.setEventListeners = function(element) {
        var _this = this;
        function forwardKeyDown(event) {
            _this.handleKeyDown(event);
        }
        function forwardKeyUp(event) {
            _this.handleKeyUp(event);
        }
        function forwardMouseDown(event) {
            _this.handleMouseDown(event);
        }
        function forwardMouseMove(event) {
            _this.handleMouseMove(event);
        }
        function forwardMouseUp(event) {
            _this.handleMouseUp(event);
        }

        element.addEventListener("keydown", forwardKeyDown, false);
        element.addEventListener("keyup", forwardKeyUp, false);
        element.addEventListener("mousedown", forwardMouseDown, false);
        element.addEventListener("mousemove", forwardMouseMove, false);
        element.addEventListener("mouseup", forwardMouseUp, false);
    };

    this.update = function(td) {
        var dir = this.getMoveFromKeyState();
        this.player.move(dir);
        this.player.isFiring = this.isFiring;
        this.player.targetPos = this.targetPos;
    };

    this.keyState = {
        up: false,
        right: false,
        down: false,
        left: false
    };

    this.isFiring = false;
    this.targetPos = null;

    this.updateKeyState = function(keyPressed, value) {
        switch(keyPressed) {
            case "W":
                this.keyState.up = value;
                break;
            case "D":
                this.keyState.right = value;
                break;
            case "S":
                this.keyState.down = value;
                break;
            case "A":
                this.keyState.left = value;
                break;
        }
    };

    this.handleKeyDown = function(event) {
        var keyPressed = String.fromCharCode(event.keyCode);
        this.updateKeyState(keyPressed, true);
    };

    this.handleKeyUp = function(event) {
        var keyPressed = String.fromCharCode(event.keyCode);
        this.updateKeyState(keyPressed, false);
    };

    this.handleMouseDown = function(event) {
        var coords = this.mouseCoordsToCanvas(event);
        if(coords.x < 0 || coords.x > canvas.width) {
            return;
        }
        if(coords.y < 0 || coords.y > canvas.height) {
            return;
        }

        this.isFiring = true;
    };

    this.handleMouseUp = function(event) {
        this.isFiring = false;
    };

    this.handleMouseMove = function(event) {
        this.targetPos = this.mouseCoordsToCanvas(event);
    };

    this.getMoveFromKeyState = function() {
        var move = { x: 0, y: 0};

        if(this.keyState.up) {
            move.y = -1;
        } else if(this.keyState.down) {
            move.y = 1;
        }

        if(this.keyState.left) {
            move.x = -1;
        } else if(this.keyState.right) {
            move.x = 1;
        }

        return move;
    };

    this.mouseCoordsToCanvas = function(event) {
        var bRect = this.canvas.getBoundingClientRect();
        var mouseX = (event.clientX - bRect.left) * (this.canvas.width / bRect.width);
        var mouseY = (event.clientY - bRect.top) * (this.canvas.height / bRect.height);
        return {x: mouseX, y: mouseY};
    }
}
