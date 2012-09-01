//
// Object initialisation
//

var g_BGTexture;
var g_LavaTexture;
var g_WateryTexture;
var g_PlayerTextures;
var g_PlayerDeadTexture;
var g_PlatformTexture;
var g_RobotTexture;
var g_IntroTexture;
var g_Platforms = [];
var g_Robots = [];

var g_JumpSound;
var g_PyramidSound;
var g_CubeSound;
var g_DeathSound;

doNothing = function() {};

var PLAYER_JUMP_IMPULSE_PPS = 440;
var ROBOT_JUMP_IMPULSE_PPS = 400;
var DECELERATION_SCALE = 1.5;
var SMALL_FLOAT = 0.001;			// small adjustment to avoid rounding errors
var RADS_PER_SEC = 1.5;
var RADS_HEALED_PER_PYRAMID = 20;

//------------------------------------------------------------------------------
// Pyramid
//------------------------------------------------------------------------------
function buildPyramid(pos)
{
	var mesh_data = getPyramidData();
	var pyramid = new Mesh(mesh_data, g_WateryTexture);
	var centre_pos = get3DPosFrom2D(pos[0], pos[1]);
	pyramid.setTranslation(centre_pos);		// 3D
	pyramid.setPosition(pos);				// 2D
	pyramid.setScale(0.03);
	pyramid.setRotation(0, [0, 1, 0], getPlusMinusRandom(45.0, 90.0));
	pyramid.setRotation(1, [0, 0, 1], getPlusMinusRandom(45.0, 90.0));
	pyramid.setLighting(true);
	pyramid.setLightingLevel(0.7, 0.1);
	pyramid.setAlpha(1.0);
	
	g_Pyramids = g_Pyramids.concat([pyramid]);
}

//------------------------------------------------------------------------------
// Cube
//------------------------------------------------------------------------------
function buildCube(pos)
{
	var mesh_data = getCubeData();
	var cube = new Mesh(mesh_data, g_LavaTexture);
	var centre = get3DPosFrom2D(pos[0], pos[1]);
	cube.setTranslation(centre);		// 3D
	cube.setPosition(pos);				// 2D
	cube.setScale(0.02);
	cube.setRotation(0, [1, 0, 0], getRandom(90.0, 180.0));
	cube.setRotation(1, [0, 1, 0], getRandom(90.0, 180.0));
	cube.setLighting(false);
	cube.setLightingLevel(0.6, 0.4);
	cube.setAlpha(0.7);
	
	g_Cubes = g_Cubes.concat([cube]);
}

//------------------------------------------------------------------------------
// Sprite
//------------------------------------------------------------------------------
function addGlobalSprite(texture, position)
{
	sprite = new Sprite(texture, position);
	g_Sprites = g_Sprites.concat([sprite]);
}

//------------------------------------------------------------------------------
// Platform
//------------------------------------------------------------------------------
function Platform(x, y, width)
{
	this.m_Sprites = [];
	this.m_Position = [x, y];
	this.m_Width = width;
	this.m_VelocityPPS = [0, 0];
	this.m_CollideRect = [0, 0, width, 27];
	position = [x, y];
	image_width = g_PlatformTexture.image.width;
	while (width > 0)
	{
		this.m_Sprites = this.m_Sprites.concat([new Sprite(g_PlatformTexture, position)]);
		position[0] += image_width;
		width -= image_width;
	}
}

//------------------------------------------------------------------------------
Platform.prototype.draw = function()
{
	for (index in this.m_Sprites)
		this.m_Sprites[index].draw();
};

//------------------------------------------------------------------------------
function addPlatform(x, y, width)
{
	g_Platforms = g_Platforms.concat([new Platform(x, y, width)]);
}

//------------------------------------------------------------------------------
// Player
//------------------------------------------------------------------------------
function Player(x, y)
{
	this.m_Texture = g_PlayerTextures[0];
	this.m_Position = [x, y];
	this.m_PrevPosition = [x, y];
	this.m_VelocityPPS = [0, 0];
	this.m_AccelerationPPSPS = [0, 0];
	this.m_Sprite = new Sprite(this.m_Texture, this.m_Position);
	this.m_XAccelPPSPS = 450;
	this.m_XVelPPSTarget = 180;
	this.m_JumpImpulsePPS = PLAYER_JUMP_IMPULSE_PPS;
	this.m_CollideRect = [22, 8, 42, 64];
	this.m_Collided = [false, false, false, false];		// left, top, right, bottom
	this.m_AbovePlatform = null;
	this.m_IsOnPlatform = false;
	this.m_Jumping = false;
	this.m_Rads = 0.0;
	this.m_RadsDisplay = 0;
	this.m_TouchingRobots = 0;
	this.m_Mutation = 0;
	this.m_Alive = true;
	this.m_Won = false;
	this.hitScreenXEdge = doNothing;
	this.hitScreenYEdge = doNothing;
	this.updateRadsDisplay();
	this.updateMutation();
}

