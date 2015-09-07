"user strict";

define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var jquery = require("jquery");
    var interact = require("interact");
    var Mustache = require("mustache.min");
    var words = require("../js/words.js");

    /*
     * General function to move interact objects
     */
    var moveItem = function(event) {
        // Current element
        var target = event.target;
        // Get axis values + movement change
        if (!target.hasAttribute('data-x')) {
            x0 = $(target).position().top;
            y0 = $(target).position().left;
        }

        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        // Transform element
        target.style.top = x0 + 'px';
        target.style.left = y0 + 'px';
        target.style.webkitTransform =
        target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';
        // Update element attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    };

    /*
     * Manage letters for the first level
     */
    function Alphabet() {
        this.letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    }

    Alphabet.prototype.setAlphabet = function() {
        var output = Mustache.render('{{#letters}}<div class="item">{{.}}</div>{{/letters}}', this);
        $('#letters').html(output);
    };

    Alphabet.prototype.reloadAlphabet = function(element) {
        this.setAlphabet();
        $('#canvas').append(element);
    };


    /*
     * Manage words for the second level
     */

    function Soup() {
        this.words = [];
    }

    Soup.prototype.randomWords = function() {
        for (var i = 0; this.words.length < 10; i++) {
            var tmp_word = words[Math.floor(Math.random() * words.length)];
            if ($.inArray(tmp_word, this.words) === -1) {
                this.words.push(tmp_word);
            }
        }
    };

    Soup.prototype.setWords = function() {
        var output = Mustache.render('{{#words}}<div class="word">{{.}}</div>{{/words}}', this);
        $('#words-list').html(output);
    };

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
                var letters = [];

                $('#upper-button').on('click', function() {
                    $('.item').addClass('upper');
                });

                $('#lower-button').on('click', function() {
                    $('.item').removeClass('upper');
                });

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

                    // The element enters the area
                    ondragenter: function(event) {
                        var target = event.relatedTarget;
                        $(target).addClass('enter');
                    },

                    ondragleave: function(event) {
                        var target = event.relatedTarget;
                        $(target).removeClass('enter');
                    },

                    // The element is dropped within the area
                    ondrop: function(event) {
                        var target = event.relatedTarget;
                        target.style.position = 'absolute';
                        letters.push(target);
                        $(target).removeClass('enter');
                        alphabet.reloadAlphabet(letters);
                    },
                });
            }

            else if (level === '2') {
                var soup = new Soup();
                soup.randomWords();
                soup.setWords();
            }
        };

        $('.menu-button').on('click', function() {
        	selectMenu($(this).attr('value'));
        });

    });
});
