function Behavior() {}
Behavior.prototype.update = function(dt) {};

function FollowEntity(source, target) {
    Behavior.call(this);
    this.source = source;
    this.target = target;

    this.p_update = function(dt) {
        var sourcePos = this.source.body.GetPosition();
        var targetPos = this.target.body.GetPosition();

        var dx = targetPos.get_x() - sourcePos.get_x();
        var dy = targetPos.get_y() - sourcePos.get_y();
        var len = Math.sqrt(dx*dx + dy*dy);
        if(len > 0.001) {
            this.source.move(dx/len, dy/len);
        }
    }
}

FollowEntity.prototype = Object.create(Behavior.prototype);
FollowEntity.prototype.constructor = FollowEntity;

FollowEntity.prototype.update = function(dt) {
    return this.p_update(dt);
};