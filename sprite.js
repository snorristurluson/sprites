SPRITE_VERTEX_SIZE = 6;

function addVertex(buffer, offset, x, y, color) {
    buffer[offset] = x;
    buffer[offset + 1] = y;
    buffer[offset + 2] = color.r;
    buffer[offset + 3] = color.g;
    buffer[offset + 4] = color.b;
    buffer[offset + 5] = color.a;

    return SPRITE_VERTEX_SIZE;
}

function Sprite(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;

    this.width = 32;
    this.height = 32;
    this.color = new Color(1, 1, 1, 1);

    this.getVertices = function(buffer, offset) {
        offset += addVertex(buffer, offset, this.x, this.y, this.color);
        offset += addVertex(buffer, offset, this.x + this.width, this.y, this.color);
        offset += addVertex(buffer, offset, this.x + this.width, this.y + this.height, this.color);

        offset += addVertex(buffer, offset, this.x, this.y, this.color);
        offset += addVertex(buffer, offset, this.x + this.width, this.y + this.height, this.color);
        offset += addVertex(buffer, offset, this.x, this.y + this.height, this.color);
        return offset;
    };

    this.update = function(td) {
        this.x += td * this.dx;
        this.y += td * this.dy;

        if(this.x < 0) {
            this.dx = -this.dx;
        }
        else if(this.x + this.width > canvas.width) {
            this.dx = -this.dx;
        }
        if(this.y < 0) {
            this.dy = -this.dy;
        }
        else if(this.y + this.height > canvas.height) {
            this.dy = -this.dy;
        }
    }
}

