var COLS = 10,
    ROWS = 10,
    PPX = 30,
    ENTER_CODE = 13;


var node = {
    el: $('#node'),

    run: function(method) {
        switch (method) {
            case 'GO':
                return this.go(parseInt(arguments[1]) || 1);
            case 'TRA':
                if (arguments[1]) {
                    return this.tra(arguments[1], parseInt(arguments[2]) || 1);
                } else {
                    console.log('TUN need direction arguments');
                }
                break;
            case 'TUN':
                if (arguments[1]) {
                    return this.turn(arguments[1]);
                } else {
                    console.log('TUN need direction arguments');
                }
                break;
            case 'MOV':
                if (arguments[1]) {
                    return this.move(arguments[1], parseInt(arguments[2]) || 1);
                } else {
                    console.log('MOV need direction arguments');
                }
                break;
            default:
                console.log('error command', method, [].slice.call(arguments, 1));
        }
    },

    getRotate360: function() {
        var rotate = this.rotate % 360;
        if (rotate < 0) {
            rotate += 360;
        }
        return rotate;
    },

    promiseTransition: function(func) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.el.off('transitionend');
            self.el.on('transitionend', function() {
                resolve();
            });
            setTimeout(function() {
                reject('Transition Timeout');
            }, 1500);
            try {
                func();
            } catch (e) {
                reject(e);
            }
        });
    },

    go: function(n) {
        var self = this;
        var promise = this.promiseTransition(function() {
            switch (self.getRotate360() / 90) {
                case 0:
                    self.y -= n;
                    break;
                case 1:
                    self.x += n;
                    break;
                case 2:
                    self.y += n;
                    break;
                case 3:
                    self.x -= n;
                    break;
            }
        });
        return promise;
    },

    tra: function(dir, n) {
        console.log(this);
        var self = this;
        var promise = this.promiseTransition(function() {
            switch (dir) {
                case 'TOP':
                    self.y -= n;
                    break;
                case 'RIG':
                    self.x += n;
                    break;
                case 'BOT':
                    self.y += n;
                    break;
                case 'LEF':
                    self.x -= n;
                    break;
            }
        });
        return promise;
    },

    turn: function(dir) {
        var self = this;
        var promise = this.promiseTransition(function() {
            switch (dir) {
                case 'LEF':
                    self.rotate -= 90;
                    break;
                case 'RIG':
                    self.rotate += 90;
                    break;
                case 'BAC':
                    self.rotate += 180;
                    break;
                default:
                    throw (dir, 'is not a valid direction');
            }
        });
        return promise;
    },

    move: function(dir, n) {
        var self = this;
        return this.turn(dir)
            .then(function() {
                return self.go(n);
            });
    },
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
            x = Math.round(x);
            if (x < 1 || x > ROWS) {
                throw 'out of content x = ' + x;
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
            y = Math.round(y);
            if (y < 1 || y > COLS) {
                throw 'out of content x = ' + y;
            } else {
                this.el.css('top', PPX * (y - 1) + 'px');
            }
        }
    },
    'rotate': {
        get: function() {
            var transform = this.el[0].style.transform;
            var rotate = transform.match(/-?\d+(?=deg)/);
            if (rotate && rotate.length) {
                return parseInt(rotate[0]) || 0;
            }
            return 0;
        },
        set: function(rotate) {
            this.el.css('transform', 'rotate(' + rotate + 'deg)');
        }
    }
});

function updateLines() {
    setTimeout(function() {
        var lines = $('.input .lines');
        var length = $('.input .code').val().split('\n').length;
        lines.html('');
        for (var i = 1; i <= length; i++) {
            lines.append($('<li>' + i + '</li>'))
        }
        syncScroll();
    }, 0);
}

function syncScroll() {
    if ($('.input li')[0]) {
        $('.input li')[0].style.marginTop = -$('.input .code').scrollTop() + 'px'
    }
}

function parse(command) {
    return command.split(' ');
}

function run() {
    var commands = $('.input .code').val().split('\n');
    var command;
    var p = Promise.resolve();
    for (var i = 0; i < commands.length; i++) {
        p = p.then((function() {
            var index = i;
            return function() {
                var command = parse(commands[index]);
                if (command.length) {
                    return node.run.apply(node, command);
                } else {
                    $('.lines li')[index].classList.add('error');
                }
            };
        })(), (function() {
            var index = i;
            return function() {
                $('.lines li')[index].classList.add('error');
                return Promise.reject();
            };
        })());
    }
    return p;
}

function reset() {
    $('.input .code').val('').click();
}
