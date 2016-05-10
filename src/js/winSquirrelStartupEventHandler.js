var app = require("electron");
var spawn  = require("child_process");
var path = require("path");
var exports = module.exports = {};

function run(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
  console.log("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true
  })
    .on("close", done);
}

exports.handleStartupEvent = function() {
  if (process.platform !== "win32") {
    return false;
  }

  var cmd = process.argv[1];
  console.log("Processing squirrel command `%s`", cmd);
  var target = path.basename(process.execPath);
  if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
    run(['--createShortcut=' + target + ''], app.quit);
    return true;
  }
  else if (cmd === "--squirrel-uninstall") {
    run(['--removeShortcut=' + target + ''], app.quit);
    return true;
  }
  else if (cmd === "--squirrel-obsolete") {
    app.quit();
    return true;
  }
  else {
    return false;
  }
};