"user strict";

define(function (require) {
    require("wordfind");
    require("easeljs-0.7.1.min");
    require("tweenjs-0.5.1.min");

    var font = "16px sans-serif";
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
                                        {height: 10, width: 10,
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

        this.startup_animation = function () {

            this.animation_runnning = true;
            var animatedLetters = [];
            var row = null;
            var text = null;
            createjs.Ticker.addEventListener("tick", this.stage);
            createjs.Tween.get(this.stage).call(
                this.startGame, [], this);

        };


        this.getCell = function (x, y) {
            var cell_x = parseInt(x / this.cell_size);
            var cell_y = parseInt((y - this.margin_y) / this.cell_size);
            return [cell_x, cell_y];
        };


        this.startGame = function() {

            this.stage.removeAllChildren();

            this.select_word_line = new createjs.Shape();
            this.animationContainer = new createjs.Container();
            this.animationContainer.x = 0;
            this.animationContainer.y = this.margin_y;

            this.wordsFoundcontainer = new createjs.Container();
            this.wordsFoundcontainer.x = 0;
            this.wordsFoundcontainer.y = 0;

            this.container = new createjs.Container();
            this.container.x = 0;
            this.container.y = this.margin_y;

            // need a white background to receive the mouse events
            var background = new createjs.Shape();
            background.graphics.beginFill(
                "#ffffff").drawRect(
                0, 0,
                this.cell_size * this.puzzle.length,
                this.cell_size * this.puzzle.length);
            this.container.hitArea = background;

            // HACK: the webkit version we use in android have a bug and don't
            // update properly the screen after the animation,
            // and the first line in the matrix is corrupted, showing
            // all the letter superimposed. Now we are using a transparent
            // background and a gradient in the div containing the canvas
            // this bandaid is a white rectangle over that letters,
            // just to hide it.
            var bandaid = new createjs.Shape();
            bandaid.graphics.beginFill(
                "#ffffff").drawRect(
                0, 0,
                this.cell_size * this.puzzle.length, this.cell_size * 2);
            this.container.addChild(bandaid);

            for (var i = 0, height = this.puzzle.length; i < height; i++) {
                var row = this.puzzle[i];
                var y = this.cell_size * i;
                var lettersRow = [];

                for (var j = 0, width = row.length; j < width; j++) {
                    var letter = this.puzzle[i][j];
                    if (this.game.lowerCase) {
                        letter = letter.toLowerCase();
                    } else {
                        letter = letter.toUpperCase();
                    }
                    var text = new createjs.Text(letter,
                                             font, "#000000");
                    text.x = this.cell_size * j + this.cell_size / 2;
                    text.y = y + this.cell_size / 3;
                    text.textAlign = "center";
                    this.container.addChild(text);
                    lettersRow.push(text);
                }
                this.letters.push(lettersRow);
            }
            this.container.cache(0, 0, this.cell_size * this.puzzle.length,
                            this.cell_size * this.puzzle.length);
            this.stage.addChild(this.container);

            this.stage.addChild(this.wordsFoundcontainer);
            this.stage.addChild(this.select_word_line);
            this.stage.addChild(this.animationContainer);

            this.stage.update();
        };


    }
    wordmatrix.MatrixView = MatrixView;
    return wordmatrix;
});
