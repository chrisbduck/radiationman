//
// Object initialisation
//

//------------------------------------------------------------------------------
function initObjects()
{
	//
	// Pyramid
	//
	
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
	
	g_Pyramid = new Mesh(position_buf, null, colour_buf, uv_buf, normal_buf, gl.TRIANGLES);
	g_Pyramid.setTranslation([-1.5, 0.0, -7.0]);
	g_Pyramid.setRotation(0, [0, 1, 0], 90.0);
	g_Pyramid.setRotation(1, [0, 0, 1], 60.0);
	
	//
	// Cube
	//
	
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
	
	g_Cube = new Mesh(position_buf, index_buf, colour_buf, uv_buf, normal_buf,
					  gl.TRIANGLES);
	g_Cube.setTranslation([1.5, 0.0, -7.0]);
	g_Cube.setRotation(0, [1, 0, 0], 75.0);
	g_Cube.setRotation(1, [0, 1, 0], 110.0);
}

//------------------------------------------------------------------------------
