function getContactListener(level) {
    var listener = new Box2D.JSContactListener();
    listener.level = level;

    listener.BeginContact = function(contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();

        var entityA = fixtureA.entity;
        var entityB = fixtureB.entity;

        if(entityA) {
            if(entityB) {
                entityA.handleCollision(level, entityB);
            } else {
                entityA.handleWallCollision(level);
            }
        }
        if(entityB) {
            if(entityA) {
                entityB.handleCollision(level, entityA);
            } else {
                entityB.handleWallCollision(level);
            }
        }
    };

    listener.EndContact = function() {};
    listener.PreSolve = function() {};
    listener.PostSolve = function() {};

    return listener;
}
