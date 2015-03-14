attribute vec2 aVertexPosition;
attribute vec4 aColor;
uniform vec2 uDimensions;

varying lowp vec4 vColor;

void main(void)
{
    float x = (aVertexPosition.x / uDimensions.x - 0.5) * 2.0;
    float y = (-aVertexPosition.y / uDimensions.y + 0.5) * 2.0;
    gl_Position = vec4(x, y, 0.0, 1.0);
    vColor = aColor;
}
