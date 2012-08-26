//
// Object initialisation
//

var g_BGTexture;
var g_LavaTexture;
var g_WateryTexture;
var g_PlayerTexture;
var g_PlatformTexture;
var g_RobotTexture;
var g_Platforms = [];
var g_Robots = [];

// Pyramids
var g_PyramidPositions = null;
var g_PyramidUVs = null;
var g_PyramidNormals = null;

// Cubes
var g_CubePositions = null;
var g_CubeIndices = null;
var g_CubeUVs = null;
var g_CubeNormals = null;

var JUMP_IMPULSE_PPS = 300;
var DECELERATION_SCALE = 1.5;
var SMALL_FLOAT = 0.001;			// small adjustment to avoid rounding errors
var RADS_HEALED_PER_PYRAMID = 20;

//------------------------------------------------------------------------------
// Pyramid
//------------------------------------------------------------------------------
function buildPyramid(pos)
{
	if (g_PyramidPositions === null)
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
		g_PyramidPositions = createStaticFloatBuffer(positions, 3, 12);
		
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
		g_PyramidUVs = createStaticFloatBuffer(uvs, 2, 12);
		
		// Normals
		// In case I need to calculate these again, it's pretty simple:
		// vec1 = vert2 - vert1;  vec2 = vert3 - vert2
		// normal = normalise(cross(vec1, vec2))
		var normals = [
			// Front face
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			// Right-back face
			-0.8133, -0.475, -0.3359,
			-0.8133, -0.475, -0.3359,
			-0.8133, -0.475, -0.3359,
			// Left-back face
			0.8133, -0.475, -0.3359,
			0.8133, -0.475, -0.3359,
			0.8133, -0.475, -0.3359,
			// Bottom face
			0.0, 0.9434, -0.3231,
			0.0, 0.9434, -0.3231,
			0.0, 0.9434, -0.3231,
		];
		g_PyramidNormals = createStaticFloatBuffer(normals, 3, 12);
	}
	
	var pyramid = new Mesh(g_PyramidPositions, null, g_PyramidUVs, g_PyramidNormals, gl.TRIANGLES, g_WateryTexture);
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
	if (g_CubePositions === null)
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
		g_CubePositions = createStaticFloatBuffer(positions, 3, 24);
		
		// Indices
		var indices = [
			0, 1, 2,      0, 2, 3,    // Front face
			4, 5, 6,      4, 6, 7,    // Back face
			8, 9, 10,     8, 10, 11,  // Top face
			12, 13, 14,   12, 14, 15, // Bottom face
			16, 17, 18,   16, 18, 19, // Right face
			20, 21, 22,   20, 22, 23  // Left face
		];
		g_CubeIndices = createStaticUint16Buffer(indices, 1, 36);
		
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
		g_CubeUVs = createStaticFloatBuffer(uvs, 2, 24);
		
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
		g_CubeNormals = createStaticFloatBuffer(normals, 3, 24);
	}
	
	var cube = new Mesh(g_CubePositions, g_CubeIndices, g_CubeUVs, g_CubeNormals, gl.TRIANGLES, g_LavaTexture);
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
function Sprite(texture, position)
{
	if (!Sprite.prototype.m_VertPositions)
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

var RADS_PER_SEC = 1.0;

function Player(texture, x, y)
{
	this.m_Texture = texture;
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
	this.m_Rads = 0.0;
	this.m_RadsDisplay = 0;
	this.m_Mutation = 0;
	this.m_Alive = true;
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
				object.m_VelocityPPS[1] = -JUMP_IMPULSE_PPS;
				object.m_Jumping = true;
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
	object.m_VelocityPPS[0] += time_diff_sec * object.m_AccelerationPPSPS[0];
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
	else
	{
		// No X acceleration.  Decelerate automatically
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
	for (index in g_Platforms)
		collideRects(object, g_Platforms[index], true);
	object.m_IsOnPlatform = object.m_Collided[3];	// rect bottom collision
}

//------------------------------------------------------------------------------
Player.prototype.updateCollisions = function(time_diff_sec)
{
	// Make sure the player stays on screen
	var min_x = -this.m_CollideRect[0];
	var max_x = gl.m_ViewportWidth - this.m_CollideRect[2];
	if (this.m_Position[0] < min_x)
	{
		this.m_Position[0] = min_x;
		if (this.m_VelocityPPS[0] < 0)
			this.m_VelocityPPS[0] = 0;
	}
	else if (this.m_Position[0] > max_x)
	{
		this.m_Position[0] = max_x;
		if (this.m_VelocityPPS[0] > 0)
			this.m_VelocityPPS[0] = 0;
	}
	var min_y = -this.m_CollideRect[1];
	var max_y = gl.m_ViewportHeight - this.m_CollideRect[3];
	if (this.m_Position[1] < min_y)
	{
		this.m_Position[1] = min_y;
		if (this.m_VelocityPPS[1] < 0)
			this.m_VelocityPPS[1] = 0;
	}
	else if (this.m_Position[1] > max_y)
	{
		this.m_Position[1] = max_y;
		if (this.m_VelocityPPS[1] > 0)
			this.m_VelocityPPS[1] = 0;
	}
	
	// Collide the player with all platforms
	collideWithPlatforms(this);
	
	// Check for collisions with pyramids
	var delete_indices = [];
	for (index in g_Pyramids)
		if (collideSphere(this, g_Pyramids[index]))
		{
			this.m_Rads = Math.max(this.m_Rads - RADS_HEALED_PER_PYRAMID, 0);
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
			this.advanceMutation();
			delete_indices = delete_indices.concat([index]);
		}
	delete_indices.reverse();
	for (index in delete_indices)
		g_Cubes.splice(delete_indices[index], 1);
	
	// Store positions for next time
	this.m_PrevPosition[0] = this.m_Position[0];	// don't assign the entire object, or
	this.m_PrevPosition[1] = this.m_Position[1];	//     they'll point to the same place
};

//------------------------------------------------------------------------------
Player.prototype.updateStatus = function(time_diff_sec)
{
	// Update rads
	this.m_Rads += time_diff_sec * RADS_PER_SEC;
	var new_rads_display = Math.floor(this.m_Rads);
	if (new_rads_display != this.m_RadsDisplay)
	{
		this.m_RadsDisplay = new_rads_display;
		document.getElementById("rads").innerText = "Rads: " + new_rads_display;
		
			if (this.m_Rads < 25)	status = "OK";
		else if (this.m_Rads < 50)	status = "Sick";
		else if (this.m_Rads < 75)	status = "Very Sick";
		else if (this.m_Rads < 100)	status = "Dying";
		else
		{
			status = "Dead";
			this.m_Alive = false;
		}
		
		document.getElementById("notes").innerText = status;
		
		if (!this.m_Alive)
			this.die();
	}
};

//------------------------------------------------------------------------------
Player.prototype.die = function()
{
	// Incredibly cheap death animation: turn the character upside-down :)
	this.m_Sprite.m_Scale[1] = -1;
};

//------------------------------------------------------------------------------
Player.prototype.advanceMutation = function()
{
	this.m_Mutation++;
	
	var mutation_strings = ["normal", "slight", "moderate", "advanced", "evolved"];
	var index = (this.m_Mutation < mutation_strings.length) ? this.m_Mutation : (mutation_strings.length - 1);
	var text = "Mutation: " + mutation_strings[index];
	
	document.getElementById("mutation").innerText = text;
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
	this.m_XAccelPPSPS = 450;
	this.m_XVelPPSTarget = 180;
	this.m_CollideRect = [14, 12, 51, 63];
	this.m_Collided = [false, false, false, false];
	this.m_IsOnPlatform = false;
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
	updateInput(this, time_diff_sec, 0, 0);
	updatePhysics(this, time_diff_sec);
	collideWithPlatforms(this);
	
	// Store positions for next time
	this.m_PrevPosition[0] = this.m_Position[0];	// don't assign the entire object, or
	this.m_PrevPosition[1] = this.m_Position[1];	//     they'll point to the same place
};

//------------------------------------------------------------------------------
function addRobot(position)
{
	g_Robots = g_Robots.concat([new Robot(position)]);
}

//------------------------------------------------------------------------------
// Misc
//------------------------------------------------------------------------------
function loadTextures()
{
	g_BGTexture = new Texture('data/sort-of-cloudy.jpg');
	g_LavaTexture = new Texture('data/collectable-sm.png');
	g_WateryTexture = new Texture('data/watery.jpg');
	g_PlayerTexture = new Texture('data/man.png');
	g_PlatformTexture = new Texture('data/platform.png');
	g_RobotTexture = new Texture('data/robot.png');
	
	g_TexturesLoadedCallback = initObjects;
}

//------------------------------------------------------------------------------
function initObjects()
{
	var pyramid_positions = [
		[100, 400], [150, 420], [200, 430]
	];
	var cube_positions = [
		[350, 430], [400, 420], [450, 400]
	];
	
	for (index in pyramid_positions)
		buildPyramid(pyramid_positions[index]);
	for (index in cube_positions)
		buildCube(cube_positions[index]);
	
	addGlobalSprite(g_BGTexture, [0, 0]);
	
	addPlatform(0, 512 - 27, 512);
	addPlatform(150, 350, 250);
	g_Player = new Player(g_PlayerTexture, 0, 512 - 27 - 64 - 100);
	
	addRobot([300, 280]);
	
	// Hide the "loading" image
	loading_img = document.getElementById("loading");
	loading_img.hidden = true;
	
	// Show the status text
	status_items = document.getElementsByClassName("status");
	for (index in status_items)
		status_items[index].hidden = false;
	
	g_Running = true;
}

//------------------------------------------------------------------------------
