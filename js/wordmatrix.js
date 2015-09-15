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
            var orientations = ['horizontal', 'vertical', 'verticalUp',
                'diagonal', 'diagonalUp'];
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

        this.stop = function() {
            // stop the animation
            this.animation_runnning = false;
        };

        this.changeCase = function () {
            for (var i = 0; i < this.letters.length; i++) {
                var lettersRow = this.letters[i];
                for (var j = 0; j < lettersRow.length; j++) {
                    var letter = this.letters[i][j];
                    if (this.game.lowerCase) {
                        letter.text = letter.text.toLowerCase();
                    } else {
                        letter.text = letter.text.toUpperCase();
                    }
                }
            }
            this.container.updateCache();
        };

        this.stage.on("pressup", function (event) {
            this.restoreAnimatedWord();
            this.hideDancingLetters();
            this.verifyWord(this.start_cell, this.end_cell);
            this.start_cell = null;
            this.end_cell = null;
        }, this);

        this.stage.on('mousedown', function (event) {
            var cell = this.getCell(event.stageX, event.stageY);
            this.select_word_line.graphics.clear();
            this.markWord(cell, cell,
                          this.select_word_line, '#3d53a1', true);
            this.prepareWordAnimation(cell, cell);
            this.showDancingLetters();
            if (this.start_cell === null) {
                this.start_cell = [cell[0], cell[1]];
                this.end_cell = null;
            }
        }, this);

        this.stage.on("pressmove", function (event) {
            var end_cell = this.getCell(event.stageX, event.stageY);
            if (this.end_cell !== null &&
                (end_cell[0] == this.end_cell[0]) &&
                (end_cell[1] == this.end_cell[1])) {
                return;
            }
            this.end_cell = end_cell;
            this.select_word_line.graphics.clear();
            this.markWord(this.start_cell, this.end_cell,
                          this.select_word_line, '#3d53a1', true);
            this.prepareWordAnimation(this.start_cell, this.end_cell);
            this.showDancingLetters();

            this.stage.update();
        }, this);

        this.verifyWord = function(start_cell, end_cell) {
            if ((start_cell !== null) && (end_cell !== null)) {
                for (var n = 0; n < this.wordLocations.length; n++) {
                    var word = this.wordLocations[n];
                    var nextFn = wordfind.orientations[word.orientation];
                    var end_word = nextFn(start_cell[0], start_cell[1],
                                          word.word.length - 1);
                    if ((word.x == start_cell[0] && word.y == start_cell[1] &&
                         word.end_x == end_cell[0] &&
                         word.end_y == end_cell[1]) ||
                        (word.end_x == start_cell[0] &&
                         word.end_y == start_cell[1] &&
                         word.x == end_cell[0] && word.y == end_cell[1])) {
                        // verify if was already marked
                        //if (this.game.words.indexOf(word.word) > -1) {
                            //console.log("HERE?");
                            //continue;
                        //}

                        var found_word_line = new createjs.Shape();
                        this.markWord(start_cell, end_cell,
                                      found_word_line, '#3d53a1', false);

                        found_word_line.mouseEnabled = false;
                        this.wordsFoundcontainer.addChild(found_word_line);

                        // show in the word list
                        // AQUI SE AGREGA LA PALABRA GUARDAD

                        this.game.markWordFound(word.word);
                    }
                }
            }
            this.select_word_line.graphics.clear();
            this.stage.update();
        };

        /*
        Draw a rounded rectangle over shape
        star_cell, end_cell = array of integer
        shape = createjs.Shape
        color = createjs.Graphics.getRGB
        */
        this.markWord = function(start_cell, end_cell, shape, color, fill) {

            var start_cell_x = start_cell[0];
            var start_cell_y = start_cell[1];

            var end_cell_x = end_cell[0];
            var end_cell_y = end_cell[1];

            var x1 = start_cell_x * this.cell_size + this.cell_size / 2;
            var y1 = this.margin_y + start_cell_y * this.cell_size +
                this.cell_size / 2;
            var x2 = end_cell_x * this.cell_size + this.cell_size / 2;
            var y2 = this.margin_y + end_cell_y * this.cell_size +
                this.cell_size / 2;

            var diff_x = x2 - x1;
            var diff_y = y2 - y1;
            var angle_rad = Math.atan2(diff_y, diff_x);
            var angle_deg = angle_rad * 180 / Math.PI;
            var distance = diff_x / Math.cos(angle_rad);
            if (Math.abs(angle_deg) == 90) {
                distance = Math.abs(diff_y);
            }

            var line_width = this.cell_size / 10;
            shape.graphics.setStrokeStyle(line_width, "round");
            if (fill) {
                shape.graphics.beginFill(color);
            } else {
                shape.graphics.beginStroke(color);
            }
            shape.graphics.drawRoundRect(
                -(this.cell_size - line_width) / 2,
                -(this.cell_size - line_width) / 2,
                distance + this.cell_size - line_width,
                this.cell_size - line_width,
                this.cell_size / 2);
            shape.graphics.endStroke();
            shape.rotation = angle_deg;
            shape.x = x1;
            shape.y = y1;
        };

        this.restoreAnimatedWord = function() {
            this.animatedLetters = [];
            this.animationContainer.removeAllChildren();
        };

        this.prepareWordAnimation = function(start_cell, end_cell) {
            this.restoreAnimatedWord();
            var start_cell_x = start_cell[0];
            var start_cell_y = start_cell[1];

            var end_cell_x = end_cell[0];
            var end_cell_y = end_cell[1];

            if (start_cell_x != end_cell_x) {
                var inclination = (end_cell_y - start_cell_y) /
                                  (end_cell_x - start_cell_x);
                var start = start_cell_x;
                var end = end_cell_x;
                if (start_cell_x > end_cell_x) {
                    start = end_cell_x;
                    end = start_cell_x;
                }

                for (var x = start; x <= end; x++) {
                    y = Math.round(start_cell_y + inclination *
                                   (x - start_cell_x));
                    if (isNaN(y)) {
                        y = start_cell_y;
                    }
                    this.animatedLetters.push(this.letters[y][x]);
                }
            } else {
                var start = start_cell_y;
                var end = end_cell_y;
                if (start_cell_y > end_cell_y) {
                    start = end_cell_y;
                    end = start_cell_y;
                }

                for (var y = start; y <= end; y++) {
                    this.animatedLetters.push(this.letters[y][start_cell_x]);
                }
            }

        };

        this.showDancingLetters = function() {
            // apply the effect over the selected letters
            for (var i = 0; i < this.animatedLetters.length; i++) {
                matrixLetter = this.animatedLetters[i];
                // add another letter to animate
                var text = new createjs.Text(matrixLetter.text,
                                         font, "#ffffff");
                text.x = matrixLetter.x;
                text.y = matrixLetter.y + text.getMeasuredHeight() / 2;
                text.textAlign = "center";
                // this is needed to set the rotation center
                text.regY = text.getMeasuredHeight() / 2;
                text.scaleX = 1.5;
                text.scaleY = 1.5;
                // text.rotation = 45;

                //createjs.Tween.get(text, {loop:true}).to(
                //    {rotation:-90}, 600).to(
                //    {rotation:90}, 600);

                this.animationContainer.addChild(text);
            }
        };

        this.hideDancingLetters = function() {
            this.animationContainer.removeAllChildren();
        };


    }
    wordmatrix.MatrixView = MatrixView;
    return wordmatrix;
});
