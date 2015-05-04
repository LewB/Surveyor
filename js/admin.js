/************************************************************
 * FILE NAME: admin.js
 * AUTHOR: ALB
 * USAGE: Included in admin.html
 * FUNCTIONAL DESCRIPTION:
 * This File supports admin.html
 *-----------------------------------------------------------
 * MODIFICATION HISTORY:
 *  02-21-2015 Created ALB
 *************************************************************
 */
//
// CHECK FOR VALID LOGIN
function admin_login()
{
	check_login("url", location.search, admin_initDoc);
	// admin_initDoc() will be called asynchronously by HTTPRequest
	// after it Returns from processing the request
	// IMPORTANT: Nothing stops DOC flow before next event loop
}
// Init Document
function admin_initDoc(result)
{
	if ( result == true )
	{
		// True: Keys Match - Go ahead and Initialize the Doc
		
        document.getElementById("logUserID").innerHTML = g_user;
        admin_initlist();
	}
	else
	{
		// False: Keys DON'T Match - Stale or Unauthorized User
		alert("You Are Not Logged In or Your Login Timed Out.");
		history.back();
	}
}
// Load Users from Admin Database
// NOTE: Also called by: admin_RefreshBtn().
function admin_initlist()
{   
    // Build Admin Login Data Table
    
    loadXMLDoc("GET", "/cgi-bin/rsp_loadusers.py", "dummy", function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        //alert("<STATE: " + g_xmlhttp.readyState + " STATUS: " + g_xmlhttp.status + " RESP: " + g_xmlhttp.responseText + ">");
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText != "")
            {
                // Call successful response function here
                var html = [];
                html.push("<table id=\x22tblBody\x22>");
                html.push("<colgroup><col class=\x22c1\x22><col class=\x22c2\x22><col class=\x22c3\x22><col class=\x22c4\x22></colgroup>");
                // Request returns JSON Data Strings
                var pJSON = JSON.parse(g_xmlhttp.responseText);
                for (var i = 0; i < pJSON.length; i++)
                {
                    hstr = "<tr><td class=\x22c1\x22><input type=\x22checkbox\x22></td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22c2\x22 READONLY value=\x22" + pJSON[i].ID + "\x22></td>";
                    hstr += "<td><input type=\x22password\x22 class=\x22c3\x22 value=\x22" + pJSON[i].PW + "\x22></td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22c4\x22 value=\x22" + pJSON[i].EMAIL + "\x22></td></tr>";
                    html.push(hstr);
                }
                html.push("</table>");
                // Load the HTML array into the DOM table body div
                document.getElementById("tblBodyDiv").innerHTML = html.join("\n");
                // Get User Table Row Elements To Highlight
                var tlen = document.getElementById("tblBody").rows.length;
                for (var i = 0; i < tlen; i++)
                {
                    var rx = document.getElementById("tblBody").rows[i];
                    if (rx.cells[1].firstChild.value == g_user)
                    {
                        rx.cells[1].firstChild.className = "cs2";
                        rx.cells[2].firstChild.className = "cs3";
                        rx.cells[3].firstChild.className = "cs4";
                    }
                }
                //setStatus("Enter Data and Select and Action.");
            }
            else
            {
                // GOT A PROCESSING ERROR
                //alert(g_xmlhttp.responseText)
                setStatus("<h2 class=\x22err\x22>ERROR Loading Admin Users.</h2>");
            }
        }
    });
    // Exit to Document Event Loop
}
// HANDLER FUNCTION FOR Add New User BUTTON ONCLICK EVENT
function admin_NewUserBtn()
{
    // Add another record line to the display table
    var itype = "";
    var iclass = "";
    var trow = document.getElementById("tblBody").insertRow(-1);

    for (var i = 0; i < 4; i++)
    {
        var tcell = trow.insertCell(i);
        var new_inp = document.createElement( 'input' );
        
        switch (i)
        {
        case 0:
            tcell.className = "c1"; // Nice to know about this...
            itype = "checkbox";
            iclass = "";
            break;
        case 1:
            itype = "text";
            iclass = "Tc2";         // After input and saved change to "c2".
            break;
        case 2:
            itype = "password";
            iclass = "c3";
            break;
        case 3:
            itype = "text";
            iclass = "c4";
            break;
        }
        new_inp.setAttribute("type", itype);
        new_inp.setAttribute("class", iclass);
        tcell.appendChild(new_inp);
        if (i == 1)
        {
            new_inp.focus();
        }
    }
    trow.scrollIntoView();
}
// HANDLER FUNCTION FOR UPDATE ON "Save Changes" BUTTON ONCLICK EVENT
function admin_UpdUserBtn(mode)
{
    // mode is "DEL" or "UPD"
    // Get target Table Row Elements
    var tlen = document.getElementById("tblBody").rows.length;
    for (var i = 0; i < tlen; i++)
    {
        var rx = document.getElementById("tblBody").rows[i];
        var cx = rx.cells[0].firstChild;
        var cx_id = rx.cells[1].firstChild.value;
        if (mode == "DEL")
        {
            // If element is checked - Delete the entire Row.
            if (cx.checked == true)
            {
                if (cx_id == g_user)
                {
                    alert("Nice Try - You Cannot Delete The Current User!");
                    cx.checked = false;
                    return;
                }
                var rsp = confirm("Permanently DELETE User: " + cx_id + " from the Admin Database?");
                if (rsp == true )
                {
                    update_user(cx_id, "", "", "DEL");
                    //document.getElementById("tblBody").deleteRow(i);
                }
            }
        }
        else
        {
            // Update the Database with row contents
            var cx_pw = rx.cells[2].firstChild.value;
            var cx_em = rx.cells[3].firstChild.value;
            //alert("Updating " + cx_id + " with: " + cx_pw + ", " + cx_em);
            update_user(cx_id, cx_pw, cx_em, "UPD");
            if (rx.cells[1].firstChild.getAttributeNode("class").value == "Tc2")
            {
                rx.cells[1].firstChild.className =  "c2";
            }
        }
    }
}
// Update User Function and Asynchronous Callback
function update_user(p_id, p_pw, p_em, mode)
{
    var pstr;
    
    if ( !p_id )
    {
    	alert("Bad Call to update_user(): Invalid Parameter (p_pid)");
    	return;
    }
    pstr = "LOGID=" + hexercize(p_id);
    if ( mode == "UPD" )
    {
	    if ( p_pw )
	    {
	    	pstr += "&LOGPW=" + hexercize(p_pw);
	    }
	    if (p_em )
	    {
	    	pstr += "&LOGEM=" + hexercize(p_em);
	    }
	    pstr += "&MODE=UPD";
    }
    else if ( mode == "DEL")
    {
    	pstr += "&MODE=DEL";
    }
    else
    {
    	alert("Bad Call to update_user(): Invalid Parameter(s)");
    	return;
    }
    
    loadXMLDoc("POST", "/cgi-bin/rsp_admin.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText == "OK\n")
            {
                // Call successful response function here
                // Refresh the Table to show changes
    			admin_initlist();
                setStatus("Successfully Updated Admin Database.");
            }
            else
            {
                // GOT A PROCESSING ERROR
                //alert(g_xmlhttp.responseText)
                setStatus("<h2 class=\x22err\x22>" + g_xmlhttp.responseText + "</h2>");
            }
        }
    });
}
