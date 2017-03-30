// Custom Event
(function(foo){
	
	if (typeof foo.CustomEvent !== "function") {
		var x = function CustomEvent(event, params) {
			params = params || {
				bubbles : false,
				cancelable : false,
				detail : undefined
			};
			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, params.bubbles, params.cancelable,
					params.detail);
			return evt;
		}
		;
		CustomEvent.prototype = foo.Event.prototype;
		foo.CustomEvent = x;
	}

	if (!foo.BrowserDetect) {
		foo.BrowserDetect = new (function() {
			this.isBelowIE9 = false;
		});
	}

	if (typeof Object.getPrototypeOf !== "function") {
		if (typeof "test".__proto__ === "object") {
			Object.getPrototypeOf = function(object) {
				return object.__proto__;
			};
		} else {
			Object.getPrototypeOf = function(object) {
				return object.constructor.prototype;
			};
		}
	}
	if (typeof Object.setPrototypeOf !== "function") {
		if (typeof "test".__proto__ === "object") {
			if (false && typeof Object.defineProperty == 'function') {
				Object.setPrototypeOf = function(object, proto) {
					Object.defineProperty(object, 'prototype', {
						value : proto
					});
					return proto;
				};
			} else {
				Object.setPrototypeOf = function(object, proto) {
					return object.__proto__ = proto;
				};
			}
		} else {
			Object.setPrototypeOf = function(object, proto) {
				return object.constructor.prototype = proto;
			};
		}
	}
	if (typeof String.prototype.endsWith !== 'function') {
		String.prototype.endsWith = function(suffix) {
			return this.indexOf(suffix, this.length - suffix.length) !== -1;
		};
	}
	
	if (typeof String.prototype.startsWith !== 'function') {
		String.prototype.startsWith = function(prefix) {
			return this.indexOf(prefix) === 0;
		};
	}
	
	// Array Pollyfills
	if (typeof Array.prototype.unique !== 'function') {
		Object.defineProperties(Array.prototype, {
			unique : {
				value : function() {
					var u = {}, a = [];
					for (var i = 0, l = this.length; i < l; ++i) {
						if (u.hasOwnProperty(this[i])) {
							continue;
						}
						a.push(this[i]);
						u[this[i]] = 1;
					}
					return a;
				}
			}
		});
	}
	if (typeof Array.prototype.sortBy !== 'function') {
                Object.defineProperties(Array.prototype, {
                    sortBy: {
                        value: function(key, desc,nullOrder) {
                            var order = desc ? -1 : 1;
                            return this.sort(function(a, b) {
                                if(nullOrder === true && b[key]=== null){
                                    return order * -1;
                                }
                                if (a[key] > b[key]) {
                                    return order * 1;
                                } else if (a[key] < b[key]) {
                                    return order * -1;
                                }
                                return 0;
                            });
                        }
                    }
                });
        }

	
})(this);
