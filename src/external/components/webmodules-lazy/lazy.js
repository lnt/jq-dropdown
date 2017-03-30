/**
 * Created by lalittanwar on 26/02/16.
 */
(function(foo, $) {

    var isPromise = function(obj) {
        if (obj !== undefined && is.Function(obj.done) && is.Function(obj.then) && is.Function(obj.fail)) {
            return true;
        } else return false;
    };


    foo.lazy = function(callback) {

    };

    foo.lazy.ACTIONS = new foo.Enum("CLEAR");

    /**
     * Should be used inside Promise function to get Deferred Object
     *
     * @returns {*}
     * @constructor
     */
    foo.lazy.Deferred = function() {
        return foo.lazy.promise.apply(foo.lazy, arguments);
    };

    /**
     * Convert any function into Promise.
     *
     * TO get DeferredObject to resolve/reject promise, lazy.Deferred(arguments) should be used inside parent function
     *
     * @param callback
     * @returns {*}
     */
    foo.lazy.promise = function(callback) {
        if (is("Arguments", callback)) {
            return callback[callback.length - 1];
        } else {
            return function() {
                var context = this;
                var myDeffered = $.Deferred();
                var args = [].slice.apply(arguments);
                args.push(myDeffered);
                var resp = is.Function(callback) ? callback.apply(context, args) : callback;
                if (isPromise(resp)) {
                    resp.done(function(resp2) {
                        myDeffered.resolve(resp2);
                    }).fail(function(resp2) {
                        myDeffered.reject(resp2);
                    });
                } else if (resp !== undefined) {
                    myDeffered.resolve(resp);
                }
                return myDeffered.promise();
            };
        }
    };


    /**
     *
     * @param callback
     * @returns {Function}
     */
    foo.lazy.once = function(callback) {
        var fname = (callback.name || "___lazy__single__") + foo.getUUID();
        return function() {
            var context = this;
            if (arguments[0] === foo.lazy.ACTIONS.CLEAR) {
                delete context[fname];
                return;
            }
            if (!context.hasOwnProperty(fname)) {
                context[fname] = is.Function(callback) ? callback.apply(context, arguments) : callback;
            }
            return context[fname];
        };
    };

    foo.lazy.debounce = function(func, wait, immediate, _fname) {
        var fname = _fname || ((func.name || "___lazy__debounce__") + foo.getUUID());
        return function() {
            var context = this;
            if (!context.hasOwnProperty(fname)) {
                context[fname] = function() {
                };
                context[fname].wait = wait || 200;
                context[fname].immediate = immediate || false;

                context[fname].later = function() {
                    var gap = (new Date()) - context[fname].timestamp;
                    if (gap < context[fname].wait) {
                        context[fname].timeout = foo.setTimeout(context[fname].later, context[fname].wait);
                    } else {
                        foo.clearTimeout(context[fname].timeout);
                        context[fname].timeout = null;
                        if (!context[fname].immediate) {
                            var resp = func.apply(context, context[fname].args);
                            if (isPromise(resp)) {
                                resp.done(function(resp2) {
                                    context[fname].deffered.resolve(resp2);
                                });
                            } else {
                                context[fname].deffered.resolve(resp);
                            }
                        }
                    }
                };
            }
            if (!context[fname].deffered || context[fname].deffered.state() !== "pending") {
                context[fname].deffered = $.Deferred();
            }
            context[fname].timestamp = new Date();
            context[fname].args = arguments;
            foo.clearTimeout(context[fname].timeout);
            context[fname].timeout = foo.setTimeout(context[fname].later, context[fname].wait);
            return context[fname].deffered.promise();
        };
    };

    var throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = _.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    foo.clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = foo.setTimeout(later, remaining);
            }
            return result;
        };
    };

    foo.lazy.throttle = function(func, wait, options) {
        var context, myDeffered = $.Deferred();
        var defResp = throttle(function() {
            var resp = func.apply(context, arguments);
            if (isPromise(resp)) {
                resp.done(function(resp2) {
                    myDeffered.resolve(resp2);
                });
            } else {
                myDeffered.resolve(resp);
            }
        }, func, wait, options);

        return function() {
            context = this;
            if (myDeffered.state() !== "pending") {
                myDeffered = $.Deferred();
            }
            defResp.apply(context, arguments);
            return myDeffered.promise();
        };
    };

    foo.lazy.repeat = function(func, wait, options) {
        var id = "___lazy__repeat__" + foo.getUUID();
        return  function() {
            var args = arguments, context = this;
            if (!context.hasOwnProperty(id)) {
                context[id] = function() {
                    args = arguments;
                };
                context[id].deffered = $.Deferred();
                context[id].notify = function() {
                    return context[id].deffered.notify.apply(context[id].deffered, arguments);
                };
                context[id].start = function() {
                    context[id].timer = foo.setInterval(function() {
                        var resp = func.apply(context, args);
                        if (isPromise(resp)) {
                            resp.done(function(resp2) {
                                context[id].notify(resp2);
                            });
                        } else {
                            context[id].notify(resp);
                        }
                    }, wait);
                };
                context[id].stop = function() {
                    if (context[id].timer) {
                        foo.clearInterval(context[id].timer);
                    }
                };
                context[id].start();
            } else {
                context[id].stop();
                context[id].start();
            }
            //context[id].apply(context,arguments);
            return context[id].deffered.promise();
        };
    };

})(this, window.jQuery);
