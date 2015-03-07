function Entity(type, size) {
    this.type = type;
    this.size = size;

    this.shape = new Box2D.b2CircleShape();
    this.shape.set_m_radius(this.size / 2.0);

    this.body = null;

    this.sprite = new Sprite(-1, -1);
    this.sprite.color = new Color(0, 0, 1, 1);
    this.sprite.width = 32;
    this.sprite.height = 32;

    this.p_move = function(x, y) {
        if(this.body)
        {
            var scale = 1000000;
            var force = new Box2D.b2Vec2(x*scale, y*scale);
            this.body.ApplyForceToCenter(force, true);
        }
    };
}

Entity.prototype.update = function(dt) {};
Entity.prototype.move = function(x, y) {
    return this.p_move(x, y);
};

function PlayerEntity() {
    Entity.call(this, "player", 30);

    this.keyState = {
        up: false,
        right: false,
        down: false,
        left: false
    };

    this.p_update = function(dt) {
        var x = 0;
        var y = 0;
        if(this.keyState.up) {
            y = -1;
        } else if(this.keyState.down) {
            y = 1;
        }

        if(this.keyState.left) {
            x = -1;
        } else if(this.keyState.right) {
            x = 1;
        }
        this.move(x, y);
    };

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
}

PlayerEntity.prototype = Object.create(Entity.prototype);
PlayerEntity.prototype.update = function(dt) {
    this.p_update(dt);
};

