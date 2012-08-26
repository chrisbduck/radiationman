//
// Object initialisation
//

var g_TestTexture;
var g_LavaTexture;
var g_PlatformTexture;
var g_Platforms = [];

//------------------------------------------------------------------------------
// Pyramid
//------------------------------------------------------------------------------
function buildPyramid()
{
	// -1.0, -0.5574, -0.4082		// A
	//  1.0, -0.5574, -0.4082		// B
	//  0.0,  1.1547, -0.4082		// C
	//  0.0,  0.0,     1.2247		// D
	
	// Positions
	var positions = [
		// Front face
	    0.0,  1.1547, -0.4082,		// C
	   -1.0, -0.5574, -0.4082,		// A
	    1.0, -0.5574, -0.4082,		// B
		// Right-back face
	    0.0,  1.1547, -0.4082,		// C
	    1.0, -0.5574, -0.4082,		// B
	    0.0,  0.0,     1.2247,		// D
		// Left-back face
	    0.0,  1.1547, -0.4082,		// C
	    0.0,  0.0,     1.2247,		// D
	   -1.0, -0.5574, -0.4082,		// A
		// Bottom face
	    1.0, -0.5574, -0.4082,		// B
	   -1.0, -0.5574, -0.4082,		// A
	    0.0,  0.0,     1.2247,		// D
	];
	var position_buf = createStaticFloatBuffer(positions, 3, 12);
	
	// UVs
	var uvs = [
		// Front face
		1.0, 0.5,		// C
		0.0, 0.0,		// A
		0.5, 1.0,		// B
		// Right face
		1.0, 0.5,		// C
		0.5, 1.0,		// B
		1.0, 1.0,		// D1
		// Back face
		1.0, 0.5,		// C
		1.0, 0.0,		// D2
		0.0, 0.0,		// A
		// Left face
		0.5, 1.0,		// B
		0.0, 0.0,		// A
		0.0, 1.0,		// D3
	];
	var uv_buf = createStaticFloatBuffer(uvs, 2, 12);
	
	// Normals
	var normals = [
		// Front face
		0.0, 0.5, 0.7071,
		0.0, 0.5, 0.7071,
		0.0, 0.5, 0.7071,
		// Right face
		0.7071, 0.5, 0.0,
		0.7071, 0.5, 0.0,
		0.7071, 0.5, 0.0,
		// Back face
		0.0, 0.5, -0.7071,
		0.0, 0.5, -0.7071,
		0.0, 0.5, -0.7071,
		// Left face
		-0.7071, 0.5, 0.0,
		-0.7071, 0.5, 0.0,
		-0.7071, 0.5, 0.0,
	];
	var normal_buf = createStaticFloatBuffer(normals, 3, 12);
	
	var pyramid = new Mesh(position_buf, null, uv_buf, normal_buf, gl.TRIANGLES);
	pyramid.setTranslation([-1.5, 0.0, -7.0]);
	pyramid.setRotation(0, [0, 1, 0], getPlusMinusRandom(45.0, 90.0));
	pyramid.setRotation(1, [0, 0, 1], getPlusMinusRandom(45.0, 90.0));
	pyramid.setTexture(g_WateryTexture);
	pyramid.setLighting(false);
	pyramid.setAlpha(0.4);
	return pyramid;
}

//------------------------------------------------------------------------------
// Cube
//------------------------------------------------------------------------------
function buildCube()
{
	// Positions
	positions = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,
		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,
	];
	position_buf = createStaticFloatBuffer(positions, 3, 24);
	
	// Indices
	var indices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
	];
	var index_buf = createStaticUint16Buffer(indices, 1, 36);
	
	// UVs
	uvs = [
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];
	uv_buf = createStaticFloatBuffer(uvs, 2, 24);
	
	// Normals
	normals = [
		// Front face
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		// Back face
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,
		// Top face
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,
		// Bottom face
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,
		// Right face
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		// Left face
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
	];
	normal_buf = createStaticFloatBuffer(normals, 3, 24);
	
	var cube = new Mesh(position_buf, index_buf, uv_buf, normal_buf, gl.TRIANGLES);
	cube.setTranslation([1.5, 0.0, -7.0]);
	cube.setRotation(0, [1, 0, 0], getRandom(90.0, 180.0));
	cube.setRotation(1, [0, 1, 0], getRandom(90.0, 180.0));
	cube.setTexture(g_LavaTexture);
	cube.setLighting(false);
	cube.setAlpha(0.7);
	return cube;
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
function Sprite(texture, position)
{
	if (!Sprite.prototype.m_Positions)
	{
		// Positions
		positions = [
			-1.0, -1.0,  0.0,
			 1.0, -1.0,  0.0,
			 1.0,  1.0,  0.0,
			-1.0,  1.0,  0.0,
		];
		Sprite.prototype.m_VertPositions = createStaticFloatBuffer(positions, 3, 4);
		this.m_Positions = Sprite.prototype.m_VertPositions;
		
		// UVs
		uvs = [
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
		];
		Sprite.prototype.m_UVs = createStaticFloatBuffer(uvs, 2, 4);
		this.m_UVs = Sprite.prototype.m_UVs;
	}
	
	if (position === null)
		position = [0.0, 0.0];
	
	this.m_Texture = texture;
	this.m_Width = texture.image.width;
	this.m_Height = texture.image.height;
	this.m_Position = new Float32Array(position);
	this.m_Scale = [1, 1];
	this.m_ShaderProg = g_SpriteProg;
	this.m_Colour = new Float32Array([1.0, 1.0, 1.0, 1.0]);
}

