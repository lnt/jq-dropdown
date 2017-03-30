_define_('jsonutil', function(json) {

    var BRACKET_RE_S = /\['([^']+)'\]/g,
    	BRACKET_RE_D = /\["([^"]+)"\]/g,
    	BRACKET_RE_N = /\[([0-9]+)\]/g;
	
	function normalizeKeypath (key) {
	    return key.indexOf('[') < 0
	        ? key
	        : key.replace(BRACKET_RE_S, '.$1')
	             .replace(BRACKET_RE_D, '.$1')
	             .replace(BRACKET_RE_N, '.$1')
	}
	
    json.get = function (obj, key) {
        /* jshint eqeqeq: false */
        key = normalizeKeypath(key);
        if (key.indexOf('.') < 0) {
            return obj[key]
        }
        var path = key.split('.'),
            d = -1, l = path.length
        while (++d < l && obj != null) {
            obj = obj[path[d]]
        }
        return obj
    };

    /**
     *  set a value to an object keypath
     */
    json.set = function (obj, key, val) {
        /* jshint eqeqeq: false */
        key = normalizeKeypath(key)
        if (key.indexOf('.') < 0) {
            obj[key] = val
            return
        }
        var path = key.split('.'),
            d = -1, l = path.length - 1
        while (++d < l) {
            if (obj[path[d]] == null) {
                obj[path[d]] = {}
            }
            obj = obj[path[d]]
        }
        obj[path[d]] = val
        return obj[path[d]];
    };
    
	json.stringify = function(obj) {
        //if(!errorList) var errorList = [];
        try {
            return JSON.stringify(obj);
        } catch (err) {
            //errorList.push(err)
            return json.stringify({
                msg: "cannot convert JSON to string",
                error: [err]
            });
        }
    };
    json.parse = function(str, throwExcep) {
        if (typeof (str) == 'object')
            return str;
        try {
            return JSON.parse(str);
        } catch (err) {
            try {
                return $.parseJSON(str);
            } catch (err2) {
                var errorMSG = {msg: "cannot convert to JSON object", error: [err, err2], str: str};
                if (throwExcep)
                    throw err2;
                else
                   console.log(errorMSG);
                return errorMSG;
            }
        }
    };
    
    json.duplicate = function(obj){
		var retObj = obj;
		if(!obj){
			LOG.warn("Cannot dubplicate",obj);
			return retObj;
		}
		try {
			var newString = JSON.stringify(obj);
			retObj = JSON.parse(newString);
		} catch(err) {
			LOG.error("NOT SAFE",obj,newString);
			retObj = json.makeCopy(obj,10);
		}
		return retObj;
	};
	json.makeCopy = function(obj, level){
		if(level){
			if(jQuery.isPlainObject(obj)){
				var newObj = {};
			} else if(jQuery.isArray(obj)){
				var newObj = [];
			} else return obj;
			for(var key in obj){
				newObj[key] = json.makeCopy(obj[key],level-1)
			}
			return newObj;
		} else {
			return obj;
		}
	};
	
});

