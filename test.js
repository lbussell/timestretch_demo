// var transposer = new RateTransposer(true);
// transposer.rate = 1;

// change stretch.tempo to alter playback speed
var stretch = new Stretch(true);
stretch.tempo = 1;

var context = new AudioContext();
var buffer;

function loadSample(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      context.decodeAudioData(request.response, function(data) {
        buffer = data;
        play();
      })
    }
    request.send();
}

loadSample('track.mp3')

var BUFFER_SIZE = 1024;
var samples = new Float32Array(BUFFER_SIZE * 2);
var node = context.createScriptProcessor(BUFFER_SIZE, 2, 2);

node.onaudioprocess = function (e) {
    var l = e.outputBuffer.getChannelData(0);
    var r = e.outputBuffer.getChannelData(1);
    var framesExtracted = f.extract(samples, BUFFER_SIZE);
    if (framesExtracted == 0) {
        pause();
    }
    for (var i = 0; i < framesExtracted; i++) {
        l[i] = samples[i * 2];
        r[i] = samples[i * 2 + 1];
    }
};

function play() {
    node.connect(context.destination);
}

function pause() {
    node.disconnect();
}

var source = {
    extract: function (target, numFrames, position) {
        var l = buffer.getChannelData(0);
        var r = buffer.getChannelData(1);
        for (var i = 0; i < numFrames; i++) {
            target[i * 2] = l[i + position];
            target[i * 2 + 1] = r[i + position];
        }
        return Math.min(numFrames, l.length - position);
    }
};

f = new SimpleFilter(source, stretch);