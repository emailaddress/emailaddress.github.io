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
    var app = new Vue({
        el: '#author-list',
        data: {
          authors: [],
          userName: null,
          failed: false,
          inProgress: false
        }
    })
    var userApiPrefix = "https://api.github.com/users/";
    var userApiSuffix = "/events";
    var userName = getQueryStringValue("user");
    if (userName) {
        $("#githubUser").val(userName);
        app.inProgress = true;
        $.getJSON(userApiPrefix + userName + userApiSuffix)
        .done(function(data) {
            app.failed = false;
            var authors = _.map(uniqObjects(_.compact(_.pluck(_.flatten(_.pluck(_.pluck(data, "payload"), "commits")), "author"))), function (el) { return JSON.parse(el); } );
            if (authors.length > 0) {
                console.log(authors);
                app.authors = authors;
            }
        })
        .fail (function() {
            app.failed = true;
        })
        .always(function() {
            app.inProgress = false;
            app.userName = userName
        });
    }
})();
