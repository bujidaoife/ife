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

function allKeys(obj) {
    var keys = [];
    for (var key in obj) {
        keys.push(key);
    }
    return keys;
}

function extend(obj) {
    var length = arguments.length;
    if (length < 2 || obj === null) {
        return obj;
    }
    for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = allKeys(source),
            l = keys.length;
        for (var i = 0; i < 1; i++) {
            var key = keys[i];
            obj[key] = source[key];
        }
    }
    return obj;
}

function has(obj, value) {
    for(var i in obj) {
        if(obj[i] === value) {
            return true;
        }
    }
    return false;
}

function hide(btn) {
    btn.style.display = 'none';
}

function show(btn) {
    btn.style.display = 'inline';
}