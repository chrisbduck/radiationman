//------------------------------------------------------------------------------
// Useful WebGL functions
// Chris Bevan, 23/8/2012
//------------------------------------------------------------------------------

var g_PressedKeys = {};
var g_LastUpdateTimeSec;
var g_Textures = [];
var g_NumLoadingTextures = 0;		// >0 when a texture is loading
var g_NumLoadingResources = 0;		// >0 when a texture or sound is loading
var g_TexInitialisedCount = 0;
var g_ResourcesLoadedCallback;
var g_CanPlaySound = null;
var g_Music;

//------------------------------------------------------------------------------
// WebGL helpers
//------------------------------------------------------------------------------
function initGL(canvas)
{
	try
	{
		webgl_names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
		for (var index in webgl_names)
		{
			gl = canvas.getContext(webgl_names[index]);
			if (gl !== null)
				break;
		}
		if (gl === null)
			return false;
		gl.m_ViewportWidth = canvas.width;
		gl.m_ViewportHeight = canvas.height;
	}
	catch (exc)
	{
		return false;
	}
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	return true;
}

//------------------------------------------------------------------------------
function createStaticFloatBuffer(values, item_size, num_items)
{
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
	buffer.m_ItemSize = item_size;
	buffer.m_NumItems = num_items;
	return buffer;
}

//------------------------------------------------------------------------------
function createStaticUint16Buffer(values, item_size, num_items)
{
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(values), gl.STATIC_DRAW);
	buffer.m_ItemSize = item_size;
	buffer.m_NumItems = num_items;
	return buffer;
}

//------------------------------------------------------------------------------
function getShader(id)
{
	var shader_script = document.getElementById(id);
	if (!shader_script)
		return null;

	var str = "";
	var k = shader_script.firstChild;
	while (k)
	{
		if (k.nodeType === 3)
			str += k.textContent;
		k = k.nextSibling;
	}

	var shader;
	if (shader_script.type === "x-shader/x-fragment")
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	else if (shader_script.type === "x-shader/x-vertex")
		shader = gl.createShader(gl.VERTEX_SHADER);
	else
		return null;

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

//------------------------------------------------------------------------------
function getShaderProg(vertex_shader_name, fragment_shader_name, properties)
{
	// Find the source
	var vertex_shader = getShader(vertex_shader_name);
	var fragment_shader = getShader(fragment_shader_name);
	if (vertex_shader === null || fragment_shader === null)
	{
		var msg = "Shader(s) missing:";
		if (vertex_shader === null)
			msg += " " + vertex_shader_name;
		if (fragment_shader === null)
			msg += " " + fragment_shader_name;
		alert(msg);
		return;
	}
	
	// Compile and link
	var shader_prog = gl.createProgram();
	gl.attachShader(shader_prog, vertex_shader);
	gl.attachShader(shader_prog, fragment_shader);
	gl.linkProgram(shader_prog);
	if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS))
	{
		alert("Shader init failed: " + vertex_shader_name + " + " + fragment_shader_name);
		return;
	}
	
	// Get appropriate attributes and uniforms
	for (index in properties)
	{
		prop = properties[index];
		if (prop[1] == '_')			// a_, u_
		{
			if (prop[0] == 'a')
				shader_prog[prop] = gl.getAttribLocation(shader_prog, prop);
			else if (prop[0] == 'u')
				shader_prog[prop] = gl.getUniformLocation(shader_prog, prop);
		}
	}
	
	return shader_prog;
}

