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
