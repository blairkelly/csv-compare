var fs = require('fs');

var file1 = 'first.csv';
var file2 = 'second.csv';

console.log(" ");
console.log("CSV Comparer");

var testfor = function (arr, piecesToMatch) {
	var matcher = -1;
	arr.forEach(function (arrItem, i) {
		var matched = 0;
		var arrItemLowerCase = arrItem.toLowerCase().replace('-', '');
		piecesToMatch.forEach(function (ptm) {
			ptm = ptm.toLowerCase();
			if (arrItemLowerCase.indexOf(ptm) > -1) {
				matched++;
			}
		});
		if (matcher < 0 && matched == piecesToMatch.length) {
			matcher = i;
		}
	});
	return matcher;
}

var locs = function (arr) {
	return {
		fn: testfor(arr, ['first', 'name']),
		ln: testfor(arr, ['last', 'name']),
		em: testfor(arr, ['email']),
	}
}

function compare_csvs(csv1, csv2) {
	console.log(' ');
	console.log(' ');
	console.log('Comparing CSVs: ');

	var datmap1 = csv1[0];
	var datmap2 = csv2[0];
	
	var dm1locs = locs(datmap1);
	var dm2locs = locs(datmap2);

	var discrepancy_count = 0;
	for(var i=1; i<csv1.length; i++) {
		var entry_name = csv1[i][dm1locs.fn] + ' ' + csv1[i][dm1locs.ln];
		var entry_email = csv1[i][dm1locs.em];

		//console.log(entry_email);

		var found_flag = false;
		for(var j=0; j<csv2.length; j++) {
			var compare_name = csv2[j][dm2locs.fn] + ' ' + csv2[j][dm2locs.ln];
			var compare_email = csv2[j][dm2locs.em];

			if((entry_email == compare_email) || (entry_name == compare_name)) {
				found_flag = true;
			}
		}

		if(found_flag) {
			//the entry csv1[i] is present in csv2
		} else {
			console.log("[" + i + "] (" + entry_name + ") was NOT FOUND in compare CSV");
			discrepancy_count++;
		}
	}
	console.log("Discrepancy count = " + discrepancy_count);
	console.log(' ');
}


rf(file1, function(data) {
	var csv_1_string = data.toString();
	var csv_1_array = CSVToArray(csv_1_string);
	console.log(csv_1_array.length);

	rf(file2, function(data) {
		var csv_2_string = data.toString();
		var csv_2_array = CSVToArray(csv_2_string);
		console.log(csv_2_array.length);

		compare_csvs(csv_1_array, csv_2_array);
		compare_csvs(csv_2_array, csv_1_array);
	});
});



function rf(thefile, docallback) {
    fs.readFile(thefile, function (err,data) {
        if (err) throw err;
        if(docallback) {
          docallback(data);
        }
    });
}






// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];

	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;


	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];

		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );

		}


		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}
