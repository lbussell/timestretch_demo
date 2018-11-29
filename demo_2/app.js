var context = new AudioContext();

var BUFFER_SIZE = 4096;
var FRAME_SIZE  = 4096;

var players = [];
var playersIdCounter = 0;

var load_local_audio = function(e) {
  if (e.dataTransfer.files.length) {

          // Create file reader
          var reader = new FileReader();
          reader.addEventListener('progress', function (e) {
              console.log(e);
          });
          reader.addEventListener('load', function (e) {
              context.decodeAudioData(e.target.result, function(decodedData) {
                add_player(filename, decodedData);
              });
          });
          reader.addEventListener('error', function () {
              alert('Error reading file');
              console.error('Error reading file');
          });

          var filename = e.dataTransfer.files[0].name;
          reader.readAsArrayBuffer(e.dataTransfer.files[0].slice());

      } else {
          alert('Not a file');
          console.error('Not a file');
      }
}

var add_player = function(title, decodedData) {
  var id = playersIdCounter++;
  var player = new WAAPlayer(context, decodedData, FRAME_SIZE, BUFFER_SIZE);
  var gain = context.createGain();

  var ui = new WAAPlayerUI(id, title, player, gain);
  ui.removeCallback = function() {
    player.disconnect();
    gain.disconnect();
    delete players[id];
  }

  players[id] = {
    player : player,
    gain : gain, 
    ui : ui
  };

  player.connect(gain);
  gain.connect(context.destination);
}

var dd = new DragAndDrop(document.getElementById('drag-and-drop'));
dd.on('drop', load_local_audio);