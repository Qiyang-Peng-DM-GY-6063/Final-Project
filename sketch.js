let song;
let lyricsData = [];
let lrcLines;

let currentLyric = "";
let lastLoggedLyric = "";

let mFFT;
let energyH, energyM, energyB;

let potHValue = 20; 
let potMValue = 45; 
let potBValue = 50;

let mSerial;
let connectButton;

let pg;

// high, mid, base
let colorPalettes = [
  [
    [114,161,246], [168,221,236], [117,100,248]
  ],
  [
    [125,246,114], [168,236,176], [151,250,100]
  ],
  [
    [246,114,220], [236,168,216], [248,100,186]
  ],
  [
    [246,114,114], [236,175,168], [248,131,100]
  ],
  [
    [240,246,114], [236,220,168], [248,216,100]
  ]
];

let currentPalette;
let currentFont;

let fonts = ["Arial", "Verdana", "Times New Roman", "Georgia", "Courier New", "Helvetica"];

// Variables to track song end and restart
let songEnded = false;

function preload() {
  song = loadSound("Yellow_Submarine_Full.mp3");
  lrcLines = loadStrings("Yellow_Submarine_Lyrics.lrc", transcribeLRC); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textFont('Helvetica');

  mFFT = new p5.FFT();

  // Initialize serial
  mSerial = createSerial(); 
  connectButton = createButton("Connect To Serial");
  connectButton.position(20, 20);
  connectButton.mousePressed(connectToSerial);

  // buffer
  pg = createGraphics(windowWidth, windowHeight);
  pg.textAlign(CENTER, CENTER);
  pg.textFont('Helvetica');

  console.log("Setup complete");

  frameRate(2.1);
}

function draw() {
  // Update pot values from serial if available
  if (mSerial.opened() && mSerial.availableBytes() > 0) {
    receiveSerial();
  }

  if (song.isPlaying()) {
    let playbackTime = song.currentTime();
    currentLyric = getCurrentLyric(playbackTime);

    // If lyric changed and is not empty, pick a random palette and font
    if (currentLyric !== lastLoggedLyric && currentLyric !== "") {
      console.log("Current Lyric:", currentLyric);
      lastLoggedLyric = currentLyric;
      currentPalette = random(colorPalettes);
      currentFont = random(fonts);
    }

    // stop
    if (playbackTime >= song.duration()) {
      songEnded = true;
      song.stop();
    }
  } else {
 
  }

  mFFT.analyze();
  energyH = mFFT.getEnergy("highMid")*5;
  energyM = mFFT.getEnergy("mid")*5;
  energyB = mFFT.getEnergy("bass")*5;
  // print(energyH);

  // Clear the screen when end
  if (songEnded) {
    background(0);
    fill(255);
    textSize(36);
    text("Press R to restart", width/2, height/2);
    return; 
  }

  // Gradually darken previous content
  pg.fill(0, 10); 
  pg.noStroke();
  pg.rect(0, 0, width, height);

  drawLyricsOntoPG(pg);
  image(pg, 0, 0);
}


function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);
    connectButton.hide();
    console.log("Connected to serial port");
  }
}

function receiveSerial() {
  let line = mSerial.readUntil("\n");
  if (!line) return;
  line = trim(line);
  if (line.length === 0) return;

  let parts = line.split(" ");
  if (parts.length === 3) {
    let valH = parseInt(parts[0], 10);
    let valM = parseInt(parts[1], 10);
    let valB = parseInt(parts[2], 10);

    // if (!isNaN(valH)) 
    potHValue = 20 + map(valH, 0, 4096, 0, 120);
    // if (!isNaN(valM))
    potMValue = 45 + map(valM, 0, 4096, 0, 95);
    // if (!isNaN(valB))
    potBValue = 50 + map(valB, 0, 4096, 0, 90);

    console.log("Pot Values:", potHValue, potMValue, potBValue);
  }
}

