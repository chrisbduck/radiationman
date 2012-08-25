//
// Object initialisation
//

//------------------------------------------------------------------------------
function buildPyramid()
{
	// Positions
	var positions = [
		// Front face
		 0.0,  1.0,  0.0,
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		// Right face
		 0.0,  1.0,  0.0,
		 1.0, -1.0,  1.0,
		 1.0, -1.0, -1.0,
		// Back face
		 0.0,  1.0,  0.0,
		 1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		// Left face
		 0.0,  1.0,  0.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0
	];
	var position_buf = createStaticFloatBuffer(positions, 3, 12);
	
	// Colours
	var colours = [
		// Front face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		// Right face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		// Back face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		// Left face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0
	];
	var colour_buf = createStaticFloatBuffer(colours, 4, 12);
	
	// UVs
	var uvs = [
		// Front face
		0.5, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		// Right face
		1.0, 0.5,
		0.0, 0.0,
		0.0, 1.0,
		// Back face
		0.5, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Left face
		0.0, 0.5,
		1.0, 0.0,
		1.0, 1.0,
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
	
	var pyramid = new Mesh(position_buf, null, colour_buf, uv_buf, normal_buf, gl.TRIANGLES);
	pyramid.setTranslation([-1.5, 0.0, -7.0]);
	pyramid.setRotation(0, [0, 1, 0], 90.0);
	pyramid.setRotation(1, [0, 0, 1], 60.0);
	return pyramid;
}

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
	
	// Colours
	colours = [
		// Front face
		0.5, 0.5, 0.0, 1.0,
		0.5, 0.5, 0.5, 1.0,
		0.5, 0.0, 0.5, 1.0,
		0.0, 0.5, 0.5, 1.0,
		// Back face
		1.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		// Top face
		0.0, 1.0, 1.0, 1.0,
		0.0, 0.5, 0.5, 1.0,
		0.5, 0.0, 0.5, 1.0,
		1.0, 0.0, 1.0, 1.0,
		// Bottom face
		1.0, 1.0, 0.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		0.5, 0.5, 0.5, 1.0,
		0.5, 0.5, 0.0, 1.0,
		// Right face
		1.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 1.0, 1.0,
		0.5, 0.0, 0.5, 1.0,
		0.5, 0.5, 0.5, 1.0,
		// Left face
		1.0, 1.0, 0.0, 1.0,
		0.5, 0.5, 0.0, 1.0,
		0.0, 0.5, 0.5, 1.0,
		0.0, 1.0, 1.0, 1.0,
	];
	colour_buf = createStaticFloatBuffer(colours, 4, 24);
	
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
	
	var cube = new Mesh(position_buf, index_buf, colour_buf, uv_buf, normal_buf,
						gl.TRIANGLES);
	cube.setTranslation([1.5, 0.0, -7.0]);
	cube.setRotation(0, [1, 0, 0], 75.0);
	cube.setRotation(1, [0, 1, 0], 110.0);
	return cube;
}

//------------------------------------------------------------------------------
function initObjects()
{
	g_Pyramid = buildPyramid();
	g_Cube = buildCube();
	g_Sprite = new Sprite(g_Texture, [0.0, 0.0, 0.0], g_SpriteProg);
	g_Test = buildTest();
}

//------------------------------------------------------------------------------

function Sprite(texture, translation, shader_prog)
{
	this.m_Texture = texture;
	this.m_Translation = translation;
	this.m_ShaderProg = shader_prog;
	this.m_Positions = createStaticFloatBuffer([0.0, 0.0, 0.0], 3, 1);
}

