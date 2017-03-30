(function (root) {

    var preventPropagation = function (event, stopDefault) {
        if (!event)
            var event = window.event;
        if (event) {
            if (stopDefault && event.preventDefault !== undefined) {
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
        return false;
    };
    var CURRENT_ELEMENT = null;

    document.addEventListener('click', function (e) {
        if (CURRENT_ELEMENT && CURRENT_ELEMENT.$options) {
            CURRENT_ELEMENT.$options.innerHTML = "";
        }
    });

    pitana.register({
        tagName: "jq-dropdown",
        events: {
            "keyup input": "onSearch",
            "click input": "onSearch",
            "change input": "onInputChange",
            "click option": "onSelect"
        },
        accessors: {
            value: {
                type: "string",
                onChange: "onValueChange"
            },
            text: {
                type: "string",
                onChange: "onTextChange",
                default: ""
            },
            api: {
                type: "string"
            },
            userinput: {
                type: "string"
            },
            placeholder: {
                type: "string", default: ""
            }
        },
        makeOptionString: function (value, text) {
            return "<option value='" + value + "'>" + text + "</option>";
        },
        attachedCallback: function () {
            this.$.innerHTML = '<input placeholder="' + this.$.placeholder + '"/><options/>';
            this.$input = this.$.querySelector('input');
            this.$options = this.$.querySelector('options');

            if (String(this.$.text).trim()) {
                this.showText();
            }
        },
        onSearch: function (e, elem, data) {
            this.$.userinput = elem.value;
            var options = jqDropdown.getOptions(this.$.api, e, this.$, this.$.dataset);
            var domText = "";
            for (var i in options) {
                domText = domText + this.makeOptionString(options[i].value, options[i].text);
            }
            this.$options.innerHTML = domText;
            CURRENT_ELEMENT = this;
            return this.prevent(e, true);
        },
        onSelect: function (e, elem, data) {
            var self = this;
            this.$.value = elem.getAttribute('value');
            this.$.text = elem.getAttribute('text') || elem.innerHTML;
            this.showText();
            pitana.domEvents.trigger(this.$, "input", {});
            pitana.domEvents.trigger(this.$, "change", {});
            setTimeout(function () {
                self.$options.innerHTML = "";
            });
        },
        onTextChange: function () {
            this.$input.value = this.$.text;
        },
        onValueChange: function () {
            this.$.text = "";
            this.showText();
        },
        showText: function (a, b, c, d) {
            var self = this;
            this.$.userinput = "";
            if (self.$.value !== "" && this.$.text === "") {
                var options = jqDropdown.getOptions(this.$.api, null, this.$, this.$.dataset);
                self.$.text = (options.filter(function (option) {
                    return option.value === self.$.value
                })[0] || {text: ""}).text;
            }
            this.$input.value = this.$.text;
        },
        onInputChange: function (e) {
            var self = this;
            var text = self.$input.value;
            var options = jqDropdown.getOptions(this.$.api, null, this.$, this.$.dataset);
            self.$.value = (options.filter(function (option) {
                return option.text === text
            })[0] || {value: ""}).value;
            self.$.text = text;
            self.$input.value = text;
            pitana.domEvents.trigger(this.$, "input", {});
            pitana.domEvents.trigger(this.$, "change", {});
            return this.prevent(e);
        },
        prevent: function (e, stopDefault) {
            return preventPropagation(e, stopDefault);
        }
    });

    root.jqDropdown = (function () {
        var cbs = {};
        return {
            register: function (api, callback) {
                cbs[api] = callback;
            },
            getOptions: function (api, input, target, data) {
                if (typeof cbs[api] === 'function') {
                    return cbs[api](input || "", target, data) || [];
                }
                return [];
            }
        };
    })();

})(this);

