let song;
let lyricsData = [];

let lrcLines;
let currentLyric = "";
let lastLoggedLyric = ""; // Track the last logged lyric

function preload() {

  song = loadSound("Yellow_Submarine_Full.mp3");
  lrcLines = loadStrings("Yellow_Submarine_Lyrics.lrc", transcribeLRC); // Load and parse LRC
  print(lrcLines);
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(48);
}

function draw() {
  background(45);

  if (song.isPlaying()) {
    let playbackTime = song.currentTime();
    currentLyric = getCurrentLyric(playbackTime);

    // Log the lyric
    if (currentLyric !== lastLoggedLyric) {
      console.log("Current Lyric:", currentLyric);
      lastLoggedLyric = currentLyric; // Update the last logged lyric
    }
  }

  if (currentLyric) {
    push();

    //under
    textSize(72);
    strokeWeight(28);
    stroke(100, 150, 200); 
    fill(255); 
    text(currentLyric, width / 2, height / 2);
    pop();

    //overlay
    push();
    textSize(72);
    noStroke();
    fill(255, 200, 0);
    text(currentLyric, width / 2 + 1, height / 2 + 2); 
    pop();
  }
}

function mouseClicked() {
  if (!song.isPlaying()) {
    song.play();
  }
}

// Parse the LRC file into lyricsData
function transcribeLRC(lines) {
  for (let i = 0; i < lines.length; i++) {
    // Remove extra spaces
    let line = lines[i].trim(); 

    //skip
    if (
      line.startsWith("[id:") || 
      line.startsWith("[ar:") || 
      line.startsWith("[al:") || 
      line.startsWith("[ti:") || 
      line.startsWith("[length:")
    ) {
      continue;
    }

    // Extract time and text
    // Regular expression
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

// Find the current lyric based on the song playing time
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
