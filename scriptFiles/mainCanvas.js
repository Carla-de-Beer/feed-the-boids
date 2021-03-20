define(["Boid", "Star", "sketch", "../libraries/p5", "./p5.dom"],
	function(Boid, Star, sketch, p5) {
		"use strict";

		new p5(function(p) {
			var boids = [];
			var food = [];
			var oldestBoid = -1;
			var biggestBoid = -1;
			var margin = sketch.margin;

			p.setup = function() {
				var p = sketch.p;

				var canvas = p.createCanvas(window.innerWidth, window.innerHeight);
				canvas.position(0, 0);

				sketch.canvasArea = window.innerWidth*window.innerHeight;
				sketch.setMinMaxs(sketch.canvasArea);

				for (var i = 0; i < sketch.maxNumBoids/2; ++i) {
					boids[i] = new Boid(p.random(p.width), p.random(p.height));
				}

				for (var i = 0; i < sketch.minNumFood; ++i) {
					let x = p.random(margin, p.width - margin);
					let y = p.random(margin, p.height - margin);
					food.push({position : p.createVector(x, y)});
				}
			};

			p.draw = function() {
				var p = sketch.p;

				p.background(70);
				p.fill(255);
				p.noStroke();
				sketch.numFood = food.length;
				sketch.numBoids = boids.length;
				let smallBoids = boids.filter(boid => boid.health<sketch.HealthUntilStopEatingFood/2).length;

				p.textAlign(p.RIGHT);
				let y = 15;
				p.text("Max number of boids: "+Math.floor(sketch.maxNumBoids), window.innerWidth-5,y);
				y += 15;
				p.text("Number of boids: "+sketch.numBoids, window.innerWidth-5,y);
				y += 15;
				p.text("Number of small boids: "+smallBoids, window.innerWidth-5,y);
				y += 15;
				p.text("Number of food: "+sketch.numBoids, window.innerWidth-5,y);


				var longestMills = 0;
				var currentMillis = (new Date).getTime();
				var bestHealth = 0;
				for (var i = 0; i < boids.length; ++i) {
					var millis = currentMillis - boids[i].millis;
					if (millis > longestMills) {
						longestMills = millis;
						oldestBoid = i;
					}
					if(boids[i].health > bestHealth){
						bestHealth = boids[i].health;
						biggestBoid = i;
					}
				}

				if (food.length < Math.min(sketch.maxFood,Math.max(smallBoids*4,sketch.minNumFood))) {
					let x = p.random(margin, p.width - margin);
					let y = p.random(margin, p.height - margin);
					food.push({position : p.createVector(x, y)});
				}
				if( p.mouseIsPressed && p.random(1)<0.33){
					let x = p.winMouseX;
					let y = p.winMouseY;
					food.push({position : p.createVector(x, y)});
				}
				for (var i = 0; i < food.length; ++i) {
					p.fill(sketch.foodCol);
					p.noStroke();
					p.ellipse(food[i].position.x, food[i].position.y, 5, 5);
				}
				for (var i = boids.length-1; i >= 0; --i) {
					boids[i].boundaries();
					boids[i].behaviours(food, boids);
					boids[i].update();
					if (i=== oldestBoid || i===biggestBoid) {
						boids[i].display(true);
					} else {
						boids[i].display(false);
					}
					if (sketch.maxNumBoids < sketch.numBoids)
					{
						var newBoid = boids[i].clone();
						if (newBoid !== null) {
							boids.push(newBoid);
						}
					}
					if (boids[i].dead()) {
						let x = p.random(margin, p.width - margin);
						let y = p.random(margin, p.height - margin);
						food.push({position : p.createVector(x, y)});
						boids.splice(i, 1);
					}
				}

				if (sketch.maxNumBoids/2 >= boids.length &&
					(smallBoids<boids.length/10 || boids.length<sketch.maxNumBoids/20)) {
					boids.push(new Boid(p.random(p.width), p.random(p.height)));
				}
				
			};

			window.onresize = function(){
				var p = sketch.p
				p.resizeCanvas(window.innerWidth, window.innerHeight);
				sketch.canvasArea = window.innerWidth*window.innerHeight;
				sketch.setMinMaxs(sketch.canvasArea);
			}

			p.keyReleased = function() {
				if (p.keyCode === p.ENTER) {
					sketch.debug = !sketch.debug;
				}
			};

		}, null);

	});