function ExitEntity() {
    Entity.call(this, "exit", 10);
    this.categoryBits = EntityCategory.WALL;
    this.maskBits = EntityCategory.PLAYER;
    this.sprite.color = new Color(0.9, 1, 0.1, 1);
    this.isStatic = true;
}

ExitEntity.prototype = Object.create(Entity.prototype);
ExitEntity.prototype.constructor = ExitEntity;