//------------------------------------------------------------------------------
Player.prototype.draw = function()
{
	this.m_Sprite.setPosition(this.m_Position);
	this.m_Sprite.draw();
};

//------------------------------------------------------------------------------
Player.prototype.update = function(time_diff_sec, x_input, jump_input)
{
	// x_input = 0, -1, or 1
	// jump_input = 0 or 1
	
	//
	// Input & acceleration
	//
	
	if (this.m_Alive)
		updateInput(this, time_diff_sec, x_input, jump_input);
	
	updatePhysics(this, time_diff_sec);
	this.updateCollisions(time_diff_sec);
	
	if (this.m_Alive)
		this.updateStatus(time_diff_sec);
};

//------------------------------------------------------------------------------
function updateInput(object, time_diff_sec, x_input, jump_input)
{
	if (x_input != 0)
	{
		object.m_AccelerationPPSPS[0] = object.m_XAccelPPSPS * x_input;
		object.m_Sprite.m_Scale[0] = (x_input < 0) ? -1 : 1;	// flip horizontally when going left
	}
	else
		object.m_AccelerationPPSPS[0] = 0;
	
	if (object.m_IsOnPlatform)
	{
		// Jumping - just modify the speed directly
		if (jump_input > 0)
		{
			if (!object.m_Jumping)	// ignore held keys
			{
				object.m_VelocityPPS[1] = -object.m_JumpImpulsePPS;
				object.m_Jumping = true;
				if (object === g_Player)
					g_JumpSound.play();
			}
		}
	}
	else
		object.m_AccelerationPPSPS[1] = g_GravityPPSPS;
	if (jump_input == 0)
		object.m_Jumping = false;
};

//------------------------------------------------------------------------------
function updatePhysics(object, time_diff_sec)
{
	// Update velocity towards the target
	var velocity_x_delta_pps = time_diff_sec * object.m_AccelerationPPSPS[0];
	if (	(object.m_AccelerationPPSPS[0] < 0 && object.m_VelocityPPS[0] > 0)
		||  (object.m_AccelerationPPSPS[0] > 0 && object.m_VelocityPPS[0] < 0))
	{
		velocity_x_delta_pps *= DECELERATION_SCALE;		// decelerating - turn faster
	}
	object.m_VelocityPPS[0] += velocity_x_delta_pps;
	if (object.m_AccelerationPPSPS[0] != 0)
	{
		if (object.m_AccelerationPPSPS[0] > 0)
		{
			if (object.m_VelocityPPS[0] >= object.m_XVelPPSTarget)
			{
				object.m_VelocityPPS[0] = object.m_XVelPPSTarget;
				object.m_AccelerationPPSPS[0] = 0;
			}
		}
		else
		{
			if (object.m_VelocityPPS[0] <= -object.m_XVelPPSTarget)
			{
				object.m_VelocityPPS[0] = -object.m_XVelPPSTarget;
				object.m_AccelerationPPSPS[0] = 0;
			}
		}
	}
	else if (object.m_IsOnPlatform)
	{
		// No X acceleration.  Decelerate automatically, unless we're in the air
		if (object.m_VelocityPPS[0] > 0)
		{
			object.m_VelocityPPS[0] -= time_diff_sec * object.m_XAccelPPSPS * DECELERATION_SCALE;
			if (object.m_VelocityPPS[0] < 0)
				object.m_VelocityPPS[0] = 0;
		}
		else if (object.m_VelocityPPS[0] < 0)
		{
			object.m_VelocityPPS[0] += time_diff_sec * object.m_XAccelPPSPS * DECELERATION_SCALE;
			if (object.m_VelocityPPS[0] > 0)
				object.m_VelocityPPS[0] = 0;
		}
	}
	
	object.m_VelocityPPS[1] += time_diff_sec * object.m_AccelerationPPSPS[1];
	
	//
	// Position
	//
	
	object.m_Position[0] += time_diff_sec * object.m_VelocityPPS[0];
	object.m_Position[1] += time_diff_sec * object.m_VelocityPPS[1];
};

