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
    this.tileShape.SetAsBox(this.tileWidth / 2.0, this.tileHeight / 2.0);

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
                this.addTile(j, i, line.charAt(j));
            }
        }
    };

    this.worldCoordsFromSpriteCoords = function(x, y) {
        x += this.tileWidth / 2.0;
        y += this.tileHeight / 2.0;

        //noinspection JSPotentiallyInvalidConstructorUsage
        return new Box2D.b2Vec2(x, y);
    };

    this.spriteCoordsFromWorldCoords = function(pos) {
        var x = pos.get_x() - this.tileWidth / 2.0;
        var y = pos.get_y() - this.tileHeight / 2.0;
        return {
            x: x,
            y: y
        };
    };

    this.addTile = function(x, y, tileType) {
        x *= this.tileWidth;
        y *= this.tileHeight;
        var sprite = this.createSprite(x, y, tileType);
        this.wallSprites.add(sprite);

        if(tileType == "x") {
            //noinspection JSPotentiallyInvalidConstructorUsage
            var bd = new Box2D.b2BodyDef();
            bd.set_position(this.worldCoordsFromSpriteCoords(x, y));
            var body = this.world.CreateBody(bd);
            var fixture = body.CreateFixture(this.tileShape, 0.0);
            fixture.type = "wall";
        }
    };

    this.createSprite = function(x, y, tileType) {
        var color;
        switch(tileType) {
            case "x":
                color = new Color(0.7, 0.7, 0, 1);
                break;
            case " ":
                color = new Color(0.9, 1, 0.9, 1);
                break;
            case "g":
                color = new Color(0.1, 1, 0.1, 1);
                break;
        }

        var sprite = new Sprite(x, y);
        sprite.color = color;

        return sprite;
    };

    this.addEntity = function(entity, x, y) {
        x *= this.tileWidth;
        y *= this.tileHeight;

        //noinspection JSPotentiallyInvalidConstructorUsage
        var bd = new Box2D.b2BodyDef();
        bd.set_type(Box2D.b2_dynamicBody);
        bd.set_position(this.worldCoordsFromSpriteCoords(x, y));

        var body = this.world.CreateBody(bd);

        // The fixture is used for collision detection. We attach the entity to the fixture
        // so we can discover what entities are involved in collisions.
        var fixture = body.CreateFixture(entity.shape, 0);
        fixture.type = "entity";
        fixture.entity = entity;

        body.SetLinearDamping(5);

        this.entitySprites.add(entity.sprite);

        entity.sprite.x = x;
        entity.sprite.y = y;
        entity.body = body;

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

        this.debugRenderer.clear();

        for(i = 0; i < this.entities.length; ++i) {
            entity = this.entities[i];
            entity.update(dt);
        }

        this.world.Step(dt, 10, 8);
        this.destroyBodies();

        for(i = 0; i < this.entities.length; ++i) {
            entity = this.entities[i];
            var pos = this.spriteCoordsFromWorldCoords(entity.body.GetPosition());
            entity.sprite.x = pos.x;
            entity.sprite.y = pos.y;
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
    };
}

