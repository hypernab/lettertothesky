let r;
let baseFactor = 0;
let n = 2; 
let cols = 4;
let rows = 4;
let total = 200;
let factors = [];
let stars = [];
let audio;
let playButton;
let fft;
let song;
let themeLight = false;

function preload() {
  song = loadSound('acura.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  r = min(width / (cols * 2), height / (rows * 2)) - 10;
  

  for (let i = 0; i < cols * rows; i++) {
    factors.push(n + i);
  }
  
 
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 4),
      speed: random(0.5, 2)
    });
  }
  
  fft = new p5.FFT();
  fft.setInput(song);
  
  // play
  playButton = createButton('A Letter to the Sky?');
  playButton.style('position', 'absolute');
  playButton.style('left', '75%');
  playButton.style('top', '75%');
  playButton.style('transform', 'translate(-50%, -50%)');
  playButton.mousePressed(toggleMusic);
}

function getVector(index, total, radius) {
  const angle = map(index % total, 0, total, 0, TWO_PI);
  const v = p5.Vector.fromAngle(angle + PI);
  v.mult(radius);
  return v;
}

function draw() {
  if (themeLight) {
    background(color('rgb(131, 199, 255)'));
  } else {
    background(color('rgb(0, 0, 0)'));
  }
  drawStars();
  
  let spacingX = (width / 2) / cols; // Left side 
  let spacingY = height / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let xOffset = col * spacingX + spacingX / 2;
      let yOffset = row * spacingY + spacingY / 2;
      let index = row * cols + col;
      drawCardioid(xOffset, yOffset, r, factors[index]);
    }
  }
  
  //  right half
  baseFactor += 0.015;
  drawCardioid(3 * width / 4, height / 2, r * 1.5, n + baseFactor);
  

  drawVisualizer();
}

function drawCardioid(cx, cy, radius, factor) {
  push();
  translate(cx, cy);
  stroke(255, 150);
  strokeWeight(1);
  noFill();
  ellipse(0, 0, radius * 2);

  strokeWeight(1);
  for (let i = 0; i < total; i++) {
    const a = getVector(i, total, radius);
    const b = getVector(i * factor, total, radius);
    line(a.x, a.y, b.x, b.y);
  }
  pop();
}

function drawStars() {
  noStroke();
  fill(255);
  for (let star of stars) {
    ellipse(star.x, star.y, star.size);
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }
}

function drawVisualizer() {
  let wave = fft.waveform();
  noFill();
  stroke(255);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = map(i, 0, wave.length, 3 * width / 4 - r * 1.5, 3 * width / 4 + r * 1.5);
    let y = map(wave[i], -1, 1, height / 2 - r * 2.2, height / 2 - r * 1.7);
    vertex(x, y);
  }
  endShape();
}

function toggleMusic() {
  if (!song.isPlaying()) {
    song.play();
    playButton.html('Pause');
    themeLight = true;
  } else {
    song.pause();
    playButton.html('A Letter to the Sky?');
    themeLight = false;
  }
}
