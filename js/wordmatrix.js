"user strict";

define(function (require) {
    require("wordfind");
    require("easeljs-0.7.1.min");
    require("tweenjs-0.5.1.min");

    wordmatrix = {};
    function MatrixView(canvas, soup) {
        this.canvas = canvas;
        this.game = soup;
        this.stage = new createjs.Stage(canvas);
        this.stage.mouseChildren = false;
        this.start_cell = null;
        this.end_cell = null;
        this.select_word_line = null;

        this.container = null;
        this.letters = [];
        this.animatedLetters = [];
        this.animationContainer = null;

        this.animation_runnning = false;

        this.init = function () {
            var orientations = ['horizontal', 'vertical'];
            this.puzzleGame = wordfind.newPuzzle(this.game.words,
                                        {height: 12, width:12,
                                         orientations: orientations,
                                         fillBlanks: true});

            this.puzzle = this.puzzleGame.matrix;
            this.cell_size = canvas.width / this.puzzle.length;
            this.margin_y = (canvas.height - this.cell_size *
                             this.puzzle.length) / 2;

            this.wordLocations = this.puzzleGame.locations;
            wordfind.print(this.puzzle);
            for (var n = 0; n < this.wordLocations.length; n++) {
                var word = this.wordLocations[n];
                var nextFn = wordfind.orientations[word.orientation];
                var word_end = nextFn(word.x, word.y, word.word.length - 1);
                word.end_x = word_end.x;
                word.end_y = word_end.y;
            }
            // clean objects if the canvas was already used
            this.stage.removeAllChildren();
            this.stage.update();
            this.startup_animation();

            this.letters = [];
            this.animatedLetters = [];
        };




    }
    wordmatrix.MatrixView = MatrixView;
    return wordmatrix;
});
