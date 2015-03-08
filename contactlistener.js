function getContactListener() {
    var listener = new Box2D.JSContactListener();

    listener.BeginContact = function(contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();

        var entityA = fixtureA.entity;
        var entityB = fixtureB.entity;

        if(entityA) {
            if(entityB) {
                entityA.handleCollision(entityB);
            } else {
                entityA.handleWallCollision();
            }
        }
        if(entityB) {
            if(entityA) {
                entityB.handleCollision(entityA);
            } else {
                entityB.handleWallCollision();
            }
        }
    };

    listener.EndContact = function() {};
    listener.PreSolve = function() {};
    listener.PostSolve = function() {};

    return listener;
}
