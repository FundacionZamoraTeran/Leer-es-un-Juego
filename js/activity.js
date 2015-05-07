$(document).ready(function(){
	requirejs.config({
       		baseUrl: "lib"
        });

	require(["sugar-web/graphics/activitypalette", "domReady!"],
		function (activitypalette, doc) {
	
		var button = document.getElementById("activity-button");
		var palette = new activitypalette.ActivityPalette(button);
		//palette.popUp();
	});

	var canvas = $("#gameCanvas");
	var context = canvas.get(0).getContext("2d");

	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();

	var playGame;
	var plataformX;
	var plataformY;
	var plataformOuterRadius;
	var plataformInnerRadius;
	//var image = $("#logo");
	//var contextimg = image.get(0).getContext("2d");

	var ui = $("#gameUI");
	var uiIntro = $("#gameIntro");
	var uiStats = $("#gameStats");
	var uiComplete = $("#gameComplete");
	var uiSonido = $("#sonidoPlay");
	var uiSilabas = $("#silabasPlay");
	var uiPalabras= $("#palabrasPlay");
	var uiReset = $(".gameReset");
	var uiRemaining = $("#gameRemaining");
	var uiScore = $(".gameScore");

	function startGame(level){
		uiScore.html("0");
		uiStats.show();
		playGame = false;
		if (level=="sonidoPlay"){
			var img1 = new Image();
			img1.src = "./images/z.png";
			$(img1).load(function(){
				context.drawImage(img1, 20, 60); 
			});
		};
		animate();
	};
	
	function init(){
		uiStats.hide();
		uiComplete.hide();

		uiSonido.click(function(e){
			e.preventDefault();
			uiIntro.hide();
			startGame("sonidoPlay");
		});

		uiSilabas.click(function(e){
			e.preventDefault();
			uiIntro.hide();
			startGame("");
		});

		uiPalabras.click(function(e){
			e.preventDefault();
			uiIntro.hide();
			startGame();
		});
		
		uiReset.click(function(e){
			e.preventDefault();
			uiComplete.hide();
			startGame();
		});
	};

	function animate(){
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context.fillStyle = "rgb(100, 100, 100)";
		context.beginPath();
		context.arc(plataformX, plataformY, plataformOuterRadius, 0, Math.PI*2, true);
		context.closePath();
		context.fill();

		if (playGame){
			setTimeout(animate, 33);
		};
	};

	init();
});
