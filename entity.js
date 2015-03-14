var EntityCategory = {
    WALL: 1,
    PLAYER: 2,
    MONSTER: 4,
    PROJECTILE: 8,
    GENERATOR: 16
};

function Entity(type, size) {
    this.type = type;
    this.size = size;
    this.worldSize = this.size / globals.worldToSpriteScale;

    //noinspection JSPotentiallyInvalidConstructorUsage
    this.shape = new Box2D.b2CircleShape();
    this.shape.set_m_radius(this.worldSize / 2.0);

    this.body = null;

    this.sprite = new Sprite(-1, -1);
    this.sprite.color = new Color(0, 0, 1, 1);
    this.sprite.width = size;
    this.sprite.height = size;

    this.speed = 0;

    this.isStatic = false;
    this.categoryBits = 1;
    this.maskBits = 0xffff;

    this.p_update = function(dt) {};

    this.p_move = function(dir) {
        if(this.body)
        {
            var scaledX = dir.x * this.speed;
            var scaledY = dir.y * this.speed;
            //noinspection JSPotentiallyInvalidConstructorUsage
            var force = new Box2D.b2Vec2(scaledX, scaledY);
            this.body.ApplyForceToCenter(force, true);

            var cx = this.sprite.x + this.sprite.width / 2;
            var cy = this.sprite.y + this.sprite.height / 2;
            this.level.debugRenderer.addLineSegment(cx, cy, cx + dir.x * 32, cy + dir.y * 32, this.sprite.color);

        }
    };

    this.p_handleCollision = function(other) {};
    this.p_handleWallCollision = function() {};
}

Entity.prototype.update = function(dt) {
    return this.p_update(dt);
};

Entity.prototype.move = function(dir) {
    return this.p_move(dir);
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
    this.categoryBits = EntityCategory.PLAYER;
    this.maskBits = EntityCategory.WALL | EntityCategory.MONSTER | EntityCategory.GENERATOR;

    // Firing interval in seconds
    this.firingInterval = 0.333;
    this.isFiring = false;
    this.targetPos = null;
    this.timeUntilFiringReady = 0;

    this.p_update = function(dt) {
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
    };
}

PlayerEntity.prototype = Object.create(Entity.prototype);
PlayerEntity.prototype.constructor = PlayerEntity;


function Monster() {
    Entity.call(this, "monster", 30);
    this.hitPoints = 2;
    this.speed = 0.3;
    this.sprite.color = new Color(1, 0, 0, 1);

    this.behavior = null;

    this.categoryBits = EntityCategory.WALL | EntityCategory.GENERATOR | EntityCategory.MONSTER;
    this.maskBits = 0xffff;

    this.p_update = function(dt) {
        if(this.behavior) {
            this.behavior.update(dt)
        }
    };

    this.p_handleCollision = function(other) {
        switch(other.type) {
            case "projectile":
                this.hitPoints -= 1;
                this.level.removeEntity(other);
                break;
            case "player":
                this.hitPoints -= 1;
        }
        if(this.hitPoints <= 0) {
            this.die();
        }
    };

    this.die = function() {
        this.level.removeEntity(this);
        this.generator.monstersAlive -= 1;
    };
}

Monster.prototype = Object.create(Entity.prototype);
Monster.prototype.constructor = Monster;


function Projectile(direction) {
    Entity.call(this, "projectile", 10);
    this.speed = 1;
    this.sprite.color = new Color(1, 0, 1, 1);
    this.direction = direction;

    this.behavior = null;

    this.categoryBits = EntityCategory.PROJECTILE;
    this.maskBits = EntityCategory.WALL | EntityCategory.MONSTER | EntityCategory.GENERATOR;

    this.p_update = function(dt) {
        this.move(this.direction);
    };

    this.p_handleWallCollision = function() {
        this.level.removeEntity(this);
    }
}

Projectile.prototype = Object.create(Entity.prototype);
Projectile.prototype.constructor = Projectile;
