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
