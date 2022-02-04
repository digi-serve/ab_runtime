const shell = require('shelljs'); 
const STACK = process.argv.length > 2 ? process.argv[2]:'test_ab';

function resetDB(){
	const regEx = /^\S+/;
	const response = shell.exec('docker ps', { silent: true }).grep(`${STACK}_db`);
	if (!regEx.test(response)) {
		console.log(`\ncouldn't find process matching '${STACK}_db'`);
		console.log("\ncurrent processes:\n");
		shell.exec('docker ps');
		process.exit();
	}
	const containerId = response.stdout.match(regEx)[0];
	shell.exec(`docker exec ${containerId} bash reset.sh`);
}
resetDB();
