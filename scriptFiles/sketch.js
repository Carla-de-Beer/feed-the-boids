define(["../libraries/p5", "./p5.dom"],
	function(p5) {
		"use strict";

		var sketch = {};
		sketch.p = new p5(function(p) {

		});

		// Shared global variables
		sketch.foodCol = sketch.p.color(0, 255, 0);
		sketch.poisonCol = sketch.p.color(255, 0, 0);

		sketch.debug = false;
		sketch.healthValue = 0;
		sketch.margin = 50;
		sketch.numFood= 0;
		sketch.numPoison = 0;
		sketch.numBoids = 0;
		sketch.start = new Date();
		sketch.gameOver = false;
		sketch.maxNumBoids = 75;
		sketch.numSmallBoids = [];
		sketch.numMediumBoids = [];
		sketch.numLargeBoids = [];

		return sketch;

	});

