function Level() {
    this.source = null;
    this.sprites = [];
    this.tileWidth = 32;
    this.tileHeight = 32;
    this.world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0));

    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(this.tileWidth / 2.0, this.tileHeight / 2.0);

    var debugDraw = new Box2D.JSDraw();
    function colorFromBox2D(colorPtr) {
        var c = Box2D.wrapPointer(colorPtr, Box2D.b2Color);
        return new Color(c.get_r(), c.get_g(), c.get_b(), 1);
    }
    debugDraw.DrawSegment = function(v0Ptr, v1Ptr, colorPtr) {
        console.debug("DrawSegment");
        var v0 = Box2D.wrapPointer(v0Ptr, Box2D.b2Vec2);
        var v1 = Box2D.wrapPointer(v1Ptr, Box2D.b2Vec2);
        var color = colorFromBox2D(colorPtr);
        dr.addLineSegment(v0.get_x(), v0.get_y(), v1.get_x(), v1.get_y(), color);
    };

    debugDraw.DrawPolygon = function(vertices, vertexCount, colorPtr) {
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

    debugDraw.DrawSolidPolygon = debugDraw.DrawPolygon;

    debugDraw.DrawCircle = function() {};
    debugDraw.DrawSolidCircle = function() {};
    debugDraw.DrawTransform = function() {};
    debugDraw.SetFlags(255);

    this.world.SetDebugDraw(debugDraw);

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

    this.addTile = function(x, y, tileType) {
        x *= this.tileWidth;
        y *= this.tileHeight;
        var sprite = this.createSprite(x, y, tileType);
        this.sprites.push(sprite);

        if(tileType == "x") {
            var bd = new Box2D.b2BodyDef();
            bd.set_position( new Box2D.b2Vec2(x + this.tileWidth / 2.0, y + this.tileHeight / 2.0));
            var body = this.world.CreateBody(bd);
            body.CreateFixture(shape, 0.0);
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

    this.update = function(dt) {
        this.world.Step(dt, 2, 2);
        this.world.DrawDebugData();
    }
}

