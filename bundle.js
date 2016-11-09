(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const Enemy = require('./enemy');
const Powerup = require('./powerup');
const BulletPool = require('./bullet_pool');


/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var input = {
  up: false,
  down: false,
  left: false,
  right: false
}
var camera = new Camera(canvas);
var bulletRadius = 3;
var bullets = new BulletPool(10, bulletRadius);
var missiles = [];
var player = new Player(bullets, missiles);
var backgroundsLevelOne = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image()
];

var levelOnePowerup = new Powerup({x:200, y:-400},1);
var levelTwoPowerup = new Powerup({x:400, y:-550},2);
var levelThreePowerup = new Powerup({x:300, y:-1000},3);

var levelOneEnemies = [
  new Enemy({x:300, y:-200},5),
  new Enemy({x:500, y:-400},5)
];
var levelTwoEnemies = [
  new Enemy({x:400, y:-200},1),
  new Enemy({x:500, y:-500},2),
  new Enemy({x:100, y:-1200},1),
  new Enemy({x:500, y:-1600},2)
];
var levelThreeEnemies = [
  new Enemy({x:400, y:-200},1),
  new Enemy({x:500, y:-500},3),
  new Enemy({x:100, y:-1200},2),
  new Enemy({x:500, y:-1600},3),
  new Enemy({x:400, y:-2000},4),
  new Enemy({x:50, y:-2500},2),
  new Enemy({x:100, y:-2700},2),
  new Enemy({x:20, y:-2900},3),
  new Enemy({x:400, y:-3400},4),
  new Enemy({x:500, y:-4000},1)
];

var gameIcon = new Image();
gameIcon.src = 'assets/TSHPSP~1.GIF';

var level = 1;
var levelSpeed = 2;
var paused = false;
var endOfLevel = false;
var score = 0;
//var paused = true;

backgroundsLevelOne[0].src = 'assets/shapesx.png';
backgroundsLevelOne[1].src = 'assets/shapesy.png';
backgroundsLevelOne[2].src = 'assets/newshp.shp.000000.png';
backgroundsLevelOne[3].src = 'assets/iceshard.png';
backgroundsLevelOne[4].src = 'assets/shapesw.png';
backgroundsLevelOne[5].src = 'assets/shapes).png';
backgroundsLevelOne[6].src = 'assets/tyrian.shp.1.transp.png';

