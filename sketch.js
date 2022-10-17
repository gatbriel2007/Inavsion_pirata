const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
var engine, world, backgroundImg, waterSound, backgroundMusic, cannonExplosion, pirateLaughtSound;
var canvas, angle, tower, ground, cannon, boat;
var balls = [];
var boats = [];
var score = 0
var isGameover = false 
var isLaughing = false 

var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
 brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");

  backgroundMusic = loadSound("./assets/background_music.mp3");
  pirateLaughtSound = loadSound("./assets/pirate_laugh.mp3");
  waterSound = loadSound("./assets/cannon_water.mp3");
  cannonExplosion = loadSound("./assets/cannon_explosion.mp3");

}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  angle = -PI / 4;
  ground = new Ground(0, height - 1, width * 2, 1);
  tower = new Tower(150, 350, 160, 310);
  cannon = new Cannon(180, 110, 110, 50, angle);

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }
 var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
    for (var i = 0; i < waterSplashFrames.length; i++)  {
      var pos = waterSplashFrames[i].position;
      var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
      waterSplashAnimation.push(img);
    }

}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);
  if(!backgroundMusic.isPlaying()) {
    backgroundMusic.play();
    backgroundMusic.setVolume(0.1);
  }


  Engine.update(engine);
  ground.display();

  showBoats();

  
  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    for (var j = 0;  j < boats.length; j++) {
      if(balls[i]!==undefined && boats[j]!==undefined)  {
        var collision = Matter.SAT.collides(balls[i].body, boats[j].body);
        if(collision.collided)  {
          if(!boats[j].isBroken && !balls[i].isSink)  {
            score += 5;
            boats[j].remove(j);
            j--;
          }
          Matter.World.remove(world, balls[i].body);
          balls.splice(i,1);
          i--;
        }
      }
    }
  }

  cannon.display();
  tower.display();
  text("score: "+score, width-200, 50);

}


//crear bala de cañón al presionar una tecla
function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

//función para mostrar la bala
function showCannonBalls(ball, index) {
  ball.display();
  ball.animate();
  if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
    if(!ball.isSink)  {
      ball.remove(index);
      waterSound.play();
    }
  }
}


//función para mostrar el barco
function showBoats() {
  if (boats.length > 0) {
    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      var collision = Matter.SAT.collides(tower.body, boats[i].body);
      if(collision.collided && !boats[i].isBroken){
        if(!isLaughing && !pirateLaughtSound.isPlaying()){
          pirateLaughtSound.play();
          isLaughing = true;
        }
        isGameover = true;
      }

    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}


//soltar bala de cañón al dejar de presionar la tecla
function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    balls[balls.length - 1].shoot();
  }
}
