var getQueryStringValue = function(queryParam){
    var currentURL = new URI()
    if(currentURL.hasQuery(queryParam)){
        var qsValues = currentURL.query(true);
        return qsValues[queryParam];
   }
   else
   {
     return undefined;
   }
}

var uniqObjects = function( arr ){
	return _.uniq( _.collect( arr, function( x ){
		return JSON.stringify( x );
	}));
};

(function() {
    var vueApp = new Vue({
        el: '#app',
        data: {
            authors: [],
            failed: false,
            userName: '',
            inProgress: false,
            location: 'Sydney',
            language: null
        },
        methods: {
            search: function () {
                vueApp.inProgress = true;
                $.getJSON('https://api.github.com/search/users?q=type:user location:'+ this.location + '&sort=followers')
                    .done(function (data) {
                        var promises = _.map(data.items, function (i) { return getUserEmails(i.login) });
                        $.when.apply($, promises).done(function () {
                            vueApp.authors = _.toArray(arguments);
                        });
                    }).fail (function() {
                        vueApp.failed = true;
                    })
                    .always(function() {
                        vueApp.inProgress = false;
                    });
            }
        }
    });

    function getUserEmails (userName) {
        var userApiPrefix = "https://api.github.com/users/";
        var userApiSuffix = "/events/public";
        if (userName) {

            return $.getJSON(userApiPrefix + userName + userApiSuffix)
            .then(function(data) {
                app.failed = false;
                var pushEvents = _.filter(data, function (evt) { return evt.type === 'PushEvent' && evt.actor.login === userName; });

                return {
                    login: userName,
                    emails: _.map(uniqObjects(_.compact(_.pluck(_.flatten(_.pluck(_.pluck(pushEvents, "payload"), "commits")), "author"))), function (el) { return JSON.parse(el); } )
                };
            });

        }
    }
})();
