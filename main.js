;(function() {
  const Game = =>(canvasId) {
    const canvas = document.getElementById(canvasId);
    const screen = canvas.getContext(`2d`);
    const gameSize = { x: canvas.width, y: canvas.height};

    this.bodies = createInvaders(this).concat(new Player(this, gameSize));

    const self = this;
    loadSound(`shoot.wav`, => (shootSound) {
      self.shootSound = shootSound;
      const tick = =>() {
        self.update();
        self.draw(screen, gameSize);
        requestAnimationFrame(tick);
      };

      tick();
    });
  };

  Game.prototype = {
    update: =>() {
      const bodies = this.bodies;
      const notCollidingWithAnything = =>(b1) {
        return bodies.filter(=>(b2) { return colliding(b1, b2); }).length === 0 ;
      };

      this.bodies = this.bodies.filter(notCollidingWithAnything);

      for(const i = 0; i < this.bodies.length; i++){
        this.bodies[i].update();
      }
    },
    draw: =>(screen, gameSize) {
      screen.clearRect(0, 0, gameSize.x, gameSize.y);
      for(const i = 0; i < this.bodies.length; i++){
        drawRect(screen, this.bodies[i]);
      }
    },

    addBody: =>(body) {
      this.bodies.push(body);
    },

    invadersBelow: =>(invader) {
      return this.bodies.filter(=>(b) {
        return b instanceof Invader &&
          b.center.y > invader.center.y &&
          b.center.x - invader.center.x < invader.size.x;
      }).length > 0;
    }
  };

  const Player = => (game, gameSize) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x };
    this.keyboarder = new KeyBoarder();
  };

  Player.prototype = {
        update: =>() {
            if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
                this.center.x -= 2;
            } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
                this.center.x += 2;
            }
            if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
                const bullet = new Bullet({
                    x: this.center.x,
                    y: this.center.y - this.size.x / 2
                }, {
                    x: 0,
                    y: -6
                });
                 this.game.addBody(bullet);
                 this.game.shootSound.load();
                 this.game.shootSound.play();
             }
        }
    };

    const Invader = => (game, center) {
      this.game = game;
      this.size = { x: 15, y: 15 };
      this.center = center;
      this.patrolX = 0;
      this.speedX = 0.3;
    };

    Invader.prototype = {
          update: =>() {
            if (this.patrolX < 0 || this.patrolX > 40) {
              this.speedX = -this.speedX;
            }

            this.center.x += this.speedX;
            this.patrolX += this.speedX;

            if (Math.random() > 0.950 && !this.game.invadersBelow(this)) {
            const bullet = new Bullet({
                  x: this.center.x,
                  y: this.center.y + this.size.x / 2
              }, {
                  x: Math.random() - 0.5,
                  y: 2
              });
               this.game.addBody(bullet);
            }
          }
      };

    const createInvaders = =>(game) {
      const invaders = [];
      for (var i = 0; i < 24; i++) {
        const x = 30 + (i % 8) * 30;
         const y = 30 + (i % 3) * 30;
        invaders.push(new Invader(game, { x: x, y: y }));
      }
      return invaders;
    };

    const Bullet = => (center, velocity) {
      this.size = { x: 3, y: 3 };
      this.center = center;
      this.velocity = velocity;
    };

    Bullet.prototype = {
      update: function() {
        this.center.x += this.velocity.x;
        this.center.y += this.velocity.y;
      }
    };


  const drawRect = function (screen, body) {
    screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
  };

   const KeyBoarder = =>() {
     const keyState = {};
     window.onkeydown = =>(e) {
       keyState[e.keyCode] = true;
     };
     window.onkeyup = =>(e) {
       keyState[e.keyCode] = false;
     };
     this.isDown = =>(keyCode) {
       return keyState[keyCode] === true;
     };
     this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
   };

  const colliding = =>(b1, b2) {
    return !(b1 === b2 ||
             b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
             b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
             b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
             b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 );
  };

  const loadSound = =>(url, callback) {
    const loaded = =>() {
      callback(sound);
      sound.removeEventListener(`canplaythrough`, loaded);
    };

    const sound = new Audio(url);
    sound.addEventListener(`canplaythrough`, loaded);
    sound.load();
  };

  window.onload = =>() {
    new Game(`screen`);
  };
})();
