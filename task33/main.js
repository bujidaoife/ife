var COLS = 10,
    ROWS = 10,
    PPX = 30,
    ENTER_CODE = 13;

var node = {
    el: $('#node'),

    run: function(command) {
        var cs = command.split(' ');
        switch (cs[0]) {
            case 'GO':
                this.go();
                break;
            case 'TUN':
                if (cs[1]) {
                    this.turn(cs[1]);
                } else {
                    console.log('TUN need direction arguments');
                }
                break;
            default:
                console.log('error command', command);
        }
    },

    go: function() {
        switch (this.rotate / 90) {
            case 0:
                this.y--;
                break;
            case 1:
                this.x++;
                break;
            case 2:
                this.y++;
                break;
            case 3:
                this.x--;
                break;
        }
    },

    turn: function(dir) {
        switch (dir) {
            case 'LEF':
                this.rotate -= 90;
                break;
            case 'RIG':
                this.rotate += 90;
                break;
            case 'BAC':
                this.rotate += 180;
                break;
            default:
                console.log(dir, 'is not a valid direction');
        }
    }
};

Object.defineProperties(node, {
    'x': {
        get: function() {
            var left = parseInt(this.el.css('left'));
            if (left) {
                return left / PPX + 1;
            }
            return 1;
        },
        set: function(x) {
            if (x < 1 || x > ROWS) {
                console.log('out of content x = ', x);
            } else {
                this.el.css('left', PPX * (x - 1) + 'px');
            }
        }
    },
    'y': {
        get: function() {
            var top = parseInt(this.el.css('top'));
            if (top) {
                return top / PPX + 1;
            }
            return 1;
        },
        set: function(y) {
            if (y < 1 || y > COLS) {
                console.log('out of content x = ', y);
            } else {
                this.el.css('top', PPX * (y - 1) + 'px');
            }
        }
    },
    'rotate': {
        get: function() {
            var transform = this.el[0].style.transform;
            var rotate = transform.match(/\d+(?=deg)/);
            if (rotate && rotate.length) {
                return parseInt(rotate[0]) || 0;
            }
            return 0;
        },
        set: function(rotate) {
            rotate = rotate % 360;
            if (rotate < 0) {
                rotate += 360;
            }
            this.el.css('transform', 'rotate(' + rotate + 'deg)');
        }
    }
});

$('#input').on('keypress', function(e) {
    if(e.keyCode === ENTER_CODE) {
        node.run(this.value);
    }
});