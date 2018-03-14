console.log('requiring quickstart...');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

function init(cb){

	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	    if (err) {
		console.log('Error loading client secret file: ' + err);
		return;
	    }
	    // Authorize a client with the loaded credentials, then call the
	    // Google Sheets API.
	    authorize(JSON.parse(content), listGuests, cb);
	});
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, cb) {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
	    console.log('using existing token');
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, cb);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    console.log('getNewToken...');
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
	    console.log('TOKEN: ', token);
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    console.log('storeToken...');
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
	console.log('Error: ', err);
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listGuests(auth, cb) {
    console.log('listing majors...');
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: '1vkuS3DgGbZGqWSz9-qF-tjxNQxPBPGKigmfASAfTgEk',
        range: 'B9:S500',
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
	console.log('success...');
        var rows = response.values;
        if (rows.length == 0) {
            console.log('No data found.');
        } else {
	    var guests = response.values.map(function(g,i){
		g.unshift(i);
		return g;
	    });
            guests = guests.filter(function(g){
		return g[1];
	    });
	    guests = guests.sort(function(a,b){
                var A = a[2] + a[1];
		var B = b[2] + b[1];
		return A.toLowerCase().localeCompare(B.toLowerCase());
            });
	    //console.log(guests);
	    cb(guests);
        }
    });
}

function writeGuest(data, cb){
	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	    if (err) {
		console.log('Error loading client secret file: ' + err);
		return;
	    }
	    // Authorize a client with the loaded credentials, then call the
	    // Google Sheets API.
	    authorize(JSON.parse(content), 
                function(auth, cb){
		    //var rangeEnd = parseInt(data.guestList) + 3;
	            var rowNum = parseInt(data.guestList)+9;
		    var range = 'RSVP List!M' + rowNum + ':S' + rowNum; 
		    console.log('range:', range);
		    console.log('data:', data);
		    var sheets = google.sheets('v4');
		    var owner = (data.owner)?"YES":""; 
		    var area27 = (data.area27)?"YES":""; 
	            sheets.spreadsheets.values.update({
                        auth: auth,
                        spreadsheetId: '1vkuS3DgGbZGqWSz9-qF-tjxNQxPBPGKigmfASAfTgEk',
                        range: range,
                        valueInputOption: 'USER_ENTERED',
                        resource: {values: [[data.guest,data.guestEmail,data.guestPhone, owner, area27, data.notes, 'YES']]}
                     })/*.then((err, response) => {
                       var result = response.result;
                       console.log(`${result.updatedCells} cells updated.`);
                     });*/
                }, cb);
		cb();
	});

}

module.exports = {
	init: init,
	listGuests: listGuests,
        writeGuest: writeGuest
}
