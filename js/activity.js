"user strict";

define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var jquery = require("jquery");
    var interact = require("interact");
    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

        var selectMenu = function(level) {
        	$('#level-' + level).toggle();
        	$('#menu').toggle();
        };

        $('.menu-button').on('click', function() {
        	selectMenu($(this).attr('value'));
        });
    });

});
