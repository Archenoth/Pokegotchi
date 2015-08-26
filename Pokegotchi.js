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
   * element the game will be bound to.
   */
  function Pokegotchi(id){
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = 320;
    this.canvas.height = 240;

    document.getElementById(id).appendChild(this.canvas);

    this.interface = new Interface(this.canvas, function(){
      this.drawInterface();
    });
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

    game.interface.addListener(handleClick.bind(this));
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
    if(this.sick){
      this.frailty++;

      if(Math.random() > 0.5 + this.frailty * 0.01){
        this.sick = false;
        this.happiness += 500;
      }
    } else {
      this.happiness -= 1000;
    }
  };

  /**
   * Cheers the Pokemon up by playing a game.
   */
  Pokemon.prototype.play = function(){
    this.happiness += 10000;
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
    if(this.sick && Math.random() < 0.000001 * this.frailty){
      this.dead = true;
    } else {
      this.happiness--;
    }

    // Hunger grows with time
    this.hunger++;

    // If the Pokemon is feeling bad in some way, it should call us.
    this.calling = (this.sick || this.hunger > 15000 || this.happiness < 0);

    // No more AI if we're dead.
    if(!this.dead){
      setTimeout(pokemonAI.bind(this), 300);
    } else {
      this.calling = false;
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

      // If the Pokemon is calling, we want to highlight the
      // Pokemon_Calling.png interface atlas entry.
      pokemon.game.interface.drawImage("Pokemon_Calling.png", pokemon.calling ? 1 : 0.5);
    });

    pokemonAI.call(pokemon);

    return pokemon;
  };

  /**
   * Handles what action to take when a user clicks the canvas. Should
   * have a Pokemon instance as context.
   *
   * @param image <String>: The name of the image clicked if there was one.
   */
  function handleClick(image){
    switch(image){
      case "Pokemon_Feed.png":
        this.feed();
        break;
      case "Pokemon_Lights.png":
        break;
      case "Pokemon_Games.png":
        this.play();
        break;
      case "Pokemon_Cure.png":
        this.cure();
        break;
      case "Pokemon_Junk_food.png":
        this.feed(true);
        break;
      case "Pokemon_Stats.png":
        break;
      case "Pokemon_No.png":
        break;
      default:
    }

    if(image){
      var interface = this.game.interface;

      interface.drawImage(image, 1);

      setTimeout(function(){
        interface.drawImage(image, 0.5);
      }, 200);
    }
   }

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
  }

  /**
   * Everthing pertaining to the interface that goes along the outside
   * of the window. Nothing to do with the display of the Pokemon in
   * the canvas.
   */
  var Interface = (function(){
    /**
     * The locations of the interface sprites in the Interface image,
     * and their target location on the canvas.
     */
    var interfaceAtlas = {
      "frames": {
        "Pokemon_Calling.png": {
          "frame": {"x":2,"y":2,"w":60,"h":60},
          "location" : {"x":280,"y":200}
        },
        "Pokemon_Cure.png": {
          "frame": {"x":64,"y":2,"w":54,"h":54},
          "location" : {"x":280,"y":10}
        },
        "Pokemon_Feed.png": {
          "frame": {"x":120,"y":2,"w":58,"h":55},
          "location" : {"x":10,"y":10}
        },
        "Pokemon_Games.png": {
          "frame": {"x":180,"y":2,"w":60,"h":60},
          "location" : {"x":190,"y":10}
        },
        "Pokemon_Junk_food.png": {
          "frame": {"x":242,"y":2,"w":54,"h":66},
          "location" : {"x":10,"y":200}
        },
        "Pokemon_Lights.png": {
          "frame": {"x":298,"y":2,"w":68,"h":68},
          "location" : {"x":100,"y":10}
        },
        "Pokemon_No.png": {
          "frame": {"x":368,"y":2,"w":67,"h":60},
          "location" : {"x":190,"y":200}
        },
        "Pokemon_Stats.png": {
          "frame": {"x":437,"y":2,"w":54,"h":54},
          "location" : {"x":100,"y":200}
        }
      }
    };

    /**
     * The constructor for a new interface object.
     *
     * @param canvas <Canvas>: A Canvas element to draw the interface
     * to.
     *
     * @param callback <Function> (Optional): A callback function that
     * will run when the interface images are loaded with this
     * interface object in context.
     */
    function Interface(canvas, callback){
      this.context = canvas.getContext('2d');
      this.interface = new Image();
      this.interface.onload = (callback.bind(this) || function(){});
      this.interface.src = "img/interface.png";
      var listeners = [];

      canvas.onclick = function(e){
        var viewport = e.target.getBoundingClientRect();
        var x = e.clientX - viewport.left;
        var y = e.clientY - viewport.top;
        var whichImage;

        for(var image in interfaceAtlas.frames){
          var c = interfaceAtlas.frames[image].location;
          if(x > c.x && x < c.x + 30 && y > c.y && y < c.y + 30){
            (function(image){
              listeners.forEach(function(listener){
                listener(image);
              });
            })(image);
          }
        }
      };

      this.listeners = listeners;
    }

    /**
     * Adds a click listener to be notified when a click event occurs
     * on the canvas. This listener will be called back with the image
     * name that was clicked if there was an image clicked. If not, it
     * will be called with undefined.
     *
     * @param listener <Function>: The listener to add
     */
    Interface.prototype.addListener = function(listener){
      this.listeners.push(listener);
    };

    /**
     * Draws an image from the intefrace atlas to the screen.
     *
     * @param name <String>: The name of the image to draw from the
     * atlas to the screen.
     *
     * @param alpha <Number> (Optional): The alpha for the
     * draw. Default is 1.
     */
    Interface.prototype.drawImage = function(name, alpha){
      var image = interfaceAtlas.frames[name];
      var f = image.frame;
      var c = image.location;
      var originalAlpha = this.context.globalAlpha;

      this.context.globalAlpha = alpha || 1;
      this.context.clearRect(c.x, c.y, 30, 30);
      this.context.drawImage(this.interface, f.x, f.y, f.w, f.h, c.x, c.y, 30, 30);
      this.context.globalAlpha = originalAlpha;
    };

    /**
     * Draws the interface of the Pokegotchi
     *
     * @param canvas <Canvas>: The canvas element to draw the interface
     * to.
     */
    Interface.prototype.drawInterface = function(canvas){
      for(var name in interfaceAtlas.frames){
        this.drawImage(name, 0.5);
      }

      // The lines seperating the buttons from the Pokemon viewport
      this.context.beginPath();
      this.context.moveTo(0, 50);
      this.context.lineTo(320, 50);
      this.context.stroke();
      this.context.closePath();

      this.context.beginPath();
      this.context.moveTo(0, 190);
      this.context.lineTo(320, 190);
      this.context.stroke();
      this.context.closePath();
    };

    return Interface;
  })();


  return Pokegotchi;
})();
