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
