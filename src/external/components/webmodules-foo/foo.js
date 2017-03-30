// is Utility functions
(function(foo) {

    foo.mixin = function(obj, proto) {
        for (var prop in proto) {
            if (proto.hasOwnProperty(prop)) {
                obj[prop] = proto[prop];
            }
        }
        return obj;
    };

    foo.debounce = function debounce(func, wait, immediate, fname) {
        var timeout, args, context, timestamp, result;
        var fname = fname || func.name;
        return function() {
            if (context !== undefined && context !== this) {
                if (fname && (!this.hasOwnProperty(fname) || this[func.name] === context[fname])) {
                    this[fname] = foo.debounce(func, wait, immediate, fname);
                    return this[fname].apply(this, arguments);
                }
            }
            context = this;
            args = arguments;
            timestamp = new Date();
            var later = function() {
                var last = (new Date()) - timestamp;
                if (last < wait) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate)
                        result = func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow)
                result = func.apply(context, args);
            return result;
        };
    };

    foo.until = function(fun, condition, delay) {
        if ((is.Function(condition) && condition()) || condition == true) {
            fun();
        } else {
            foo.setTimeout(function() {
                foo.until(fun, condition, delay)
            }, delay || 200)
        }
    };

    foo.getUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r
                    : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    };

    foo.preventPropagation = function(event) {
        if (!event)
            var event = window.event;
        if (event) {
            if (event.preventDefault !== undefined) {
                event.preventDefault && event.preventDefault();
            }
            event.cancelBubble = true;
            event.returnValue = false;
            if (event.stopPropagation !== undefined) {
                event.stopPropagation();
            }
            if (event.stopImmediatePropagation !== undefined) {
                event.stopImmediatePropagation();
            }
            return false;
        }
    };

})(this);

// is Resolver
(function(foo) {
    function getType(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }

    function is(type, obj) {
        var clas = getType(obj);
        return obj !== undefined && obj !== null && clas === type;
    }

    is.Function = function(obj) {
        return is("Function", obj);
    };
    is.Object = function(obj) {
        return is("Object", obj);
    };
    is.Array = function(obj) {
        return is("Array", obj);
    };
    is.Null = function(obj) {
        return is("Null", obj);
    };
    is.Undefined = function(obj) {
        return getType(obj) === "Undefined";
    };
    is.Number = function(obj) {
        return is("Number", obj);
    };
    is.String = function(obj) {
        return is("String", obj);
    };
    is.Value = function(obj) {
        var clas = getType(obj);
        return !(clas === "Undefined" || clas === "Null");
    };
    is.Empty = function(obj) {
        var clas = getType(obj);
        switch (clas) {
            case "Undefined":
            case "Null":
                return true;
                break;
            case "Boolean":
                return obj;
                break;
            case "Number":
                return obj === 0;
            case "String":
            case "Array":
                return (obj.length === 0);
                break;
            default:
                for (var key in obj) {
                    if (hasOwnProperty.call(obj, key))
                        return false;
                }
                return true;
                break;
        }
        return !(is.Undefined(obj) || is.Null(obj));
    };
    is.Valid = function(condition, message) {
        if (!condition && is.String(message)) {
            throw Error(message);
        }
        return !!condition;
    };
    foo.is = is;

})(this);


(function(foo) {

    function JSONPath(path) {
        if (this === window) {
            return new window.JSONPath(path);
        }
        this.keys = path.split(".");
    }

    JSONPath.prototype.load = function(sourceObj, defaultValue, self) {
        var value = sourceObj;
        for (var i in this.keys) {
            if (is.Object(value) || is.Array(value)) {
                value = value[this.keys[i]];
            } else break;
        }
        if (!is.Undefined(value)) {
            return value;
        }
        return  defaultValue;
    };

    foo.JSONPath = JSONPath;

})(this);

(function(foo) {
    var isCorrupted = {"null": true, "undefined": true };

    function to() {
    }

    to.List = function(str) {
        return is.String(str) && !is.Empty(str) && !isCorrupted[str] ? str.split(",") : (is.Array(str) ? str : []);
    };
    to.Native = function(str) {
        if(is.String(str)){
            switch (str.toLowerCase()) {
                case "undefined":
                    return undefined;
                case "null":
                    return null;
                    break;
                case "true":
                    return true;
                    break;
                case "false":
                    return false;
                case "":
                    return "";
                default: {
                    if(!isNaN(str)){
                        return str-0;
                    }
                }
            }
        }
        return str;
    };
    foo.to = to;
})(this);


(function(foo) {
    var when = (foo.is.Function(document.addEventListener))
        ? (function(f) {
        /ing/.test(document.readyState) ? document.addEventListener('DOMContentLoaded', f) : f();
    })
        : (function(f) {
        /in/.test(document.readyState) ? setTimeout(function() {
            f()
        }, 9) : f()
    });

    when.ready = function(f) {
        return when(f);
    };
    foo.when = when;
})(this);


(function(foo) {
    function Enum() {
        this.add.apply(this, arguments);
    }
    Enum.prototype.add = function() {
        for (var i in arguments) {
            this[arguments[i]] = new String(arguments[i]);
        }
    };
    Enum.prototype.toList = function() {
        return Object.keys(this);
    };
    foo.Enum = Enum;
})(this);



