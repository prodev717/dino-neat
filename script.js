class tree{
	constructor(x){
		this.x=x;this.h;this.y;this.c=(random(["red","blue","green","yellow","orange","white","grey"]));
		this.changeH();
	}
	draw(){
		fill(this.c);
		rect(this.x,this.y,30,this.h);
	}
	move(){
		if(this.x<-30){
			this.x=600;
			this.changeH();
		}else{this.x-=2.5;}
	}
	changeH(){
		this.c=(random(["red","blue","green","yellow","orange","white","grey"]));
		this.h=random(10,100);
		this.y=400-this.h;
	}
}

class player{
	constructor(){
		this.brain=ml5.neuralNetwork({inputs:["dis","hig"],outputs:["jump","dont jump"],task:"classification",noTraining:true});
		this.brain.mutate(1);
		this.x=50;this.y=370;
		this.score=0;
		this.vy=0;
	}
	nextMove(distance,height){
		return this.brain.classify({dis:distance/200,hig:height/100});
	}
	draw(){
		fill(255,100,100);
		rect(this.x,this.y,30,30);
		this.y+=this.vy;
		this.vy+=0.5;
		this.y=constrain(this.y,0,370);
	}
	jump(){this.vy=-12;}
}

let trees=[];
let players=[];
let dead=[];
let gen=1;
let population=5;

function setup() {
	let canvas = createCanvas(600,400);
	canvas.parent("canvas");
	trees.push(new tree(200));
	trees.push(new tree(400));
	trees.push(new tree(600));
	for(let i=0;i<population;i++){
		players.push(new player());
	}
}

function draw() {
	background(50);
	text('gen : '+str(gen)+"\n"+"alive : "+str(players.length),20,20);
	if(players.length===0){
		generate();
	}
	trees.forEach(i=>{
		i.draw();
		i.move();
	});
	
	players.forEach((i,ix)=>{
		i.draw();
		for(let j in trees){
			if(i.x===trees[j].x+30){
				i.score++;
			}
			if(collide(i,trees[j])){
				dead.push(i);
				players.splice(ix,1);
			}
		}
		stroke(0);
		text(i.score,i.x,i.y+15);
		let currentTree = trees[i.score%3];
		let distance = (currentTree.x+30)-i.x;
		//text(str(distance),i.x,i.y);
		let action = i.nextMove(distance,currentTree.h);
		action.then(r=>{
			if(r[0].label==="jump"){
				if(365<i.y && i.y<371)i.jump();
			}
		});
	});
}

function generate() {
	gen++;
	dead.sort((a,b)=>{return b.score-a.score});
	let a = dead[0];let b = dead[1];
	let c = a.brain.crossover(b.brain);
	c.mutate(0.01);
	for(let i=0;i<population;i++){
		let temp = new player();
		temp.brain=c;
		players.push(temp);
	}
}

function collide(b,p){return ((b.x+30>=p.x)&&(p.x+30>=b.x)&&(b.y+30>=p.y)&&(p.y+p.h>=b.y));}