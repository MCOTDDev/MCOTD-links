let points = [];
let numPoints = 100; // Number of points for random distribution
let maxDistance = 200; // Maximum distance for connecting lines
let cursor = { x: 0, y: 0 }; // Virtual cursor for mouse/touch input
let shift = { x: 0, y: 0 }; // Overall shift for the entire structure

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Generate randomly distributed points
  generateRandomPoints(numPoints);

  // Ensure all points are part of one connected structure
  connectPoints();
}

function draw() {
  background(0); // Black background

  for (let p of points) {
    // Draw lines to connected points
    for (let other of p.connected) {
      let midPointX = (p.x + other.x) / 2;
      let midPointY = (p.y + other.y) / 2;

      // Change line color if the cursor is near
      let distanceToCursor = dist(cursor.x, cursor.y, midPointX, midPointY);
      stroke(distanceToCursor < 100 ? 120 : 25); // Bright on hover, darker otherwise
      strokeWeight(0.75); // Adjusted line thickness
      line(p.x + shift.x, p.y + shift.y, other.x + shift.x, other.y + shift.y);
    }

    // Draw points
    let distanceToCursor = dist(cursor.x, cursor.y, p.x, p.y);
    fill(distanceToCursor < 100 ? 200 : 40); // Brighter when hovered
    noStroke();
    ellipse(p.x + shift.x, p.y + shift.y, 4); // Smaller points

    // Slight individual movement for natural feel
    p.vx += random(-0.05, 0.05); // Small random motion
    p.vy += random(-0.05, 0.05);
    p.vx *= 0.95; // Damping for smooth movement
    p.vy *= 0.95;
    p.x += p.vx;
    p.y += p.vy;

    // Constrain individual movement to keep points near their original positions
    p.x = constrain(p.x, p.originalX - 5, p.originalX + 5);
    p.y = constrain(p.y, p.originalY - 5, p.originalY + 5);
  }

  // Calculate overall structure shift based on cursor
  let pullX = (cursor.x - width / 2) * 0.001; // Slightly increased shift
  let pullY = (cursor.y - height / 2) * 0.001;

  // Apply damping for smooth transitions
  shift.x += pullX;
  shift.y += pullY;
  shift.x *= 0.95; // Damping
  shift.y *= 0.95;
}

function generateRandomPoints(numPoints) {
  // Randomly distribute points with even coverage
  for (let i = 0; i < numPoints; i++) {
    let edgeProbability = random();

    let x, y;
    if (edgeProbability < 0.2) {
      // 20% chance: Place on edges or corners
      let side = floor(random(4));
      if (side === 0) {
        // Top edge
        x = random(0, width);
        y = random(0, height * 0.1);
      } else if (side === 1) {
        // Bottom edge
        x = random(0, width);
        y = random(height * 0.9, height);
      } else if (side === 2) {
        // Left edge
        x = random(0, width * 0.1);
        y = random(0, height);
      } else {
        // Right edge
        x = random(width * 0.9, width);
        y = random(0, height);
      }
    } else {
      // 80% chance: Place in a random area with more bias toward the center
      x = random(width * 0.15, width * 0.85);
      y = random(height * 0.15, height * 0.85);
    }

    points.push({ x: x, y: y, originalX: x, originalY: y, vx: 0, vy: 0 });
  }
}

function connectPoints() {
  // Use a minimum spanning tree algorithm to ensure all points are connected
  let unvisited = [...points];
  let visited = [unvisited.pop()]; // Start with one random point

  while (unvisited.length > 0) {
    let closestPair = { p1: null, p2: null, dist: Infinity };

    // Find the closest pair between visited and unvisited points
    for (let v of visited) {
      for (let u of unvisited) {
        let d = dist(v.x, v.y, u.x, u.y);
        if (d < closestPair.dist) {
          closestPair = { p1: v, p2: u, dist: d };
        }
      }
    }

    // Connect the closest pair
    let { p1, p2 } = closestPair;
    if (!p1.connected) p1.connected = [];
    if (!p2.connected) p2.connected = [];
    p1.connected.push(p2);
    p2.connected.push(p1);

    // Move the newly connected point to the visited list
    visited.push(p2);
    unvisited.splice(unvisited.indexOf(p2), 1);
  }

  // Optionally add random additional connections for a more web-like structure
  for (let p of points) {
    let neighbors = points
      .filter((other) => other !== p && !p.connected.includes(other))
      .sort((a, b) => dist(p.x, p.y, a.x, a.y) - dist(p.x, p.y, b.x, b.y));

    // Connect to up to 2 additional nearby points
    for (let i = 0; i < 2 && i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (!p.connected.includes(neighbor)) {
        p.connected.push(neighbor);
        if (!neighbor.connected) neighbor.connected = [];
        neighbor.connected.push(p);
      }
    }
  }
}

function mouseMoved() {
  // Update cursor position for mouse input
  cursor.x = mouseX;
  cursor.y = mouseY;
}

function touchMoved() {
  // Update cursor position for touch input
  cursor.x = touches[0].x;
  cursor.y = touches[0].y;
  return false; // Prevent default scrolling on touch devices
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
