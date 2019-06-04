const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Body = Matter.Body;
const SAT = Matter.SAT;

const engine = Engine.create();
let ground_number = 0;
let bullet_number = 0;
let enemy_number = 0;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width:document.body.clientWidth,
        height:document.body.clientHeight,
        wireframes:false,
    }
});

const defaultCategory = 0x0001,
    bottomCategory = 0x0002,
    topCategory = 0x0004,
    blueCategory = 0x0008;
const player = Bodies.rectangle(400, 200, 80, 80,{

});
const boxB = Bodies.rectangle(450, 50, 80, 80);
const starting_ground = Bodies.rectangle(400, 610, 810, 30, {
    isStatic:true,
    friction: 0.1,
    label: "ground-"+ground_number,
    collisionFilter:{
        category:bottomCategory,
        mask:defaultCategory
    }
});
// const top_border = Bodies.rectangle(0,-10,document.body.clientWidth*10,100, {isStatic:true,friction:10000000});
World.add(engine.world, [player,starting_ground]);

Engine.run(engine);
Render.run(render);

let mousePosX,mousePosY;
const keydown = {left:false,right:false,up:false};
let mousedown = false;
document.querySelector("#overlay").scrollIntoView();
let angle;

const start = () => {
    window.addEventListener("keydown",(ev)=>{
        switch (ev.key) {
            case "w":
                if (keydown.up == false) {
                    keydown.up = true;
                }
                break;
            case "a":
                if (keydown.left == false) {
                    keydown.left = true;
                }
                break;
            case "d":
                if (keydown.right == false) {
                    keydown.right = true;
                }
                break;
        }     
    });
    window.addEventListener("keyup",(ev)=>{
        switch (ev.key) {
            case "w":
                keydown.up = false;
                break;
            case "a":
                keydown.left = false;
                break;
            case "d":
                keydown.right = false;
                break;
        }     
    });
    window.addEventListener("mousedown",(ev)=>{
        mousedown=true;
    });
    window.addEventListener("mouseup",(ev)=>{
        mousedown=false;
    })
    window.addEventListener("mousemove",(ev)=>{
        mousePosX=ev.clientX;
        mousePosY=ev.clientY;
        
    });
    window.addEventListener("resize",(ev)=>{
        document.querySelector("canvas").height = document.body.clientHeight;
        document.querySelector("canvas").width = document.body.clientWidth;
    });
    document.querySelector("#start-button").addEventListener("click",()=>{
        document.querySelector("canvas").scrollIntoView({behavior:"smooth"});
        setTimeout(()=>{window.requestAnimationFrame(draw)},50);
    });
    for (let i=0;i<=10;i++) {
        newEnemy();
    }
};

