(function (foo) {
  ///CONSOLE LOG
  var flags = {
    debug : true, warn : true, error : true, trace : true, info : true
  };
  var LOG = function () {
    return console.log.apply(console, arguments);
  };
  LOG.Timer = function () {
    var startTime = new Date().getTime();
    var lastTime = 0;
    var incTime = 0;
    var now = function () {
      var s = new Date().getTime();
      var _lastTime = s - startTime;
      incTime = _lastTime - lastTime;
      lastTime = _lastTime;
      return lastTime;
    };
    now.getIncTime = function () {
      return incTime;
    };
    return now;
  };

  LOG.traceEvent = function Trace(timer) {
    this.timer = timer;
    this.length = 0;
    this.push = Array.prototype.push;
    this.pop = Array.prototype.pop;
    this.splice = Array.prototype.splice;
    this.push(timer);
    this.error = function (err) {
      this.lineNumber = err.lineNumber;
      this.fileName = err.fileName;
      this.push(err.fileName);
      this.push(err.lineNumber);
    };
    this.caller = function (caller) {
      this.callerName = caller.name;
      this.push(caller.name);
      this.callerFunction = caller.toString();
    };
    this.stackTrace = printStackTrace();
    this.stackTrace.splice(0, 6);
  };

  var debugTimerMap = {};
  LOG.debugTimer = function (timer, clearNew) {
    var _timer = debugTimerMap[timer];
    if (!_timer || clearNew) {
      _timer = debugTimerMap[timer] = new LOG.Timer();
    }
    var deBugMesgEvent = new LOG.traceEvent(timer);
    deBugMesgEvent.push(_timer());
    deBugMesgEvent.push("+" + _timer.getIncTime());
    return deBugMesgEvent;
  };

  /**
   *  Functiont o return time taken so far
   *
   *  @param timer - name of bookmark timer
   *  @param message
   *    - if true, then restarts the timer, else time-gap between this and last bookmark,
   *    if passed new Error(), then will print the line no and file name.
   *
   *  @param args - message to be printed
   */
  LOG.timer = function (timer, message, arg1, arg2, arg3) {
    var isNew = (message === true);
    var deBugMesgEvent = LOG.debugTimer(timer, isNew);
    deBugMesgEvent.caller(arguments.callee.caller);
    if (isNew)
      return LOG.info(deBugMesgEvent, arg1, arg2, arg3);
    if (message && message.name == 'Error') {
      deBugMesgEvent.error(message);
      return LOG.info(deBugMesgEvent, arg1, arg2, arg3);
    } else
      return LOG.info(deBugMesgEvent, message, arg1, arg2, arg3);
  };

  /**
   *  log for info purpose
   */
  LOG.info = function () {
    if (flags.info) {
      return console.info.apply(console, arguments);
    }
  };

  /**
   *  log for debugging
   */
  LOG.debug = function () {
    if (flags.debug) {
      return console.debug.apply(console, arguments);
    }
  };

  /**
   *  log for logging
   */
  LOG.log = function () {
     return console.log.apply(console, arguments);
  };

  /**
   *  warnings, traces by default
   *  can be suppressed by `silent` option.
   */
  LOG.warn = function () {
    if(flags.warn){
      return console.warn.apply(console, arguments);
    }
  };

  /**
   *  warnings, traces by default
   *  can be suppressed by `silent` option.
   */
  LOG.error = function () {
    if(flags.error){
      return console.error.apply(console, arguments);
    }
  };

  LOG.config = function (config) {
    for(var i in config){
      if(config[i]!==undefined){
        flags[i] = config[i];
      }
    }
  };

  foo.LOG = LOG;

})(this);