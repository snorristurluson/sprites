function Level() {
    this.source = null;
    this.sprites = [];

    this.build = function(source) {
        this.source = source;

        var lines = this.source.split("\r\n");
        var i, j, x, y;
        for(i = 0; i < lines.length; ++i) {
            var line = lines[i];
            console.debug(line);
            for(j = 0; j < line.length; ++j) {
                x = j * 32;
                y = i * 32;
                var sprite = this.createSprite(x, y, line.charAt(j));
                this.sprites.push(sprite);
            }
        }
    };

    this.createSprite = function(x, y, type) {
        var color;
        switch(type) {
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

        console.debug(x, y, color);

        return sprite;
    };
}