//------------------------------------------------------------------------------
function collideWithPlatforms(object)
{
	object.m_Collided = [false, false, false, false];
	object.m_AbovePlatform = null;
	for (index in g_Platforms)
		collideRects(object, g_Platforms[index], true);
	object.m_IsOnPlatform = object.m_Collided[3];	// rect bottom collision
}

//------------------------------------------------------------------------------
function updateScreenCollisions(object)
{
	// Make sure the player stays on screen
	var min_x = -object.m_CollideRect[0];
	var max_x = gl.m_ViewportWidth - object.m_CollideRect[2];
	if (object.m_Position[0] < min_x)
	{
		object.m_Position[0] = min_x;
		if (object.m_VelocityPPS[0] < 0)
			object.m_VelocityPPS[0] = 0;
		object.hitScreenXEdge();
	}
	else if (object.m_Position[0] > max_x)
	{
		object.m_Position[0] = max_x;
		if (object.m_VelocityPPS[0] > 0)
			object.m_VelocityPPS[0] = 0;
		object.hitScreenXEdge();
	}
	var min_y = -object.m_CollideRect[1];
	var max_y = gl.m_ViewportHeight - object.m_CollideRect[3];
	if (object.m_Position[1] < min_y)
	{
		object.m_Position[1] = min_y;
		if (object.m_VelocityPPS[1] < 0)
			object.m_VelocityPPS[1] = 0;
		object.hitScreenYEdge();
	}
	else if (object.m_Position[1] > max_y)
	{
		object.m_Position[1] = max_y;
		if (object.m_VelocityPPS[1] > 0)
			object.m_VelocityPPS[1] = 0;
		object.hitScreenYEdge();
	}
}

//------------------------------------------------------------------------------
Player.prototype.updateCollisions = function(time_diff_sec)
{
	updateScreenCollisions(this);
	
	// Collide the player with all platforms
	collideWithPlatforms(this);
	
	if (this.m_Alive)
	{
		// Check for collisions with pyramids
		var delete_indices = [];
		for (index in g_Pyramids)
			if (collideSphere(this, g_Pyramids[index]))
			{
				this.m_Rads = Math.max(this.m_Rads - RADS_HEALED_PER_PYRAMID, 0);
				g_PyramidSound.play();
				delete_indices = delete_indices.concat([index]);
			}
		delete_indices.reverse();
		for (index in delete_indices)
			g_Pyramids.splice(delete_indices[index], 1);
		
		// Check for collisions with cubes
		delete_indices = [];
		for (index in g_Cubes)
			if (collideSphere(this, g_Cubes[index]))
			{
				this.m_Mutation++;
				this.updateMutation();
				g_CubeSound.play();
				delete_indices = delete_indices.concat([index]);
			}
		delete_indices.reverse();
		for (index in delete_indices)
			g_Cubes.splice(delete_indices[index], 1);
		
		// Check for collisions with robots
		this.m_TouchingRobots = 0;
		for (index in g_Robots)
			if (collideRects(this, g_Robots[index]))
				this.m_TouchingRobots++;
	}
	
	// Store positions for next time
	this.m_PrevPosition[0] = this.m_Position[0];	// don't assign the entire object, or
	this.m_PrevPosition[1] = this.m_Position[1];	//     they'll point to the same place
};

//------------------------------------------------------------------------------
Player.prototype.updateStatus = function(time_diff_sec)
{
	// Update rads
	var rad_multiplier = 1 + 40 * this.m_TouchingRobots;
	this.m_Rads += time_diff_sec * RADS_PER_SEC * rad_multiplier;
	var new_rads_display = Math.floor(this.m_Rads);
	if (new_rads_display != this.m_RadsDisplay)
	{
		this.m_RadsDisplay = new_rads_display;
		this.updateRadsDisplay();
	}
};

//------------------------------------------------------------------------------
Player.prototype.updateRadsDisplay = function()
{
	document.getElementById("rads").innerHTML = "Rads: " + this.m_RadsDisplay;
	
		if (this.m_Rads < 25)	status = "OK";
	else if (this.m_Rads < 50)	status = "Sick";
	else if (this.m_Rads < 75)	status = "Very Sick";
	else if (this.m_Rads < 100)	status = "Dying";
	else
	{
		status = "Dead - Enter to restart";
		this.m_Alive = false;
	}
	
	document.getElementById("notes").innerHTML = status;
	
	if (!this.m_Alive)
		this.die();
};