//------------------------------------------------------------------------------
Sprite.prototype.draw = function()
{
	// Programme
	var prog = this.m_ShaderProg;
	gl.useProgram(prog);
	
	// Matrices
	var model_view_matrix = mat4.create();
	mat4.identity(model_view_matrix);
	mat4.translate(model_view_matrix, this.m_Translation);
	gl.uniformMatrix4fv(prog.u_ProjMatrix, false, g_ProjMatrix);
	gl.uniformMatrix4fv(prog.u_WorldMatrix, false, model_view_matrix);
	
	// Texture
	this.m_Texture.use(prog);
	
	// Positions
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Positions);
	gl.vertexAttribPointer(prog.a_PointPos, this.m_Positions.item_size, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prog.a_PointPos);
	
	gl.uniform1f(prog.u_PointSize, 16.0);
	
	gl.disable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);
	gl.uniform1f(prog.u_Alpha, 1.0);
	
	//gl.enable(34370);	// magic point sprites number?
	
	// Draw
	gl.drawArrays(gl.POINTS, 0, 1);
	
	gl.disableVertexAttribArray(prog.a_PointPos);
}

//------------------------------------------------------------------------------
function buildTest()
{
	// Positions
	positions = [
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
	];
	position_buf = createStaticFloatBuffer(positions, 3, 4);
	
	// Indices
	var indices = [
		0, 1, 2, 0, 2, 3,
	];
	var index_buf = createStaticUint16Buffer(indices, 1, 6);
	
	// Colours
	colours = [
		0.5, 0.5, 0.0, 1.0,
		0.5, 0.5, 0.5, 1.0,
		0.5, 0.0, 0.5, 1.0,
		0.0, 0.5, 0.5, 1.0,
	];
	colour_buf = createStaticFloatBuffer(colours, 4, 4);
	
	// UVs
	uvs = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];
	uv_buf = createStaticFloatBuffer(uvs, 2, 4);
	
	var test_obj = new Test(position_buf, index_buf, colour_buf, uv_buf, gl.TRIANGLES);
	test_obj.setTranslation([1.5, 0.0, -7.0]);
	return test_obj;
}

//------------------------------------------------------------------------------
function Test(positions, indices, colours, uvs, primitive_type, translation)
{
	this.m_Positions = positions;
	this.m_Indices = indices;
	this.m_Colours = colours;
	this.m_UVs = uvs;
	this.m_PrimitiveType = primitive_type;
	this.m_ShaderProg = g_TestProg;
}

//------------------------------------------------------------------------------
Test.prototype.setTranslation = function(translation)
{
	this.m_Translation = translation;
};

//------------------------------------------------------------------------------
Test.prototype.draw = function()
{
	prog = this.m_ShaderProg;
	gl.useProgram(prog);
	
	// Model/view matrix
	var model_view_matrix = mat4.create();
	mat4.identity(model_view_matrix);
	mat4.translate(model_view_matrix, this.m_Translation);
	
	gl.uniformMatrix4fv(prog.u_ProjMatrix, false, g_ProjMatrix);
	gl.uniformMatrix4fv(prog.u_WorldMatrix, false, model_view_matrix);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Positions);
	gl.vertexAttribPointer(prog.a_VertPos, this.m_Positions.item_size, gl.FLOAT,
						   false, 0, 0);
	gl.enableVertexAttribArray(prog.a_VertPos);
	
	if (this.m_UVs !== null)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.m_UVs);
		gl.vertexAttribPointer(prog.a_VertUV, this.m_UVs.item_size, gl.FLOAT,
							   false, 0, 0);
		gl.enableVertexAttribArray(prog.a_VertUV);
		
		g_Texture.use(prog);
		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.uniform1f(prog.u_Alpha, 0.7);
		gl.disable(gl.DEPTH_TEST);
	}
	
	if (this.m_Indices !== null)
	{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_Indices);
		gl.drawElements(this.m_PrimitiveType, this.m_Indices.num_items,
						gl.UNSIGNED_SHORT, 0);
	}
	else
		gl.drawArrays(this.m_PrimitiveType, 0, this.m_Positions.num_items);
	
	gl.disableVertexAttribArray(prog.a_VertPos);
	gl.disableVertexAttribArray(prog.a_VertUV);
};

//------------------------------------------------------------------------------