window.onkeypress = function(event) {
  switch(event.keyCode)
  {
    case 13:
      paused = !paused;
      break;
    case 106:
    case 74:
      if(player.alive && !paused)
      {
        player.fireBullet({x:0, y:-2});
      }
      break;
  }
}
/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
if(!paused)
{
  if(player.health <= 0)
  {
    player.health = 0;
    player.alive = false;
    paused = true;
  }
  leveling();
  player.update(elapsedTime, input);
  camera.update(player.position);

  bullets.update(elapsedTime, function(bullet){
    if(!camera.onScreen(bullet)) return true;
    return false;
  });

  var markedForRemoval = [];
  missiles.forEach(function(missile, i){
    missile.update(elapsedTime);
    if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
      markedForRemoval.unshift(i);
  });

  // Remove missiles that have gone off-screen
  markedForRemoval.forEach(function(index){
    missiles.splice(index, 1);
  });

  //check for powerup at 500, -2300 on level 3
  if(level == 1)
  {
    levelOneEnemies.forEach(function(enemy) {
        enemy.update(elapsedTime);
        var TX = Math.abs(player.position.x - enemy.position.x);
        var TY = Math.abs(player.position.y - enemy.position.y);
        if((TX*TX)+(TY*TY) < 3000)
        {
          if(enemy.alive)
          {
            enemy.alive = false;
            player.health -= 400;
            score += 150;
          }
        }
        for(var i=0; i<bullets.max; i++)
        {
          var BX = Math.abs(bullets.pool[4*i] - enemy.position.x);
          var BY = Math.abs(bullets.pool[4*i+1] - enemy.position.y);
          if((BX*BX)+(BY*BY) < 5000)
          {
            enemy.alive = false;
            score += 200;
          }
        }
    });
    var X = Math.abs(player.position.x - levelOnePowerup.position.x);
    var Y = Math.abs(player.position.y - levelOnePowerup.position.y);
    if((X*X)+(Y*Y) < 400)
    {
      if(!levelOnePowerup.on)
      {
        score += 1000;
        levelOnePowerup.on = true;
      }
    } 
  }
  else if(level == 2)
  {
    levelTwoEnemies.forEach(function(enemy) {
        enemy.update(elapsedTime);
        var TX = Math.abs(player.position.x - enemy.position.x);
        var TY = Math.abs(player.position.y - enemy.position.y);
        if((TX*TX)+(TY*TY) < 3000)
        {
          if(enemy.alive)
          {
            enemy.alive = false;
            player.health -= 400;
            score += 150;
          }
        }
        for(var i=0; i<bullets.max; i++)
        {
          var BX = Math.abs(bullets.pool[4*i] - enemy.position.x);
          var BY = Math.abs(bullets.pool[4*i+1] - enemy.position.y);
          if((BX*BX)+(BY*BY) < 5000)
          {
            enemy.alive = false;
            score += 200;
          }
        }
    });
    var X = Math.abs(player.position.x - levelTwoPowerup.position.x);
    var Y = Math.abs(player.position.y - levelTwoPowerup.position.y);
    if((X*X)+(Y*Y) < 400)
    {
      if(!levelTwoPowerup.on)
      {
        bulletRadius = 7;
        bullets = new BulletPool(10, bulletRadius);
        var pos = player.position;
        var phealth = player.health;
        player = new Player(bullets, missiles);
        player.position = pos;
        player.health = phealth;
        levelTwoPowerup.on = true;
      }
    } 
  }
  else if(level == 3)
  {
    levelThreeEnemies.forEach(function(enemy) {
        enemy.update(elapsedTime);
        var TX = Math.abs(player.position.x - enemy.position.x);
        var TY = Math.abs(player.position.y - enemy.position.y);
        if((TX*TX)+(TY*TY) < 3000)
        {
          if(enemy.alive)
          {
            enemy.alive = false;
            player.health -= 400;
            score += 150;
          }
        }
        for(var i=0; i<bullets.max; i++)
        {
          var BX = Math.abs(bullets.pool[4*i] - enemy.position.x);
          var BY = Math.abs(bullets.pool[4*i+1] - enemy.position.y);
          if((BX*BX)+(BY*BY) < 5000)
          {
            enemy.alive = false;
            score += 200;
          }
        }
    });
    var X = Math.abs(player.position.x - levelThreePowerup.position.x);
    var Y = Math.abs(player.position.y - levelThreePowerup.position.y);
    if((X*X)+(Y*Y) < 400)
    {
      if(!levelThreePowerup.on)
      {
        levelSpeed = 2;
        levelThreePowerup.on = true;
      }
    } 
  }
}
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
if(!paused)
{
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1024, 786);

  // TODO: Render background

  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD cooridnates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();
}

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
    if(level == 1)
    {
      //far background
      ctx.save();
      ctx.translate(0, -camera.y * 0.2);
      ctx.drawImage(backgroundsLevelOne[0], 0, 1596, 70, 84, 0, -338, 782, 938);
      ctx.drawImage(backgroundsLevelOne[0], 0, 1400, 96, 112, 0, -1250, 782, 912);
      ctx.drawImage(backgroundsLevelOne[0], 72, 1507, 72, 84, 0, -2162, 782, 912)
      ctx.restore();
      
      //middle background
      ctx.save();
      ctx.translate(0, -camera.y * 0.6);
      ctx.drawImage(backgroundsLevelOne[0], 192, 1564, 48, 28, 400, 32, 288, 168);
      ctx.drawImage(backgroundsLevelOne[0], 144, 1564, 48, 28, 20, -330, 288, 168);
      ctx.drawImage(backgroundsLevelOne[0], 192, 1536, 48, 28, 200, -730, 288, 168);
      ctx.drawImage(backgroundsLevelOne[0], 192, 1508, 48, 28, 0, -1040, 288, 168);
      ctx.drawImage(backgroundsLevelOne[0], 192, 1480, 48, 28, 502, -1300, 288, 168);
      ctx.drawImage(backgroundsLevelOne[0], 192, 1564, 48, 28, 48, -1520, 288, 168);
      ctx.drawImage(backgroundsLevelOne[0], 144, 1564, 48, 28, 402, -1700, 288, 168);
      ctx.restore();
    
      //close background
      ctx.save();
      ctx.translate(0, -camera.y);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      300,     100,     48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      200,     0,       48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      600,     -250,    48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      420,     -500,    48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      120,     -600,    48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      380,     -850,    48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      590,     -1000,   48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      10,      -1300,   48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      80,      -1600,   48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      300,     -1780,   48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      600,     -1800,   48,        48);
      ctx.drawImage(backgroundsLevelOne[0],   120,     168,     24,      28,      160,     -1920,   48,        48);
      ctx.restore();
      levelOnePowerup.render(elapsedTime, ctx);
      levelOneEnemies.forEach(function(enemy) {
        enemy.render(elapsedTime, ctx);
      });
    }
    else if(level == 2)
    {
      //far background
      ctx.save();
      ctx.translate(0, -camera.y * 0.2);
      ctx.drawImage(backgroundsLevelOne[1],   72,      898,     48,      112,     0,       -1224,   782,       1824);
      ctx.drawImage(backgroundsLevelOne[1],   72,      1008,    48,      27,      0,       -1680,   782,       456);
      ctx.drawImage(backgroundsLevelOne[1],   0,       898,     72,      130,     0,       -3200,   782,       1520);
      ctx.restore(); 
      
      //middle background
      ctx.save();
      ctx.translate(0, -camera.y * 0.6);
      ctx.drawImage(backgroundsLevelOne[2],   0,       112,     48,      48,      400,     32,      192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   48,      112,     48,      48,      460,     -300,    192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   96,      112,     48,      48,      180,     -520,    192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   0,       112,     48,      48,      570,     -600,    192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   48,      112,     48,      48,      30,      -630,    192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   96,      112,     48,      48,      300,     -820,    192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   0,       112,     48,      48,      400,     -1040,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   48,      112,     48,      48,      460,     -1400,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   96,      112,     48,      48,      80,      -1720,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   0,       112,     48,      48,      210,     -1950,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   48,      112,     48,      48,      50,      -2200,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   96,      112,     48,      48,      580,     -2490,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   0,       112,     48,      48,      70,      -2530,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   48,      112,     48,      48,      460,     -2760,   192,       192);
      ctx.drawImage(backgroundsLevelOne[2],   96,      112,     48,      48,      320,     -2930,   192,       192);
      ctx.restore();

      //close background
      ctx.save();
      ctx.translate(0, -camera.y);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      300,     100,     72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      90,      -45,     72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      220,     -200,    72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      600,     -260,    72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      300,     -400,    72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      270,     -660,    72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      580,     -780,    72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      140,     -960,    72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      600,     -1260,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      340,     -1430,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      20,      -1560,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      40,      -1700,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      300,     -1870,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      420,     -1980,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      340,     -2060,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      60,      -2350,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      640,     -2470,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      390,     -2600,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      200,     -2870,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      550,     -2920,   72,        72);
      ctx.drawImage(backgroundsLevelOne[3],   0,       0,       115,     78,      430,     -3060,   72,        72); 
      ctx.restore();
      levelTwoPowerup.render(elapsedTime, ctx);
      levelTwoEnemies.forEach(function(enemy) {
        enemy.render(elapsedTime, ctx);
      });
    }
    else
    {
      ctx.save();
      ctx.translate(0, -camera.y * 0.2);
      ctx.drawImage(backgroundsLevelOne[4],   0,        34,     50,      132,      0,      -1860,   782,     2460);
      ctx.drawImage(backgroundsLevelOne[4],   0,        34,     50,      132,      0,      -4320,   782,     2460);
      ctx.drawImage(backgroundsLevelOne[4],   0,        34,     50,      132,      0,      -6780,   782,     2460);
      ctx.restore();

      ctx.save();
      ctx.translate(0, -camera.y * 0.6);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      180,     20,      300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      380,     -380,    300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      20,      -680,    300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      500,     -750,    300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      30,      -1020,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      90,      -1400,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      180,     -1700,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      480,     -2400,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      30,     -3000,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      570,     -3450,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      -100,     -4120,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      610,     -4500,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      300,     -4830,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      450,     -5300,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      210,     -5800,   300,       300);
      ctx.drawImage(backgroundsLevelOne[5],   0,         0,     68,      80,      370,     -6240,   300,       300);
      ctx.restore();

      ctx.save();
      ctx.translate(0, -camera.y);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      370,     0,        90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      600,     -30,      90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      400,     -200,     90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      700,     -540,     90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      30,      -780,     90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      210,     -820,     90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      120,     -990,     90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      500,     -1200,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      10,      -1630,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      550,     -1700,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      670,     -1880,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      20,      -2300,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      100,     -2530,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      300,     -2780,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      450,     -2980,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      240,     -3200,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      700,     -3340,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      630,     -3820,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      370,     -3930,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      220,     -4630,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      510,     -4780,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      380,     -5000,    90,        90);
      ctx.drawImage(backgroundsLevelOne[5],   0,        84,     95,      80,      580,     -5320,    90,        90);
      ctx.restore();
      levelThreePowerup.render(elapsedTime, ctx);
      levelThreeEnemies.forEach(function(enemy) {
        enemy.render(elapsedTime, ctx);
      });
    }

    // Render the bullets
    bullets.render(elapsedTime, ctx);

    // Render the missiles
    missiles.forEach(function(missile) {
      missile.render(elapsedTime, ctx);
    });

    // Render the player
    player.render(elapsedTime, ctx);
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI

  //background
  ctx.font = "20px serif";
  ctx.fillStyle = "black";
  ctx.fillRect(780, 0, 242, 600);
  //gameicon
  ctx.drawImage(gameIcon, 0, 0, 512, 384, 795, 20, 222, 166);
  //ship health text
  ctx.fillStyle = "white";
  ctx.fillText("Ship Health: " + player.health + " / 1000", 800, 220);
  //ship health bar
  ctx.fillStyle = "green";
  ctx.fillRect(800, 230, player.health/5, 10);
  //player score
  ctx.fillStyle = "pink";
  ctx.fillText("SCORE: " + score, 800, 260);
  //pause command
  ctx.fillStyle = "white";
  ctx.fillText("Pause: [Enter]", 800, 500);
  ctx.fillText("Shoot: [J]", 800, 520);
  ctx.fillText("Powered Shot: [K]", 800, 540);
  ctx.fillText("Move: [A][S][W][D]", 800, 560);
  if(paused)
  {
    if(!endOfLevel)
    {
      ctx.fillStyle = "white";
      ctx.font = "48px serif";
      if(player.alive) {
        ctx.fillText("PAUSED", 340, 300);
      }
      else {
        ctx.fillText("GAME OVER", 300, 300);
      }
    }
    else
    {
      ctx.fillStyle = "white";
      ctx.font = "36px serif";
      ctx.fillText("Score: " + score, 200, 200);
      ctx.font = "20px serif";
      if(level != 3) {
        ctx.fillText("Press enter to continue", 200, 300);
      }
      else {
        ctx.fillText("Game Complete, Good Job!", 200, 300);
      }
    }
  }
}

