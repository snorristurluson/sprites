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
