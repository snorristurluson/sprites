function Recorder(player) {
    this.player = player;
    this.records = [];
    this.time = 0;
    this.currentRecordIndex = 0;
    this.isPlaying = false;

    this.add = function(timestamp, dir, isFiring, targetPos) {
        var record = {
            timestamp: timestamp,
            dir: dir,
            isFiring: isFiring,
            targetPos: targetPos
        };
        this.records.push(record);
    };

    this.rewind = function() {
        this.time = 0;
        this.currentRecordIndex = 0;
        this.isPlaying = true;
    };

    this.stop = function() {
        this.isPlaying = false;
    };

    this.update = function(td) {
        if(!this.isPlaying) {
            return;
        }

        var record = this.records[this.currentRecordIndex];
        if(record.timestamp != this.time) {
            console.error("Timestamps not in sync");
            return;
        }

        this.player.move(record.dir);
        this.player.isFiring = record.isFiring;
        this.player.targetPos = record.targetPos;

        this.time += td;
        this.currentRecordIndex++;
    };
}
