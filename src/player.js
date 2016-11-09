"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED_X = 8.5;
const PLAYER_SPEED_Y = 6.4;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, missiles) {
  this.alive = true;
  this.missiles = missiles;
  this.missileCount = 4;
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: 200, y: 200};
  this.velocity = {x: 0, y: 0};
  this.health = 1000;
  this.img = new Image();
  this.img.src = 'assets/tyrian.shp.1.transp.png';
  this.death = new Image();
  this.death.src = 'assets/exploding.png';
}

Player.prototype.health = function() {
  return this.health;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input) {
  if(this.alive)
  {
    // set the velocity
    this.velocity.x = 0;
    if(input.left) this.velocity.x -= PLAYER_SPEED_X;
    if(input.right) this.velocity.x += PLAYER_SPEED_X;
    this.velocity.y = 0;
    if(input.up) this.velocity.y -= PLAYER_SPEED_Y;
    if(input.down) this.velocity.y += PLAYER_SPEED_Y;
    
    // determine player angle
    this.angle = 0;
    if(this.velocity.x < 0) this.angle = -1;
    if(this.velocity.x > 0) this.angle = 1;
    
    // move the player
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // don't let the player move off-screen
    if(this.position.x < 0) this.position.x = 0;
    if(this.position.x > 1024) this.position.x = 1024;
    if(this.position.y > 786) this.position.y = 786;
  }
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx) {
  if(this.alive) {
    var offset = this.angle * 23;
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 48+offset, 169, 23, 27, -12.5, -12, 23, 27);
    ctx.restore();
  }
  else
  {
    for(var i=0; i<30; i++)
    {
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      var randX = Math.cos(Math.PI * 2 * Math.random())*(30*Math.random());
      var randY = Math.sin(Math.PI * 2 * Math.random())*(30*Math.random());
      ctx.drawImage(this.death, 0, 0, 20, 28, randX, randY, 20, 28);
      ctx.restore();
    }
  }
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:0, y:6});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}
