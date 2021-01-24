var dog,sadDog,happyDog,garden,washroom, database;
var foodS,foodStock;
var fedTime,lastFed,currentTime;
var feed,addFood;
var foodObj;
var gameState="hungry";
var gameStateRef;

function preload(){
sadDog=loadImage("images/Dog.png");
happyDog=loadImage("images/Happy.png");
garden=loadImage("images/Garden.png");
washroom=loadImage("images/WashRoom.png");
bedroom=loadImage("images/BedRoom.png");
}

function setup() {
  database=firebase.database();
  createCanvas(1000,500);
  
  foodObj = new Food();

  foodStock=database.ref('Food');
  foodStock.on("value",readStock);

  fedTime=database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed=data.val();
  });

  //read game state from database
  readState=database.ref('gameState');
  readState.on("value",function(data){
    gameState=data.val();
  });
   
  dog=createSprite(550,250,10,10);
  dog.addImage(sadDog);
  dog.scale=0.15;
  
  getGameState();

  feed=createButton("FEED HIM");
  feed.position(500,15);
  feed.mousePressed(feedDog);

  addFood=createButton("ADD FOOD");
  addFood.position(400,15);
  addFood.mousePressed(addFoods);
}

function draw() {
  currentTime = hour();
  if(currentTime===lastFed+1){
      gameState="playing";
      updateGameState();
      foodObj.garden();
   }else if(currentTime===lastFed+2){
    gameState="sleeping";
    updateGameState();
    foodObj.bedroom();;
   }else if(currentTime>lastFed+2 && currentTime<=lastFed+4){
    gameState="bathing";
      updateGameState();
      foodObj.washroom();
   }else{
    gameState="hungry";
      updateGameState();
      foodObj.display();
   }
   
   foodObj.getFoodStock();

   getGameState();
   
   fedTime = database.ref('feedTime');
   fedTime.on("value",function(data){
     lastFed = data.val();
   })
   if(gameState === "hungry"){
     feed.show();
     addFood.show();
     dog.addImage(sadDog);
   }
   else{
     feed.hide();
     addFood.hide();
     dog.remove();
   }
 
  drawSprites();
  textSize(32);
  fill("red");
  textSize(20);
  text("Last fed: "+lastFed+":00",300,95);
  text("Time since last fed: "+(currentTime - lastFed),300,125);
}

//function to read food Stock
function readStock(data){
  foodS=data.val();
  foodObj.updateFoodStock(foodS);
}


//function to update food stock and last fed time
function feedDog(){
  foodObj.deductFood();
  foodObj.updateFoodStock();
  dog.changeImage(happyDog);
    gameState ="Happy";
 updateGameState();
}

//function to add food in stock
function addFoods(){
  foodObj.addFood();
  foodObj.updateFoodStock();
}

async function hour(){
  var site = await fetch("http://worldtimeapi.org/api/timezone/America/Toronto");
  var siteJSON = await site.json();
  var datetime = siteJSON.datetime;
  var hourTime = datetime.slice(11,13);
  return hourTime;
}
function getGameState(){
  gameStateRef = database.ref('gameState');
  gameStateRef.on("value",function(data){
    gameState = data.val();
  });
};

function updateGameState(){
  database.ref('/').update({
    gameState: gameState
  })
}

function update(state){
  database.ref('/').update({
    gameState:state
  })
}