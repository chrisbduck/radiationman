//
// Radiation Man game script file
// By Chris Bevan, 25/8/2012, for Ludum Dare 24
//

var gl;
var g_LastUpdateTimeSec = null;
var g_ShaderProg;
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
	// Model/view matrix
	var model_view_matrix = mat4.create();
	mat4.identity(model_view_matrix);
	mat4.translate(model_view_matrix, this.m_Translation);
	var rotation_rad = this.m_RotationDeg[0] * Math.PI / 180;
	mat4.rotate(model_view_matrix, rotation_rad, this.m_RotationAxis[0]);
	rotation_rad = this.m_RotationDeg[1] * Math.PI / 180;
	mat4.rotate(model_view_matrix, rotation_rad, this.m_RotationAxis[1]);
	
	gl.uniformMatrix4fv(g_ShaderProg.u_WorldMatrix, false, model_view_matrix);
	
	// Normal matrix
	var normal_matrix = mat3.create();
	mat4.toInverseMat3(model_view_matrix, normal_matrix);
	mat3.transpose(normal_matrix);
	gl.uniformMatrix3fv(g_ShaderProg.u_NormalMatrix, false, normal_matrix);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Positions);
	gl.vertexAttribPointer(g_ShaderProg.a_VertPos, this.m_Positions.item_size, gl.FLOAT,
						   false, 0, 0);
	
	if (this.m_UVs !== null)
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.m_UVs);
		gl.vertexAttribPointer(g_ShaderProg.a_VertUV, this.m_UVs.item_size, gl.FLOAT,
							   false, 0, 0);
		
		g_Texture.use();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.m_Normals);
		gl.vertexAttribPointer(g_ShaderProg.a_VertNormal, this.m_Normals.item_size,
							   gl.FLOAT, false, 0, 0);
		
		gl.uniform1i(g_ShaderProg.u_UseLighting, 1);
		
		//if (use_lighting)
		{
			gl.uniform3f(g_ShaderProg.u_AmbientCol, 0.2, 0.2, 0.2);
			var lighting_dir = vec3.create([-1.0, 1.0, 0.0]);
			vec3.normalize(lighting_dir);
			gl.uniform3fv(g_ShaderProg.u_LightingDir, lighting_dir);
			gl.uniform3f(g_ShaderProg.u_LightingCol, 0.8, 0.8, 0.8);
		}
		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.uniform1f(g_ShaderProg.u_Alpha, 0.7);
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
	vertex_shader = getShader("lit-mesh-vs");
	fragment_shader = getShader("lit-mesh-fs");
	
	g_ShaderProg = gl.createProgram();
	gl.attachShader(g_ShaderProg, vertex_shader);
	gl.attachShader(g_ShaderProg, fragment_shader);
	gl.linkProgram(g_ShaderProg);
	
	if (!gl.getProgramParameter(g_ShaderProg, gl.LINK_STATUS))
	{
		alert("Failed to initialise shaders");
		return;
	}
	
	gl.useProgram(g_ShaderProg);
	g_ShaderProg.a_VertPos = gl.getAttribLocation(g_ShaderProg, "a_VertPos");
	g_ShaderProg.a_VertUV = gl.getAttribLocation(g_ShaderProg, "a_VertUV");
	g_ShaderProg.a_VertNormal = gl.getAttribLocation(g_ShaderProg, "a_VertNormal");
	g_ShaderProg.u_ProjMatrix = gl.getUniformLocation(g_ShaderProg, "u_ProjMatrix");
	g_ShaderProg.u_WorldMatrix = gl.getUniformLocation(g_ShaderProg, "u_WorldMatrix");
	g_ShaderProg.u_NormalMatrix = gl.getUniformLocation(g_ShaderProg, "u_NormalMatrix");
	g_ShaderProg.u_Sampler = gl.getUniformLocation(g_ShaderProg, "u_Sampler");
	g_ShaderProg.u_AmbientCol = gl.getUniformLocation(g_ShaderProg, "u_AmbientCol");
	g_ShaderProg.u_LightingDir = gl.getUniformLocation(g_ShaderProg, "u_LightingDir");
	g_ShaderProg.u_LightingCol = gl.getUniformLocation(g_ShaderProg, "u_LightingCol");
	g_ShaderProg.u_UseLighting = gl.getUniformLocation(g_ShaderProg, "u_UseLighting");
	g_ShaderProg.u_Alpha = gl.getUniformLocation(g_ShaderProg, "u_Alpha");
	
	gl.enableVertexAttribArray(g_ShaderProg.a_VertPos);
	gl.enableVertexAttribArray(g_ShaderProg.a_VertUV);
	gl.enableVertexAttribArray(g_ShaderProg.a_VertNormal);
}

//------------------------------------------------------------------------------
function initTextures()
{
	g_Texture = new Texture('sports-image.jpg');
}

//------------------------------------------------------------------------------
function initScene()
{
	initObjects();
	initShaders();
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
	gl.uniformMatrix4fv(g_ShaderProg.u_ProjMatrix, false, g_ProjMatrix);
	
	g_Pyramid.draw();
	g_Cube.draw();
}

//------------------------------------------------------------------------------
function startGame()
{
	webGLStart();
}

//------------------------------------------------------------------------------
