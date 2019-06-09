const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Composite = Matter.Composite;
const Body = Matter.Body;
const SAT = Matter.SAT;
const Runner = Matter.Runner;
const fps = 60;
yolo();
// window.onerror = function () {
//     return true;
// }; // Comment out when debugging
function yolo() {
    let score = 0;
    if (document.body.querySelector("canvas")) {
        document.body.querySelector("canvas").remove();
    }
    document.body.querySelector("#pause-screen").style.display = "none";
    document.body.querySelector("#overlay").hidden = true;
    document.body.querySelector("#game-over").style.display = "none";
    document.body.querySelector("#game-over").hidden = true;
    document.body.querySelector("#menu-screen").style.display = "none";
    const engine = Engine.create();
    let ground_number = 0;
    let bullet_number = 0;
    let enemy_number = 0;
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            wireframes: false,
        }
    });

    let running = false;
    const defaultCategory = 0x0001,
        bottomCategory = 0x0002,
        topCategory = 0x0004;
    const player = Bodies.rectangle(400, 200, 80, 80, {
        mass: 10,
    });
    engine.world.gravity.y = 2.5;
    // const boxB = Bodies.rectangle(450, 50, 80, 80);
    const starting_ground = Bodies.rectangle(400, 610, 810, 30, {
        isStatic: true,
        friction: 0.1,
        label: "ground-" + ground_number,
        collisionFilter: {
            category: bottomCategory,
            mask: defaultCategory
        }
    });
    // const top_border = Bodies.rectangle(0,-10,document.body.clientWidth*10,100, {isStatic:true,friction:10000000});
    World.add(engine.world, [player, starting_ground]);
    let mousePosX, mousePosY;
    const keydown = {
        left: false,
        right: false,
        up: false
    };
    let mousedown = false;
    let paused = false;
    let upgradelvl = {
            bullet_speed: 0,
            reload_rate: 0,
            bullet_damage: 0,
            jump_height: 0,
            score_multiplier: 0
        },
        price = {
            bullet_speed: 100,
            reload_rate: 500,
            bullet_damage: 200,
            jump_height: 750,
            score_multiplier: 1000
        },
        bullet_speed_divisor = 1000,
        shootingRate = 1, //how many times a second
        damage = 10,
        jump_height = 0.65,
        score_mult = 1;
    document.body.querySelector("#screen").scroll(0, document.body.height * 5);
    document.body.querySelector("canvas").hidden = true;
    const start = () => {
        document.body.querySelector("#bullet-speed-upgrade").addEventListener("click", () => {
            if (score > price.bullet_speed && upgradelvl.bullet_speed !== 10) {
                score -= price.bullet_speed;
                upgradelvl.bullet_speed++;
                price.bullet_speed *= 3;
                bullet_speed_divisor /= 1.5;
                updateUpgradeScreen();
            }
        });
        document.body.querySelector("#reload-rate-upgrade").addEventListener("click", () => {
            if (score > price.reload_rate && upgradelvl.reload_rate !== 10) {
                score -= price.reload_rate;
                upgradelvl.reload_rate++;
                price.reload_rate *= 5;
                shootingRate += 0.5;
                updateUpgradeScreen();
            }
        });
        document.body.querySelector("#bullet-damage-upgrade").addEventListener("click", () => {
            if (score > price.bullet_damage && upgradelvl.bullet_damage !== 10) {
                score -= price.bullet_damage;
                upgradelvl.bullet_damage++;
                price.bullet_damage *= 5;
                damage += 10;
                updateUpgradeScreen();
            }
        });
        document.body.querySelector("#jump-height-upgrade").addEventListener("click", () => {
            if (score > price.jump_height && upgradelvl.jump_height !== 10) {
                score -= price.jump_height;
                upgradelvl.jump_height++;
                price.jump_height *= 5;
                jump_height += 0.125;
                updateUpgradeScreen();
            }
        });
        document.body.querySelector("#score-multiplier-upgrade").addEventListener("click", () => {
            if (score > price.score_multiplier && upgradelvl.score_multiplier !== 10) {
                score -= price.score_multiplier;
                upgradelvl.score_multiplier++;
                price.score_multiplier *= 3;
                score_mult *= 2;
                updateUpgradeScreen();
            }
        });
        window.addEventListener("keypress", (ev) => {
            if (ev.key == " ") {
                if (running == true) {
                    if (paused == false) {
                        pause();
                    } else if (paused == true) {
                        unpause();
                    }
                }
            }

        });
        window.addEventListener("keydown", (ev) => {
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
                case "Tab":
                    ev.preventDefault();
                    document.body.querySelector("canvas").scrollIntoView();
                    break;
            }
        });
        window.addEventListener("keyup", (ev) => {
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
        window.addEventListener("mousedown", (ev) => {
            mousedown = true;
        });
        window.addEventListener("mouseup", (ev) => {
            mousedown = false;
        });
        window.addEventListener("mousemove", (ev) => {
            mousePosX = ev.clientX;
            mousePosY = ev.clientY;

        });
        window.addEventListener("resize", (ev) => {
            document.body.querySelector("canvas").height = window.innerHeight;
            document.body.querySelector("canvas").width = window.innerWidth;
            document.body.scroll(0, document.body.clientWidth);
            if (running == false) {
                document.body.querySelector("#score").style.transition = "2s all";
                document.body.querySelector("#score").children[0].style.textShadow = "white 0px 0px 60px";
                document.body.querySelector("#score").style.top = `${(30*document.body.clientHeight)/100}px`;
                document.body.querySelector("#score").style.transform = "rotateY(360deg) skewX(-10deg)";
                document.body.querySelector("#score").style.fontSize = "1rem";
                document.body.querySelector("#score").children[0].innerHTML = `Final Score: ${score}`;
                document.body.querySelector("#score").style.right = `${(document.body.clientWidth-document.body.querySelector("#score").clientWidth)/2}px`;
            }
        });
        document.body.querySelector("#start-button").addEventListener("click", () => {
            if (running == false) {
            document.body.querySelector("canvas").hidden = false;
            document.body.querySelector("canvas").scrollIntoView({
                behavior: "smooth"
            });
            setTimeout(() => {
                window.requestAnimationFrame(draw);
                running = true;
                document.body.querySelector("#overlay").hidden = false;
            }, 50);
        }
        });
        document.body.querySelector("#menu-button").addEventListener("click", () => {
            document.body.querySelector("#menu-screen").hidden = false;
            document.body.querySelector("#menu-screen").style.display = "flex";
            document.body.querySelector("#menu-screen").scrollIntoView({
                behavior: "smooth",
            });
        });
        let advice_number = 0;
        document.body.querySelector("#info").addEventListener("click", () => {
            advice_number++;
            switch (advice_number) {
                case 1:
                    document.body.querySelector("#info-box").children[0].innerHTML = "The enemies don't do any damage to you, but they can knock you off.";
                    break;
                case 2:
                    document.body.querySelector("#info-box").children[0].innerHTML = "Destroying enemies as well as surviving for the longest time gives you a higher score";
                    break;
                case 3:
                    document.body.querySelector("#info-box").children[0].innerHTML = "Remember to pause occasionly to buy upgrades! You can use space to pause.";
                    break;
                case 4:
                    document.body.querySelector("#info-box").children[0].innerHTML = "Spinning around might affect your jump height or direction in unintended ways.";
                    break;
                case 5:
                    advice_number = 0;
                    document.body.querySelector("#info-box").children[0].innerHTML = "Use W to jump, A to move left, D to move right, and hold down the mouse to shoot!";
                    break;
            }
        });
        for (let i = 0; i <= 10; i++) {
            newEnemy();
        }
    };

    start();
    let frame = 0,
        jump = true,
        shoot = true,
        moverate = 5;
    function draw() {
        if (paused == false && running == true) {
            setTimeout(() => {
                if (document.hidden == true) {
                    pause();
                }
                window.requestAnimationFrame(draw);
            }, 1000 / fps);
            for (let i = Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("ground-");
                }).length; i <= 10; i++) {
                newGround();
            }
            // console.log(keydown);
            if (keydown.right == true) {
                // Body.applyForce(boxB, {
                //     x: boxB.position.x,
                //     y: boxB.position.y
                // }, {
                //     x: 0.05,
                //     y: 0
                // });
                Body.applyForce(player, {
                    x: player.position.x,
                    y: player.position.y
                }, {
                    x: 0.05,
                    y: 0
                })
            }
            if (keydown.left == true) {
                // Body.applyForce(boxB, {
                //     x: boxB.position.x,
                //     y: boxB.position.y
                // }, {
                //     x: -0.05,
                //     y: 0
                // })
                Body.applyForce(player, {
                    x: player.position.x,
                    y: player.position.y
                }, {
                    x: -0.05,
                    y: 0
                })
            }
            if (mousedown == true && shoot == true) {
                shoot = false;
                setTimeout(() => {
                    shoot = true;
                }, 1000 / shootingRate);
                newBullet();
            }
            if (Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("enemy-");
                }).length <= 8) {
                newEnemy();
            }
            for (let i = 0; i < Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("enemy-");
                }).length; i++) {
                const arr = Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("enemy-");
                });
                Body.applyForce(arr[i], {
                    x: 0,
                    y: 0,
                }, {
                    x: 0,
                    y: -engine.world.gravity.y * engine.world.gravity.scale * arr[i].mass,
                });
                // const width = arr[i].bounds.max.x - arr[i].bounds.min.x;
                // const height = arr[i].bounds.max.y-arr[i].bounds.min.y;
                let distX = player.position.x - arr[i].position.x;
                let distY = player.position.y - arr[i].position.y;
                let angle;
                if (distX > 0 && distY > 0) {
                    angle = ((0 * Math.PI / 2) + Math.atan(distX / distY));
                } else if (distX < 0 && distY > 0) {
                    angle = ((4 * Math.PI / 2) + Math.atan(distX / distY));
                } else if (distX < 0 && distY < 0) {
                    angle = (((2 * Math.PI) / 2) + Math.atan(distX / distY));
                } else if (distX > 0 && distY < 0) {
                    angle = (((2 * Math.PI) / 2) + Math.atan(distX / distY));
                }
                for (let j = 0; j < Composite.allBodies(engine.world).filter((v) => {
                        return v.label.includes("bullet-");
                    }).length; j++) {
                    const arr1 = Composite.allBodies(engine.world).filter((v) => {
                        return v.label.includes("bullet-");
                    });
                    if (SAT.collides(arr1[j], arr[i]).collided) {
                        arr[i].health -= arr1[j].damage;
                        if (arr[i].health <= 0) {
                            score += 50 * score_mult;
                            Composite.remove(engine.world, arr[i]);
                        }
                        Composite.remove(engine.world, arr1[j]);
                    }
                }
                let border = (document.body.clientWidth / 5 > 100) ? document.body.clientWidth / 5 : 150;
                Body.setAngularVelocity(arr[i], 2 * Math.PI / 60);
                if (arr[i].position.x < border) {
                    Body.applyForce(arr[i], {
                        x: arr[i].position.x,
                        y: arr[i].position.y
                    }, {
                        x: (Math.sin(angle) / 500),
                        y: Math.cos(angle) / 500
                    });
                } else {
                    arr[i].force = {
                        x: 0,
                        y: 0
                    };
                    Body.applyForce(arr[i], {
                        x: arr[i].position.x,
                        y: arr[i].position.y
                    }, {
                        x: -0.05,
                        y: ((Math.cos(angle)) / 10)
                    });
                }
            }
            for (let i = 0; i < Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("bullet-");
                }).length; i++) {
                const arr = Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("bullet-");
                });
                arr[i].force = {
                    x: Math.sin(arr[i].shootingAngle) / bullet_speed_divisor,
                    y: Math.cos(arr[i].shootingAngle) / bullet_speed_divisor
                }
                Body.applyForce(arr[i], {
                    x: 0,
                    y: 0
                }, {
                    x: -engine.world.gravity.x * engine.world.gravity.scale * arr[i].mass,
                    y: -engine.world.gravity.y * engine.world.gravity.scale * arr[i].mass
                });
                const width = arr[i].bounds.max.x - arr[i].bounds.min.x;
                const height = arr[i].bounds.max.y - arr[i].bounds.min.y;
                if (arr[i].position.x + (width / 2) < -500 || arr[i].position.x - (width / 2) > document.body.clientWidth + 500 || arr[i].position.y + (height / 2) < -500 || arr[i].position.y - (height / 2) > document.body.clientHeight + 500) {
                    Composite.remove(engine.world, arr[i]);
                }
            }
            for (let i = 0; i < Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("ground-");
                }).length; i++) {
                const arr = Composite.allBodies(engine.world).filter((v) => {
                    return v.label.includes("ground-");
                });
                if (jump == true && SAT.collides(player, arr[i]).collided && keydown.up == true) {
                    jump = false;
                    setTimeout(() => {
                        jump = true;
                    }, 500);
                    player.force = {
                        x: 0,
                        y: 0
                    };
                    Body.applyForce(player, {
                        x: player.position.x,
                        y: player.position.y
                    }, {
                        x: 0,
                        y: -jump_height
                    });
                    // Body.applyForce(boxB, {
                    //     x: boxB.position.x,
                    //     y: boxB.position.y
                    // }, {
                    //     x: 0,
                    //     y: -jump_height
                    // });
                }
                Body.setPosition(arr[i], {
                    x: arr[i].position.x - moverate,
                    y: arr[i].position.y
                });
                const width = arr[i].bounds.max.x - arr[i].bounds.min.x;
                if (arr[i].position.x + (width / 2) < 0) {
                    Composite.remove(engine.world, arr[i]);
                }
            }
            frame++;
            ((frame) % 50 == 0) ? moverate = 7 + (1.5 * Math.log(frame / 50)): null;
            Body.setPosition(player, {
                x: player.position.x - moverate,
                y: player.position.y
            });
            Engine.update(engine, 1000 / fps);
            Render.world(render);
            if (player.position.y > 500 + document.body.clientHeight || player.position.x < 0) {
                gameOver();
            }
            if (frame % 10 == 0) {
                score += 10 * score_mult;
            }
        }
        document.body.querySelector("#score").children[0].innerHTML = score;
    }

    function newGround() {
        ground_number++;
        const arr = Composite.allBodies(engine.world).filter((v) => {
            return v.label.includes("ground-");
        });
        const prevX = arr[arr.length - 1].position.x + ((arr[arr.length - 1].bounds.max.x - arr[arr.length - 1].bounds.min.x) / 2);
        const prevY = arr[arr.length - 1].position.y + ((arr[arr.length - 1].bounds.max.y - arr[arr.length - 1].bounds.min.y) / 2);
        let mult = (Math.random() <= 0.5) ? 1 : -1;
        let range = (mult < 0) ? document.body.clientHeight - prevY - 60 : 135;
        const addH = Math.random() * range + 100;
        const addW = Math.random() * 400 + 50;
        let x = prevX + addW;
        let y = (mult * addH) + prevY;
        const width = (Math.random() * 500) + 200;
        const height = 30;
        if (y + height + 100 + 80 > document.body.clientHeight) {
            mult = -1;
            y = prevY - 100;
        } else if (y < 100 + height) {
            mult = 1;
            y = prevY + 100;
        }
        World.add(engine.world, Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            friction: 0.1,
            label: "ground-" + ground_number,
            collisionFilter: {
                category: bottomCategory
            }
        }));
    }

    function newBullet() {
        let transV0 = (mousePosX - player.position.x);
        let transV1 = (mousePosY - player.position.y);
        let angle;
        if (transV0 > 0 && transV1 > 0) {
            angle = ((0 * Math.PI / 2) + Math.atan(transV0 / transV1));
        } else if (transV0 < 0 && transV1 > 0) {
            angle = ((4 * Math.PI / 2) + Math.atan(transV0 / transV1));
        } else if (transV0 < 0 && transV1 < 0) {
            angle = (((2 * Math.PI) / 2) + Math.atan(transV0 / transV1));
        } else if (transV0 > 0 && transV1 < 0) {
            angle = (((2 * Math.PI) / 2) + Math.atan(transV0 / transV1));
        }
        bullet_number++;
        let bullet = Bodies.circle(player.position.x, player.position.y, 15, {
            label: "bullet-" + bullet_number,
            force: {
                x: Math.sin(angle) / bullet_speed_divisor,
                y: Math.cos(angle) / bullet_speed_divisor
            },
            collisionFilter: {
                mask: topCategory,
                color: "white",
            },
            damage: damage,
            shootingAngle: angle
        });
        World.add(engine.world, bullet);
    }

    function newEnemy() {
        enemy_number++;
        let x = -100;
        let y = Math.random() * (document.body.clientHeight + 200) - 100;
        let sides = Math.floor((5 * Math.random()) + 3);
        (sides == 4) ? sides = 8: null;
        sides = 3;
        let distX = player.position.x - x;
        let distY = player.position.y - y;
        let angle;
        if (distX > 0 && distY > 0) {
            angle = ((0 * Math.PI / 2) + Math.atan(distX / distY));
        } else if (distX < 0 && distY > 0) {
            angle = ((4 * Math.PI / 2) + Math.atan(distX / distY));
        } else if (distX < 0 && distY < 0) {
            angle = (((2 * Math.PI) / 2) + Math.atan(distX / distY));
        } else if (distX > 0 && distY < 0) {
            angle = (((2 * Math.PI) / 2) + Math.atan(distX / distY));
        }
        let enemy = Bodies.polygon(x, y, sides, 60, {
            label: "enemy-" + enemy_number,
            collisionFilter: {
                force: {
                    x: Math.sin(angle) / 100,
                    y: Math.cos(angle) / 100
                },
                category: topCategory,
                mask: defaultCategory,
                frictionAir: 0,
            },
            health: 110
        });
        World.add(engine.world, enemy);
    }

    function newObstacle() {

    }

    function gameOver() {
        running = false;
        document.body.querySelector("#game-over").style.left = "-50vw";
        setTimeout(() => {
            document.body.querySelector("#game-over").hidden = false;
            document.body.querySelector("#game-over").style.display = "block";
            let times = 0;
            repeat();
            document.body.querySelector("#score").style.transition = "2s all";
            document.body.querySelector("#score").children[0].style.textShadow = "white 0px 0px 60px";
            document.body.querySelector("#score").style.top = `${(30*document.body.clientHeight)/100}px`;
            document.body.querySelector("#score").style.transform = "rotateY(360deg) skewX(-10deg)";
            document.body.querySelector("#score").style.fontSize = "1rem";
            document.body.querySelector("#score").children[0].innerHTML = `Final Score: ${score}`;
            document.body.querySelector("#score").style.right = `${(document.body.clientWidth-document.body.querySelector("#score").clientWidth)/2}px`;
            function repeat() {
                document.body.querySelector("#game-over").style.left = `${(Number(document.body.querySelector("#game-over").style.left.replace("vw",""))+(8/(times)))}vw`;
                if (Math.floor(Number(document.body.querySelector("#game-over").style.left.replace("vw", ""))) <= 0) {
                    times++;
                    setTimeout(() => (repeat()), 1);
                }
            }
        }, 50);
    }

    function unpause() {
        if (running == true) {
            paused = false;
            document.body.querySelector("#pause-screen").style.display = "none";
            document.body.querySelector("#pause-screen").className = "";
            window.requestAnimationFrame(draw);
            document.body.querySelector("#score").style.right = "0";
            document.body.querySelector("#score").style.top = "0";
            document.body.querySelector("#score").style.textAlign = "right";
        }
    }

    function pause() {
        paused = true;
        if (running == true) {
            document.body.querySelector("#pause-screen").style.display = "flex";
            document.body.querySelector("#bullet-speed").lastChild.innerHTML = `price:${price.bullet_speed}`;
            updateUpgradeScreen();
            setTimeout(() => {
                document.body.querySelector("#pause-screen").className = "darkened";
                document.body.querySelector("#score").style.textAlign = "center";
                document.body.querySelector("#score").style.right = `${(document.body.clientWidth-document.body.querySelector("#score").clientWidth)/2}px`;
                document.body.querySelector("#score").style.top = `${(document.body.clientHeight-document.body.querySelector("#score").clientHeight)/2}px`;
            }, 50);
        }
    }

    function updateUpgradeScreen() {
        document.body.querySelector("#score").children[0].innerHTML = score;
        document.body.querySelector("#bullet-speed").lastElementChild.innerHTML = `Price: ${price.bullet_speed}`;
        for (let i = 0; i < upgradelvl.bullet_speed; i++) {
            document.body.querySelector("#bullet-speed").querySelector(".upgrade-bar").children[i].classList.add("upgraded");
        }
        if (upgradelvl.bullet_speed == 10) {
            document.body.querySelector("#bullet-speed").querySelector("button").classList.add("disabled")
        }
        document.body.querySelector("#reload-rate").lastElementChild.innerHTML = `Price: ${price.reload_rate}`;
        for (let i = 0; i < upgradelvl.reload_rate; i++) {
            document.body.querySelector("#reload-rate").querySelector(".upgrade-bar").children[i].classList.add("upgraded");
        }
        if (upgradelvl.reload_rate == 10) {
            document.body.querySelector("#reload-rate").querySelector("button").classList.add("disabled")
        }
        document.body.querySelector("#bullet-damage").lastElementChild.innerHTML = `Price: ${price.bullet_damage}`;
        for (let i = 0; i < upgradelvl.bullet_damage; i++) {
            document.body.querySelector("#bullet-damage").querySelector(".upgrade-bar").children[i].classList.add("upgraded");
        }
        if (upgradelvl.bullet_damage == 10) {
            document.body.querySelector("#bullet-damage").querySelector("button").classList.add("disabled")
        }
        document.body.querySelector("#jump-height").lastElementChild.innerHTML = `Price: ${price.jump_height}`;
        for (let i = 0; i < upgradelvl.jump_height; i++) {
            document.body.querySelector("#jump-height").querySelector(".upgrade-bar").children[i].classList.add("upgraded");
        }
        if (upgradelvl.jump_height == 10) {
            document.body.querySelector("#jump-height").querySelector("button").classList.add("disabled")
        }
        document.body.querySelector("#score-multiplier").lastElementChild.innerHTML = `Price: ${price.score_multiplier}`;
        for (let i = 0; i < upgradelvl.score_multiplier; i++) {
            document.body.querySelector("#score-multiplier").querySelector(".upgrade-bar").children[i].classList.add("upgraded");
        }
        if (upgradelvl.score_multiplier == 10) {
            document.body.querySelector("#score-multiplier").querySelector("button").classList.add("disabled")
        }
    }
    // window.requestAnimationFrame(draw);
}

function changeEffectsVolume() {
    document.body.querySelector("#Sound-Effects").innerHTML = `${Number(document.body.querySelector("#Sound-Effects-Volume").value)}%`;

}

function changeMusicVolume() {
    document.body.querySelector("#Music").innerHTML = `${Number(document.body.querySelector("#Music-Volume").value)}%`;
}

function scrollBack() {
    document.body.querySelector("#starting-screen").scrollIntoView({
        behavior: "smooth"
    });
    setTimeout(() => {
        document.body.querySelector("#menu-screen").style.display = "none";
    }, 1000);
}