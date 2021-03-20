define(["../libraries/p5", "./p5.dom"],
	function(p5) {
		"use strict";

		var sketch = {};
		sketch.p = new p5(function(p) {

		});
		
		sketch.maxNumBoids = 75;
		sketch.maxFood = sketch.maxNumBoids;
		sketch.minNumFood = sketch.maxNumBoids/10;

		sketch.HealthUntilStopEatingFood = 2;
		sketch.HungerToEat = 1;
		sketch.eatHealthToSelfRatio = 0.5;

		sketch.debug = false;
		sketch.healthValue = 0;
		sketch.margin = 50;
		sketch.numFood= 0;
		sketch.numBoids = 0;
		sketch.start = new Date();
		sketch.gameOver = false;

		// Shared global variables
		sketch.foodCol = sketch.p.color(0, 255, 0);

		sketch.canvasArea = 1;

		sketch.setMinMaxs = function(canvasArea){
			sketch.maxNumBoids = Math.max(10,canvasArea/20000);
			sketch.maxFood = sketch.maxNumBoids;
			sketch.minNumFood = sketch.maxNumBoids/10;
		}

		return sketch;

	});

