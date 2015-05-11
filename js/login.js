/************************************************************
 * FILE NAME: login.js
 * AUTHOR: ALB
 * USAGE: Included in login.html
 * FUNCTIONAL DESCRIPTION:
 * This File supports login.html
 **************************************************************
 * MODIFICATION HISTORY:
 * 02-21-2015 Created ALB
 *************************************************************
 */
//
// INITIALIZE DOM ELEMENT CALLBACKS AND ATTRIBUTES
//
function setitup()
{
	// SET LISTENER FOR LOGIN BUTTON
	document.getElementById("loginBtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	post_login();
  	});
  	// SET LISTENER FOR VIEW RESPONSES BUTTON
	document.getElementById("navRespBtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	window.history.replaceState({logid: g_user, 
    						 search: g_urlSearch
    						 }, document.title, document.location.href);
    	view_responses();
  	});
  	// SET LISTENER FOR SETUP SURVEYS BUTTON
	document.getElementById("navSurvBtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	window.history.replaceState({logid: g_user, 
    						 search: g_urlSearch
    						 }, document.title, document.location.href);
    	window.location = "/html/survey.html" + g_urlSearch;
  	});
  	// SET LISTENER FOR ADMIN USERS BUTTON
	document.getElementById("navUserBtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	window.history.replaceState({logid: g_user, 
    						 search: g_urlSearch
    						 }, document.title, document.location.href);
    	window.location = "/html/admin.html" + g_urlSearch;
  	});
  	// SET LISTENER FOR LOGOUT BUTTON
	document.getElementById("logoutBtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	
    	if (g_user)
    	{
    		if ( user_logout(g_user) )
	    	{
	    
	    		setStatus("User Logged Out.");
	    	}
    	}
        document.getElementById("inpDiv").className = "visible";
        document.getElementById("navBtnDiv").className = "hidden";
        document.getElementById("logUserID").innerHTML = "None";
        setStatus("<h2>You Must Login To Proceed.</h2>");
        g_urlSearch = "";
        g_logkey = null;
        g_user = null;
  	});
  	//
  	//********************* INIT DATA AND PAGE LAYOUT ***********************
  	//
  	g_urlSearch = "";
    g_logkey = null;
    g_user = null;
	var cst = window.history.state;
	//alert("Hist Len: " + window.history.length);
	if ( cst && window.history.length > 1) // Returning user - maybe?
	{
		g_user = String(cst['logid']);
		g_urlSearch = String(cst['search']);
		if ( g_user && g_urlSearch )
		{
			check_login(g_user, g_urlSearch, login_init);
		}
	}
	else if ( g_user == null ) // New User or Bad or Timed out Login
	{
		login_init(false);
	}
}
// Check User Return Function
function login_init(result)
{
	if ( result == true )
	{
		// True: Keys Match - Go ahead and Initialize the Doc
        document.getElementById("inpDiv").className = "hidden";
        document.getElementById("logUserID").innerHTML = g_user;
        document.getElementById("navBtnDiv").className = "visible";
        setStatus("<h2>Select Desired Action</h2>");
	}
	else
	{
		// No User Id or False: Keys DON'T Match Unauthorized User
        document.getElementById("inpDiv").className = "visible";
        document.getElementById("navBtnDiv").className = "hidden";
        document.getElementById("logUserID").innerHTML = "None";
        setStatus("<h2>You Must Login To Proceed.</h2>");
		g_urlSearch = "";
	    g_logkey = null;
	    g_user = null;
	}
	// Go back to document event loop
}
// HANDLER FUNCTION FOR LOGIN BUTTON ONCLICK EVENT ACTION
function post_login()
{
    var lid;
    var lpw;
    // Get DOM element values for POST operation
    // Make login and password strings a little less obvious visually
    lid = document.getElementById("loginID").value;
    lpw = document.getElementById("loginPW").value;
    if (!lid || lid == "" || !lpw || lpw == "")
    {
        setStatus("<h2 class=\x22err\x22>ERROR: Must Specify Login ID And Password.</h2>");
        document.getElementById("loginID").focus();
        return;
    }
    // Call asynchronous HTTP POST request to cgi program with DOM values and callback function
    loadXMLDoc("POST", "/cgi-bin/rsp_login.py", "LOGID="+lid+"&LOGPW="+lpw, function()
    {
        // HTTP REQUEST CALLBACK FUNCTION
        //alert("<STATE: " + g_xmlhttp.readyState + " STATUS: " + g_xmlhttp.status + " RESP: " + g_xmlhttp.responseText + ">");
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("XRT: " + g_xmlhttp.responseText);
            var xrt = g_xmlhttp.responseText.split("\n")[0];
            var sts = xrt.split(":")[0];
            var rsp = xrt.split(":")[1];
            if (sts == "OK")
            {
                // Call successful login function here
                
                // Encrypt the URL Data
                var ucid = "ID=" + crypto("E", lid, "FoxyBuns");
                var uclk = "LK=" + crypto("E", rsp, "HoundMix");
                // Encode the URL Data
                // and Save in Global variable g_urlSearch
                // MUST have the "?" !!!
                g_urlSearch = "?" + encodeURIComponent(ucid + "&" + uclk);
                g_user = lid;
                // Set Next Location With: "/html/admin.html" + g_urlSearch;
                // SetUp navigation on Login Screen
                document.getElementById("inpDiv").className = "hidden";
                document.getElementById("navBtnDiv").className = "visible";
                document.getElementById("logUserID").innerHTML = g_user;
                setStatus("<h2>Select Desired Action</h2>");
            }
            else if (sts == "DUPE")
            {
                alert("User " + lid + " is Already Logged in.");
            }
            else
            {
                //alert("ERR-RESP: " + g_xmlhttp.responseText)
                setStatus("<h2 class=\x22err\x22>ERROR:&nbsp;" + rsp + "</h2>");
            }
        }
    });
}
// Check Responses
function view_responses()
{
	// Get the Survey Code to Display
	var svCode = prompt("Enter Survey Code: ");
	
	// Create a window to display it in
	// Could change 2nd argument to make it detachable etc.
	dwin = window.open("", "");
	
	// Build Survey Header Data Table
    var pstr = "SURVEY=" + svCode;
    
    loadXMLDoc("POST", "/cgi-bin/rsp_display.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText != "")
            {
                dwin.document.write(g_xmlhttp.responseText);
            }
            else
            {
                // GOT A PROCESSING ERROR
                //alert(g_xmlhttp.responseText);
                setStatus("<h2 class=\x22err\x22>ERROR Loading Survey Response Window.</h2>");
            }
        }
    });
    dwin.focus();
}
