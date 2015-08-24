"user strict";

define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var jquery = require("jquery");
    var interact = require("interact");
    var Mustache = require("mustache.min")


    /*
     * Manage letters for the first level
     */
    function Alphabet() {
        this.letters = ['A', 'B', 'C'];
    }

    Alphabet.prototype.setAlphabet = function() {
        var output = Mustache.render('{{#letters}}<div class="item">{{.}}</div>{{/letters}}', this);
        $('#letters').html(output);
    }


    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
        var selectMenu = function(level) {
        	$('#level-' + level).toggle();
        	$('#menu').toggle();

            if (level === '1') {
                alphabet = new Alphabet();
                alphabet.setAlphabet();
            }
        };

        $('.menu-button').on('click', function() {
        	selectMenu($(this).attr('value'));
        });

        /* *
         * Interact
         * */
        // Event fires after dragging an element
        var moveItem = function(event) {
            // Current element
            var target = event.target;
            // Get axis values + movement change
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            // Transform element
            target.style.webkitTransform =
            target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';
            // Update element attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        };

        var items = interact(".item");
        var area = interact("#area");

        items.draggable({
            initial: true,
            onmove: moveItem,
        });

        area.dropzone({
            // Only accept .item
            accept: '.item',

            // An element must be completely inside the area
            overlap: 1,

            // The element starts moving
            ondropactivate: function (event) {
                console.log("The element starts moving");
            },

            // The element enters the area
            ondragenter: function(event) {
                console.log(event);
                var target = event.relatedTarget;
                $(target).addClass('big');
                console.log("Add class");
            },

            // The element leave the area
            ondragleave: function(event) {
                console.log("The element leave the area");
            },

            // The element is dropped within the area
            ondrop: function(event) {
                console.log("The element is dropped within the area");
            },
        });

        /* *
         * End Interact
         * */
    });
});
