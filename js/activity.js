"user strict";

define(function (require) {
    var activity = require("sugar-web/activity/activity");
    var jquery = require("jquery");
    var interact = require("interact");
    var Mustache = require("mustache.min");
    var wordmatrix = require("../js/wordmatrix.js");
    var words = require("../js/words.js");
    var vocabulary = require("../js/sentences.js");

    var sugarCellSize = 75;
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
        this.letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'á', 'é', 'í', 'ó', 'ú'];
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
        this.words_found = [];
    }

    Soup.prototype.reset = function() {
        this.words = [];
        this.words_found = [];
    };

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
        var gameCanvas = document.getElementById("matrix-canvas");
        //gameCanvas.height = window.innerHeight - sugarCellSize;
        gameCanvas.height = 600;
        gameCanvas.width = 600;
        this.matrixView = new wordmatrix.MatrixView(gameCanvas, this);
        this.matrixView.init();
    };

    Soup.prototype.markWordFound = function(word) {
        if ($.inArray(word, this.words_found) === -1) {
            this.words_found.push(word);
            $("div.word:contains('" + word +  "')").addClass("word-found");
            if (this.words_found.length >= 10) {
                $('#win-msg').removeClass('hidden');
                $('#again').on('click', function(e) {
                   e.preventDefault();
                   location.reload();
                });
            }
        }
    };

    /*
     * Manage letters for the third level
     */
    function Sentences() {
        this.vocabulary = [];
    }

    Sentences.prototype.randomSentence = function() {
        this.vocabulary = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        var output = Mustache.render('{{#words}}<div class="word word-sent">{{.}}</div>{{/words}}', this.vocabulary);
        $('#words-sentence').html(output);
        var box = Mustache.render('{{#words}} ____ {{/words}}', this.vocabulary);
        $('#words-box').html(box);
    };


    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
        $('.reload-button').on('click', function() {
            location.reload();
        });
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

                $('#restart-soup').on('click', function(e) {
                    e.preventDefault();
                    soup.reset();
                    soup.randomWords();
                    soup.setWords();
                    $('#win-msg').addClass('hidden');
                });
            }

            else if (level === '3') {
                var sentence = new Sentences();
                sentence.randomSentence();
                $('.restart').on('click', function(){
                    sentence.randomSentence();
                });

                var items_word = interact(".word-sent");
                var area_word = interact("#area-sent");

                items_word.draggable({
                    initial: true,
                    onmove: moveItem,
                });

                area_word.dropzone({
                    // Only accept .item
                    accept: '.word-sent',
                    // An element must be completely inside the area
                    overlap: 1,

                    // The element enters the area
                    ondragenter: function(event) {
                        var target = event.relatedTarget;
                        $(target).addClass('enter');
                    },

                });
            }
        };

        $('.menu-button').on('click', function() {
        	selectMenu($(this).attr('value'));
        });

    });
});