//------------------------------------------------------------------------------
Player.prototype.die = function()
{
	this.m_Texture = g_PlayerDeadTexture;
	this.m_Sprite.m_Texture = g_PlayerDeadTexture;
	g_DeathSound.play();
};

//------------------------------------------------------------------------------
Player.prototype.win = function()
{
	document.getElementById("notes").innerHTML = "You have reached a new state of being!";
	this.m_Won = true;
}

//------------------------------------------------------------------------------
Player.prototype.updateMutation = function()
{
	var mutation_strings = ["normal", "moderate", "advanced", "evolved"];
	var index = (this.m_Mutation < mutation_strings.length) ? this.m_Mutation : (mutation_strings.length - 1);
	var text = "Mutation: " + mutation_strings[index];
	
	index = Math.min(index, g_PlayerTextures.length - 1);
	this.m_Texture = g_PlayerTextures[index];
	this.m_Sprite.m_Texture = this.m_Texture;
	
	document.getElementById("mutation").innerHTML = text;
	
	// Winning just means fully evolving for now
	if (index == mutation_strings.length - 1)
		this.win();
};

//------------------------------------------------------------------------------
function collideRects(adjust_obj, other_obj, do_adjust)
{
	var obj1 = adjust_obj;
	var obj2 = other_obj;
	// Assume obj2's speed is zero.
	
	var Obj1Left   = obj1.m_Position[0] + obj1.m_CollideRect[0];
	var Obj1Top    = obj1.m_Position[1] + obj1.m_CollideRect[1];
	var Obj1Right  = obj1.m_Position[0] + obj1.m_CollideRect[2];
	var Obj1Bottom = obj1.m_Position[1] + obj1.m_CollideRect[3];
	var Obj2Left   = obj2.m_Position[0] + obj2.m_CollideRect[0];
	var Obj2Top    = obj2.m_Position[1] + obj2.m_CollideRect[1];
	var Obj2Right  = obj2.m_Position[0] + obj2.m_CollideRect[2];
	var Obj2Bottom = obj2.m_Position[1] + obj2.m_CollideRect[3];
	
	// Check for no collision
	if (	   Obj1Right <= Obj2Left
			|| Obj1Left >= Obj2Right
			|| Obj1Bottom <= Obj2Top
			|| Obj1Top >= Obj2Bottom)
		return false;
	
	// There's a collision.  If we should adjust an object, modify its velocity and position
	// appropriately.
	if (do_adjust)
	{
		var PrevObj1Left   = obj1.m_PrevPosition[0] + obj1.m_CollideRect[0];
		var PrevObj1Top    = obj1.m_PrevPosition[1] + obj1.m_CollideRect[1];
		var PrevObj1Right  = obj1.m_PrevPosition[0] + obj1.m_CollideRect[2];
		var PrevObj1Bottom = obj1.m_PrevPosition[1] + obj1.m_CollideRect[3];
		
		// Only count collision sides that have started this update, when adjusting, or we'll have problems
		// with wide platforms and such.
		
		// X collision
		if (Obj2Left <= Obj1Left && Obj1Left < Obj2Right
			&& PrevObj1Left >= Obj2Right)
		{
			// Collision on the left side of obj1 (probably)
			obj1.m_Collided[0] = true;	// left
			
			// Move to the right a bit
			obj1.m_Position[0] = Obj2Right - obj1.m_CollideRect[0] + SMALL_FLOAT;
			
			// Limit X speed
			if (obj1.m_VelocityPPS[0] < 0)
				obj1.m_VelocityPPS[0] = 0;
		}
		else if (Obj2Left <= Obj1Right && Obj1Right < Obj2Right
				 && PrevObj1Right < Obj2Left)
		{
			// Collision on the right side of obj1 (probably).
			obj1.m_Collided[2] = true;	// right
			
			// Move to the left a bit
			obj1.m_Position[0] = Obj2Left - obj1.m_CollideRect[2] - SMALL_FLOAT;
			
			// Limit X speed
			if (obj1.m_VelocityPPS[0] > 0)
				obj1.m_VelocityPPS[0] = 0;
		}
		
		// Y collision
		if (Obj2Top <= Obj1Top && Obj1Top < Obj2Bottom
			&& PrevObj1Top >= Obj2Bottom)
		{
			// Collision on the top side of obj1 (probably).
			obj1.m_Collided[1] = true;	// top
			
			// Move down a bit
			obj1.m_Position[1] = Obj2Bottom - obj1.m_CollideRect[1] + SMALL_FLOAT;
			
			// Limit Y speed
			if (obj1.m_VelocityPPS[1] < 0)
				obj1.m_VelocityPPS[1] = 0;
		}
		else if (Obj2Top <= Obj1Bottom && Obj1Bottom < Obj2Bottom
				 && PrevObj1Bottom < Obj2Top)
		{
			// Collision on the bottom side of obj1 (probably).
			obj1.m_Collided[3] = true;	// bottom
			obj1.m_AbovePlatform = obj2;
			
			// Move up a bit
			obj1.m_Position[1] = Obj2Top - obj1.m_CollideRect[3] - SMALL_FLOAT;
			
			// Limit Y speed
			if (obj1.m_VelocityPPS[1] > 0)
				obj1.m_VelocityPPS[1] = 0;
		}
	}
	
	return true;
}