//------------------------------------------------------------------------------
function updateScene()
{
	requestAnimFrame(updateScene);
	
	// Don't do anything until we're up and running, with all textures loaded, etc
	if (!g_Running)
		return;
	
	// Update time
	var time_now_sec = new Date().getTime() / 1000;
	if (g_LastUpdateTimeSec != null)
	{
		var time_diff_sec = time_now_sec - g_LastUpdateTimeSec;
		// Stop the sim from breaking when debugging :)
		if (time_diff_sec >= 0.1)
			time_diff_sec = 0.01;
		
		updateObjects(time_diff_sec);
	}
	g_LastUpdateTimeSec = time_now_sec;
	
	// Set up and render the scene
	gl.viewport(0, 0, gl.m_ViewportWidth, gl.m_ViewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	renderScene();
}

//------------------------------------------------------------------------------
function webGLStart()
{
	canvas = document.getElementById("gamecanvas");
	if (!initGL(canvas))
	{
		alert("WebGL initialisation failed - sorry!")
		return;
	}
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
}

//------------------------------------------------------------------------------
// Texture
//------------------------------------------------------------------------------
function Texture(file_name)
{
	g_Textures = g_Textures.concat([this]);
	g_NumLoadingTextures += 1;
	g_NumLoadingResources += 1;
	
	texture = this;
	this.gltexture = gl.createTexture();
	this.image = new Image();
	this.image.gltexture = this.gltexture;
	this.image.parent = this;
	this.image.onload = handleLoadedTexture;
	this.image.src = file_name;
}

//------------------------------------------------------------------------------
function handleLoadedTexture()
{
	// Decrease the counter
	g_NumLoadingTextures -= 1;
	if (g_NumLoadingTextures == 0)
	{
		// All textures have loaded.  Initialise them
		var init_up_to = g_Textures.length;
		var num_textures_to_init = init_up_to - g_TexInitialisedCount;
		for (index = g_TexInitialisedCount; index < init_up_to; ++index)
			g_Textures[index].init();
		g_TexInitialisedCount = init_up_to;
		
		// Assume nothing strange has happened (other texture loads being started in another thread?)
		console.assert(g_NumLoadingTextures == 0);
		
		handleLoadedResources(num_textures_to_init);
	}
}

//------------------------------------------------------------------------------
Texture.prototype.init = function()
{
	gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

//------------------------------------------------------------------------------
Texture.prototype.use = function(shader_prog)
{
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
	gl.uniform1i(shader_prog.u_Sampler, 0);
}

//------------------------------------------------------------------------------
// Sprite
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
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertPositions);
	gl.vertexAttribPointer(prog.a_VertPos, this.m_VertPositions.m_ItemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prog.a_VertPos);
	
	// UVs
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_UVs);
	gl.vertexAttribPointer(prog.a_VertUV, this.m_UVs.m_ItemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prog.a_VertUV);
	
	// Texture
	this.m_Texture.use(prog);
	
	// Colour
	gl.uniform4fv(prog.u_Col, this.m_Colour);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.DEPTH_TEST);
	
	// Draw
	gl.drawArrays(gl.TRIANGLE_FAN, 0, this.m_VertPositions.m_NumItems);
	
	// Clean up
	gl.disableVertexAttribArray(prog.a_VertPos);
	gl.disableVertexAttribArray(prog.a_VertUV);
};

//------------------------------------------------------------------------------
// Mesh
//------------------------------------------------------------------------------
function Mesh(mesh_data, texture)
{
	// mesh_data = [positions, indices, uvs, normals, primitive_type]
	this.m_VertPositions = mesh_data[0];
	this.m_Indices = mesh_data[1];
	this.m_UVs = mesh_data[2];
	this.m_Normals = mesh_data[3];
	this.m_PrimitiveType = mesh_data[4];
	this.m_RotationDeg = [0, 0];
	this.m_RotationDegPerSec = [0, 0];
	this.m_Translation = [0, 0, 0];			// 3D position
	this.m_Position = null;					// 2D position (later)
	this.m_RotationAxis = [null, null];
	this.m_Lighting = true;
	this.m_Ambient = 0.5;
	this.m_Lit = 0.5;
	this.m_Alpha = 1.0;
	this.m_Texture = texture;
	this.m_ShaderProg = g_LitMeshProg;
	this.m_Scale = 1.0;
}

//------------------------------------------------------------------------------
Mesh.prototype.setTranslation = function(translation) { this.m_Translation = translation; };
Mesh.prototype.setPosition = function(position) { this.m_Position = position; }
Mesh.prototype.setTexture = function(texture) { this.m_Texture = texture; };
Mesh.prototype.setLighting = function(active) { this.m_Lighting = active; };
Mesh.prototype.setLightingLevel = function(ambient, lit) { this.m_Ambient = ambient; this.m_Lit = lit; }
Mesh.prototype.setAlpha = function(alpha) { this.m_Alpha = alpha; };
Mesh.prototype.setScale = function(scale) { this.m_Scale = scale; };

//------------------------------------------------------------------------------
Mesh.prototype.setRotation = function(index, axis, deg_per_sec)
{
	this.m_RotationDeg[index] = 0.0;
	this.m_RotationDegPerSec[index] = deg_per_sec;
	this.m_RotationAxis[index] = axis;
};

//------------------------------------------------------------------------------
Mesh.prototype.accelerate = function(index, accel_deg_per_sec)
{
	this.m_RotationDegPerSec[index] += accel_deg_per_sec;
}

