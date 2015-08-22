/**
 * @author Archenoth
 * @version 0.0.0
 *
 * Pokegotchi -- a Tamagotchi clone with Pokemon.
 */
var Pokegotchi = (function(){
  var context,
      canvas;

  /**
   * Creates and binds the Pokegotchi to an ID on the page.
   * This must be the ID of a canvas element.
   *
   * @param id <String>: The ID of the canvas Element you want to bind
   * the game to.
   */
  function Pokegotchi(id){
    canvas = document.getElementById(id);
    context = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 240;
  }

  /**
   * The main internal Pokemon AI.
   *
   * Once called, it will call itself once every * 300 milliseconds or
   * so to check if it wants to do something.
   */
  function pokemonAI(){
    if(this.moving && !this.sick){
      if(Math.random() < 0.50){
        if(this.facing == "left" && this.x >= 20){
          this.x -= 2;
        } else if(this.x <= canvas.width - 20){
          this.x += 2;
        }
      }
    }

    if(this.hunger > 50000){
      if(Math.random() < this.hunger * 0.0000001){
        this.dead = true;
      }
    }

    if(this.sick && Math.random() < 0.00001){
      this.sick = false;
    } else if(Math.random() < 0.00001 * this.frailty){
      this.sick = true;
    }

    if(this.sick && Math.random() < 0.00001 * (this.frailty / 2)){
      this.dead = true;
    }

    this.hunger++;

    if(!this.dead){
      setTimeout(pokemonAI.bind(this), 300);
    }
  }

  /**
   * Creates a new Pokemon that will hop around the canvas with a
   * number of default stats, and returns them in an object.
   *
   * @param pokemon <Object>: A TexturePacker object of a
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
   * @return <Object> The stats object of the newly created Pokemon,
   * modifying the values of this object will modify the Pokemon.
   */
  Pokegotchi.prototype.newPokemon = function(pokemon){
    var stats = {
      "gender": Math.random() > 0.5 ? "male" : "female",
      "facing": Math.random() > 0.5 ? "left" : "right",
      "moving": true,
      "backTurned": false,
      "calling": false,
      "hunger": 0,
      "happiness": 0,
      "discipline": 0,
      "frailty": 0,
      "sick": 0,
      "dead": false
    };

    /*
     * The callback will run when an animation is complete, meaning
     * that it won't look wierd to change a bunch of states that
     * affect animation...
     *
     * The rest of the state changing is AI-based and will be in
     * pokemonAI()
     */
    display(pokemon, stats, function(){
      if(Math.random() < 0.3){
        stats.moving ^= true;
      }
      if(Math.random() < 0.3){
        stats.facing = stats.facing == "right" ? "left" : "right";
      }
    });

    pokemonAI.call(stats);

    return stats;
  };

  /**
   * Feeds the Pokemon, reducing their hunger.
   *
   * @param pokemon <Object>: The Pokemon you wish to feed
   */
  Pokegotchi.prototype.feed = function(pokemon){
    pokemon.hunger = Math.max(pokemon.hunger - 10000,  0);
  };

  /**
   * Attempts to cure Pokemon with medicine.
   *
   * @param pokemon <Object>: The Pokemon you wish to heal
   */
  Pokegotchi.prototype.cure = function(pokemon){
    pokemon.frailty++;
    if(Math.random() > 0.5 + pokemon.frailty * 0.01){
      pokemon.sick = false;
    }
  };

  /**
   * Internal function that displays the Pokemon on-screen and starts
   * its animations.
   *
   * @param pokemon <Object>: An object converted from a TexturePacker
   * JSON array containing the animatino key specified to be passed
   * into newPokemon()
   *
   * @param parameters <Object>: The stats of the Pokemon to be
   * animated, this includes things like whether it is moving, it's X
   * and Y coordinates, whether or not its back is turned, and so
   * on. This function will pass this argument as the context of the
   * animate() function inside, which will call itself with
   * asynchronous recursion to handle picking the correct animation
   * and displaying it based on the state of this object.
   *
   * @param callback <Function> (Optional): A callback function that
   * is called by animate() when an animation is finished. (All the
   * frames have been run and it is about to loop) This is an ideal
   * time to update state that will change the animation since it will
   * appear seamless if done here.
   */
  function display(pokemon, parameters, callback){
    parameters = parameters || {};
    parameters.frame |= 0;
    callback = callback || function(){};

    if(isNaN(parameters.x)){
      parameters.x = canvas.width * 0.5;
    }
    if(isNaN(parameters.y)){
      parameters.y = canvas.height * 0.5;
    }

    var sprites = new Image();
    var lastFrame = {
      "x": 0,
      "y": 0,
      "w": canvas.width,
      "h": canvas.height
    };

    sprites.src = pokemon.meta.image;

    /**
     * Starts an animation based on the current context's state,
     * renders it, then calls itself with asynchronous recursion every
     * 50 milliseconds.
     */
    function animate(){
      if(this.dead){
        this.animation = pokemon.animations.dead;
      } else if(this.sick){
        this.animation = pokemon.animations.sick;
      } else if(this.moving){
        this.animation = this.backTurned ? pokemon.animations.backMoving : pokemon.animations.moving;
      } else {
        this.animation = this.backTurned ? pokemon.animations.backStanding : pokemon.animations.standing;
      }

      if(this.frame == this.animation.length){
        callback.call(this);
      }

      var sprite = pokemon.frames[(this.frame %= this.animation.length) + this.animation.start];
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
        setTimeout(animate.bind(this), 50 * (1 + this.hunger * 0.00002));
      }
    }

    animate.call(parameters);
  };

  return Pokegotchi;
})();
