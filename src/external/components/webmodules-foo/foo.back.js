(function(foo) {

	"use strict";

	function ModuleContainer() {
		// module Container, framework is supposed to extend its prototype
	}

	var mix = function(obj, proto) {
		for ( var prop in proto) {
			if (proto.hasOwnProperty(prop)) {
				obj[prop] = proto[prop];
			}
		}
		return obj;
	};

	var namespace = function(_root, _nameSpace, _valObj) {
		var root = _root;
		var nameSpace = _nameSpace;
		var valObj = _valObj;
		if (typeof _root === "string") {
			root = foo;
			nameSpace = _root;
			valObj = _nameSpace;
		}
		var nspace = nameSpace.split('.');
		var win = root || foo;
		var retspace = nspace[0];
		for (var i = 0; i < nspace.length - 1; i++) {
			if (!win[nspace[i]])
				win[nspace[i]] = {};
			retspace = nspace[i];
			win = win[retspace];
		}
		if(valObj !== undefined){
			win[nspace[nspace.length - 1]] = valObj;
		}
		return win[nspace[nspace.length - 1]];
	};
	
	var _create_ = function(moduleName, fromModuleName, definition) {
		var fromModule = foo[fromModuleName] || {};
		var thisModule = Object.create(fromModule);
		return namespace(foo, moduleName, definition.call(this,thisModule)
				|| thisModule);
		foo[moduleName] = definition.call(this,thisModule) || thisModule;
		return foo[moduleName];
	};
	
	var _define_ = function(moduleName, fromModule, definition) {
			if (typeof definition === 'function'
				&& typeof fromModule === 'string') {
			return _create_.call(this,
					moduleName, fromModule, definition);
		} else if (typeof fromModule === 'function') {
			return _create_.call(this,
					moduleName, null, fromModule);
		} else if (typeof definition === 'object'
				&& typeof fromModule === 'string') {
			return _create_.call(this,moduleName, fromModule,
					function(thisModule) {
						mix(thisModule, definition);
					});
		} else if (typeof fromModule === 'object') {
			return _create_.call(this,moduleName, null, function(
					thisModule) {
				mix(thisModule, fromModule);
			});
		}
	}; 

	ModuleContainer.prototype = {
		define : function() {
			var mc = new ModuleContainer();
			mc.__modulePrototype__ = _define_.apply(mc, arguments);
			return mc;
		},
		module : function(moduleName) {
			if (moduleName !== undefined) {
				return foo[moduleName];
			} else if(this!==undefined){
				return this.__modulePrototype__;
			}
		},
		tag : function(tagName, definition) {
			return console.warn("No tag Registrar found");
		},
		require : function() {
			return console.warn("No tag Registrar found");
		}
	};

//	var _metaDef_ = {
//		define : ModuleContainer.prototype.define,
//		module : ModuleContainer.prototype.module,
//		tag : ModuleContainer.prototype.tag,
//		require : ModuleContainer.prototype.require,
//		namespace : namespace
//	};

	foo._define_ = ModuleContainer.prototype.define;
	foo._module_ = ModuleContainer.prototype.module;
	foo._tag_ = ModuleContainer.prototype.tag;
	foo._require_ = ModuleContainer.prototype.require;
	foo._namespace_ = namespace;

	["define","module","namespace"].map(function(prop){
		if(foo[prop]===undefined){
			foo[prop] = function(){
				return foo["_"+prop+"_"].apply(foo,arguments);
			};
		}
	});
	
	foo._setFoo_ = function(propName,propValue){
		return foo["_"+propName+"_"] = propValue;
	};

	foo.registerModule = function registerModule(root, modeulName, cb) {

		if((typeof root === "string")){
			cb = modeulName;
			modeulName = root;
			root = foo;
		};
		
		if (root.utils && typeof root.utils.define === 'function') {
			// Utils Package System
			return utils.define(modeulName).as(cb.bind(root));
		} else {
			var factory = function() {
				var X = {}, x;
				var _X = cb.bind(root)(X, x);
				return _X || X;
			};
			if (typeof root.define === 'function' && root.define.amd) {
				// AMD based package system
				root.define([], factory);
			} else if (window.define && window.define.get) {
				return define({
					"fileName" : modeulName
				}).content(factory);
			} else if (typeof exports === 'object') {
				// EXPORT based system
				module.exports = factory();
			} else {
				namespace(root,modeulName,factory());
			}
		}

	};

	foo.mixin = mix;

})(this);

// is Utility functions
(function(foo) {

	foo.debounce = function debounce(func, wait, immediate) {
		var timeout, args, context, timestamp, result;
		return function() {
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
		return is("Undefined", obj);
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
			for ( var key in obj) {
				if (hasOwnProperty.call(obj, key))
					return false;
			}
			return true;
			break;
		}
		return !(is.Undefined(obj) || is.Null(obj));
	};
	is.Valid = function(condition,message){
		if(!condition && is.String(message)){
			throw Error(message);
		} return !!condition;
	};
	foo.is = is;
	
})(this);

(function(foo) {
	var when = (foo.is.Function(document.addEventListener)) 
	? (function (f){/ing/.test(document.readyState)?document.addEventListener('DOMContentLoaded',f):f();})
	: (function (f){/in/.test(document.readyState)?setTimeout(function(){f()},9):f()}) ;

	when.ready = function(f){
		return when(f);
	};
	foo.when = when;
})(this);