function leveling() {
  endOfLevel = false;
  if(level == 1)
  {
    if(camera.y > -1720) { camera.y-=levelSpeed; }
    else {
      paused = true;
      endOfLevel = true;
      level = 2;
      levelSpeed = 3;
      camera.y = 0;
      player.position = {x:200,y:200};
      var phealth = player.health;
      bullets = new BulletPool(10, bulletRadius);
      player = new Player(bullets, missiles);
      player.health = phealth;
    }
  }
  else if(level == 2)
  {
    if(camera.y > -2600) { camera.y-=levelSpeed; }
    else {
      paused = true;
      endOfLevel = true;
      level = 3;
      levelSpeed = 4;
      camera.y = 0;
      player.position = {x:200,y:200};
      var phealth = player.health;
      bullets = new BulletPool(10, bulletRadius);
      player = new Player(bullets, missiles);
      player.health = phealth;
    }
  }
  else
  {
    if(camera.y > -5600) { camera.y-=levelSpeed; }
    else {
      paused = true;
      endOfLevel = true;
      //beat the game
    }
  }
}

},{"./bullet_pool":2,"./camera":3,"./enemy":4,"./game":5,"./player":7,"./powerup":8,"./vector":10}],2:[function(require,module,exports){
"use strict";

/**
 * @module BulletPool
 * A class for managing bullets in-game
 * We use a Float32Array to hold our bullet info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = BulletPool;

/**
 * @constructor BulletPool
 * Creates a BulletPool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function BulletPool(maxSize, radius) {
  this.pool = new Float32Array(4 * maxSize);
  this.end = 0;
  this.max = maxSize;
  this.radius = radius;
}

/**
 * @function add
 * Adds a new bullet to the end of the BulletPool.
 * If there is no room left, no bullet is created.
 * @param {Vector} position where the bullet begins
 * @param {Vector} velocity the bullet's velocity
*/
BulletPool.prototype.add = function(position, velocity) {
  if(this.end < this.max) {
    this.pool[4*this.end] = position.x;
    this.pool[4*this.end+1] = position.y;
    this.pool[4*this.end+2] = velocity.x;
    this.pool[4*this.end+3] = velocity.y;
    this.end++;
  }
}

/**
 * @function update
 * Updates the bullet using its stored velocity, and
 * calls the callback function passing the transformed
 * bullet.  If the callback returns true, the bullet is
 * removed from the pool.
 * Removed bullets are replaced with the last bullet's values
 * and the size of the bullet array is reduced, keeping
 * all live bullets at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the bullet's position,
 * if the return value is true, the bullet is removed from the pool
 */
BulletPool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the bullet
    this.pool[4*i] += this.pool[4*i+2];
    this.pool[4*i+1] += this.pool[4*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[4*i],
      y: this.pool[4*i+1]
    })) {
      // Swap the current and last bullet if we
      // need to remove the current bullet
      this.pool[4*i] = this.pool[4*(this.end-1)];
      this.pool[4*i+1] = this.pool[4*(this.end-1)+1];
      this.pool[4*i+2] = this.pool[4*(this.end-1)+2];
      this.pool[4*i+3] = this.pool[4*(this.end-1)+3];
      // Reduce the total number of bullets by 1
      this.end--;
      // Reduce our iterator by 1 so that we update the
      // freshly swapped bullet.
      i--;
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
BulletPool.prototype.render = function(elapsedTime, ctx) {
  // Render the bullets as a single path
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "orange";
  for(var i = 0; i < this.end; i++) {
    ctx.moveTo(this.pool[4*i], this.pool[4*i+1]);
    ctx.arc(this.pool[4*i], this.pool[4*i+1], this.radius, 0, 2*Math.PI);
  }
  ctx.fill();
  ctx.restore();
}

},{}],3:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');

