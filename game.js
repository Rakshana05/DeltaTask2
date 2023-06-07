const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let baseHealth = 100;
let score = 0;

const gameOver = document.querySelector(".gameOver");
canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 10;
    this.height = 40;
    this.position = {
      x: canvas.width / 2 - this.width / 2,
      y: canvas.height - this.height - 50,
    };
    this.angle = 0;
    this.rotation = 0;
    this.radius = 20;
  }

  draw() {
    ctx.save();
    ctx.translate(
      player.position.x + this.width / 2,
      player.position.y + this.height
    );
    ctx.rotate(this.rotation);
    ctx.translate(
      -(player.position.x + this.width / 2),
      -(player.position.y + this.height)
    );

    ctx.fillStyle = "grey";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.beginPath();
    ctx.fillStyle = "purple";
    ctx.arc(
      this.position.x + this.width / 2,
      this.position.y + 40,
      this.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 5;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Home {
  constructor() {
    this.width = 70;
    this.height = 40;

    this.position = {
      x: canvas.width / 2 - this.width / 2,
      y: canvas.height * 0.75,
    };
  }

  draw() {
    ctx.fillStyle = "aqua";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Enemy {
  constructor(position) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 20;
    this.height = 20;
    this.position = {
      x: position.x,
      y: position.y,
    };
  }

  draw() {
    ctx.fillStyle = "orange ";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update({ velocity }) {
    this.draw();
    this.position.x += velocity.x;
    this.position.y += velocity.y;
  }
}

class Grid {
  constructor() {
    const rth = Math.ceil((Math.random() * (canvas.width - 120)) / 30);
    this.position = {
      x: rth,
      y: 0,
    };

    //random speed for different grids
    const randomVal = Math.floor(Math.random() * 2) + 0.5;
    this.velocity = {
      x: 0,
      y: randomVal,
    };

    this.enemies = [];

    const rows = Math.ceil(Math.random() * 2) + 1;
    const cols = Math.ceil(Math.random() * 2) + 2;

    this.width = cols * 30;
    this.height = rows * 30;

    for (let x = rth; x < cols + rth; x++) {
      for (let y = 0; y < rows; y++) {
        let pos = { x: x * 30, y: 20 + y * 30 };
        this.enemies.push(new Enemy(pos));
      }
    }
  }

  update() {
    this.position.y += this.velocity.y;
  }
}

const drawScore = () => {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 20);
};

const drawBaseHealth = () => {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Base Health: " + baseHealth, canvas.width - 180, 20);
};

const player = new Player();
const projectiles = [];
const grids = [new Grid()];
const home = new Home();
const keys = {
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

function animate() {
  //style canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw and update
  player.update();
  home.draw();
  drawScore();
  drawBaseHealth();

  //move or remove projectile
  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(index, 1);
    } else {
      projectile.update();
    }
  });

  grids.forEach((grid, gridIndex) => {
    grid.update();
    grid.enemies.forEach((enemy, i) => {
      enemy.update({ velocity: grid.velocity });

      //projetile colliding enemy
      projectiles.forEach((projectile, j) => {
        if (
          enemy.position.x <= projectile.position.x + projectile.radius &&
          enemy.position.x + enemy.width >= projectile.position.x &&
          enemy.position.y <= projectile.position.y + projectile.radius &&
          enemy.position.y + enemy.height >= projectile.position.y
        ) {
          setTimeout(() => {
            grid.enemies.splice(i, 1);
            projectiles.splice(j, 1);
            score += 10;
          });
        }
      });

      //remove dead grid blocks
      if (grid.enemies.length === 0) {
        setTimeout(() => {
          grids.splice(gridIndex, 1);
        }, 0);
      }

      //enemy colliding home
      if (
        enemy.position.x <= home.position.x + home.width &&
        enemy.position.x + enemy.width >= home.position.x &&
        enemy.position.y <= home.position.y + home.height &&
        enemy.position.y + enemy.height >= home.position.y
      ) {
        setTimeout(() => {
          grid.enemies.splice(i, 1);
          baseHealth -= 10;
        }, 0);
      }
    });

    // remove grids out of screen
    if (grid.position.y > canvas.height) {
      setTimeout(() => {
        baseHealth -= 10;
        grids.splice(gridIndex, 1);
      }, 0);
    }
  });
  // console.log(grids)

  if (keys.ArrowLeft.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
  } else if (
    keys.ArrowRight.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 5;
  } else {
    player.velocity.x = 0;
  }

  //check death & restart
  if (baseHealth <= 0) {
    gameOver.style.display = "block";
    setTimeout(() => {
      document.location.reload();
    }, 2000);
  } else {
    requestAnimationFrame(animate);
  }
}

// generating enemies
setInterval(() => {
  grids.push(new Grid());
}, 5000);

animate();

addEventListener("keydown", (e) => {
  switch (e.key) {
    //left movement
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      break;
    //right movement
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      break;
    //shoot projectiles
    case " ":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height,
          },
          velocity: {
            x: Math.sin(player.rotation) * 5,
            y: -Math.cos(player.rotation) * 5,
          },
        })
      );
      break;
    //Turn right
    case "ArrowUp":
      if (player.rotation < 1) player.rotation += (Math.PI * 30) / 180;
      break;
    //Turn Left
    case "ArrowDown":
      if (player.rotation > -1) player.rotation -= (Math.PI * 30) / 180;
      break;
  }
});

addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case " ":
      break;
  }
});