//------------------------------------------------------------------------------
Sprite.prototype.setPosition = function(position)
{
	this.m_Position = position;
};

//------------------------------------------------------------------------------
Sprite.prototype.setColour = function(colour)
{
	for (index in colour)
		this.m_Colour[index] = colour[index];
}

//------------------------------------------------------------------------------
Sprite.prototype.draw = function()
{
	// Check for off screen
	var x = this.m_Position[0];
	var y = this.m_Position[1];
	var width = this.m_Width;
	var height = this.m_Height;
	if (	   x >= gl.m_ViewportWidth || x + width < 0
			|| y >= gl.m_ViewportHeight || y + height < 0)
		return;
	
	// Shader prog
	prog = this.m_ShaderProg;
	gl.useProgram(prog);
	
	// Sprite transformation matrix
	
	// Without transformation, the vertices match the coordinates of the corners of the viewport
	// - (-1, -1) to (1, 1).
	// Apply a scaling factor of (sprite width / viewport width, sprite height / viewport height)
	// to get the sprite to the right size.
	
	var world_matrix = mat4.create();
	mat4.identity(world_matrix);
	
	var xoff = -1 + (width + 2 * x) / gl.m_ViewportWidth;
	var yoff =  1 - (height + 2 * y) / gl.m_ViewportHeight;		// flip y so 0 is at the top
	
	mat4.translate(world_matrix, [xoff, yoff, 0]);
	mat4.scale(world_matrix, [this.m_Scale[0] * width / gl.m_ViewportWidth,
							  this.m_Scale[1] * height / gl.m_ViewportHeight, 1]);
	
	gl.uniformMatrix4fv(prog.u_WorldMatrix, false, world_matrix);
	
	// Positions
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Positions);
	gl.vertexAttribPointer(prog.a_VertPos, this.m_VertPositions.item_size, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prog.a_VertPos);
	
	// UVs
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_UVs);
	gl.vertexAttribPointer(prog.a_VertUV, this.m_UVs.item_size, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prog.a_VertUV);
	
	// Texture
	this.m_Texture.use(prog);
	
	// Colour
	gl.uniform4fv(prog.u_Col, this.m_Colour);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.DEPTH_TEST);
	
	// Draw
	gl.drawArrays(gl.TRIANGLE_FAN, 0, this.m_VertPositions.num_items);
	
	// Clean up
	gl.disableVertexAttribArray(prog.a_VertPos);
	gl.disableVertexAttribArray(prog.a_VertUV);
};

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
	this.m_Texture = new Texture('data/man.png');
	this.m_Position = [x, y];
	this.m_PrevPosition = [x, y];
	this.m_VelocityPPS = [0, 0];
	this.m_AccelerationPPSPS = [0, 0];
	this.m_Sprite = new Sprite(this.m_Texture, this.m_Position);
	this.m_XAccelPPSPS = 450;
	this.m_XVelPPSTarget = 180;
	this.m_CollideRect = [22, 8, 42, 64];
	this.m_Collided = [false, false, false, false];		// left, top, right, bottom
	this.m_IsOnPlatform = false;
	this.m_Jumping = false;
}

//------------------------------------------------------------------------------
Player.prototype.draw = function()
{
	this.m_Sprite.setPosition(this.m_Position);
	this.m_Sprite.draw();
};

