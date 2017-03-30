(function (foo) {

  //Check Dependencies
  switch (undefined) {
    case foo.is :
    case foo.when :
      throw "include foo.js";
    case foo.URI :
      throw "include URI.js";
  };

  var LIB = {};
  /**
   * Getter for register modules, tries to search in bootloader library and
   * fallbacks to foo as default.
   *
   * @param moduleName
   * @returns {*|{}|h.__modulePrototype__}
   */
  var _module_ = function (moduleName, skipFallbackOrCallback) {
    if(is.Array(moduleName)){
      var umodules = [],modlen=moduleName.length,umoduleNameFun =  function(mod){
        umodules[moduleName.indexOf(mod.name)] = mod;
        modlen--;
        if(modlen==0){
          skipFallbackOrCallback.apply(this,umodules);
        }
      };
      for(var i in moduleName){
        _module_(moduleName[i],umoduleNameFun);
      }
      return;
    }
    if (LIB[moduleName]) {
      if (is.Function(skipFallbackOrCallback)) {
        skipFallbackOrCallback(LIB[moduleName].__modulePrototype__);
      }
      return LIB[moduleName].__modulePrototype__;
    } else {
      return (function (myModule) {
        if (myModule) {
          if (is.Function(skipFallbackOrCallback)) {
            skipFallbackOrCallback(myModule);
          }
        } else if (skipFallbackOrCallback !== false && is.Function(foo.onmodulenotfound)) {
          myModule = foo.onmodulenotfound(moduleName, skipFallbackOrCallback);
          if (myModule === undefined) {
            console.warn("Module:", moduleName, "not found, might loading synchronously via onmodulenotfound");
          }
        } else if (skipFallbackOrCallback == true) {
          console.error("Module:", moduleName, "not found, should be loaded with callback function");
        }
        return myModule;
      })(foo[moduleName]);
    }
  };

  if (foo.onmodulenotfound == undefined) {
    foo.onmodulenotfound = function (moduleName, skipFallbackOrCallback) {
      console.error("Module:", moduleName, "does not exists");
      return false;
    };
  }

  /**
   * Module Contianer/Meta-Info
   *
   * @param __modulePrototype__
   * @param dependsOn
   * @constructor
   */
  var Moduler = function Moduler(__modulePrototype__, dependsOn) {
    this.intialize.apply(this, arguments);
    this.dependsOn = dependsOn;
  };

  Moduler.prototype = {
    /**
     * Initialize moduler with default prototype
     *
     * @param __modulePrototype__
     */
    intialize: function (__modulePrototype__) {
      this.__modulePrototype__ = __modulePrototype__ || {};
    },
    /**
     * returns module prototype
     *
     * @returns {*|{}}
     */
    module: function () {
      return this.__modulePrototype__;
    },
    /**
     * Extends module from parent module
     *
     * @param parentModuleName
     * @returns {Moduler}
     */
    extend: function (parentModuleName) {
      if (LIB[parentModuleName]) {
        this.__modulePrototype__ = foo.mixin(Object
          .create(module(parentModuleName) || {}), this.__modulePrototype__);
        this.__modulePrototype__.__extend__ = [parentModuleName].concat(this.__modulePrototype__.__extend__);
        LIB[parentModuleName].callOwnFunction("_extended_", this);
      } else {
        console.error("Parent Module " + parentModuleName
          + " does not exists for module " + this.__moduleName__);
      }
      return this;
    },
    /**
     *
     * @param ChildProto
     * @returns {Moduler}
     */
    mixin: function (ChildProto) {
      for (var i in ChildProto) {
        if (ChildProto.hasOwnProperty(i) === true) {
          this.__modulePrototype__[i] = ChildProto[i];
          if(is.Function(this.__modulePrototype__[i]) && this.__modulePrototype__[i].__fun__ === true){
            this.__modulePrototype__[i].__fun__ = i;
          }
        }
      }
      return this;
    },
    as: function (definition) {
      var self = this;
      if(this.___defined___ === undefined){
        console.info("Defining " + this.__moduleName__);
        if (typeof definition === 'function') {
          var ChildProto;
          if (this.dependsOn === undefined) {
            ChildProto = definition.call(this,
              this.__modulePrototype__, this.__modulePrototype__);
          } else {
            var deps = [ this.__modulePrototype__ ];
            for (var i in this.dependsOn) {
              var mod = foo._module_(this.dependsOn[i], false);
              deps.push(mod);
              if (mod === undefined) {
                console.error("Module " + this.dependsOn[i] + " is not loaded, hence cannot be used by " + this.__moduleName__);
              }
            }
            ChildProto = definition.apply(this, deps);
          }
          if (ChildProto !== undefined) {
            this.mixin(ChildProto);
          }
        } else if (typeof definition === "object") {
          this.mixin(definition);
        }
        this.callOwnFunction("_define_");
        this.___defined___ = true;
      } else {
        console.warn("Cannot be redefined : " + this.__moduleName__);
      }
      return this;
    },
    callOwnFunction: function (prop) {
      if (this.__modulePrototype__.hasOwnProperty(prop) === true
        && typeof this.__modulePrototype__[prop] === "function") {
        return this.__modulePrototype__[prop].apply(this.__modulePrototype__, arguments);
      }
    },
    /**
     * @Deprecated - it is recursive function which can cause 'Maximum call stack size exceeded' if multiple supers are used.
     *
     * @param callback
     * @returns {wrapper}
     */
    super : function (callback) {
      var wrapper;
      wrapper = function(){
        var ret;
        if(wrapper && wrapper.__fun__ && is.Function(this.parent()[wrapper.__fun__])){
           ret = this.parent()[wrapper.__fun__].apply(this,arguments);
        }
        return callback.apply(this,[ret].concat(Array.prototype.slice.call(arguments)))
      };
      wrapper.__fun__ = true;
      return wrapper;
    }
  };

  var counter__id__ = 0;
  /***************************************************************************
   * Abstract Module
   **************************************************************************/
  var AbstractModule = function AbstractModule(moduleName, file) {
    this.name = moduleName;
    this.__file__ = file;
    this.__dir__ = null;
    this.__extend__ = [];
    this.__id__ = (++counter__id__);
  };
  AbstractModule.prototype = {
    create: function () {
      return this.instance.apply(this, arguments);
    },
    instance: function () {
      var newObj = Object.create(this);
      (newObj._create_ || newObj._instance_).apply(newObj, arguments);
      if (is.Object(arguments[0]) && is.Object(arguments[0].options)) {
        newObj.options = arguments[0].options;
      } else newObj.options = {};
      newObj.__id__ = (++counter__id__);
      return newObj;
    },
    _instance_: function () {
    },
    path: function (path) {
      this.__dir__ = this.__dir__ || "";
      return foo.URI(path, this.__dir__);
    },
    parent: function () {
      if (this.__extend__ && this.__extend__[0]) {
        return module(this.__extend__[0]);
      } else return AbstractModule.prototype;
    },
    mixin: function (source) {
      for (var i in source) {
        if (source.hasOwnProperty(i) === true) {
          this[i] = source[i];
        }
      }
      return this;
    },
    is: function (type) {
      var _type = is.String(type) ? type : type.name;
      if(this.name === _type){
        return true;
      } else if (this.__extend__ && this.__extend__[0] && is.String(_type)) {
        return !!this.__extend__.filter(function (iType) {
          return iType === _type;
        })[0];
      }
    }
  };

  /**
   *
   * Defines and registers module
   *
   * @param moduleInfo -
   *            Name of module or Map of module info
   * @param definition -
   *            Module prototype or function returning module prototype.
   * @returns {*}
   */
  var _define_ = function (moduleInfo, definition, definition2) {
    var moduleName, onModules, extendsFrom, moDef;
    if (typeof moduleInfo === "object") {
      moduleName = moduleInfo.name || moduleInfo.module;
      onModules = moduleInfo.using || moduleInfo.dependsOn || moduleInfo.modules;
      extendsFrom = moduleInfo.extend;
    } else if (typeof moduleInfo === "string") {
      moduleName = moduleInfo;
      if (typeof definition === "string") {
        extendsFrom = definition;
        definition = definition2;
      }
    }
    if(LIB[moduleName] === undefined){
      moDef = new Moduler(new AbstractModule(moduleName), onModules);
      moDef.__moduleName__ = moduleName;

      if(moduleName){
        LIB[moduleName] = moDef;
      }

      if (is.String(extendsFrom)) {
        moDef.extend(extendsFrom);
      }

      if (definition !== undefined) {
        moDef.as(definition);
      }

      var _readyCheck_ = function(){
        //Module should not be ready unitl its path is resolved, its important in case module is self instantiator
        if(moDef.__modulePrototype__.__dir__ == null){
          foo.setTimeout(function(){
            _readyCheck_();
          },200);
        } else {
          moDef.callOwnFunction("_ready_");
        }
      };
      _define_.ready(_readyCheck_);
    } else {
      moDef = LIB[moduleName];
      console.warn("Duplicate definition for module ", moduleName);
    }
    return moDef;
  };
  _define_.foo = true;
  _define_.ready = function (cb) {
    return foo.when.ready(cb);
  };
  /**
   * Alternat method for _module_
   */
  _define_.get = function () {
    return _module_.apply(foo, arguments);
  };

  _define_.setSafe = function (name, func) {
    foo["_" + name + "_"] = func;
    if (foo[name] === undefined) {
      foo[name] = func;
    }
  };

  _define_("AbstractModule", AbstractModule.prototype);

  _define_.setSafe("define", _define_);
  _define_.setSafe("module", _module_);

})(this);

//Aditional Function for different patterns
(function (foo) {

  "use strict";

  foo.namespace = function (_root, _nameSpace, _valObj) {
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
    if (valObj !== undefined) {
      win[nspace[nspace.length - 1]] = valObj;
    }
    return win[nspace[nspace.length - 1]];
  };

  foo.registerModule = function registerModule(root, modeulName, cb) {

    if ((typeof root === "string")) {
      cb = modeulName;
      modeulName = root;
      root = foo;
    }
    ;

    if (root.utils && typeof root.utils.define === 'function') {
      // Utils Package System
      return utils.define(modeulName).as(cb.bind(root));
    } else {
      var factory = function () {
        var X = {}, x;
        var _X = cb.bind(root)(X, x);
        return _X || X;
      };
      if (typeof root.define === 'function' && root.define.amd) {
        // AMD based package system
        root.define([], factory);
      } else if (window.define && window.define.foo) {
        return define({
          "fileName": modeulName
        }).as(factory);
      } else if (window.define && window.define.get) {
        return define({
          "fileName": modeulName
        }).content(factory);
      } else if (typeof exports === 'object') {
        // EXPORT based system
        module.exports = factory();
      } else {
        namespace(root, modeulName, factory());
      }
    }

  };

})(this);