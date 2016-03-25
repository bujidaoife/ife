// 事件类型
var EV_ENERGY = 'sun:energy';
var EV_BROADCAST = 'commander:broadcast';
// 全局事件发射器
var EventEmitter = {
    cb: {},

    addEventListener: function(event, cb) {
        this.cb[event] = this.cb[event] || [];
        this.cb[event].push(cb);
    },

    trigger: function(event) {
        if (!this.cb[event]) {
            return;
        }
        var args = [].slice.call(arguments, 1);
        this.cb[event].forEach(function(cb) {
            cb.apply(null, args);
        });
    }
};
// 日志
var Logger = function(el) {
    this._el = el;
    this.log = function(level, args) {
        var p = document.createElement('p');
        p.innerHTML = [].join.call(args, ' ');
        p.classList.add(level);
        this._el.appendChild(p);
        this._el.scrollTop = this._el.scrollHeight;
    };

    this.info = function() {
        this.log('info', arguments);
    };

    this.warning = function() {
        this.log('warning', arguments);
    };

    this.error = function() {
        this.log('error', arguments);
    };
};

var logger = new Logger(document.getElementsByClassName('console')[0]);

// 太阳能
function sunInit() {
    setInterval(function() {
        EventEmitter.trigger(EV_ENERGY);
    }, 1000);
}

var Ship = function(i, engInc, engDec) {
    this.construct(i, engInc, engDec);
};

Ship.prototype = {

    construct: function(i, engInc, engDec) {
        this._el = document.getElementsByClassName('ship' + i)[0];
        this.engDec = engDec;
        this.n = i;
        Object.defineProperty(this, 'energy', {
            get: function() {
                var innerHTML = this._el.innerHTML;
                return parseInt(innerHTML.match(/\d+(?=%)/)[0]);
            },
            set: function(energy) {
                var innerHTML = this._el.innerHTML;
                energy = Math.min(100, energy);
                energy = Math.max(0, energy);
                this._el.innerHTML = innerHTML.replace(/\d+(?=%)/, '' + energy);
            }
        });

        Object.defineProperty(this, 'deg', {
            get: function() {
                var rotate = this._el.style.transform;
                if (rotate) {
                    return parseFloat(rotate.slice(7)) || 0;
                }
                return 0;
            },
            set: function(deg) {
                deg = deg % 360;
                if (deg < 0) {
                    deg += 360;
                }
                var rotate = 'rotate(' + deg + 'deg)';
                this._el.style.transform = rotate;
            }
        });

        var self = this;
        EventEmitter.addEventListener(EV_ENERGY, function() {
            var innerHTML = self._el.innerHTML;
            var energy = parseInt(innerHTML.match(/\d+(?=%)/)[0]);
            energy = Math.min(energy + engInc, 100);
            energy = Math.max(0, energy);
            self.energy = energy;
        });

        EventEmitter.addEventListener(EV_BROADCAST, function(msg) {
            if (msg.ship == i) {
                switch (msg.command) {
                    case 'start':
                        self.start();
                        break;
                    case 'fly':
                        self.fly();
                        break;
                    case 'stop':
                        self.stop();
                        break;
                    case 'destory':
                        self.destory();
                        break;
                }
            }
        });

        this.hide(true);
    },

    hide: function(hide) {
        this._el.style.display = hide ? 'none' : 'block';
    },

    flying: function() {
        return this._el.style['animation-play-state'] === 'running';
    },

    fly: function() {
        logger.info('ship', this.n, 'fly');
        this.hide(false);
        this._el.style['animation-play-state'] = 'running';
        setTimeout(this.onFly.bind(this), 1000);
    },

    onFly: function() {
        this.energy -= this.engDec;
        if (this.energy === 0) {
            this.stop();
            return;
        }
        if (this.flying()) {
            setTimeout(this.onFly.bind(this), 1000);
        }
    },

    start: function() {
        logger.info('ship', this.n, 'set');
        this.hide(false);
        this._el.style['animation-play-state'] = 'paused';
    },

    stop: function() {
        logger.info('ship', this.n, 'stop');
        this.hide(false);
        this._el.style['animation-play-state'] = 'paused';
    },

    destory: function() {
        logger.info('ship', this.n, 'destory');
        this.hide(true);
        this._el.style['animation-play-state'] = 'paused';
    }

};

var ShipFactory = {
    ships: [],
    getShip: function(i) {
        if (this.ships[i]) {
            return this.ships[i];
        }
        this.ships[i] = new Ship(i, 2, 4);
        return this.getShip(i);
    }
};


function hide(btn) {
    btn.style.display = 'none';
}

function show(btn) {
    btn.style.display = 'inline';
}

var commander = {

    init: function() {
        var el = document.getElementsByClassName('commander')[0];
        el.addEventListener('click', function(e) {
            if (e.target.id) {
                var m = e.target.id[0];
                var i = e.target.id[1];
                switch (m) {
                    case 's':
                        commander.startCommand(i);
                        break;
                    case 'd':
                        commander.destoryCommand(i);
                        break;
                    case 'f':
                        commander.flyCommand(i);
                        break;
                    case 't':
                        commander.stopCommand(i);
                        break;
                }
            }
        });
    },

    setBtnStat: function(i, state) {
        var sbtn = document.getElementById('s' + i);
        var dbtn = document.getElementById('d' + i);
        var fbtn = document.getElementById('f' + i);
        var tbtn = document.getElementById('t' + i);
        fbtn.disabled = false;
        switch (state) {
            case 'start':
                hide(sbtn);
                show(dbtn);
                show(fbtn);
                hide(tbtn);
                break;
            case 'fly':
                hide(sbtn);
                show(dbtn);
                hide(fbtn);
                show(tbtn);
                break;
            case 'stop':
                hide(sbtn);
                show(dbtn);
                show(fbtn);
                hide(tbtn);
                break;
            case 'destory':
                show(sbtn);
                hide(dbtn);
                show(fbtn);
                fbtn.disabled = true;
                hide(tbtn);
                break;
        }
    },

    boradcast: function(msg) {
        if (Math.random() > 0.3) {
            logger.info(msg.command, 'command to ship', msg.ship);
            EventEmitter.trigger(EV_BROADCAST, msg);
        } else {
            logger.error(msg.command, 'command to ship', msg.ship, 'missing');
        }
    },

    startCommand: function(i) {
        var msg = {
            command: 'start',
            ship: i
        };
        this.boradcast(msg);
        this.setBtnStat(i, 'start');
    },

    destoryCommand: function(i) {
        var msg = {
            command: 'destory',
            ship: i
        };
        this.boradcast(msg);
        this.setBtnStat(i, 'destory');
    },

    flyCommand: function(i) {
        var msg = {
            command: 'fly',
            ship: i
        };
        this.boradcast(msg);
        this.setBtnStat(i, 'fly');
    },

    stopCommand: function(i) {
        var msg = {
            command: 'stop',
            ship: i
        };
        this.boradcast(msg);
        this.setBtnStat(i, 'stop');
    }
};