//------------------------------------------------------------------------------
Mesh.prototype.update = function(time_diff_sec)
{
	for (index in this.m_RotationDeg)
		this.m_RotationDeg[index] += this.m_RotationDegPerSec[index] * time_diff_sec;
}

//------------------------------------------------------------------------------
Mesh.prototype.draw = function()
{
	prog = this.m_ShaderProg;
	gl.useProgram(prog);
	
	// Model/view matrix
	var model_view_matrix = mat4.create();
	mat4.identity(model_view_matrix);
	mat4.translate(model_view_matrix, this.m_Translation);
	var rotation_rad = this.m_RotationDeg[0] * Math.PI / 180;
	mat4.rotate(model_view_matrix, rotation_rad, this.m_RotationAxis[0]);
	rotation_rad = this.m_RotationDeg[1] * Math.PI / 180;
	mat4.rotate(model_view_matrix, rotation_rad, this.m_RotationAxis[1]);
	mat4.scale(model_view_matrix, [this.m_Scale, this.m_Scale, this.m_Scale]);
	
	gl.uniformMatrix4fv(prog.u_ProjMatrix, false, g_ProjMatrix);
	gl.uniformMatrix4fv(prog.u_WorldMatrix, false, model_view_matrix);
	
	// Normal matrix
	var normal_matrix = mat3.create();
	mat4.toInverseMat3(model_view_matrix, normal_matrix);
	mat3.transpose(normal_matrix);
	gl.uniformMatrix3fv(prog.u_NormalMatrix, false, normal_matrix);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertPositions);
	gl.vertexAttribPointer(prog.a_VertPos, this.m_VertPositions.m_ItemSize, gl.FLOAT,
						   false, 0, 0);
	gl.enableVertexAttribArray(prog.a_VertPos);
	
	if (this.m_UVs !== null)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.m_UVs);
		gl.vertexAttribPointer(prog.a_VertUV, this.m_UVs.m_ItemSize, gl.FLOAT,
							   false, 0, 0);
		gl.enableVertexAttribArray(prog.a_VertUV);
		
		this.m_Texture.use(prog);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Normals);
		gl.vertexAttribPointer(prog.a_VertNormal, this.m_Normals.m_ItemSize,
							   gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(prog.a_VertNormal);
		
		gl.uniform1i(prog.u_UseLighting, this.m_Lighting);
		
		if (this.m_Lighting)
		{
			gl.uniform3f(prog.u_AmbientCol, this.m_Ambient, this.m_Ambient, this.m_Ambient);
			var lighting_dir = vec3.create([0.0, -1.0, 0.0]);
			//vec3.normalize(lighting_dir);
			gl.uniform3fv(prog.u_LightingDir, lighting_dir);
			gl.uniform3f(prog.u_LightingCol, this.m_Lit, this.m_Lit, this.m_Lit);
		}
		
		if (this.m_Alpha < 1.0)
		{
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			gl.uniform1f(prog.u_Alpha, this.m_Alpha);
			gl.disable(gl.DEPTH_TEST);
		}
		else
		{
			gl.disable(gl.BLEND);
			gl.enable(gl.DEPTH_TEST);
		}
	}
	
	if (this.m_Indices !== null)
	{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_Indices);
		gl.drawElements(this.m_PrimitiveType, this.m_Indices.m_NumItems,
						gl.UNSIGNED_SHORT, 0);
	}
	else
		gl.drawArrays(this.m_PrimitiveType, 0, this.m_VertPositions.m_NumItems);
	
	gl.disableVertexAttribArray(prog.a_VertPos);
	gl.disableVertexAttribArray(prog.a_VertUV);
	gl.disableVertexAttribArray(prog.a_VertNormal);
};

//------------------------------------------------------------------------------
// Mesh data
//------------------------------------------------------------------------------
// Returns: [positions, indices, uvs, normals, primitive_type]
function getPyramidData()
{
	if (!getPyramidData.positions)
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
		getPyramidData.positions = createStaticFloatBuffer(positions, 3, 12);
		
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
		getPyramidData.uvs = createStaticFloatBuffer(uvs, 2, 12);
		
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
		getPyramidData.normals = createStaticFloatBuffer(normals, 3, 12);
	}
	
	return [getPyramidData.positions, null, getPyramidData.uvs, getPyramidData.normals, gl.TRIANGLES];
}

