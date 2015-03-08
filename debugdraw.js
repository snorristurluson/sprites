function getDebugDraw(debugRenderer) {
    var debugDraw = new Box2D.JSDraw();
    debugDraw.debugRenderer = debugRenderer;

    function colorFromBox2D(colorPtr) {
        var c = Box2D.wrapPointer(colorPtr, Box2D.b2Color);
        return new Color(c.get_r(), c.get_g(), c.get_b(), 1);
    }
    debugDraw.DrawSegment = function(v0Ptr, v1Ptr, colorPtr) {
        var v0 = Box2D.wrapPointer(v0Ptr, Box2D.b2Vec2);
        var v1 = Box2D.wrapPointer(v1Ptr, Box2D.b2Vec2);
        var color = colorFromBox2D(colorPtr);
        this.debugRenderer.addLineSegment(v0.get_x(), v0.get_y(), v1.get_x(), v1.get_y(), color);
    };

    debugDraw.DrawPolygon = function(vertices, vertexCount, colorPtr) {
        var i;
        var color = colorFromBox2D(colorPtr);
        var v0 = Box2D.wrapPointer(vertices, Box2D.b2Vec2);
        var v00 = v0;
        var v1;
        for(i = 1; i < vertexCount; ++i) {
            v1 = Box2D.wrapPointer(vertices + (i * 8), Box2D.b2Vec2);
            debugDraw.debugRenderer.addLineSegment(v0.get_x(), v0.get_y(), v1.get_x(), v1.get_y(), color);
            v0 = v1;
        }
        debugDraw.debugRenderer.addLineSegment(v1.get_x(), v1.get_y(), v00.get_x(), v00.get_y(), color);
    };

    debugDraw.DrawSolidPolygon = function(vertices, vertexCount, colorPtr) {
        var i;
        var color = colorFromBox2D(colorPtr);
        var v = Box2D.wrapPointer(vertices, Box2D.b2Vec2);
        var v00 = {
            x: v.get_x(),
            y: v.get_y()
        };
        var v0 = v00;
        for(i = 1; i < vertexCount; ++i) {
            v = Box2D.wrapPointer(vertices + (i * 8), Box2D.b2Vec2);
            var v1 = {
                x: v.get_x(),
                y: v.get_y()
            };
            debugDraw.debugRenderer.addTriangle(v00, v0, v1, color);
            v0 = v1;
        }
    };

    debugDraw.DrawCircle = function(centerPtr, radius, axisPtr, colorPtr) {
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
            debugDraw.debugRenderer.addLineSegment(p0, p1, color);
        }
    };

    debugDraw.DrawSolidCircle = function(centerPtr, radius, axisPtr, colorPtr) {
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
            debugDraw.debugRenderer.addTriangle(c, p0, p1, color);
        }
    };

    debugDraw.DrawTransform = function() {};

    return debugDraw;
}