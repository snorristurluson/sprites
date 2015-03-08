function Level() {
    this.debugRenderer = new DebugRenderer();
    this.wallSprites = new SpriteRenderer();
    this.entitySprites = new SpriteRenderer();

    this.source = null;
    this.entities = [];
    this.tileWidth = 32;
    this.tileHeight = 32;

    //noinspection JSPotentiallyInvalidConstructorUsage
    this.world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0));

    // We may want to respond to collision by removing things from the world, but
    // we can't do that inside the collision handling. Instead, we gather up a list
    // of bodies that should be destroyed and process that after stepping the world.
    this.bodiesToDestroy = [];

    this.world.SetContactListener(getContactListener(this));

    //noinspection JSPotentiallyInvalidConstructorUsage
    this.tileShape = new Box2D.b2PolygonShape();
    this.tileShape.SetAsBox(
        this.tileWidth / 2.0 / globals.worldToSpriteScale,
        this.tileHeight / 2.0 / globals.worldToSpriteScale
    );

    this.setupDebugDraw = function() {
        this.debugDraw = getDebugDraw(this.debugRenderer);
        this.world.SetDebugDraw(this.debugDraw);
    };

    this.enableDebugDraw = function(enabled) {
        if(enabled) {
            this.debugDraw.SetFlags(255);
        }
        else {
            this.debugDraw.SetFlags(0);
        }
    };

    this.build = function(source) {
        this.source = source;

        var lines = this.source.split("\r\n");
        var i, j;
        for(i = 0; i < lines.length; ++i) {
            var line = lines[i];
            for(j = 0; j < line.length; ++j) {
                this.addTile({x: j, y: i}, line.charAt(j));
            }
        }
    };

    this.worldCoordsFromSpriteCoords = function(pos) {
        var x = pos.x;
        var y = pos.y;

        x += this.tileWidth / 2.0;
        y += this.tileHeight / 2.0;

        x /= globals.worldToSpriteScale;
        y /= globals.worldToSpriteScale;

        return {
            x: x,
            y: y
        };
    };

    this.spriteCoordsFromWorldCoords = function(pos) {
        var x = pos.x * globals.worldToSpriteScale - this.tileWidth / 2.0;
        var y = pos.y * globals.worldToSpriteScale - this.tileHeight / 2.0;
        return {
            x: x,
            y: y
        };
    };

    this.box2dCoordsFromWorldCoords = function(pos) {
        //noinspection JSPotentiallyInvalidConstructorUsage
        return new Box2D.b2Vec2(pos.x, pos.y);
    };

    this.worldCoordsFromBox2dCoords = function(pos) {
        return {
            x: pos.get_x(),
            y: pos.get_y()
        };
    };

    this.spriteCoordsFromTileCoords = function(pos) {
        var x = pos.x;
        var y = pos.y;

        x *= this.tileWidth;
        y *= this.tileHeight;

        return {
            x: x,
            y: y
        };
    };

    this.worldCoordsFromTileCoords = function(pos) {
        var spritePos = this.spriteCoordsFromTileCoords(pos);
        return this.worldCoordsFromSpriteCoords(spritePos);
    };

    this.addWallToWorld = function(tilePos) {
        //noinspection JSPotentiallyInvalidConstructorUsage
        var bd = new Box2D.b2BodyDef();
        var worldPos = this.worldCoordsFromTileCoords(tilePos);
        var box2dPos = this.box2dCoordsFromWorldCoords(worldPos);
        bd.set_position(box2dPos);
        var body = this.world.CreateBody(bd);
        var fixture = body.CreateFixture(this.tileShape, 0.0);
        fixture.type = "wall";
    };

    this.addGenerator = function(tilePos) {
        var generator = new Generator();
        this.addEntity(generator, this.worldCoordsFromTileCoords(tilePos));
    };

    this.addTile = function(tilePos, tileType) {
        var spritePos = this.spriteCoordsFromTileCoords(tilePos);
        var sprite;
        switch(tileType) {
            case "x":
                sprite = new Sprite(spritePos.x, spritePos.y);
                sprite.color = new Color(0.7, 0.7, 0, 1);
                this.wallSprites.add(sprite);
                this.addWallToWorld(tilePos);
                break;
            case " ":
                sprite = new Sprite(spritePos.x, spritePos.y);
                sprite.color = new Color(0.9, 1, 0.9, 1);
                this.wallSprites.add(sprite);
                break;
            case "s":
                sprite = new Sprite(spritePos.x, spritePos.y);
                sprite.color = new Color(0.7, 0.7, 1, 1);
                this.wallSprites.add(sprite);
                this.spawnLocation = this.worldCoordsFromTileCoords(tilePos);
                break;
            case "e":
                sprite = new Sprite(spritePos.x, spritePos.y);
                sprite.color = new Color(0.7, 1, 0.7, 1);
                this.wallSprites.add(sprite);
                break;
            case "g":
                this.addGenerator(tilePos);
                break;
        }
    };

    this.setPlayer = function(player) {
        this.player = player;
        this.addEntity(this.player, this.spawnLocation);
    };

    this.addEntity = function(entity, pos) {
        //noinspection JSPotentiallyInvalidConstructorUsage
        var bd = new Box2D.b2BodyDef();
        if(!entity.isStatic) {
            bd.set_type(Box2D.b2_dynamicBody);
        }
        bd.set_position(this.box2dCoordsFromWorldCoords(pos));

        var body = this.world.CreateBody(bd);

        // The fixture is used for collision detection. We attach the entity to the fixture
        // so we can discover what entities are involved in collisions.
        var fixture = body.CreateFixture(entity.shape, 1);
        fixture.type = "entity";
        fixture.entity = entity;

        //noinspection JSPotentiallyInvalidConstructorUsage
        var filterData = new Box2D.b2Filter();
        filterData.set_categoryBits(entity.categoryBits);
        filterData.set_maskBits(entity.maskBits);
        fixture.SetFilterData(filterData);

        body.SetLinearDamping(10);

        this.entitySprites.add(entity.sprite);

        var spriteCoords = this.spriteCoordsFromWorldCoords(pos);

        entity.sprite.x = spriteCoords.x;
        entity.sprite.y = spriteCoords.y;
        entity.body = body;

        entity.level = this;

        this.entities.push(entity);
    };

    this.removeEntity = function(entity) {
        var index = this.entities.indexOf(entity);
        if(index != -1) {
            this.entities.splice(index, 1);
            this.entitySprites.remove(entity.sprite);
            this.bodiesToDestroy.push(entity.body);
        }
    };

    this.destroyBodies = function() {
        var i;
        for(i = 0; i < this.bodiesToDestroy.length; ++i) {
            this.world.DestroyBody(this.bodiesToDestroy[i]);
        }
        this.bodiesToDestroy = [];
    };

    this.update = function(dt) {
        var i;
        var entity;

        for(i = 0; i < this.entities.length; ++i) {
            entity = this.entities[i];
            entity.update(dt);
        }

        this.world.Step(dt, 10, 8);
        this.destroyBodies();

        for(i = 0; i < this.entities.length; ++i) {
            entity = this.entities[i];
            var pos = this.worldCoordsFromBox2dCoords(entity.body.GetPosition());
            var spritePos = this.spriteCoordsFromWorldCoords(pos);
            entity.sprite.x = spritePos.x;
            entity.sprite.y = spritePos.y;
        }
        this.world.DrawDebugData();
    };

    this.render = function() {
        if(globals.spriteRenderingEnabled) {
            this.wallSprites.render();
            this.entitySprites.render();
        }

        if(globals.debugRenderingEnabled) {
            this.debugRenderer.render();
        }
        this.debugRenderer.clear();
    };
}

