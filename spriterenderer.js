function SpriteRenderer() {
    this.vertexBuffer = gl.createBuffer();
    this.sprites = [];

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