start();
let frame=0;
let moverate=3;
async function draw() {
    setTimeout(()=>{window.requestAnimationFrame(draw)},60/1000);
    for (let i=Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("ground-");}).length;i<=10;i++) {
        newGround();
    }
    // console.log(keydown);
    if (keydown.right == true) {
        Body.applyForce(boxB,{x:boxB.position.x,y:boxB.position.y},{x:0.02,y:0})
        Body.applyForce(player,{x:player.position.x,y:player.position.y},{x:0.02,y:0})
    }
    if (keydown.left == true) {
        Body.applyForce(boxB,{x:boxB.position.x,y:boxB.position.y},{x:-0.02,y:0})
        Body.applyForce(player,{x:player.position.x,y:player.position.y},{x:-0.02,y:0})
    }
    if (mousedown==true && frame%15==0) {
        newBullet();
    }
    if (frame%300==0) {
        newEnemy();
    }
    for (let i=0;i<Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("enemy-");}).length;i++) {
        const arr = Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("enemy-");});
        const width = arr[i].bounds.max.x - arr[i].bounds.min.x;
        const height = arr[i].bounds.max.y-arr[i].bounds.min.y;
        let distX = player.position.x-arr[i].position.x;
        let distY = player.position.y-arr[i].position.y;
        let angle;
        if (distX>0 && distY>0) {
            angle=((0*Math.PI/2)+Math.atan(distX/distY));
        } else if (distX<0 && distY>0) {
            angle=((4*Math.PI/2)+Math.atan(distX/distY));
        } else if (distX<0 && distY<0) {
            angle=(((2*Math.PI)/2)+Math.atan(distX/distY));
        } else if (distX>0 && distY<0) {
            angle=(((2*Math.PI)/2)+Math.atan(distX/distY));
        }
        for (let j=0;j<Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("bullet-");}).length;j++) {
            const arr1 = Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("bullet-");});
            if (SAT.collides(arr1[j],arr[i])) {
                Composite.remove(engine.world,arr[i]);
                Composite.remove(engine.world,arr1[j]);
            }
        }
        Body.applyForce(arr[i],{x:arr[i].position.x,y:arr[i].position.y},{x:Math.sin(angle)/50,y:Math.cos(angle)/50});
    }
    for (let i=0;i<Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("bullet-");}).length;i++) {
        const arr = Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("bullet-");});
        const width = arr[i].bounds.max.x - arr[i].bounds.min.x;
        const height = arr[i].bounds.max.y-arr[i].bounds.min.y;
        if (arr[i].position.x+(width/2)<-500 || arr[i].position.x-(width/2)>document.body.clientWidth+500 || arr[i].position.y+(height/2)<-500 || arr[i].position.y-(height/2)>document.body.clientHeight+500) {
            Composite.remove(engine.world,arr[i]);
        }
    }
    for (let i=0;i<Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("ground-");}).length;i++) {
        const arr = Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("ground-");});
        if (frame%10==0 && SAT.collides(player,arr[i]).collided && keydown.up == true) {
            player.force = {x:0,y:0};
            Body.applyForce(player,{x:player.position.x,y:player.position.y},{x:0,y:-0.3})
            Body.applyForce(boxB,{x:boxB.position.x,y:boxB.position.y},{x:0,y:-0.3})
        }
        Body.setPosition(arr[i],{x:arr[i].position.x-moverate,y:arr[i].position.y});
        const width = arr[i].bounds.max.x - arr[i].bounds.min.x;
        if (arr[i].position.x+(width/2)<0) {
            Composite.remove(engine.world,arr[i]);
        }
    }
    frame++;
    ((frame) % 50==0) ? moverate = 3+(1.5*Math.log(frame/50)): null;
    Body.setPosition(player,{x:player.position.x-moverate,y:player.position.y})
}
function newGround() {
    ground_number++;
    const arr = Composite.allBodies(engine.world).filter((v)=>{return v.label.includes("ground-");});
    const prevX = arr[arr.length-1].position.x + ((arr[arr.length-1].bounds.max.x-arr[arr.length-1].bounds.min.x)/2);
    const prevY = arr[arr.length-1].position.y + ((arr[arr.length-1].bounds.max.y-arr[arr.length-1].bounds.min.y)/2);
    let mult = (Math.random()<=0.5)? 1:-1;
    let range= (mult<0) ? document.body.clientHeight-prevY-60: 150;
    const addH = Math.random()*range + 100;
    const addW = Math.random()*400+50;
    let x = prevX+addW;
    let y =(mult*addH)+prevY;
    const width = (Math.random()*500)+200;
    const height = 30;
    if (y+height+100+80>document.body.clientHeight) {
        mult = -1;
        y = (mult*addH)+prevY+100;
    } else if(y<100+height) {
        mult = 1;
        y = (mult*addH)+prevY-100;
    }
    World.add(engine.world,Bodies.rectangle(x,y,width,height,{
        isStatic:true,
        friction: 0.1,
        label: "ground-"+ground_number,
        collisionFilter: {
            category:bottomCategory
        }
    }));
}
function newBullet() {
    let transV0=(mousePosX-player.position.x)
    let transV1=(mousePosY-player.position.y)
        let angle;
        if (transV0>0 && transV1>0) {
            angle=((0*Math.PI/2)+Math.atan(transV0/transV1));
        } else if (transV0<0 && transV1>0) {
            angle=((4*Math.PI/2)+Math.atan(transV0/transV1));
        } else if (transV0<0 && transV1<0) {
            angle=(((2*Math.PI)/2)+Math.atan(transV0/transV1));
        } else if (transV0>0 && transV1<0) {
            angle=(((2*Math.PI)/2)+Math.atan(transV0/transV1));
        }
    bullet_number++;
    let bullet = Bodies.circle(player.position.x,player.position.y,8,{
        label:"bullet-"+bullet_number,
        force:{x:Math.sin(angle)/30,y:Math.cos(angle)/30},
        collisionFilter:{
            mask:topCategory,
            mass: 1,
            density: 999999999999999,
            color:"white",
        }
    });
    World.add(engine.world,bullet);
}
function newEnemy() {
    enemy_number++;
    let x=-100;
    let y= Math.random()*(document.body.clientHeight+200)-100;
    let sides = Math.floor((5*Math.random())+3);
    (sides == 4) ? sides = 8: null;
    let distX = player.position.x-x;
    let distY = player.position.y-y;
    let angle;
    if (distX>0 && distY>0) {
        angle=((0*Math.PI/2)+Math.atan(distX/distY));
    } else if (distX<0 && distY>0) {
        angle=((4*Math.PI/2)+Math.atan(distX/distY));
    } else if (distX<0 && distY<0) {
        angle=(((2*Math.PI)/2)+Math.atan(distX/distY));
    } else if (distX>0 && distY<0) {
        angle=(((2*Math.PI)/2)+Math.atan(distX/distY));
    }
    let enemy = Bodies.polygon(x,y,sides,60,{
        label:"enemy-"+enemy_number,
        collisionFilter: {
            force: {x:Math.sin(angle)/100,y:Math.cos(angle)/100},
            category:topCategory,
            mask: defaultCategory,
            frictionAir: 0,
        }
    });
    World.add(engine.world,enemy);
}
function newObstacle() {

}
// window.requestAnimationFrame(draw);