//------------------------------------------------------------------------------
function collideSphere(obj1, obj2)
{
	// A very basic sphere-to-sphere collision check by distances
	// We assume for now that obj1 has a collide rect and obj2 doesn't (player to other)
	
	var obj1_collide_width = obj1.m_CollideRect[2] - obj1.m_CollideRect[0];
	var obj1_collide_height = obj1.m_CollideRect[3] - obj1.m_CollideRect[1];
	var obj1_collide_rad = (obj1_collide_width + obj1_collide_height) / 2;
	var obj1_collide_rad_sq = obj1_collide_rad * obj1_collide_rad;
	
	var obj1_cx = obj1.m_Position[0] + (obj1.m_CollideRect[0] + obj1.m_CollideRect[2]) / 2;
	var obj1_cy = obj1.m_Position[1] + (obj1.m_CollideRect[1] + obj1.m_CollideRect[2]) / 2;
	
	var offsetx = obj2.m_Position[0] - obj1_cx;
	var offsety = obj2.m_Position[1] - obj1_cy;
	var offsetsq = offsetx * offsetx + offsety * offsety;
	
	return offsetsq < obj1_collide_rad_sq;
}

//------------------------------------------------------------------------------
// Robot
//------------------------------------------------------------------------------
function Robot(position)
{
	var x = position[0];
	var y = position[1];
	this.m_Texture = g_RobotTexture;
	this.m_Position = [x, y];
	this.m_PrevPosition = [x, y];
	this.m_VelocityPPS = [0, 0];
	this.m_AccelerationPPSPS = [0, 0];
	this.m_Sprite = new Sprite(this.m_Texture, this.m_Position);
	var brightness = getRandom(0.5, 1.2);
	this.m_Sprite.setColour([brightness, brightness, brightness, 1.0]);
	this.m_XAccelPPSPS = getRandom(400, 500);
	this.m_XVelPPSTarget = getRandom(150, 210);
	this.m_JumpImpulsePPS = ROBOT_JUMP_IMPULSE_PPS;
	this.m_DesiredXDir = Math.random() < 0.5 ? -1 : 1;
	this.m_CollideRect = [14, 12, 51, 63];
	this.m_Collided = [false, false, false, false];
	this.m_AbovePlatform = null;
	this.m_IsOnPlatform = false;
	this.hitScreenXEdge = this.reverseDirection;
	this.hitScreenYEdge = doNothing;
	this.m_TimeToNextJump = null;
}

//------------------------------------------------------------------------------
Robot.prototype.draw = function()
{
	this.m_Sprite.m_Position = this.m_Position;
	//console.log('robot', this.m_Sprite);
	this.m_Sprite.draw();
};

