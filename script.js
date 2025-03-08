let r;
let baseFactor = 0;
let n = 2; // where we start our tables
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
let isDragging = false; // need this to track dragging state

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
  
  playButton = createButton('A Letter to the Sky?');
  playButton.style('position', 'absolute');
  playButton.style('left', '75%');
  playButton.style('top', '75%');
  playButton.style('transform', 'translate(-50%, -50%)');
  playButton.style('cursor', 'pointer');
  playButton.mousePressed(toggleMusic);

  let noteIcon = createButton('📝');
  noteIcon.style('position', 'absolute');
  noteIcon.style('left', '97%');
  noteIcon.style('top', '5%');
  noteIcon.style('transform', 'translate(-50%, -50%)');
  noteIcon.style('font-size', '30px');
  noteIcon.style('background', 'transparent');
  noteIcon.style('border', 'none');
  noteIcon.style('cursor', 'pointer');
  noteIcon.mousePressed(createStickyNote);
  
  // gotta make sure drag always ends properly
  window.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener('mousemove', window.currentMoveHandler);
      window.currentMoveHandler = null;
    }
  });
}

function getVector(index, total, radius) {
  const angle = map(index % total, 0, total, 0, TWO_PI);
  const v = p5.Vector.fromAngle(angle + PI);
  v.mult(radius);
  return v;
}

function draw() {
  if (themeLight) {
    background(color('rgb(131, 199, 255)')); // nice sky blue
  } else {
    background(color('rgb(0, 0, 0)')); // dark night
  }
  drawStars();
  
  let spacingX = (width / 2) / cols;
  let spacingY = height / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let xOffset = col * spacingX + spacingX / 2;
      let yOffset = row * spacingY + spacingY / 2;
      let index = row * cols + col;
      drawCardioid(xOffset, yOffset, r, factors[index]);
    }
  }
  
  baseFactor += 0.015; // slow mesmerizing rotation
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
    themeLight = true; // day time when music plays
  } else {
    song.pause();
    playButton.html('A Letter to the Sky?');
    themeLight = false; // back to night
  }
}

function createStickyNote() {
  // make a nice note container
  let noteContainer = createDiv('');
  noteContainer.id('note-' + random(10000)); // random ID so we don't clash
  noteContainer.style('position', 'absolute');
  noteContainer.style('left', '50%');
  noteContainer.style('top', '50%');
  noteContainer.style('min-width', '300px'); 
  noteContainer.style('min-height', '200px');
  noteContainer.style('max-width', '600px');
  noteContainer.style('background', 'rgb(255, 255, 255)');
  noteContainer.style('border', '1px solid #000');
  noteContainer.style('box-shadow', '2px 2px 10px rgba(0, 0, 0, 0.3)');
  noteContainer.style('resize', 'both');
  noteContainer.style('display', 'flex');
  noteContainer.style('flex-direction', 'column');
  noteContainer.style('overflow', 'hidden');
  
  // header for dragging around
  let noteHeader = createDiv('');
  noteHeader.parent(noteContainer);
  noteHeader.style('width', '100%');
  noteHeader.style('height', '20px');
  noteHeader.style('background-color', '#f0f0f0');
  noteHeader.style('border-bottom', '1px solid #ddd');
  noteHeader.style('cursor', 'move');
  noteHeader.style('position', 'relative'); // added for absolute positioning of close button
  
  // add close button (X) to top right
  let closeButton = createButton('✕');
  closeButton.parent(noteHeader);
  closeButton.style('position', 'absolute');
  closeButton.style('right', '5px');
  closeButton.style('top', '0px');
  closeButton.style('background', 'transparent');
  closeButton.style('border', 'none');
  closeButton.style('cursor', 'pointer');
  closeButton.style('font-size', '14px');
  closeButton.style('color', '#555');
  closeButton.style('padding', '0px 5px');
  closeButton.style('line-height', '20px');
  closeButton.style('z-index', '10');
  
  // close the note when X is clicked
  closeButton.mousePressed(() => {
    noteContainer.remove();
  });
  
  // add hover effect for the X
  closeButton.mouseOver(() => {
    closeButton.style('color', '#000');
  });
  
  closeButton.mouseOut(() => {
    closeButton.style('color', '#555');
  });
  
  // where you actually type stuff
  let note = createDiv('Write your letter?..');
  note.parent(noteContainer);
  note.style('flex', '1');
  note.style('width', '100%');
  note.style('min-height', '140px');
  note.style('padding', '10px');
  note.style('box-sizing', 'border-box');
  note.style('overflow', 'auto');
  note.style('word-wrap', 'break-word');
  note.attribute('contenteditable', 'true');
  note.style('cursor', 'text');
  
  // pretty send button
  let sendButton = createButton('Send me your note! (if you want to)');
  sendButton.parent(noteContainer);
  sendButton.style('margin', '10px auto');
  sendButton.style('padding', '8px 20px');
  sendButton.style('background-color', '#000000');
  sendButton.style('color', 'white');
  sendButton.style('border', 'none');
  sendButton.style('border-radius', '4px');
  sendButton.style('cursor', 'pointer');
  sendButton.style('font-size', '14px');
  
  // what happens when we click send
  sendButton.mousePressed(() => {
    const content = note.html();
    sendToGmail(content);
  });
  
  // clear placeholder when clicked
  note.mouseClicked(function() {
    if (note.html() === 'Type your note here...') {
      note.html('');
    }
  });

  // make the dragging work - but only on the header part
  noteHeader.mousePressed(function(event) {
    // don't drag if clicking the close button
    if (event.target === closeButton.elt) {
      return;
    }
    
    event.stopPropagation();
    
    isDragging = true;
    const dragElement = noteContainer.elt;
    dragElement.style.zIndex = 1000; // bring to front while dragging
    
    // figure out where we clicked within the element
    const rect = dragElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    function onMouseMove(event) {
      const x = event.clientX - offsetX;
      const y = event.clientY - offsetY;
      
      dragElement.style.left = x + 'px';
      dragElement.style.top = y + 'px';
    }
    
    // keep track so we can clean up if needed
    window.currentMoveHandler = onMouseMove;
    document.addEventListener('mousemove', onMouseMove);
    
    // clean up when done dragging
    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    
    document.addEventListener('mouseup', onMouseUp);
  });
}

function sendToGmail(content) {
  const email = 'hypernabtester@gmail.com';
  
  // timestamp for the subject
  const now = new Date();
  const timestamp = now.toLocaleString();
  
  // clean up the text
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // build the Gmail link
  const subject = encodeURIComponent('My note - ' + timestamp);
  const body = encodeURIComponent(plainText);
  const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
  
  // open Gmail
  window.open(gmailURL, '_blank');
  
  // let them know it worked
  createSuccessNotification('Gmail compose window opened!');
}

function createSuccessNotification(message) {
  let notification = createDiv(message);
  notification.style('position', 'fixed');
  notification.style('top', '20px');
  notification.style('left', '50%');
  notification.style('transform', 'translateX(-50%)');
  notification.style('background-color', '#4CAF50');
  notification.style('color', 'white');
  notification.style('padding', '10px 20px');
  notification.style('border-radius', '4px');
  notification.style('z-index', '9999');
  notification.style('box-shadow', '0 2px 10px rgba(0,0,0,0.2)');
  
  // remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
