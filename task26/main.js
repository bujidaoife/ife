var EV_ENERGY = 'sun:energy';
var EV_BROADCAST = 'commander:broadcast';

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
        var self = this;
        this._el = document.getElementsByClassName('ship' + i)[0];
        this.engDec = engDec;
        this.n = i;
        this._state = 'destory';

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

        hide(this._el);
    },

    _getanim: function() {
        return this._el.style['animation-play-state'];
    },

    _setanim: function(state) {
        if (['running', 'paused'], state) {
            this._el.style['animation-play-state'] = state;
        }
    },

    flying: function() {
        return this._state === 'fly';
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

    fly: function() {
        if (has(['stop', 'start'], this._state)) {
            logger.info('ship', this.n, 'fly');
            show(this._el);
            this._setanim('running');
            setTimeout(this.onFly.bind(this), 1000);
            this._state = 'fly';
        }

    },

    stop: function() {
        if (this._state === 'fly') {
            logger.info('ship', this.n, 'stop');
            show(this._el);
            this._setanim('paused');
            this._state = 'stop';
        }

    },

    start: function() {
        if (this._state === 'destory') {
            logger.info('ship', this.n, 'set');
            show(this._el);
            this._setanim('paused');
            this._state = 'start';
        }
    },

    destory: function() {
        if (this._state !== 'destory') {
            logger.info('ship', this.n, 'destory');
            hide(this._el);
            this._setanim('paused');
            this._state = 'destory';
        }

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

var Mediator = {
    boradcast: function(msg) {
        if (Math.random() > 0.3) {
            logger.info(msg.command, 'command to ship', msg.ship);
            setTimeout(function() {
                EventEmitter.trigger(EV_BROADCAST, msg);
            }, 1000);
        } else {
            logger.error(msg.command, 'command to ship', msg.ship, 'missing');
        }
    },
};

var commander = {

    init: function() {
        var el = document.getElementsByClassName('commander')[0];
        el.addEventListener('click', function(e) {
            if (e.target.id) {
                var m = e.target.id[0];
                var i = e.target.id[1];
                switch (m) {
                    case 's':
                        commander.command('start', i);
                        break;
                    case 'd':
                        commander.command('destory', i);
                        break;
                    case 'f':
                        commander.command('fly', i);
                        break;
                    case 't':
                        commander.command('stop', i);
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
        Mediator.boradcast(msg);
    },

    command: function(command, i) {
        var msg = {
            command: command,
            ship: i
        };
        this.boradcast(msg);
        this.setBtnStat(i, command);
    },
};
