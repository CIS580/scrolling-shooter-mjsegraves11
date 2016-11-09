"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED_X = 4;
const PLAYER_SPEED_Y = 3;
const BULLET_SPEED = 8;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Enemy;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Enemy(position, enemyType) {
  this.alive = true;
  this.initialx = position.x;
  this.initialy = position.y;
  this.position = position;
  this.velocity = {x: 0, y: 0};
  this.enemyType = enemyType;
  this.img = new Image();
  this.img.src = 'assets/tyrian.shp.1.transp.png';
  this.death = new Image();
  this.death.src = 'assets/exploding.png';

  this.moveRight = false;
  this.moveLeft = false;
  this.moveUp = false;
  this.moveDown = false;

  if(this.enemyType == 1)
  {
    this.moveLeft = true;
  } else if(this.enemyType == 2) {
    this.moveUp = true;
  } else if(this.enemyType == 3) {
    this.moveLeft = true;
    this.moveUp = true;
  } else if(this.enemyType == 4) {
    this.moveLeft = true;
    this.moveDown = true;
  }
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Enemy.prototype.update = function(elapsedTime) {
  if(this.alive)
  {
    if(this.enemyType == 1) {
      if(this.initialx - this.position.x < -200)
      {
        this.moveLeft = true;
        this.moveRight = false;
      }
      if(this.initialx - this.position.x > 200)
      {
        this.moveRight = true;
        this.moveLeft = false;
      }
    } else if(this.enemyType == 2) {
      if(this.initialy - this.position.y < -200)
      {
        this.moveUp = true;
        this.moveDown = false;
      }
      if(this.initialy - this.position.y > 200)
      {
        this.moveDown = true;
        this.moveUp = false;
      }
    } else if(this.enemyType == 3) {
      if(this.initialx - this.position.x < -150 && this.initialy - this.position.y < -150)
      {
        this.moveLeft = true;
        this.moveUp = true;
        this.moveRight = false;
        this.moveDown = false;
      }
      if(this.initialx - this.position.x > 150 && this.initialy - this.position.y > 150)
      {
        this.moveRight = true;
        this.moveDown = true;
        this.moveLeft = false;
        this.moveUp = false;
      }
    } else if(this.enemyType == 4) {
      if(this.initialx - this.position.x < -150 && this.initialy - this.position.y > 150)
      {
        this.moveLeft = true;
        this.moveDown = true;
        this.moveRight = false;
        this.moveUp = false;
      }
      if(this.initialx - this.position.x > 150 && this.initialy - this.position.y < -150)
      {
        this.moveRight = true;
        this.moveUp = true;
        this.moveLeft = false;
        this.moveDown = false;
      }
    } else if(this.enemyType == 5) {
      //stay motionless
    }
    if(this.moveLeft)
    {
      this.position.x -= 5;
    }
    if(this.moveRight)
    {
      this.position.x += 5;
    }
    if(this.moveUp)
    {
      this.position.y -= 5;
    }
    if(this.moveDown)
    {
      this.position.y += 5;
    }
  }
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Enemy.prototype.render = function(elapasedTime, ctx) {
  if(this.alive) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    if(this.enemyType == 1) {
      ctx.drawImage(this.img, 48, 198, 23, 27, -12.5, -12, 46, 54);
    } else if(this.enemyType == 2) {
      ctx.drawImage(this.img, 48, 169, 23, 27, -12.5, -12, 46, 54);
    } else if(this.enemyType == 3) {
      ctx.drawImage(this.img, 48, 140, 23, 27, -12.5, -12, 46, 54);
    } else if(this.enemyType == 4) {
      ctx.drawImage(this.img, 48, 113, 23, 27, -12.5, -12, 46, 54);
    } else if(this.enemyType == 5) {
      ctx.drawImage(this.img, 48, 56,  23, 27, -12.5, -12, 46, 54);
    }
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

