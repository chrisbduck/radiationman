//
// Object initialisation
//

var g_TestTexture;
var g_LavaTexture;

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
	pyramid.setRotation(0, [0, 1, 0], 90.0);
	pyramid.setRotation(1, [0, 0, 1], 60.0);
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
	cube.setRotation(0, [1, 0, 0], 75.0);
	cube.setRotation(1, [0, 1, 0], 110.0);
	cube.setTexture(g_LavaTexture);
	cube.setLighting(false);
	cube.setAlpha(0.7);
	return cube;
}

//------------------------------------------------------------------------------
// Sprite
//------------------------------------------------------------------------------
function addSprite(texture, position)
{
	g_Sprites = g_Sprites.concat([new Sprite(texture, position)]);
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
	this.m_ShaderProg = g_SpriteProg;
	this.m_Colour = new Float32Array([1.0, 1.0, 1.0, 1.0]);
}

//------------------------------------------------------------------------------
Sprite.prototype.setTranslation = function(translation)
{
	this.m_Translation = translation;
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
	
	var x = this.m_Position[0];
	var y = this.m_Position[1];
	var width = this.m_Width;
	var height = this.m_Height;
	var xoff = -1 + (width + 2 * x) / gl.m_ViewportWidth;
	var yoff =  1 - (height + 2 * y) / gl.m_ViewportHeight;		// flip y so 0 is at the top
	
	mat4.translate(world_matrix, [xoff, yoff, 0]);
	mat4.scale(world_matrix, [width / gl.m_ViewportWidth, height / gl.m_ViewportHeight, 1]);
	
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
// Misc
//------------------------------------------------------------------------------
function initObjects()
{
	g_TestTexture = new Texture('sports-image.jpg');
	var bg_texture = new Texture('data/sort-of-cloudy.jpg');
	g_LavaTexture = new Texture('data/collectable.jpg');
	g_WateryTexture = new Texture('data/watery.jpg');
	var player_texture = new Texture('data/man.png');
	var platform_texture = new Texture('data/platform.png');
	
	g_Pyramid = buildPyramid();
	g_Cube = buildCube();
	
	addSprite(bg_texture, [0, 0]);
	addSprite(platform_texture, [256, 400]);
	addSprite(player_texture, [256, 256]);
}

//------------------------------------------------------------------------------