//------------------------------------------------------------------------------
// Returns: [positions, indices, uvs, normals, primitive_type]
function getCubeData()
{
	if (!getCubeData.positions)
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
		getCubeData.positions = createStaticFloatBuffer(positions, 3, 24);
		
		// Indices
		var indices = [
			0, 1, 2,      0, 2, 3,    // Front face
			4, 5, 6,      4, 6, 7,    // Back face
			8, 9, 10,     8, 10, 11,  // Top face
			12, 13, 14,   12, 14, 15, // Bottom face
			16, 17, 18,   16, 18, 19, // Right face
			20, 21, 22,   20, 22, 23  // Left face
		];
		getCubeData.indices = createStaticUint16Buffer(indices, 1, 36);
		
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
		getCubeData.uvs = createStaticFloatBuffer(uvs, 2, 24);
		
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
		getCubeData.normals = createStaticFloatBuffer(normals, 3, 24);
	}
	
	return [getCubeData.positions, getCubeData.indices, getCubeData.uvs, getCubeData.normals, gl.TRIANGLES];
}

//------------------------------------------------------------------------------
// Sound
//------------------------------------------------------------------------------
function Sound(file_name)
{
	if (g_CanPlaySound === null)
	{
		// Check if we can play the sound
		g_CanPlaySound = (new Audio()).canPlayType("audio/ogg; codecs=vorbis");
		if (!g_CanPlaySound)
			console.log("Can't play sound! :(");
	}
	if (!g_CanPlaySound)
	{
		this.sound = null;
		return;
	}
	
	g_NumLoadingResources += 2;
	
	this.sound = [null, null];
	for (index in this.sound)
	{
		this.sound[index] = new Audio(file_name);
		this.sound[index].addEventListener("loadeddata", handleLoadedSound, false);
	}
	this.current_index = 0;
}

//------------------------------------------------------------------------------
Sound.prototype.play = function()
{
	if (this.sound === null)
		return;
	
	this.sound[this.current_index].play();
	this.current_index = 1 - this.current_index;
	this.sound[this.current_index].currentTime = 0;
};

//------------------------------------------------------------------------------
function handleLoadedSound()
{
	handleLoadedResources(1);
}

//------------------------------------------------------------------------------
function handleLoadedResources(num_loaded_resources)
{
	g_NumLoadingResources -= num_loaded_resources;
	if (g_NumLoadingResources == 0)
	{
		// activate the callback now
		if (g_ResourcesLoadedCallback !== null)
		{
			g_ResourcesLoadedCallback();
			g_ResourcesLoadedCallback = null;
		}
	}
}

//------------------------------------------------------------------------------
function playMusic(file_name)
{
	// Delay doesn't really matter here
	g_Music = new Audio(file_name);
	g_Music.loop = true;
	g_Music.play();
}

//------------------------------------------------------------------------------
// Miscellaneous
//------------------------------------------------------------------------------
function handleKeyDown(event)
{
	g_PressedKeys[event.keyCode] = true;
}

//------------------------------------------------------------------------------
function handleKeyUp(event)
{
	g_PressedKeys[event.keyCode] = false;
}

//------------------------------------------------------------------------------
// Sets up a default projection matrix, with 45 degrees FOV, and near&far planes 0.1 & 100
function getProjectionMatrix()
{
	var proj_matrix = mat4.create();
	mat4.perspective(45, gl.m_ViewportWidth / gl.m_ViewportHeight, 0.1, 100.0, proj_matrix);
	return proj_matrix;
}

//------------------------------------------------------------------------------
function getRandom(min_val, max_val)
{
	return min_val + Math.random() * (max_val - min_val);
}

//------------------------------------------------------------------------------
function getPlusMinusRandom(min_val, max_val)
{
	var val = getRandom(min_val, max_val);
	val =  Math.random() < 0.5 ? -val : val;
	return val;
}

//------------------------------------------------------------------------------
function get3DPosFrom2D(desired_x, desired_y)
{
	// Scale the desired position into the projected buffer space
	var scaled_x = -1.0 + desired_x * 2.0 / gl.m_ViewportWidth;
	var scaled_y =  1.0 - desired_y * 2.0 / gl.m_ViewportHeight;	// flip y so 0 is at the top
	var pos = vec3.create([scaled_x, scaled_y, 1.0]);
	
	// Apply the inverse of the projection transformation to get a point in 3D space
	var inv_proj_matrix = mat4.create();
	mat4.inverse(g_ProjMatrix, inv_proj_matrix);
	mat4.multiplyVec3(inv_proj_matrix, pos);
	return pos;
}

//------------------------------------------------------------------------------
