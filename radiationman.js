//
// Radiation Man game script file
// By Chris Bevan, 25/8/2012, for Ludum Dare 24
//
// In all cases, PPS = pixels per second (velocity), and PPSPS = PPS per second (acceleration)
//

var gl;
var g_LastUpdateTimeSec = null;
var g_LitMeshProg;
var g_SpriteProg;
var g_PressedKeys = {};
var g_Player = null;
var g_Cubes = [];
var g_Pyramids = [];
var g_ProjMatrix;
var g_Sprites = [];
var g_GravityPPSPS = 600;
var g_Running = false;
var g_IntroActive = false;
var g_RobotJump = false;

//------------------------------------------------------------------------------
function initShaders()
{
	g_LitMeshProg = getShaderProg("lit-mesh-vs", "lit-mesh-fs",
								  ["a_VertPos", "a_VertUV", "a_VertNormal",
								   "u_ProjMatrix", "u_WorldMatrix", "u_NormalMatrix",
								   "u_Sampler",
								   "u_AmbientCol", "u_LightingDir", "u_LightingCol", "u_UseLighting",
								   "u_Alpha"]);
	
	g_SpriteProg = getShaderProg("sprite-vs", "sprite-fs",
								 ["a_VertPos", "a_VertUV",
								  "u_WorldMatrix", "u_Sampler", "u_Col"]);
}

//------------------------------------------------------------------------------
function initScene()
{
	g_ProjMatrix = getProjectionMatrix();
	initShaders();
	playMusic("data/music/cheese.ogg");
	loadResources();		// initObjects is called via callback when this finishes
}

//------------------------------------------------------------------------------
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_SPACE = 32;
var KEY_CTRL = 17;
var KEY_SHIFT = 16;
var KEY_ALT = 18;
var KEY_SUPER = 91;
var KEY_P = 80;
var KEY_J = 74;
var KEY_M = 77;
var KEY_COMMA = 188;
var KEY_FULL_STOP = 190;
var KEY_ENTER = 13;

function updateObjects(time_diff_sec)
{
	if (g_PressedKeys[KEY_ENTER])
	{
		if (g_IntroActive)
		{
			g_IntroActive = false;
			destroyObjects();
			initObjects();
		}
		if (!g_Player.m_Alive || g_Player.m_Won)
		{
			// Restart
			destroyObjects();
			initObjects();
		}
	}
	
	// Music off
	if (g_PressedKeys[KEY_M] && !g_Music.paused)
		g_Music.pause();
	
	// Turn off updates on the intro screen and when the player wins
	if (g_IntroActive || g_Player.m_Won)
		return;
	
	if (g_PressedKeys[KEY_COMMA])
		time_diff_sec *= 0.5;
	else if (g_PressedKeys[KEY_FULL_STOP])
		time_diff_sec *= 2.0;
	if (g_PressedKeys[KEY_J])
		g_RobotJump = true;
	else
		g_RobotJump = false;
	
	// Player input & update
	var player_x_input = 0;
	var player_jump_input = 0;
	if (g_PressedKeys[KEY_LEFT])
		player_x_input -= 1;
	if (g_PressedKeys[KEY_RIGHT])
		player_x_input += 1;
	if (g_PressedKeys[KEY_UP])
		player_jump_input = 1;
	g_Player.update(time_diff_sec, player_x_input, player_jump_input);
	
	// Object update
	for (index in g_Pyramids)
		g_Pyramids[index].update(time_diff_sec);
	for (index in g_Cubes)
		g_Cubes[index].update(time_diff_sec);
	for (index in g_Robots)
		g_Robots[index].update(time_diff_sec);
}

//------------------------------------------------------------------------------
function renderScene()
{
	for (index in g_Sprites)
		g_Sprites[index].draw();
	for (index in g_Platforms)
		g_Platforms[index].draw();
	
	if (g_Player !== null)
		g_Player.draw();
	
	for (index in g_Robots)
		g_Robots[index].draw();
	for (index in g_Pyramids)
		g_Pyramids[index].draw();
	for (index in g_Cubes)
		g_Cubes[index].draw();
}

//------------------------------------------------------------------------------
function startGame()
{
	webGLStart();
	initScene();
	updateScene();		// start update loop running
}

//------------------------------------------------------------------------------
