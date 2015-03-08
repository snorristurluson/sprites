function SpriteRenderer() {
    this.vertexBuffer = gl.createBuffer();
    this.sprites = [];

    this.add = function(sprite) {
        this.sprites.push(sprite);
    };

    this.remove = function(sprite) {
        var index = this.sprites.indexOf(sprite);
        if(index != -1) {
            this.sprites.splice(index, 1);
        }
    };

    this.render = function() {
        var numVertices = this.sprites.length * 6;
        var data = new Float32Array(numVertices * SPRITE_VERTEX_SIZE);

        var i;
        var offset = 0;
        for(i = 0; i < this.sprites.length; ++i) {
            offset = this.sprites[i].getVertices(data, offset);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, SPRITE_VERTEX_SIZE * 4, 0);
        gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, SPRITE_VERTEX_SIZE * 4, 8);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    };
}

