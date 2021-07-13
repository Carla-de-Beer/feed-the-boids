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
				var smallBoids = boids.filter(boid => boid.health<sketch.HealthUntilStopEatingFood/2).length;

				var modeMap = {};
				var maxEl = boids[0].color, maxCount = 1;
				for(var i = 0; i < boids.length; i++)
				{
					var el = boids[i].color;
					if(modeMap[el] == null)
						modeMap[el] = 1;
					else
						modeMap[el]++;  
					if(modeMap[el] > maxCount)
					{
						maxEl = el;
						maxCount = modeMap[el];
					}
				}
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

				p.push();
				p.textAlign(p.RIGHT);
				let y = 15;
				p.text("Max number of boids: "+Math.floor(sketch.maxNumBoids), window.innerWidth-5,y);
				y += 15;
				p.text("Number of boids: "+sketch.numBoids, window.innerWidth-5,y);
				y += 15;
				p.text("Number of small boids: "+smallBoids, window.innerWidth-5,y);
				y += 15;
				p.text("Number of food: "+sketch.numFood, window.innerWidth-5,y);
				y+= 15;
				p.text("Number of species = "+Object.keys(modeMap).length, window.innerWidth-5,y);
				y+= 15;
				p.fill(maxEl);
				p.text("Best specie have N = "+maxCount, window.innerWidth-5,y);
				y+= 15;
				p.fill(boids[oldestBoid].color);
				p.text("Oldest boid health= "+boids[oldestBoid].health.toFixed(2), window.innerWidth-5,y);
				y+= 15;
				p.fill(boids[biggestBoid].color);
				p.text("Best boid health= "+boids[biggestBoid].health.toFixed(2), window.innerWidth-5,y);
				p.pop();

				if (food.length < Math.min(sketch.maxFood,Math.max(smallBoids*4,sketch.minNumFood))) {
					let x = p.random(margin, p.width - margin);
					let y = p.random(margin, p.height - margin);
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
					if (boids[i].color.toString() == maxEl.toString()) {
						boids[i].display(true);
					} else {
						boids[i].display(false);
					}
					if (sketch.maxNumBoids > sketch.numBoids)
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
				if( p.mouseIsPressed && p.random(1)<0.33){
					let x = p.winMouseX;
					let y = p.winMouseY;
					if (p.mouseButton === p.CENTER){
							food.push({position : p.createVector(x, y)});
					} else if(p.mouseButton === p.RIGHT){
						for (var i = food.length-1; i >= 0; --i) {
							var d = p.dist(x, y, food[i].position.x, food[i].position.y);
		
							if (d < 50) {
								food.splice(i, 1);
							}
						}
					} else if(p.mouseButton === p.LEFT){
						boids.push(new Boid(x, y));
					}
				}

			};

			window.onresize = function(){
				var p = sketch.p
				p.resizeCanvas(window.innerWidth, window.innerHeight);
				sketch.canvasArea = window.innerWidth*window.innerHeight;
				sketch.setMinMaxs(sketch.canvasArea);
			}

			document.oncontextmenu = function() {
				return false;
			}

			p.keyReleased = function() {
				if (p.keyCode === p.ENTER) {
					sketch.debug = !sketch.debug;
				}
			};

		}, null);

	});