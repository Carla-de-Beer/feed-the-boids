define(["sketch", "../libraries/p5"],
	function(sketch, p5) {
		"use strict";

		var foodPlus = 0.4;
		var mutationRate = 0.2;
		var frameMinus = 0.0005;
		var margin = sketch.margin;
		var p = sketch.p;

		return p5.Boid = function(x, y, dna) {

			this.acceleration = p.createVector(0, 0);
			this.velocity = p.createVector(0, -2);
			this.position = p.createVector(x, y);
			this.r = 4;
			this.maxspeed = 2;
			this.maxforce = 0.5;
			this.millis = (new Date).getTime();
			this.hunger = 1;
			this.health = 1;

			this.color;
			this.dna = [];
			if (dna === undefined) {
				// Food weight
				this.dna[0] = p.random(-1, 2);
				// Fear weight
				this.dna[1] = p.random(-2, 1);
				// perception
				this.dna[2] = p.random(5, 50);
			} else {
				this.dna[0] = dna[0];
				this.dna[1] = dna[1];
				this.dna[2] = dna[2];
				let mutationRateAmount = p.random(1,-1);
				if (Math.abs(mutationRateAmount)< mutationRate) {
					this.dna[0] += mutationRateAmount;
					this.dna[1] += mutationRateAmount;
					this.dna[2] += mutationRateAmount;
				}
			}
			let r = Math.min(255,Math.abs(this.dna[1])*100);
			let g = Math.min(255,Math.abs(this.dna[0])*100);
			let b = Math.min(255,Math.abs(this.dna[2]));
			this.color = p.color(r, g, b)

			// Method to update location
			this.update = function() {
				this.health -= frameMinus;
				this.hunger -= frameMinus*10;
				// Update velocity
				this.velocity.add(this.acceleration);
				// Limit speed
				this.velocity.limit(Math.max(this.maxspeed,this.health));
				this.position.add(this.velocity);
				// Reset acceleration to 0 each cycle
				this.acceleration.mult(0);
			};

			this.applyForce = function(force) {
				// We could add mass here if we want A = F / M
				this.acceleration.add(force);
			};

			this.boundaries = function() {
				var desired = null;
				if (this.position.x < margin) {
					desired = p.createVector(this.maxspeed, this.velocity.y);
				}
				else if (this.position.x > p.width - margin) {
					desired = p.createVector(-this.maxspeed, this.velocity.y);
				}

				if (this.position.y < margin) {
					desired = p.createVector(this.velocity.x, this.maxspeed);
				}
				else if (this.position.y > p.height - margin) {
					desired = p.createVector(this.velocity.x, -this.maxspeed);
				}

				if (desired !== null) {
					desired.normalize();
					desired.mult(Math.max(this.maxspeed,this.health));
					var steer = p5.Vector.sub(desired, this.velocity);
					steer.limit(Math.max(this.maxforce,this.health/4));
					this.applyForce(steer);
				}
			};

			this.behaviours = function(food, boids) {
				var biggerBoids = boids.filter(boid=>boid.health * 
					sketch.eatHealthToSelfRatio>this.health);

				var steerB = this.fear(biggerBoids, this.dna[2]);
				steerB.mult(this.dna[1]);
				this.applyForce(steerB);

				if (this.hunger>=sketch.HungerToEat){
					return;
				}

				if (this.health < sketch.HealthUntilStopEatingFood){
					var steerG = this.eatFood(food, foodPlus, this.dna[2]);
				}
				else {
//					var steerG = this.eatFood(food, foodPlus, this.dna[2]);
					var steerG = this.eatBoids(boids, this.dna[2]);
				}
				steerG.mult(this.dna[0]);
				this.applyForce(steerG);
			};

			this.fear = function(list, perception) {
				var record = Infinity;
				var closest = null;
				for (var i = list.length-1; i >= 0; --i) {
					var d = p.dist(this.position.x, this.position.y, list[i].position.x, list[i].position.y);

						if (d < record && d < perception) {
							record = d;
							closest = list[i];
						}
				}

				if (closest !== null) {
					return this.seek(closest);
				}

				return p.createVector(0, 0);
			};

			this.eatBoids = function(list, perception) {
				var record = Infinity;
				var closest = null;
				for (var i = list.length-1; i >= 0; --i) {
					if (list[i].color === this.color){
						continue;
					}
					if (list[i].health >= this.health){
						continue;
					}
					
					if (list[i].health > this.health*sketch.eatHealthToSelfRatio){
						continue;
					}

					var d = p.dist(this.position.x, this.position.y, list[i].position.x, list[i].position.y);

					if (d < this.maxspeed) {
						this.health += list[i].health/10;
						this.hunger += list[i].health/10;
						list[i].health=0;
					} else {
						if (d < record && d < perception) {
							record = d;
							closest = list[i];
						}
					}
				}

				if (closest !== null) {
					return this.seek(closest);
				}

				return p.createVector(0, 0);
			};


			this.eatFood = function(list, nutrition, perception) {
				var record = Infinity;
				var closest = null;
				for (var i = list.length-1; i >= 0; --i) {
					var d = p.dist(this.position.x, this.position.y, list[i].position.x, list[i].position.y);

					if (d < this.maxspeed) {
						list.splice(i, 1);
						this.health += nutrition;
						this.hunger += nutrition;
					} else {
						if (d < record && d < perception) {
							record = d;
							closest = list[i];
						}
					}
				}

				if (closest !== null) {
					return this.seek(closest);
				}

				return p.createVector(0, 0);
			};

			this.clone = function() {
				var p = sketch.p;

				if (sketch.maxNumBoids > sketch.numBoids && p.random(1) < 0.0005) {
					return new p5.Boid(p.random(p.width), p.random(p.height), this.dna);
				} else return null;
			};

			this.dead = function() {
				return (this.health < 0);
			};
			// A method that calculates a steering force towards a target
			// STEER = DESIRED MINUS VELOCITY
			this.seek = function(target) {
				// A vector pointing from the location to the target
				//var desired = p5.Vector.sub(target, this.position);
				var dx = target.position.x - this.position.x;
				var dy = target.position.y - this.position.y;

				var desired = p.createVector(dx, dy);

				// Scale to maximum speed
				desired.setMag(this.maxspeed);

				// Steering = Desired minus velocity
				var steer = p5.Vector.sub(desired, this.velocity);
				// Limit to maximum steering force
				steer.limit(Math.max(this.maxforce,this.health/4));

				return steer;
			};

			this.display = function(isBest) {
				// Draw a triangle rotated in the direction of velocity
				var theta = this.velocity.heading() + p.PI/2;
				let sizeFromHealth = Math.sqrt(this.health) + 0.3;
				sizeFromHealth = Math.sqrt(sizeFromHealth);

				p.push();
				p.translate(this.position.x, this.position.y);
				p.rotate(theta);
				const rd = p.color(255,0,0);

				if (sketch.debug || isBest) {
					if (isBest) {
						p.fill(255, 40);
					} else {
						p.noFill();
					}
					p.stroke(sketch.foodCol);
					p.line(0, 0, 0, -this.dna[0] * 25);
					p.strokeWeight(0.7);
					p.ellipse(0, 0, this.dna[2] * 2);

					p.stroke(rd);
					p.line(0, 0, 0, -this.dna[1] * 25);
					p.strokeWeight(1);
					p.strokeWeight(0.7);
					p.ellipse(0, 0, this.dna[2] * 2);
					p.strokeWeight(1);
					p.stroke(255);
				}

				p.fill(this.color);
				p.stroke(this.color);
				p.strokeWeight(1);
				p.beginShape();
				p.vertex(0, -this.r * 2 * sizeFromHealth);
				p.vertex(-this.r * sizeFromHealth, this.r * 2 * sizeFromHealth);
				p.vertex(this.r * sizeFromHealth, this.r * 2 * sizeFromHealth);
				p.endShape(p.CLOSE);
				p.pop();
			};
		}

	});