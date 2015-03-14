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
