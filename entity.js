function Entity(type, size) {
    this.type = type;
    this.size = size;

    //noinspection JSPotentiallyInvalidConstructorUsage
    this.shape = new Box2D.b2CircleShape();
    this.shape.set_m_radius(this.size / 2.0 / globals.worldToSpriteScale);

    this.body = null;

    this.sprite = new Sprite(-1, -1);
    this.sprite.color = new Color(0, 0, 1, 1);
    this.sprite.width = 32;
    this.sprite.height = 32;

    this.speed = 0;

    this.p_update = function(dt) {};

    this.p_move = function(x, y) {
        if(this.body)
        {
            var scaledX = x * this.speed;
            var scaledY = y * this.speed;
            //noinspection JSPotentiallyInvalidConstructorUsage
            var force = new Box2D.b2Vec2(scaledX, scaledY);
            this.body.ApplyForceToCenter(force, true);

            var cx = this.sprite.x + this.sprite.width / 2;
            var cy = this.sprite.y + this.sprite.height / 2;
            this.level.debugRenderer.addLineSegment(cx, cy, cx + x * 32, cy + y * 32, this.sprite.color);

        }
    };

    this.p_handleCollision = function(other) {};
    this.p_handleWallCollision = function() {};
}

Entity.prototype.update = function(dt) {
    return this.p_update(dt);
};

Entity.prototype.move = function(x, y) {
    return this.p_move(x, y);
};

Entity.prototype.handleCollision = function(other) {
    return this.p_handleCollision(other);
};

Entity.prototype.handleWallCollision = function() {
    return this.p_handleWallCollision();
};


function PlayerEntity() {
    Entity.call(this, "player", 30);

    this.speed = 0.75;

    // Firing interval in seconds
    this.firingInterval = 0.333;
    this.isFiring = false;
    this.targetPos = null;
    this.timeUntilFiringReady = 0;

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

        if(this.isFiring) {
            var cx = this.sprite.x + this.sprite.width / 2;
            var cy = this.sprite.y + this.sprite.height / 2;
            this.level.debugRenderer.addLineSegment(cx, cy, this.targetPos.x, this.targetPos.y, this.sprite.color);

            if(this.timeUntilFiringReady <= 0) {
                var dx = this.targetPos.x - cx;
                var dy = this.targetPos.y - cy;
                var len = Math.sqrt(dx*dx + dy*dy);
                if(len > 0.001) {
                    var direction = {x: dx/len, y: dy/len};
                    var pos = this.level.worldCoordsFromBox2dCoords(this.body.GetPosition());
                    this.level.addEntity(new Projectile(direction), pos);
                }
                this.timeUntilFiringReady = this.firingInterval;
            } else {
                this.timeUntilFiringReady -= dt;
                if(this.timeUntilFiringReady < 0) {
                    this.timeUntilFiringReady = 0;
                }
            }
        }
    };

    this.p_handleCollision = function(other) {
        console.debug(other.type);
        if(other.type == "monster") {
            this.level.removeEntity(other);
        }
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

    this.handleMouseDown = function(x, y) {
        this.isFiring = true;
    };

    this.handleMouseUp = function(x, y) {
        this.isFiring = false;
    };

    this.handleMouseMove = function(x, y) {
        this.targetPos = {x: x, y: y};
    };
}

PlayerEntity.prototype = Object.create(Entity.prototype);
PlayerEntity.prototype.constructor = PlayerEntity;


function Monster() {
    Entity.call(this, "monster", 30);
    this.speed = 0.3;
    this.sprite.color = new Color(1, 0, 0, 1);

    this.behavior = null;

    this.p_update = function(dt) {
        if(this.behavior) {
            this.behavior.update(dt)
        }
    }
}

Monster.prototype = Object.create(Entity.prototype);
Monster.prototype.constructor = Monster;


function Projectile(direction) {
    Entity.call(this, "projectile", 10);
    this.speed = 1;
    this.sprite.color = new Color(1, 0, 1, 1);
    this.direction = direction;

    this.behavior = null;

    this.p_update = function(dt) {
        this.move(this.direction.x, this.direction.y);
    };

    this.p_handleWallCollision = function() {
        this.level.removeEntity(this);
    }
}

Projectile.prototype = Object.create(Entity.prototype);
Projectile.prototype.constructor = Projectile;