//------------------------------------------------------------------------------
var JUMP_IMPULSE_PPS = 180;
var DECELERATION_SCALE = 1.5;

Player.prototype.update = function(time_diff_sec, x_input, jump_input)
{
	// x_input = 0, -1, or 1
	// jump_input = 0 or 1
	
	//
	// Input & acceleration
	//
	
	if (x_input != 0)
	{
		//this.m_Position[0] += time_diff_sec * this.m_MaxXSpeedPPS * x_input;
		this.m_AccelerationPPSPS[0] = this.m_XAccelPPSPS * x_input;
		this.m_Sprite.m_Scale[0] = (x_input < 0) ? -1 : 1;	// flip horizontally when going left
	}
	else
		this.m_AccelerationPPSPS[0] = 0;
	
	if (this.m_IsOnPlatform)
	{
		// Jumping - just modify the speed directly
		if (jump_input > 0)
		{
			if (!this.m_Jumping)	// ignore held keys
			{
				this.m_VelocityPPS[1] = -JUMP_IMPULSE_PPS;
				this.m_Jumping = true;
			}
		}
	}
	else
		this.m_AccelerationPPSPS[1] = g_GravityPPSPS;
	if (jump_input == 0)
		this.m_Jumping = false;
	
	// 
	// Velocity
	//
	
	// Update velocity towards the target
	this.m_VelocityPPS[0] += time_diff_sec * this.m_AccelerationPPSPS[0];
	if (this.m_AccelerationPPSPS[0] != 0)
	{
		if (this.m_AccelerationPPSPS[0] > 0)
		{
			if (this.m_VelocityPPS[0] >= this.m_XVelPPSTarget)
			{
				this.m_VelocityPPS[0] = this.m_XVelPPSTarget;
				this.m_AccelerationPPSPS[0] = 0;
			}
		}
		else
		{
			if (this.m_VelocityPPS[0] <= -this.m_XVelPPSTarget)
			{
				this.m_VelocityPPS[0] = -this.m_XVelPPSTarget;
				this.m_AccelerationPPSPS[0] = 0;
			}
		}
	}
	else
	{
		// No X acceleration.  Decelerate automatically
		if (this.m_VelocityPPS[0] > 0)
		{
			this.m_VelocityPPS[0] -= time_diff_sec * this.m_XAccelPPSPS * DECELERATION_SCALE;
			if (this.m_VelocityPPS[0] < 0)
				this.m_VelocityPPS[0] = 0;
		}
		else if (this.m_VelocityPPS[0] < 0)
		{
			this.m_VelocityPPS[0] += time_diff_sec * this.m_XAccelPPSPS * DECELERATION_SCALE;
			if (this.m_VelocityPPS[0] > 0)
				this.m_VelocityPPS[0] = 0;
		}
	}
	
	this.m_VelocityPPS[1] += time_diff_sec * this.m_AccelerationPPSPS[1];
	
	//
	// Position
	//
	
	this.m_Position[0] += time_diff_sec * this.m_VelocityPPS[0];
	this.m_Position[1] += time_diff_sec * this.m_VelocityPPS[1];
	
	//
	// Collide the player with all platforms
	//
	
	this.m_Collided = [false, false, false, false];
	for (index in g_Platforms)
		collideRects(this, g_Platforms[index], true);
	this.m_IsOnPlatform = this.m_Collided[3];	// rect bottom collision
	
	// Store positions for next time
	this.m_PrevPosition[0] = this.m_Position[0];	// don't assign the entire object, or
	this.m_PrevPosition[1] = this.m_Position[1];	//     they'll point to the same place
};

//------------------------------------------------------------------------------
var SMALL_FLOAT = 0.001;	// small adjustment to avoid rounding errors

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
// Misc
//------------------------------------------------------------------------------
function initObjects()
{
	g_TestTexture = new Texture('sports-image.jpg');
	var bg_texture = new Texture('data/sort-of-cloudy.jpg');
	g_LavaTexture = new Texture('data/collectable.jpg');
	g_WateryTexture = new Texture('data/watery.jpg');
	var player_texture = new Texture('data/man.png');
	g_PlatformTexture = new Texture('data/platform.png');
	
	g_Pyramid = buildPyramid();
	g_Cube = buildCube();
	
	addGlobalSprite(bg_texture, [0, 0]);
	
	addPlatform(0, 512 - 27, 512);
	addPlatform(100, 350, 250);
	g_Player = new Player(0, 512 - 27 - 64 - 100);
}

//------------------------------------------------------------------------------
