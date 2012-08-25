//
// Radiation Man game script file
// By Chris Bevan, 25/8/2012, for Ludum Dare 24
//

var gl;
var g_LastUpdateTimeSec = null;
var g_LitMeshProg;
var g_Texture;
var g_PressedKeys = {};
var g_Cube;
var g_Pyramid;
var g_ProjMatrix;

//------------------------------------------------------------------------------
function Mesh(positions, indices, colours, uvs, normals, primitive_type, translation)
{
	this.m_Positions = positions;
	this.m_Indices = indices;
	this.m_Colours = colours;
	this.m_UVs = uvs;
	this.m_Normals = normals;
	this.m_PrimitiveType = primitive_type;
	this.m_RotationDeg = [0, 0];
	this.m_RotationDegPerSec = [0, 0];
	this.m_RotationAxis = [null, null];
	this.m_Program = g_LitMeshProg;
}

//------------------------------------------------------------------------------
Mesh.prototype.setTranslation = function(translation)
{
	this.m_Translation = translation;
};

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
	prog = this.m_Program;
	gl.useProgram(prog);
	
	// Model/view matrix
	var model_view_matrix = mat4.create();
	mat4.identity(model_view_matrix);
	mat4.translate(model_view_matrix, this.m_Translation);
	var rotation_rad = this.m_RotationDeg[0] * Math.PI / 180;
	mat4.rotate(model_view_matrix, rotation_rad, this.m_RotationAxis[0]);
	rotation_rad = this.m_RotationDeg[1] * Math.PI / 180;
	mat4.rotate(model_view_matrix, rotation_rad, this.m_RotationAxis[1]);
	
	gl.uniformMatrix4fv(prog.u_ProjMatrix, false, g_ProjMatrix);
	gl.uniformMatrix4fv(prog.u_WorldMatrix, false, model_view_matrix);
	
	// Normal matrix
	var normal_matrix = mat3.create();
	mat4.toInverseMat3(model_view_matrix, normal_matrix);
	mat3.transpose(normal_matrix);
	gl.uniformMatrix3fv(prog.u_NormalMatrix, false, normal_matrix);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Positions);
	gl.vertexAttribPointer(prog.a_VertPos, this.m_Positions.item_size, gl.FLOAT,
						   false, 0, 0);
	
	if (this.m_UVs !== null)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.m_UVs);
		gl.vertexAttribPointer(prog.a_VertUV, this.m_UVs.item_size, gl.FLOAT,
							   false, 0, 0);
		
		g_Texture.use(prog);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Normals);
		gl.vertexAttribPointer(prog.a_VertNormal, this.m_Normals.item_size,
							   gl.FLOAT, false, 0, 0);
		
		gl.uniform1i(prog.u_UseLighting, 1);
		
		//if (use_lighting)
		{
			gl.uniform3f(prog.u_AmbientCol, 0.2, 0.2, 0.2);
			var lighting_dir = vec3.create([-1.0, 1.0, 0.0]);
			vec3.normalize(lighting_dir);
			gl.uniform3fv(prog.u_LightingDir, lighting_dir);
			gl.uniform3f(prog.u_LightingCol, 0.8, 0.8, 0.8);
		}
		
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
};

//------------------------------------------------------------------------------
function initShaders()
{
	g_LitMeshProg = getShaderProg("lit-mesh-vs", "lit-mesh-fs",
								  ["a_VertPos", "a_VertUV", "a_VertNormal",
								   "u_ProjMatrix", "u_WorldMatrix", "u_NormalMatrix",
								   "u_Sampler",
								   "u_AmbientCol", "u_LightingDir", "u_LightingCol", "u_UseLighting",
								   "u_Alpha"]);
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
			{
				shader_prog[prop] = gl.getAttribLocation(shader_prog, prop);
				gl.enableVertexAttribArray(shader_prog[prop]);
			}
			else if (prop[0] == 'u')
				shader_prog[prop] = gl.getUniformLocation(shader_prog, prop);
		}
	}
	
	return shader_prog;
}

//------------------------------------------------------------------------------
function initTextures()
{
	g_Texture = new Texture('sports-image.jpg');
}

//------------------------------------------------------------------------------
function initScene()
{
	initShaders();
	initObjects();
	initTextures();
	g_ProjMatrix = getProjectionMatrix();
}

//------------------------------------------------------------------------------
function updateObjects(time_diff_sec)
{
	g_Pyramid.update(time_diff_sec);
	g_Cube.update(time_diff_sec);
}

//------------------------------------------------------------------------------
function renderScene()
{
	g_Pyramid.draw();
	g_Cube.draw();
}

//------------------------------------------------------------------------------
function startGame()
{
	webGLStart();
}

//------------------------------------------------------------------------------