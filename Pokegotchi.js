/**
 * @author Archenoth
 * @version 0.0.0
 *
 * Pokegotchi -- a Tamagotchi clone with Pokemon.
 */
var Pokegotchi = (function(){
  /**
   * Constructor for the Pokegotchi game itself.
   *
   * @param id <String>: The ID of the Element to create the canvas
   * elements the game will be bound to.
   */
  function Pokegotchi(id){
    var target = document.getElementById(id);
    var container = document.createElement('div');
    container.style.position = 'relative';

    this.canvas = document.createElement('canvas');
    this.canvas.style.top = 0;
    this.canvas.style.position = 'absolute';

    container.appendChild(this.canvas);
    target.appendChild(container);

    this.context = this.canvas.getContext('2d');
    this.canvas.width = 320;
    this.canvas.height = 240;
  }

  /**
   * Constructor for a Pokemon.
   *
   * Sets up a new Pokemon with a random gender, and all the initial
   * state it needs to get on with living.
   *
   * @param textureObject <Object>: the TexturePacker object to parse,
   * specified in Pokegotchi.prototype.newPokemon()'s documentation.
   *
   * @param game <Pokegotchi>: The Pokegotchi instance this Pokemon
   * will be a part of.
   */
  function Pokemon(textureObject, game){
    this.gender = Math.random() > 0.5 ? "male" : "female";
    this.facing = Math.random() > 0.5 ? "left" : "right";
    this.moving = true;
    this.backTurned = false;
    this.calling = false;
    this.hunger = 0;
    this.happiness = 0;
    this.discipline = 0;
    this.frailty = 0;
    this.sick = 0;
    this.dead = false;
    this.texture = textureObject;
    this.game = game;
  }

  /**
   * Feeds the Pokemon, reducing their hunger.
   *
   * @param junk <Boolean> (Optional): Is it junk food? Default is no.
   */
  Pokemon.prototype.feed = function(junk){
    if(junk){
      this.happiness += 1000;
      this.hunger = Math.max(this.hunger - 1000, 0);
      this.frailty++;
    } else if(this.hunger > 9000){
      this.hunger = Math.max(this.hunger - 10000,  0);
    }
  };

  /**
   * Attempts to cure Pokemon with medicine.
   */
  Pokemon.prototype.cure = function(){
    this.frailty++;

    if(Math.random() > 0.5 + this.frailty * 0.01){
      this.sick = false;
      this.happiness += 500;
    }
  };

  /**
   * The main internal Pokemon AI.
   *
   * Once called, it will call itself once every 300 milliseconds or
   * so to check if it wants to do something.
   */
  function pokemonAI(){
    // May move--if it can move
    if(this.moving && !this.sick){
      if(Math.random() < 0.50){
        if(this.facing == "left" && this.x >= 20){
          this.x -= 2;
        } else if(this.x <= this.game.canvas.width - 20){
          this.x += 2;
        }
      }
    }

    // Hungry means unhappy
    if(this.hunger > 20000 && Math.random() < 0.001){
      this.happiness--;
    }

    // Starving means VERY unhappy, and possibly death
    if(this.hunger > 50000){
      this.happiness--;
      if(Math.random() < this.hunger * 0.0000001 * this.frailty){
        this.dead = true;
      }
    }

    // Low chance of getting sick, low chance of healing self too
    if(this.sick && Math.random() < 0.00001){
      this.sick = false;
    } else if(Math.random() < 0.00001 * this.frailty){
      this.sick = true;
    }

    // Treat your sick! They become very unhappy and might die
    if(this.sick && Math.random() < 0.00001 * (this.frailty / 2)){
      this.dead = true;
    } else {
      this.happiness--;
    }

    // Hunger grows with time
    this.hunger++;

    // No more AI if we're dead.
    if(!this.dead){
      setTimeout(pokemonAI.bind(this), 300);
    }
  }

  /**
   * Creates a new Pokemon that will hop around the canvas with a
   * number of default stats, and returns it.
   *
   * @param textureObject <Object>: A TexturePacker object of a
   * Pokemon. This object should also contain an animation key that
   * points to an objects with the keys "moving", "standing", "sick",
   * "dead", "backMoving", and "backStanding". Each of these contains
   * "start" and "length" keys that reference the first frame, and
   * length of animation for each. For example:
   *
   *  "animations": {
   *    "moving": {start:0, length:80},
   *    "standing": {start:80, length: 33},
   *    "backMoving": {start:113, length: 80},
   *    ...
   *  }
   *
   * @return <Pokemon> The newly created Pokemon.
   */
  Pokegotchi.prototype.newPokemon = function(textureObject){
    var pokemon = new Pokemon(textureObject, this);

    /*
     * The callback will run when an animation is complete, meaning
     * that it won't look wierd to change a bunch of states that
     * affect animation...
     *
     * The rest of the state changing is AI-based and will be in
     * pokemonAI()
     */
    display(pokemon, function(){
      if(Math.random() < 0.3){
        pokemon.moving ^= true;
      }
      if(Math.random() < 0.3){
        pokemon.facing = pokemon.facing == "right" ? "left" : "right";
      }
    });

    pokemonAI.call(pokemon);

    return pokemon;
  };

  /**
   * Internal function that displays the Pokemon on-screen and starts
   * its animations.
   *
   * @param pokemon <Pokemon>: A Pokemon. This function will pass this
   * argument as the context of the animate() function inside, which
   * will call itself with asynchronous recursion to handle picking
   * the correct animation and displaying it based on the state of
   * this Pokemon.
   *
   * @param callback <Function> (Optional): A callback function that
   * is called by animate() when an animation is finished. (All the
   * frames have been run and it is about to loop) This is an ideal
   * time to update state that will change the animation since it will
   * appear seamless if done here.
   */
  function display(pokemon, callback){
    pokemon.frame |= 0;
    callback = callback || function(){};
    var canvas = pokemon.game.canvas;
    var context = pokemon.game.context;

    if(isNaN(pokemon.x)){
      pokemon.x = canvas.width * 0.5;
    }
    if(isNaN(pokemon.y)){
      pokemon.y = canvas.height * 0.5;
    }

    var animations = pokemon.texture.animations;
    var frames = pokemon.texture.frames;
    var sprites = new Image();
    var lastFrame = {
      "x": 0,
      "y": 0,
      "w": canvas.width,
      "h": canvas.height
    };

    sprites.src = pokemon.texture.meta.image;

    /**
     * Animates the Pokemon in this function's context.
     *
     * Starts an animation based on the current context's state,
     * renders it, then calls itself with asynchronous recursion every
     * 50 milliseconds.
     */
    function animate(){
      if(this.dead){
        this.animation = animations.dead;
      } else if(this.sick){
        this.animation = animations.sick;
      } else if(this.moving){
        this.animation = this.backTurned ? animations.backMoving : animations.moving;
      } else {
        this.animation = this.backTurned ? animations.backStanding : animations.standing;
      }

      if(this.frame == this.animation.length){
        callback.call(this);
      }

      var sprite = frames[(this.frame %= this.animation.length) + this.animation.start];
      var drawX = Math.floor(sprite.spriteSourceSize.x - sprite.sourceSize.w * 0.5) + this.x;
      var drawY = Math.floor(sprite.spriteSourceSize.y - sprite.sourceSize.h * 0.5) + this.y;
      var f = sprite.frame;

      context.clearRect(lastFrame.x, lastFrame.y, lastFrame.w, lastFrame.h);
      context.drawImage(sprites, f.x, f.y, f.w, f.h, drawX, drawY, f.w, f.h);

      lastFrame.x = drawX;
      lastFrame.y = drawY;
      lastFrame.w = f.w;
      lastFrame.h = f.h;
      this.frame++;

      if(!this.dead){
        // Slows animation down when the Pokemon is hungry
        setTimeout(animate.bind(this), 50 + (this.hunger > 40000 ? 50 : 0));
      }
    }

    animate.call(pokemon);
  };

  return Pokegotchi;
})();