/**
 * @module Camera
 * A class representing a simple camera
 */
module.exports = exports = Camera;

/**
 * @constructor Camera
 * Creates a camera
 * @param {Rect} screen the bounds of the screen
 */
function Camera(screen) {
  this.x = 0;
  this.y = 0;
  this.width = screen.width;
  this.height = screen.height;
}

/**
 * @function update
 * Updates the camera based on the supplied target
 * @param {Vector} target what the camera is looking at
 */
Camera.prototype.update = function(target) {
  // TODO: Align camera with player
}

/**
 * @function onscreen
 * Determines if an object is within the camera's gaze
 * @param {Vector} target a point in the world
 * @return true if target is on-screen, false if not
 */
Camera.prototype.onScreen = function(target) {
  return (
     target.x > this.x &&
     target.x < this.x + this.width &&
     target.y > this.y &&
     target.y < this.y + this.height
   );
}

/**
 * @function toScreenCoordinates
 * Translates world coordinates into screen coordinates
 * @param {Vector} worldCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toScreenCoordinates = function(worldCoordinates) {
  return Vector.subtract(worldCoordinates, this);
}

/**
 * @function toWorldCoordinates
 * Translates screen coordinates into world coordinates
 * @param {Vector} screenCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toWorldCoordinates = function(screenCoordinates) {
  return Vector.add(screenCoordinates, this);
}

},{"./vector":10}],4:[function(require,module,exports){
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


},{"./missile":6,"./vector":10}],5:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],6:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const SmokeParticles = require('./smoke_particles');

/* Constants */
const MISSILE_SPEED = 8;

