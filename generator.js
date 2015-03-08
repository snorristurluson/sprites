function Generator() {
    Entity.call(this, "generator", 30);
    this.sprite.color = new Color(0.1, 1, 0.1, 1);
    this.isStatic = true;
    this.spawnRate = 3;
    this.timeUntilSpawn = 1;
    this.monstersAlive = 0;
    this.maxMonstersAlive = 3;
    this.hitPoints = 5;

    this.categoryBits = EntityCategory.GENERATOR;
    this.maskBits = EntityCategory.PLAYER | EntityCategory.MONSTER | EntityCategory.PROJECTILE;

    var queryCallback = new Box2D.JSQueryCallback();
    queryCallback.ReportFixture = function(fixturePtr) {
        var fixture = Box2D.wrapPointer( fixturePtr, Box2D.b2Fixture );
        if(!fixture.TestPoint(this.point)) {
            return true;
        }
        this.blocked = true;
        return false;
    };

    this.p_update = function(dt) {
        if(this.monstersAlive < this.maxMonstersAlive) {
            this.timeUntilSpawn -= dt;
            if(this.timeUntilSpawn <= 0) {
                this.spawnMonster();
            }
        }
    };

    this.p_handleCollision = function(other) {
        this.p_handleCollision = function(other) {
            switch(other.type) {
                case "projectile":
                    this.hitPoints -= 1;
                    this.level.removeEntity(other);
                    break;
            }
            if(this.hitPoints <= 0) {
                this.die();
            }
        };
    };

    this.die = function() {
        this.maxMonstersAlive = 0;
        this.sprite.color = new Color(0, 0.3, 0, 1);
    };

    this.isValidSpawnLocation = function(worldPos) {

        var aabb = new Box2D.b2AABB();
        var d = 0.05;
        aabb.set_lowerBound(new Box2D.b2Vec2(worldPos.x - d, worldPos.y - d));
        aabb.set_upperBound(new Box2D.b2Vec2(worldPos.x + d, worldPos.y + d));

        this.level.debugRenderer.addBox(
            (worldPos.x - d) * globals.worldToSpriteScale,
            (worldPos.y - d) * globals.worldToSpriteScale,
            2*d * globals.worldToSpriteScale,
            2*d * globals.worldToSpriteScale,
            new Color(1, 0, 0, 1)
        );

        queryCallback.blocked = false;
        queryCallback.point = this.level.box2dCoordsFromWorldCoords(worldPos);

        this.level.world.QueryAABB(queryCallback, aabb);

        return !queryCallback.blocked;
    };

    this.findSpawnLocation = function() {
        var pos = this.level.worldCoordsFromBox2dCoords(this.body.GetPosition());
        var candidate;

        candidate = {x: pos.x - this.worldSize, y: pos.y};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }
        candidate = {x: pos.x - this.worldSize, y: pos.y - this.worldSize};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }
        candidate = {x: pos.x, y: pos.y - this.worldSize};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }
        candidate = {x: pos.x + this.worldSize, y: pos.y - this.worldSize};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }
        candidate = {x: pos.x + this.worldSize, y: pos.y};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }
        candidate = {x: pos.x + this.worldSize, y: pos.y + this.worldSize};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }
        candidate = {x: pos.x, y: pos.y + this.worldSize};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }
        candidate = {x: pos.x - this.worldSize, y: pos.y + this.worldSize};
        if(this.isValidSpawnLocation(candidate)) {
            return candidate;
        }

        return null;
    };

    this.spawnMonster = function() {
        var spawnPos = this.findSpawnLocation();
        if(spawnPos == null) {
            return;
        }

        var monster = new Monster();
        monster.behavior = new FollowEntity(monster, this.level.player);
        monster.generator = this;
        this.monstersAlive += 1;
        this.level.addEntity(monster, spawnPos);
        this.timeUntilSpawn = this.spawnRate;
    };
}

Generator.prototype = Object.create(Entity.prototype);
Generator.prototype.constructor = Generator;