//------------------------------------------------------------------------------
// Useful WebGL functions
// Chris Bevan, 23/8/2012
//------------------------------------------------------------------------------

var g_PressedKeys = {};
var g_LastUpdateTimeSec;

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
		gl.viewport_width = canvas.width;
		gl.viewport_height = canvas.height;
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
	buffer.item_size = item_size;
	buffer.num_items = num_items;
	return buffer;
}

//------------------------------------------------------------------------------
function createStaticUint16Buffer(values, item_size, num_items)
{
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(values), gl.STATIC_DRAW);
	buffer.item_size = item_size;
	buffer.num_items = num_items;
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
function buildShaderProg(vertex_shader_name, fragment_shader_name)
{
	var vertex_shader = getShader(vertex_shader_name);
	var fragment_shader = getShader(fragment_shader_name);
	
	var shader_prog = gl.createProgram();
	gl.attachShader(shader_prog, vertex_shader);
	gl.attachShader(shader_prog, fragment_shader);
	gl.linkProgram(shader_prog);
	
	if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS))
	{
		alert("Failed to initialise shaders");
		return null;
	}
	
	return shader_prog;
}

//------------------------------------------------------------------------------

function Texture(file_name)
{
	texture = this;
	this.gltexture = gl.createTexture();
	this.image = new Image();
	this.image.gltexture = this.gltexture;
	this.image.parent = this;
	this.image.onload = function() { texture.init(); }
	this.image.src = file_name;
}

//------------------------------------------------------------------------------
Texture.prototype.init = function()
{
	gl.bindTexture(gl.TEXTURE_2D, this.gltexture);
	//glpixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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
// Sets up a default projection matrix, with 45 degrees FOV, and near&far planes 0.1 & 100
function getProjectionMatrix(shader_uniform)
{
	var proj_matrix = mat4.create();
	mat4.perspective(45, gl.viewport_width / gl.viewport_height, 0.1, 100.0, proj_matrix);
	gl.uniformMatrix4fv(shader_uniform, false, proj_matrix);
	return proj_matrix;
}

//------------------------------------------------------------------------------
function updateScene()
{
	requestAnimFrame(updateScene);
	
	// Update time
	var time_now_sec = new Date().getTime() / 1000;
	if (g_LastUpdateTimeSec != null)
	{
		var time_diff_sec = time_now_sec - g_LastUpdateTimeSec;
		
		updateObjects(time_diff_sec);
	}
	g_LastUpdateTimeSec = time_now_sec;
	
	// Set up and render the scene
	gl.viewport(0, 0, gl.viewport_width, gl.viewport_height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	renderScene();
}

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
	
	initScene();
	updateScene();
}

//------------------------------------------------------------------------------
