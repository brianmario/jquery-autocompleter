// HTML Response Autocompleter plugin
//
//      <input type="text" id="contact_name" name="contact[name]" />
//      <div class="contact_name results"></div>
//
//      $('#contact_name').autocomplete({
//          url: '/contacts/autocomplete'
//      });
//
// Options:
//      searchVar          The variable name to use when sending the search request.
//                          Default: 'q'
//      url                The url for which to send the search request
//                          Default: null - if this setting is null, this autocompleter will gracefully do nothing.
//      delay              The delay to wait after the last keyup event before sending the request
//                          Default: 250ms
//      useCache           Whether or not to use a simple caching of keywords and results to prevent extra requests.
//                          Default: true
//      extraParams        An object of key/value pairs to send along with the request.
//                          Default: {}
//
// Events:
// All events are fired on the element(s) that match the original selector passed.
//
//      autocomplete.beforesend    Fired just before the autocompleter sends it's request.
//      autocomplete.finish        Fired when the autocompleter has injected the results into the DOM.
(function($) {
    $.fn.autocomplete = function(options) {
        return $(this).each(function() {
            var input = $(this);
            var settings = $.extend({
                    searchVar: 'q',
                    url: null,
                    delay: 250,
                    useCache: true,
                    extraParams: {},
                    autoClearResults: true
                }, options);
            var req = null;
            var timeout = null;
            var cache = {};
            
            if (settings.url !== null) {
                input.attr('autocomplete', 'off');
                input.keyup(function(e) {
                    e.preventDefault();
                    clearTimeout(timeout);
                    timeout = setTimeout(function() {
                        clearTimeout(timeout);
                        var formVal = input.val();
                        if (formVal !== '') {
                            // Cancel the pending request so we don't have to wait for it to return
                            if (req !== null && req.readyState < 4) {
                                req.abort();
                            }
                            if (!cache[formVal]) {
                                var params = {};
                                params[settings.searchVar] = formVal;
                                params = $.extend(true, settings.extraParams, params);
                                input.trigger('autocomplete.beforesend');
                                req = $.get(settings.url, params, function(data) {
                                    if (settings.useCache) {
                                        cache[formVal] = data;
                                    }
                                    if (input.val() === formVal) {
                                        input.trigger('autocomplete.finish', data);
                                    }
                                }, 'html');
                            } else if (settings.useCache) {
                                input.trigger('autocomplete.finish', cache[formVal]);
                            }
                        } else {
                            if (settings.autoClearResults) {
                                input.trigger('autocomplete.finish', '');
                            }
                            input.trigger('autocomplete.emptyfield');
                        }
                    }, settings.delay);
                });
            }
        });
    };
})(jQuery);