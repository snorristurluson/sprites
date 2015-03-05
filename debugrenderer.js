function DebugRenderer() {
    this.vertexBuffer = gl.createBuffer();
    this.lineSegments = [];

    this.addLineSegment = function(x0, y0, x1, y1, color) {
        var ls = {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1,
            color: color
        };
        this.lineSegments.push(ls);
    };

    this.addBox = function(x, y, width, height, color) {
        var x0 = x;
        var y0 = y;
        var x1 = x + width;
        var y1 = y + height;
        this.addLineSegment(x0, y0, x1, y0, color);
        this.addLineSegment(x1, y0, x1, y1, color);
        this.addLineSegment(x1, y1, x0, y1, color);
        this.addLineSegment(x0, y1, x0, y0, color);
    };

    this.render = function() {
        var numVertices = this.lineSegments.length * 2;

        var data = new Float32Array(numVertices * SPRITE_VERTEX_SIZE);

        var i;
        var offset = 0;
        for(i = 0; i < this.lineSegments.length; ++i) {
            var ls = this.lineSegments[i];
            offset += addVertex(data, offset, ls.x0, ls.y0, ls.color);
            offset += addVertex(data, offset, ls.x1, ls.y1, ls.color);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, SPRITE_VERTEX_SIZE * 4, 0);
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, SPRITE_VERTEX_SIZE * 4, 8);
        gl.drawArrays(gl.LINES, 0, numVertices);
    }
}