/**
 * @module Missile
 * A class representing a player's missile
 */
module.exports = exports = Missile;

/**
 * @constructor Missile
 * Creates a missile
 * @param {Vector} position the position of the missile
 * @param {Object} target the target of the missile
 */
function Missile(position, target) {
  this.position = {x: position.x, y:position.y}
  this.target = target;
  this.angle = 0;
  this.img = new Image()
  this.img.src = 'assets/helicopter.png';
  this.smokeParticles = new SmokeParticles(400);
}

/**
 * @function update
 * Updates the missile, steering it towards a locked
 * target or straight ahead
 * @param {DOMHighResTimeStamp} elapedTime
 */
Missile.prototype.update = function(elapsedTime) {

  // set the velocity
  var velocity = {x: MISSILE_SPEED, y: 0}
  if(this.target) {
    var direction = Vector.subtract(this.position, this.target);
    velocity = Vector.scale(Vector.normalize(direction), MISSILE_SPEED);
  }

  // determine missile angle
  this.angle = Math.atan2(velocity.y, velocity.x);

  // move the missile
  this.position.x += velocity.x;
  this.position.y += velocity.y;

  // emit smoke
  this.smokeParticles.emit(this.position);

  // update smoke
  this.smokeParticles.update(elapsedTime);
}