//------------------------------------------------------------------------------
Robot.prototype.update = function(time_diff_sec)
{
	// Calculate input
	var x_input = this.m_IsOnPlatform ? this.m_DesiredXDir : 0;
	var jump_input = 0;
	if (this.m_IsOnPlatform &&
			((this.m_TimeToNextJump <= 0 && this.m_TimeToNextJump !== null)
			  || g_RobotJump))
		jump_input = 1;
	if (jump_input || this.m_TimeToNextJump === null)
		this.m_TimeToNextJump = getRandom(2, 10);
	else
		this.m_TimeToNextJump -= time_diff_sec;
	
	updateInput(this, time_diff_sec, x_input, jump_input);
	
	updatePhysics(this, time_diff_sec);
	
	updateScreenCollisions(this);
	collideWithPlatforms(this);
	this.watchFloor();
	
	// Store positions for next time
	this.m_PrevPosition[0] = this.m_Position[0];	// don't assign the entire object, or
	this.m_PrevPosition[1] = this.m_Position[1];	//     they'll point to the same place
};

//------------------------------------------------------------------------------
Robot.prototype.reverseDirection = function()
{
	this.m_DesiredXDir = -this.m_DesiredXDir;
};

//------------------------------------------------------------------------------
Robot.prototype.watchFloor = function()
{
	if (!this.m_IsOnPlatform || this.m_AbovePlatform === null)
		return;
	// Check the platform we're on to see if we're about to fall off it
	var platform = this.m_AbovePlatform;
	if (this.m_DesiredXDir < 0)
	{
		if (this.m_Position[0] + this.m_CollideRect[0] < platform.m_Position[0])
			this.reverseDirection();
	}
	else
	{
		if (this.m_Position[0] + this.m_CollideRect[2] > platform.m_Position[0] + platform.m_Width)
			this.reverseDirection();
	}
};

//------------------------------------------------------------------------------
function addRobot(position)
{
	g_Robots = g_Robots.concat([new Robot(position)]);
}

//------------------------------------------------------------------------------
// Misc
//------------------------------------------------------------------------------
function loadResources()
{
	g_BGTexture = new Texture('data/sort-of-cloudy.jpg');
	g_LavaTexture = new Texture('data/collectable-sm.png');
	g_WateryTexture = new Texture('data/watery.jpg');
	g_PlayerTextures = [new Texture('data/man.png'), new Texture('data/mut1.png'),
						new Texture('data/mut2.png'), new Texture('data/mut3.png')];
	g_PlayerDeadTexture = new Texture('data/dead.png');
	g_PlatformTexture = new Texture('data/platform.png');
	g_RobotTexture = new Texture('data/robot.png');
	g_IntroTexture = new Texture('data/intro.jpg');
	
	g_JumpSound = new Sound('data/sfx/Jump6.ogg');
	g_PyramidSound = new Sound('data/sfx/Pickup_Coin5.ogg');
	g_CubeSound = new Sound('data/sfx/Powerup3.ogg');
	g_DeathSound = new Sound('data/sfx/Explosion2.ogg');
	
	g_ResourcesLoadedCallback = showIntro;
}

//------------------------------------------------------------------------------
function showIntro()
{
	// Hide the "loading" image
	loading_img = document.getElementById("loading");
	loading_img.hidden = true;
	
	g_Running = true;
	addGlobalSprite(g_IntroTexture, [0, 0]);
	g_IntroActive = true;
}

//------------------------------------------------------------------------------
function initObjects()
{
	var pyramid_positions = [
		[90, 300], [475, 270], [230, 420], [320, 150], [80, 70]
	];
	var cube_positions = [
		[30, 210], [485, 25], [475, 440]
	];
	var platform_data = [
		[0, 512 - 27, 512], [150, 370, 250], [0, 250, 256], [450, 300, 72], [0, 100, 128],
		[250, 100, 262]
	];
	var robot_positions = [
		[300, 280], [50, 180], [400, 30], [420, 220]
	];
	
	for (index in pyramid_positions)
		buildPyramid(pyramid_positions[index]);
	for (index in cube_positions)
		buildCube(cube_positions[index]);
	
	addGlobalSprite(g_BGTexture, [0, 0]);
	
	for (index in platform_data)
	{
		platform = platform_data[index];
		addPlatform(platform[0], platform[1], platform[2]);
	}
	
	g_Player = new Player(0, 512 - 27 - 65);
	
	for (index in robot_positions)
		addRobot(robot_positions[index]);
	
	// Show the status text
	status_items = document.getElementsByClassName("status");
	for (index in status_items)
		status_items[index].hidden = false;
}

//------------------------------------------------------------------------------
function destroyObjects()
{
	g_Player = null;
	g_Pyramids = [];
	g_Cubes = [];
	g_Robots = [];
	g_Platforms = [];
}

//------------------------------------------------------------------------------