// Parse LRC file
function transcribeLRC(lines) {
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    // Skip meta lines
    if (
      line.startsWith("[id:") || 
      line.startsWith("[ar:") || 
      line.startsWith("[al:") || 
      line.startsWith("[ti:") || 
      line.startsWith("[length:")
    ) {
      continue;
    }

    let timeRegex = /\[(\d{2}):(\d{2}\.\d{2})\]/;
    let match = line.match(timeRegex);
    if (match) {
      let minutes = parseInt(match[1]);
      let seconds = parseFloat(match[2]);
      let totalTime = minutes * 60 + seconds;
      let lyricText = line.replace(timeRegex, "").trim(); 
      if (lyricText) {
        lyricsData.push({ time: totalTime, text: lyricText });
      }
    }
  }
  console.log("Parsed lyrics data:", lyricsData);
}

function getCurrentLyric(playbackTime) {
  let activeLine = "";
  for (let i = 0; i < lyricsData.length; i++) {
    if (playbackTime >= lyricsData[i].time) {
      activeLine = lyricsData[i].text;
    } else {
      break; 
    }
  }
  return activeLine;
}

function drawLyricsOntoPG(pg) {
  if (!currentLyric) return;

  let currentIndex = lyricsData.findIndex(line => line.text === currentLyric);
  let linesBefore = 2;
  let linesAfter = 2;
  let lineSpacing = 180;
  let centerY = height / 2;

  pg.push();
  pg.textAlign(CENTER, CENTER);

  // // Previous lyrics
  // for (let i = currentIndex - 1; i >= currentIndex - linesBefore && i >= 0; i--) {
  //   let lineY = centerY - (lineSpacing * (currentIndex - i));
  //   pg.push();
  //   pg.textSize(24);
  //   pg.fill(255, 200, 70, 100);
  //   pg.strokeWeight(10);
  //   pg.stroke(75, 30);
  //   pg.text(lyricsData[i].text, width / 2, lineY);
  //   pg.pop();
  // }

  // // Following lyrics
  // for (let i = currentIndex + 1; i <= currentIndex + linesAfter && i < lyricsData.length; i++) {
  //   let lineY = centerY + (lineSpacing * (i - currentIndex));
  //   pg.push();
  //   pg.textSize(24);
  //   pg.fill(255, 200, 70, 100);
  //   pg.strokeWeight(10);
  //   pg.stroke(75, 30);
  //   pg.text(lyricsData[i].text, width / 2, lineY);
  //   pg.pop();
  // }

  // Draw current
  let lyricSize = 96;
  pg.push();
  pg.translate(width / 2, centerY);
  let angle = random(-0.12, 0.12); 
  pg.rotate(angle);

  let highColor = currentPalette ? currentPalette[0] : [100,160,255];
  let midColor = currentPalette ? currentPalette[1] : [170,255,236];
  let baseColor = currentPalette ? currentPalette[2] : [132,110,255];

  if (currentFont) pg.textFont(currentFont);
  pg.textStyle(BOLD);

  // Base 
  pg.strokeWeight(potBValue + map(energyB, 0, 1000, 1, 50));
  pg.stroke(baseColor[0], baseColor[1], baseColor[2], 220); 
  pg.fill(255);
  pg.textSize(lyricSize);
  pg.text(currentLyric, 0, 0);

  // Mid 
  pg.strokeWeight(potMValue + map(energyM, 0, 1000, 1, 50)); 
  pg.stroke(midColor[0], midColor[1], midColor[2],220); 
  pg.fill(255);
  pg.text(currentLyric, 0, 0);

  // High 
  pg.strokeWeight(potHValue + map(energyH, 0, 1000, 1, 50)); 
  pg.stroke(highColor[0], highColor[1], highColor[2],220); 
  pg.fill(255);
  pg.text(currentLyric, 0, 0);

  // Front fill
  pg.noStroke();
  pg.fill(20,20,30,220);
  pg.text(currentLyric, 0, 0);

  pg.pop();
}

function mouseClicked() {
  if (!song.isPlaying() && !songEnded) {
    song.play();
  }
}

// Restart
function keyPressed() {
  if (key === 'r' || key === 'R') {
    if (songEnded) {
      songEnded = false;
      lastLoggedLyric = "";
      currentLyric = "";
      song.play();
      pg.background(35);
    }
  }
}