/**
 * @function render
 * Renders the missile in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Missile.prototype.render = function(elapsedTime, ctx) {
  // Draw Missile
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(this.angle);
  ctx.drawImage(this.img, 76, 56, 16, 8, 0, -4, 16, 8);
  ctx.restore();
  // Draw Smoke
  this.smokeParticles.render(elapsedTime, ctx);
}

},{"./smoke_particles":9,"./vector":10}],7:[function(require,module,exports){
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

},{"./missile":6,"./vector":10}],8:[function(require,module,exports){
"use strict";

module.exports = exports = Powerup;

function Powerup(position, power) {
	this.position = position;
	this.power = power;
	this.on = false;
	this.image = new Image();
	this.image.src = 'assets/tyrian.shp.1.transp.png';
}

Powerup.prototype.render = function(elapsedTime, ctx) {
	if(!this.on)
	{
		if(this.power == 1)
		{
	  		ctx.save();
      		ctx.translate(this.position.x, this.position.y);
      		ctx.drawImage(this.image,   193,      70,     12,      13,      -6,     -6,    20,        20);
      		ctx.restore();
      	} else if(this.power == 2) {
      		ctx.save();
      		ctx.translate(this.position.x, this.position.y);
      		ctx.drawImage(this.image,   206,      70,     12,      13,      -6,     -6,    20,        20);
      		ctx.restore();
      	} else if(this.power == 3) {
      		ctx.save();
      		ctx.translate(this.position.x, this.position.y);
      		ctx.drawImage(this.image,   217,      70,     12,      13,      -6,     -6,    30,        30);
      		ctx.restore();
      	}
	}
}
},{}],9:[function(require,module,exports){
"use strict";

/**
 * @module SmokeParticles
 * A class for managing a particle engine that
 * emulates a smoke trail
 */
