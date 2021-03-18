define(["Boid", "Star", "sketch", "../libraries/p5", "./p5.dom"],
	function(Boid, Star, sketch, p5) {
		"use strict";

		new p5(function(p) {
			var boids = [];
			var food = [];
			var poison = [];
			var bestHealth = 0;
			var oldestBoid = -1;
			var foodCol, poisonCol;
			var margin = sketch.margin;

			p.setup = function() {
				var p = sketch.p;

				var canvas = p.createCanvas(window.innerWidth-275, window.innerHeight);
				canvas.position(0, 0);

				for (var i = 0; i < 50; ++i) {
					boids[i] = new Boid(p.random(p.width), p.random(p.height));
				}

				for (var i = 0; i < 100; ++i) {
					let x = p.random(margin, p.width - margin);
					let y = p.random(margin, p.height - margin);
					food.push({position : p.createVector(x, y)});
				}

				for (var i = 0; i < 200; ++i) {
					let x = p.random(margin, p.width - margin);
					let y = p.random(margin, p.height - margin);
					poison.push({position : new Star(x, y, 1.5, 9, 3)});
				}

				foodCol = p.color(0, 255, 0);
				poisonCol = p.color(250, 65, 65);
			};

			p.draw = function() {
				var p = sketch.p;

				p.background(70);
				p.fill(255);
				p.noStroke();

				var smallBoids = [];
				var mediumBoids = [];
				var largeBoids = [];

				for (var i = 0; i < boids.length; ++i) {
					var health = boids[i].health;
					if(health>2){
						largeBoids.push(boids[i]);
					} else if(health>1){
						mediumBoids.push(boids[i]);
					} else {
						smallBoids.push(boids[i]);
					}
				}		

				if (smallBoids.length<sketch.maxNumBoids/3) {
					smallBoids.push(new Boid(p.random(p.width), p.random(p.height)));
				}

				if (food.length < Math.min((smallBoids.length)*7,50)) {
					let x = p.random(margin, p.width - margin);
					let y = p.random(margin, p.height - margin);
					food.push({position : p.createVector(x, y)});
				}

				if (poison.length<200) {
					let x = p.random(margin, p.width - margin);
					let y = p.random(margin, p.height - margin);
					poison.push({position : new Star(x, y, 1.5, 9, 3)});
				}

				for (var i = 0; i < food.length; ++i) {
					p.fill(foodCol);
					p.noStroke();
					p.ellipse(food[i].position.x, food[i].position.y, 5, 5);
				}

				for (var i = 0; i < poison.length; ++i) {
					p.fill(poisonCol);
					p.noStroke();
					poison[i].position.show();
				}		
				
				bestHealth =0;
				for (var i = 0; i < boids.length; ++i) {
					if (boids[i].health > bestHealth) {
						bestHealth = boids[i].health;
					}
				}
				// Call the appropriate steering behaviours for our agents
				for (var i = smallBoids.length-1; i >= 0; --i) {
					smallBoids[i].boundaries();
					smallBoids[i].behaviours(food, poison);
					smallBoids[i].update();
					if (smallBoids[i].health === bestHealth) {
						smallBoids[i].display(true);
					} else {
						smallBoids[i].display(false);
					}

					var newBoid = smallBoids[i].clone();
					if (newBoid !== null) {
						smallBoids.push(newBoid);
					}

					if (smallBoids[i].dead()) {
						let x = p.random(margin, p.width - margin);
						let y = p.random(margin, p.height - margin);
						food.push({position : p.createVector(x, y)});
						smallBoids.splice(i, 1);
					}
				}
				for (var i = mediumBoids.length-1; i >= 0; --i) {
					mediumBoids[i].boundaries();
					mediumBoids[i].behaviours(food, poison);
					mediumBoids[i].update();
					if (mediumBoids[i].health === bestHealth) {
						mediumBoids[i].display(true);
					} else {
						mediumBoids[i].display(false);
					}

					var newBoid = mediumBoids[i].clone();
					if (newBoid !== null) {
						smallBoids.push(newBoid);
					}

					if (mediumBoids[i].dead()) {
						let x = p.random(margin, p.width - margin);
						let y = p.random(margin, p.height - margin);
						food.push({position : p.createVector(x, y)});
						mediumBoids.splice(i, 1);
					}
				}
				for (var i = largeBoids.length-1; i >= 0; --i) {
					largeBoids[i].boundaries();
					largeBoids[i].behaviours(smallBoids, poison);
					largeBoids[i].update();
					if (largeBoids[i].health === bestHealth) {
						largeBoids[i].display(true);
					} else {
						largeBoids[i].display(false);
					}

					var newBoid = largeBoids[i].clone();
					if (newBoid !== null) {
						smallBoids.push(newBoid);
					}

					if (largeBoids[i].dead()) {
						let x = p.random(margin, p.width - margin);
						let y = p.random(margin, p.height - margin);
						food.push({position : p.createVector(x, y)});
						largeBoids.splice(i, 1);
					}
				}

				boids = smallBoids.concat(mediumBoids, largeBoids);

				var longestMills = 0;
				var currentMillis = (new Date).getTime();
				for (var i = 0; i < boids.length; ++i) {
					var millis = currentMillis - boids[i].millis;
					if (millis > longestMills) {
						longestMills = millis;
						oldestBoid = i;
					}
				}

				sketch.healthValue = bestHealth.toFixed(3);
				sketch.numFood = food.length;
				sketch.numPoison = poison.length;
				sketch.numBoids = boids.length;
				sketch.numSmallBoids = smallBoids.length;
				sketch.numMediumBoids = mediumBoids.length;
				sketch.numLargeBoids = largeBoids.length;

			};

			p.mousePressed = function() {
				let x = p.winMouseX;
				let y = p.winMouseY;
				food.push({position : p.createVector(x, y)});
			};

			p.keyReleased = function() {
				if (p.keyCode === p.ENTER) {
					sketch.debug = !sketch.debug;
				}
			};

		}, null);

	});