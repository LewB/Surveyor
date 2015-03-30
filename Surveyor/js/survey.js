/************************************************************
 * FILE NAME: survey.js
 * AUTHOR: ALB
 * USAGE: Included in survey.html
 * FUNCTIONAL DESCRIPTION:
 * This File supports survey.html
 *-----------------------------------------------------------
 * MODIFICATION HISTORY:
 * 03-08-2015-ALB: Created file.
 *************************************************************
 */
// *************** GLOBALS **********************************
var g_survey;
var g_sb_hdr;
//
// CHECK FOR VALID LOGIN
function survey_login()
{
	check_login("url", location.search, survey_init);
	// survey_init() will be called asynchronously by HTTPRequest
	// after it Returns from processing the request
	// IMPORTANT: Nothing stops DOC flow before next event loop
}
// Initialize the Survey Page
function survey_init(result)
{
	if ( result == false )
	{
		// False: Keys DON'T Match - Stale Login or Unauthorized User
		alert("You Are Not Logged In or Your Login Timed Out.");
        // if User logged in, Log out while we can
    	user_logout(g_user);
    	 // Clean Up Globals
    	g_user = null;
    	g_logkey = null;
    	g_urlSearch = null;
		history.back();
	}
	// True: Keys Matched - Go ahead and Initialize the Doc
    document.getElementById("svyUser").innerHTML = g_user;
    
  	// SET LISTENER FOR ADD SURVEY HEADER BUTTON
	document.getElementById("hdraddbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	svyNewRecBtn("H");
  	});
  	// SET LISTENER FOR DELETE SURVEY HEADER BUTTON
	document.getElementById("hdrdelbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	svyUpdRecBtn("H", "DEL");
  	});
  	// SET LISTENER FOR SAVE SURVEY HEADER BUTTON
	document.getElementById("hdrsavbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	svyUpdRecBtn("H", "UPD");
  	});
  	// SET LISTENER FOR RELOAD SURVEY HEADER BUTTON
	document.getElementById("hdrrelbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	surveyHdr_list();
  	});
  	// SET LISTENER FOR ADD SURVEY DETAIL BUTTON
	document.getElementById("dtladdbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	svyNewRecBtn("D");
  	});
  	// SET LISTENER FOR DELETE SURVEY DETAIL BUTTON
	document.getElementById("dtldelbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	svyUpdRecBtn("D", "DEL");
  	});
  	// SET LISTENER FOR SAVE SURVEY DETAIL BUTTON
	document.getElementById("dtlsavbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	svyUpdRecBtn("D", "UPD");
  	});
  	// SET LISTENER FOR RELOAD SURVEY DETAIL BUTTON
	document.getElementById("dtlrelbtn").addEventListener("click", function(e) {
    	e.preventDefault();
    	surveyDtl_list();
  	});
  	// Display Available Surveys to Manage
	surveyHdr_list();
}
// Load Surveys from Database
function surveyHdr_list()
{
	var hstr = "";
	var html = [];
	
	// Build Survey Header Table Header and Detail Table Header
	html.push("<table id=\x22svyHdrHdrTbl\x22>");
	html.push("<colgroup><col class=\x22ck1\x22><col class=\x22h_c2\x22>"
		+ "<col class=\x22h_c3\x22><col class=\x22h_c4\x22><col class=\x22h_c5\x22>"
		+ "<col class=\x22h_c6\x22><col class=\x22h_c7\x22><col class=\x22h_c8\x22></colgroup>");
	html.push("<tr><td><input type=\x22checkbox\x22 disabled/></td><td>CODE</td><td>OWNER</td>"
		+ "<td>STS</td><td>TYP</td><td>NAME</td><td>DESCRIPTION</td><td>SKIN</td></tr>");
	html.push("</table>");
	document.getElementById("svyHdrHdrDiv").innerHTML = html.join("\n");
	// Clear HTML buffer array
	while ( html.length > 0 )
	{
		html.pop();
	}
    html.push("<table id=\x22svyDtlHdrTbl\x22>");
	html.push("<colgroup><col class=\x22dk1\x22><col class=\x22d_c2\x22>"
		+ "<col class=\x22d_c3\x22><col class=\x22d_c4\x22><col class=\x22d_c5\x22>"
		+ "<col class=\x22d_c6\x22><col class=\x22d_c7\x22><col class=\x22d_c8\x22>"
		+ "<col class=\x22d_c9\x22><col class=\x22d_c10\x22><col class=\x22d_c11\x22></colgroup>");
	html.push("<tr><td><input type=\x22checkbox\x22 disabled/></td><td>SEQ</td><td>TYP</td>"
		+ "<td>TITLE</td><td>DESCRIPTION</td><td>LABEL</td><td>MIN</td><td>MAX</td>"
		+ "<td>B1</td><td>B2</td><td>B3</td></tr>");
	html.push("</table>");
	document.getElementById("svyDtlHdrDiv").innerHTML = html.join("\n");
	
    // Build Survey Header Data Table
    var pstr = "SURVEY=*&SVPART=HEADER&SVOWNER=" + g_user;
    
    loadXMLDoc("POST", "/cgi-bin/rsp_loadsurvey.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: >>>" + g_xmlhttp.responseText + "<<<");
            if (g_xmlhttp.responseText != "")
            {
                // Call successful response function here
				// Clear HTML buffer array
                while ( html.length > 0 )
                {
                	html.pop();
                }
                // Build header table
                html.push("<table id=\x22svyHdrTblBody\x22>");
                html.push("<colgroup><col class=\x22ck1\x22><col class=\x22h_c2\x22>"
                	+ "<col class=\x22h_c3\x22><col class=\x22h_c4\x22><col class=\x22h_c5\x22>"
                	+ "<col class=\x22h_c6\x22><col class=\x22h_c7\x22><col class=\x22h_c8\x22>"
                	+ "</colgroup>");
                // Request returns JSON Data Strings
                var clsPfx = "";
                var pJSON = JSON.parse(g_xmlhttp.responseText);
                for (var i = 0; i < pJSON.length; i++)
                {
                	//alert("Got a JSON Row for: " + pJSON[i].SH_CODE);
                	// Set up appropriate CSS Class for Row if Selected
                	clsSfx = "";
                	if ( g_survey && g_survey == pJSON[i].SH_CODE )
                	{
                		clsSfx = "s";
                	}
                    hstr = "<tr onclick=\x22headerTableRowClick(this);\x22>" 
                    		+ "<td class=\x22ck1\x22><input type=\x22checkbox\x22 value=\x22"
                    		+ pJSON[i].SH_ROWID + "\x22</td>";
                	hstr += "<td><input type=\x22text\x22 class=\x22h_c2" + clsSfx + "\x22 value=\x22" 
                				+ pJSON[i].SH_CODE + "\x22</td>";
                	hstr += "<td><input type=\x22text\x22 READONLY class=\x22h_ro" + clsSfx + "\x22 value=\x22" 
                				+ pJSON[i].SH_OWNER + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22h_c4" + clsSfx + "\x22 value=\x22" 
                    			+ pJSON[i].SH_STATUS + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22h_c5" + clsSfx + "\x22 value=\x22" 
                    			+ pJSON[i].SH_TYPE + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22h_c6" + clsSfx + "\x22 value=\x22" 
                    			+ pJSON[i].SH_NAME + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22h_c7" + clsSfx + "\x22 value=\x22" 
                    			+ pJSON[i].SH_DESC + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22h_c8" + clsSfx + "\x22 value=\x22" 
                    			+ pJSON[i].SH_SKIN + "\x22</td></tr>";
                    html.push(hstr);
                }
                html.push("</table>");
                // Load the HTML array into the DOM table body div
                //alert("HTML:\n"+html.join("\n"));
                document.getElementById("svyHdrTblDiv").innerHTML = html.join("\n");
                //setStatus("Enter Data and Select and Action.");
            }
            else
            {
                // GOT A PROCESSING ERROR
                alert("Load Header Error: " + g_xmlhttp.responseText);
                setStatus("<h2 class=\x22err\x22>ERROR Loading User's Survey Header Data.</h2>");
            }
        }
    });
}
// Load Survey Detail Rows from Database
function surveyDtl_list()
{
	var hstr = "";
	var html = [];
	
	if ( !g_survey )
	{
		alert("Must Select Survey to Display Detail for.");
		return;
	}
	
	// Build Survey Body Data Table;
    var pstr = "SURVEY=" + g_survey + "&SVPART=BODY";
    
    loadXMLDoc("POST", "/cgi-bin/rsp_loadsurvey.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
            //alert("HTTPresp: " + g_xmlhttp.responseText);
            if (g_xmlhttp.responseText != "")
            {
                // Call successful response function here
                
                // Build header table
                html.push("<table id=\x22svyDtlTblBody\x22>");
                html.push("<colgroup><col class=\x22dk1\x22><col class=\x22d_c2\x22>" 
                		+ "<col class=\x22d_c3\x22><col class=\x22d_c4\x22><col class=\x22d_c5\x22>" 
                		+ "<col class=\x22d_c6\x22><col class=\x22d_c7\x22><col class=\x22d_c8\x22>" 
                		+ "<col class=\x22d_c9\x22><col class=\x22d_c10\x22><col class=\x22d_c11\x22>" 
                		+ "</colgroup>");
                // Request returns JSON Data Strings
                var pJSON = JSON.parse(g_xmlhttp.responseText);
                for (var i = 0; i < pJSON.length; i++)
                {
                    hstr = "<tr><td class=\x22dk1\x22><input type=\x22checkbox\x22 value=\x22"
                    			+ pJSON[i].SB_ROWID + "\x22</td>";
                	hstr += "<td><input type=\x22text\x22 class=\x22d_c2\x22 value=\x22" 
                				+ pJSON[i].SB_SEQ + "\x22</td>";
                	hstr += "<td><input type=\x22text\x22 class=\x22d_c3\x22 value=\x22" 
                				+ pJSON[i].SB_TYPE + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c4\x22 value=\x22" 
                    			+ pJSON[i].SB_TITLE + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c5\x22 value=\x22" 
                    			+ pJSON[i].SB_DESC + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c6\x22 value=\x22" 
                    			+ pJSON[i].SB_LABEL + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c7\x22 value=\x22" 
                    			+ pJSON[i].SB_MIN + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c8\x22 value=\x22" 
                    			+ pJSON[i].SB_MAX + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c9\x22 value=\x22" 
                    			+ pJSON[i].SB_BTN_1 + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c10\x22 value=\x22" 
                    			+ pJSON[i].SB_BTN_2 + "\x22</td>";
                    hstr += "<td><input type=\x22text\x22 class=\x22d_c11\x22 value=\x22" 
                    			+ pJSON[i].SB_BTN_3 + "\x22</td></tr>";
                    html.push(hstr);
                }
                html.push("</table>");
                // Load the HTML array into the DOM table body div
                //alert("HTML:\n"+html.join("\n"));
                document.getElementById("svyDtlTblDiv").innerHTML = html.join("\n");
                //setStatus("Enter Data and Select and Action.");
            }
            else
            {
                // GOT A PROCESSING ERROR
                alert(g_xmlhttp.responseText);
                setStatus("<h2 class=\x22err\x22>ERROR Loading Survey Detail Data.</h2>");
            }
        }
    });
	
}
// Header Row Click Function
function headerTableRowClick(row)
{
	var trows = document.getElementById("svyHdrTblBody").rows;
	
	for ( i = 0; i < trows.length; i++ )
	{
		var rc = trows[i].cells;
		for ( j = 0; j < rc.length; j++ )
		{
			// var cell = row.getElementsByTagName("td")[1];
			if ( trows[i] == row )
			{
				// Store Current Survey ROWID and Name
				if ( j == 0 )
				{
					// Very IMPORTANT - Used to Update Body Detail Records
					g_sb_hdr = rc[j].firstChild.value;
				}
			    if ( j == 1 )
			    {
			    	//g_survey = row.cells[i].firstChild.value;
			    	g_survey = rc[j].firstChild.value;
			    	document.getElementById("svyCodeTxt").innerHTML = g_survey;
			    }
			    // Highlight Selected Row
			    if ( j > 0 )
			    {
			    	if ( j == 2 )	// OWNER
			    	{
			    		rc[j].firstChild.className = "h_ros";
			    	}
			    	else
			    	{
			    		rc[j].firstChild.className = "h_c" + (i + 1) + "s";
			    	}
			    }
			}
			else
			{
				// De-Highlight Unselected Row
				if ( j > 0 )
			    {
			    	if ( j == 2 )	// OWNER
			    	{
			    		rc[j].firstChild.className = "h_ro";
			    	}
			    	else
			    	{
			    		rc[j].firstChild.className = "h_c" + (i + 1);
			    	}
			    }
			}
		}
	}
	// Show Survey Body Detail for Selected Survey
	surveyDtl_list();
}
// HANDLER FUNCTION FOR Add New User BUTTON ONCLICK EVENT
function svyNewRecBtn(part)
{
    // Add another record line to the display table
    // part "H" = HEADER, part "D" = DETAIL
    
    if ( part == "H" )
    {
    	var tblName = "svyHdrTblBody";
    	var chkCls = "ck1";
    	var clsPfx = "h_c";
    	var celCnt = 8;
    }
    else if ( part == "D" )
    {
    	var tblName = "svyDtlTblBody";
    	var chkCls = "dk1";
    	var clsPfx = "d_c";
    	var celCnt = 11;
    	if ( !g_survey )
		{
			alert("Must Select Survey to Create Detail for.");
			return;
		}
    }
    else
    {
    	alert("Invalid Parameter Passed to svyNewRecBtn().");
    	return;
    }
    
    var itype = "";
    var iclass = "";
    
    var trow = document.getElementById(tblName).insertRow(-1);

    for (var i = 1; i <= celCnt; i++)
    {
        var tcell = trow.insertCell(i-1);
        var new_inp = document.createElement( 'input' );
        
        if ( i == 1 )
        {
            tcell.className = chkCls; // Nice to know about this...
            itype = "checkbox";
            iclass = "";
            if ( g_sb_hdr )
            {
            	new_inp.value = g_sb_hdr;
            }
            else
            {
            	new_inp.value = 0;
            }
        }
        else
        {
            itype = "text";
            iclass = clsPfx + i.toString();
        }
        if( itype )
        {
        	new_inp.setAttribute("type", itype);
        }
        if ( iclass )
        {
        	new_inp.setAttribute("class", iclass);
        }
        tcell.appendChild(new_inp);
        if (i == 2)
        {
            new_inp.focus();
        }
    }
    trow.scrollIntoView();
}
// HANDLER FUNCTION FOR UPDATE ON "Save Changes" BUTTON ONCLICK EVENT
function svyUpdRecBtn(part, mode)
{
    // mode is "DEL" or "UPD"
    // Get target Table Row Elements
    // part "H" = HEADER, part "D" = DETAIL
    
    if ( part == "H" )
    {
    	var tblName = "svyHdrTblBody";
    }
    else if ( part == "D" )
    {
    	var tblName = "svyDtlTblBody";
    }
    else
    {
    	alert("Invalid Parameter [part] Passed to svyUpdRecBtn().");
    	return;
    }
    
    var rjdata;
    var txr = document.getElementById(tblName).rows;
    
    if (mode == "DEL")
    {
	    for (var i = 0; i < txr.length; i++)
	    {
            // If element is checked - Delete the entire Row.
            var cx = txr[i].cells[0].firstChild;
            if (cx.checked == true)
            {
            	var rsp = false;
                if ( part == "H" )
                {
                	var cx_id = txr[i].cells[1].firstChild.value;
                	rsp = confirm("Permanently DELETE ALL HEADER AND DETAIL Records For " 
                							+ "Survey: " + cx_id + " from the Survey Database?");
                	if ( rsp == true )
	                {
	                	// The Unique HEADER DB Row ID in first Column of Child Records
	                	// Delete ALL Records with SB_HDR eq Value of Input Checkbox in Row
	                	rjdata = "[{\x22SH_ROWID\x22:\x22" + cx.value + "\x22,\x22SH_CODE\x22:\x22" + cx_id + "\x22}]";
	                	update_rec(part, mode, cx_id, rjdata);
	                	if ( mode == "DEL" )
			    		{
			    			document.getElementById("svyDtlTblDiv").innerHTML = "";
			    			g_survey = null;
	                		g_sb_hdr = null;
			    			//surveyDtl_list();
			    		}
	                }
	            }
	            else if ( part == "D" )
	            {
	            	var cx_id = cx.value; // The Unique Sqlite3 DB Row ID of Detail Rec
	            	var svCode = document.getElementById("svyCodeTxt").innerHTML; // For Confirm Below Only
	            	rsp = confirm("Permanently DELETE This DETAIL Record For: " 
	            									+ "Survey: " + svCode + " from the Survey Data Base?");
	            	if ( rsp == true )
	                {
		            	// SB_SEQ to complete unique key
		            	rjdata = "[{\x22SB_ROWID\x22:\x22" + cx_id + "\x22,\x22SH_CODE\x22:\x22" + svCode + "\x22}]";
		            	update_rec(part, mode, "", rjdata);
		            }
	            }
            }
        }
    }
    else
    {
        // UPDATE the Database with ALL row contents
        rjdata = JSON_data(part, txr);
        update_rec(part, mode, "", rjdata);
    }
}
// Update User Function and Asynchronous Callback
function update_rec(part, mode, p_id, data)
{
    var urldata = [];
    var pstr = "";
    
    urldata.push(encodeURIComponent("SURVEY") + "=" + encodeURIComponent(p_id));
    if ( part == "H" )
    {
 		urldata.push(encodeURIComponent("SVPART") + "=" + encodeURIComponent("HEADER"));
	}
	else if ( part == "D" )
	{
		urldata.push(encodeURIComponent("SVPART") + "=" + encodeURIComponent("BODY"));
	}
	else
	{
		alert("Error - Function update_rec(): Bad [part] parameter.");
		return;
	}
    urldata.push(encodeURIComponent("SVMODE") + "=" + encodeURIComponent(mode));
    urldata.push(encodeURIComponent("SVDATA") + "=" + encodeURIComponent(data));
    pstr = urldata.join('&').replace(/%20/g, '+');
    alert("UPDATE pstr: " + pstr);
    loadXMLDoc("POST", "/cgi-bin/rsp_survey.py", pstr, function()
    {
        // HTTP GET REQUEST ASYNCHRONOUS CALLBACK FUNCTION
        if (g_xmlhttp.readyState == 4 && g_xmlhttp.status == 200)
        {
       		//alert("UPDATE HTTPresp: ->" + g_xmlhttp.responseText + "<-");
            if (g_xmlhttp.responseText == "OK\n")
            {
                // Call successful response function here
                setStatus("Successfully Updated Survey Database.");
                // Refresh the Table to show changes
			    if ( part == "H" )
			    {
			    	surveyHdr_list();
				}
			    else if ( part == "D" )
			    {
			    	surveyDtl_list();
			    }
            }
            else
            {
                // GOT A PROCESSING ERROR
               	alert("RSP: " + g_xmlhttp.responseText);
                setStatus("<h2 class=\x22err\x22>" + g_xmlhttp.responseText + "</h2>");
            }
        }
    });
}
// Function to pack header data in JSON format
// Call with table rows element as rows parameter
function JSON_data(part, rows)
{
	var data = "[";
	if ( part == "H" )
	{
		for ( var i = 0; i < rows.length; i++ )
		{
			data += "{\x22SH_ROWID\x22:\x22" + rows[i].cells[0].firstChild.value + "\x22," 
					+ "\x22SH_CODE\x22:\x22" + rows[i].cells[1].firstChild.value + "\x22," 
					+ "\x22SH_OWNER\x22:\x22" + rows[i].cells[2].firstChild.value + "\x22," 
					+ "\x22SH_STATUS\x22:\x22" + rows[i].cells[3].firstChild.value + "\x22," 
					+ "\x22SH_TYPE\x22:\x22" + rows[i].cells[4].firstChild.value + "\x22," 
					+ "\x22SH_NAME\x22:\x22" + rows[i].cells[5].firstChild.value + "\x22," 
					+ "\x22SH_DESC\x22:\x22" + rows[i].cells[6].firstChild.value + "\x22," 
					+ "\x22SH_SKIN\x22:\x22" + rows[i].cells[7].firstChild.value + "\x22}";
			if ( i < rows.length - 1 )
			{
				data += ",";
			}
		}
	}
	else if ( part == "D" )
	{
		for ( var i = 0; i < rows.length; i++ )
		{
			data += "{\x22SB_ROWID\x22:\x22" + rows[i].cells[0].firstChild.value + "\x22," 
					+ "\x22SB_HDR\x22:\x22" + g_sb_hdr + "\x22," 
					+ "\x22SB_SEQ\x22:\x22" + rows[i].cells[1].firstChild.value + "\x22," 
					+ "\x22SB_TYPE\x22:\x22" + rows[i].cells[2].firstChild.value + "\x22," 
					+ "\x22SB_TITLE\x22:\x22" + rows[i].cells[3].firstChild.value + "\x22," 
					+ "\x22SB_DESC\x22:\x22" + rows[i].cells[4].firstChild.value + "\x22," 
					+ "\x22SB_LABEL\x22:\x22" + rows[i].cells[5].firstChild.value + "\x22," 
					+ "\x22SB_MIN\x22:\x22" + rows[i].cells[6].firstChild.value + "\x22," 
					+ "\x22SB_MAX\x22:\x22" + rows[i].cells[7].firstChild.value + "\x22," 
					+ "\x22SB_BTN_1\x22:\x22" + rows[i].cells[8].firstChild.value + "\x22," 
					+ "\x22SB_BTN_2\x22:\x22" + rows[i].cells[9].firstChild.value + "\x22," 
					+ "\x22SB_BTN_3\x22:\x22" + rows[i].cells[10].firstChild.value + "\x22}";
			if ( i < rows.length - 1 )
			{
				data += ",";
			}
		}
	}
	data += "]";
	return(data);
}