module.exports = exports = SmokeParticles;

/**
 * @constructor SmokeParticles
 * Creates a SmokeParticles engine of the specified size
 * @param {uint} size the maximum number of particles to exist concurrently
 */
function SmokeParticles(maxSize) {
  this.pool = new Float32Array(3 * maxSize);
  this.start = 0;
  this.end = 0;
  this.wrapped = false;
  this.max = maxSize;
}

/**
 * @function emit
 * Adds a new particle at the given position
 * @param {Vector} position
*/
SmokeParticles.prototype.emit = function(position) {
  if(this.end != this.max) {
    this.pool[3*this.end] = position.x;
    this.pool[3*this.end+1] = position.y;
    this.pool[3*this.end+2] = 0.0;
    this.end++;
  } else {
    this.pool[3] = position.x;
    this.pool[4] = position.y;
    this.pool[5] = 0.0;
    this.end = 1;
  }
}

/**
 * @function update
 * Updates the particles
 * @param {DOMHighResTimeStamp} elapsedTime
 */
SmokeParticles.prototype.update = function(elapsedTime) {
  function updateParticle(i) {
    this.pool[3*i+2] += elapsedTime;
    if(this.pool[3*i+2] > 2000) this.start = i;
  }
  var i;
  if(this.wrapped) {
    for(i = 0; i < this.end; i++){
      updateParticle.call(this, i);
    }
    for(i = this.start; i < this.max; i++){
      updateParticle.call(this, i);
    }
  } else {
    for(i = this.start; i < this.end; i++) {
      updateParticle.call(this, i);
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
SmokeParticles.prototype.render = function(elapsedTime, ctx) {
  function renderParticle(i){
    var alpha = 1 - (this.pool[3*i+2] / 1000);
    var radius = 0.1 * this.pool[3*i+2];
    if(radius > 5) radius = 5;
    ctx.beginPath();
    ctx.arc(
      this.pool[3*i],   // X position
      this.pool[3*i+1], // y position
      radius, // radius
      0,
      2*Math.PI
    );
    ctx.fillStyle = 'rgba(160, 160, 160,' + alpha + ')';
    ctx.fill();
  }

  // Render the particles individually
  var i;
  if(this.wrapped) {
    for(i = 0; i < this.end; i++){
      renderParticle.call(this, i);
    }
    for(i = this.start; i < this.max; i++){
      renderParticle.call(this, i);
    }
  } else {
    for(i = this.start; i < this.end; i++) {
      renderParticle.call(this, i);
    }
  }
}

},{}],10:[function(require,module,exports){
"use strict";

/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  add: add,
  subtract: subtract,
  scale: scale,
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize
}


/**
 * @function rotate
 * Scales a vector
 * @param {Vector} a - the vector to scale
 * @param {float} scale - the scalar to multiply the vector by
 * @returns a new vector representing the scaled original
 */
function scale(a, scale) {
 return {x: a.x * scale, y: a.y * scale};
}

/**
 * @function add
 * Computes the sum of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed sum
*/
function add(a, b) {
 return {x: a.x + b.x, y: a.y + b.y};
}

/**
 * @function subtract
 * Computes the difference of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed difference
 */
function subtract(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}

},{}]},{},[1]);
