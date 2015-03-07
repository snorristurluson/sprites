function Level() {
    this.source = null;
    this.sprites = [];
    this.entities = [];
    this.tileWidth = 32;
    this.tileHeight = 32;
    this.world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0));

    this.tileShape = new Box2D.b2PolygonShape();
    this.tileShape.SetAsBox(this.tileWidth / 2.0, this.tileHeight / 2.0);

    this.setupDebugDraw = function() {
        this.debugDraw = new Box2D.JSDraw();
        function colorFromBox2D(colorPtr) {
            var c = Box2D.wrapPointer(colorPtr, Box2D.b2Color);
            return new Color(c.get_r(), c.get_g(), c.get_b(), 1);
        }
        this.debugDraw.DrawSegment = function(v0Ptr, v1Ptr, colorPtr) {
            var v0 = Box2D.wrapPointer(v0Ptr, Box2D.b2Vec2);
            var v1 = Box2D.wrapPointer(v1Ptr, Box2D.b2Vec2);
            var color = colorFromBox2D(colorPtr);
            dr.addLineSegment(v0.get_x(), v0.get_y(), v1.get_x(), v1.get_y(), color);
        };

        this.debugDraw.DrawPolygon = function(vertices, vertexCount, colorPtr) {
            var i;
            var color = colorFromBox2D(colorPtr);
            var v0 = Box2D.wrapPointer(vertices, Box2D.b2Vec2);
            var v00 = v0;
            var v1;
            for(i = 1; i < vertexCount; ++i) {
                v1 = Box2D.wrapPointer(vertices + (i * 8), Box2D.b2Vec2);
                dr.addLineSegment(v0.get_x(), v0.get_y(), v1.get_x(), v1.get_y(), color);
                v0 = v1;
            }
            dr.addLineSegment(v1.get_x(), v1.get_y(), v00.get_x(), v00.get_y(), color);
        };

        this.debugDraw.DrawSolidPolygon = function(vertices, vertexCount, colorPtr) {
            var i;
            var color = colorFromBox2D(colorPtr);
            var v = Box2D.wrapPointer(vertices, Box2D.b2Vec2);
            var v0 = {
                x: v.get_x(),
                y: v.get_y()
            };
            var v00 = v0;
            for(i = 1; i < vertexCount; ++i) {
                v = Box2D.wrapPointer(vertices + (i * 8), Box2D.b2Vec2);
                var v1 = {
                    x: v.get_x(),
                    y: v.get_y()
                };
                dr.addTriangle(v00, v0, v1, color);
                v0 = v1;
            }
        };

        this.debugDraw.DrawCircle = function() {
            var color = colorFromBox2D(colorPtr);
            var center = Box2D.wrapPointer(centerPtr, Box2D.b2Vec2);
            var c = {
                x: center.get_x(),
                y: center.get_y()
            };

            var i;
            var step = 36;
            for(i = 0; i < 360; i += step) {
                var angle0 = i * (Math.PI / 180);
                var angle1 = (i + step) * (Math.PI / 180);
                var p0 = {
                    x: c.x + radius * Math.cos(angle0),
                    y: c.y + radius * Math.sin(angle0)
                };
                var p1 = {
                    x: c.x + radius * Math.cos(angle1),
                    y: c.y + radius * Math.sin(angle1)
                };
                dr.addLineSegment(p0, p1, color);
            }
        };

        this.debugDraw.DrawSolidCircle = function(centerPtr, radius, axisPtr, colorPtr) {
            var color = colorFromBox2D(colorPtr);
            var center = Box2D.wrapPointer(centerPtr, Box2D.b2Vec2);
            var c = {
                x: center.get_x(),
                y: center.get_y()
            };

            var i;
            var step = 36;
            for(i = 0; i < 360; i += step) {
                var angle0 = i * (Math.PI / 180);
                var angle1 = (i + step) * (Math.PI / 180);
                var p0 = {
                    x: c.x + radius * Math.cos(angle0),
                    y: c.y + radius * Math.sin(angle0)
                };
                var p1 = {
                    x: c.x + radius * Math.cos(angle1),
                    y: c.y + radius * Math.sin(angle1)
                };
                dr.addTriangle(c, p0, p1, color);
            }
        };

        this.debugDraw.DrawTransform = function() {};

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
            console.debug(line);
            for(j = 0; j < line.length; ++j) {
                this.addTile(j, i, line.charAt(j));
            }
        }
    };

    this.worldCoordsFromSpriteCoords = function(x, y) {
        var offsetX = this.tileWidth / 2.0;
        var offsetY = this.tileHeight / 2.0;
        return new Box2D.b2Vec2(x + offsetX, y + offsetY);
    };

    this.spriteCoordsFromWorldCoords = function(pos) {
        var offsetX = this.tileWidth / 2.0;
        var offsetY = this.tileHeight / 2.0;
        return {
            x: pos.get_x() - offsetX,
            y: pos.get_y() - offsetY
        };
    };

    this.addTile = function(x, y, tileType) {
        x *= this.tileWidth;
        y *= this.tileHeight;
        var sprite = this.createSprite(x, y, tileType);
        this.sprites.push(sprite);

        if(tileType == "x") {
            var bd = new Box2D.b2BodyDef();
            bd.set_position(this.worldCoordsFromSpriteCoords(x, y));
            var body = this.world.CreateBody(bd);
            body.CreateFixture(this.tileShape, 0.0);
        }
    };

    this.createSprite = function(x, y, tileType) {
        var color;
        switch(tileType) {
            case "x":
                color = new Color(1, 0, 0, 1);
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
        var bd = new Box2D.b2BodyDef();
        bd.set_type(Box2D.b2_dynamicBody);
        bd.set_position(this.worldCoordsFromSpriteCoords(x, y));
        var body = this.world.CreateBody(bd);
        body.CreateFixture(entity.shape, 0);
        body.SetLinearDamping(5);
        this.sprites.push(entity.sprite);
        entity.sprite.x = x;
        entity.sprite.y = y;
        entity.body = body;
        this.entities.push(entity);
    };

    this.update = function(dt) {
        this.world.Step(dt, 2, 2);

        var i;
        for(i = 0; i < this.entities.length; ++i) {
            var entity = this.entities[i];
            pos = this.spriteCoordsFromWorldCoords(entity.body.GetPosition());
            entity.sprite.x = pos.x;
            entity.sprite.y = pos.y;
        }
        this.world.DrawDebugData();
    }
}

