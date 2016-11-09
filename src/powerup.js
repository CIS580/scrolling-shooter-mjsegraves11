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