// var transposer = new RateTransposer(true);
// transposer.rate = 1;

// change stretch.tempo to alter playback speed
var stretch = new Stretch(true);
stretch.tempo = 1;

var context = new AudioContext();
var buffer;

var slide = document.getElementById('slider'),
    sliderDiv = document.getElementById("sliderValue");

function dropHandler(ev) {
    console.log('File(s) dropped');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        var files = ev.dataTransfer.files
        for (var i = 0; i < files.length; i++) {
            var file = files[i]
            var reader = new FileReader()
            reader.addEventListener('load', function(ev) {
                loadSample(ev.target.result);
            })
            reader.readAsArrayBuffer(file)
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        }
    } 
    
    // Pass event to removeDragData for cleanup
    removeDragData(ev)
}

function loadSample(data) {
    context.decodeAudioData(data, function(fileBuffer) {
        buffer = fileBuffer;
        play();
    });
}

var BUFF = 1024;
var samples = new Float32Array(BUFF * 2);
var node = context.createScriptProcessor(BUFF, 2, 2);

node.onaudioprocess = function (e) {
    var l = e.outputBuffer.getChannelData(0);
    var r = e.outputBuffer.getChannelData(1);
    var framesExtracted = f.extract(samples, BUFF);
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

function removeDragData(ev) {
    console.log('Removing drag data');
  
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to remove the drag data
        ev.dataTransfer.items.clear();
    } else {
        // Use DataTransfer interface to remove the drag data
        ev.dataTransfer.clearData();
    }
}

function dragOverHandler(ev) {
    console.log('File(s) in drop zone'); 
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

slide.onchange = function() {
    stretch.tempo = this.value;
    sliderDiv.innerHTML = this.value;
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