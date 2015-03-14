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
