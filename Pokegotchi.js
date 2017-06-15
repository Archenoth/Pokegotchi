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
    this.dead = false;
    this.naughty = false;
    this.discipline = 0;
    this.frailty = 0;
    this.happiness = 0;
    this.hunger = 60000;
    this.sick = 0;
    this.age = 0;
    this.money = 0;

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
    } else if(this.hunger > 5000){
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
    if(!this.spinning){
      this.spinning = true;
      var spins = 8;

      (function spin(){
        if(spins--){
          this.backTurned ^= true;
          setTimeout(spin.bind(this), 200);
        } else {
          this.money += 10;
          this.happiness += 10000;
          this.spinning = false;
        }
      }.bind(this))();
    }
  };

  /**
   * Displays a super-simple stats overlay
   */
  Pokemon.prototype.showStats = function(){
    var context = this.game.context;
    var canvas = this.game.canvas;
    var fillStyle = context.fillStyle;
    var friendlyHunger = Math.max(0, Math.round(Math.min(this.hunger / 10000, 6)));
    var friendlyHappiness = Math.max(0, Math.round(Math.min((this.happiness / 50000) * 5, 6)));
    var hungryString = "Hunger: " + Array(7 - friendlyHunger).join("♥") + Array(friendlyHunger + 1).join("♡");
    var happyString = "Happy: " + Array(friendlyHappiness + 1).join("♥") + Array(7 - friendlyHappiness).join("♡");

    this.game.interface.setOverlay(true);
    context.fillStyle = "white";
    context.fillText(hungryString, 10, canvas.height * 0.45);
    context.fillText(happyString, 25, canvas.height * 0.65);
    this.showingStats = true;

    context.fillStyle = fillStyle;
  };

  /**
   * Scolds the Pokemon.
   *
   * Decreases happiness, though, if done while the Pokemon is being
   * naughty, it increases discipline.
   *
   * Wrongfully scoling the Pokemon will decrease its happiness
   * severely.
   */
  Pokemon.prototype.scold = function(){
    this.happiness -= 10000;

    if(this.naughty){
      this.discipline++;
      this.calling = false;
    } else {
      this.happiness -= 30000;
    }
  };

  /**
   * Encodes the state of this Pokemon as a string
   *
   * @return <String> This Pokemon, encoded as a String in a way
   * parsable by Pokemon.prototype.decode and
   * Pokemon.prototype.restore
   */
  Pokemon.prototype.encode = function(){
    var flags = 0;

    flags |= this.gender == "male" ? (1 << 0) : 0;
    flags |= this.facing == "left" ? (1 << 1) : 0;
    flags |= this.moving ? (1 << 2) : 0;
    flags |= this.backTurned ? (1 << 3) : 0;
    flags |= this.calling ? (1 << 4) : 0;
    flags |= this.dead ? (1 << 5) : 0;
    flags |= this.naughty ? (1 << 6) : 0;

    return [String.fromCharCode(flags),
            this.discipline.toString(36),
            this.frailty.toString(36),
            this.happiness.toString(36),
            this.hunger.toString(36),
            this.sick.toString(36),
            this.age.toString(36),
            this.money.toString(36)].join("\0");
  };

  /**
   * Sets the state of this Pokemon to the state of the string passed
   * in.
   *
   * @param stateString <String>: A string generated by the
   * Pokemon.prototype.encode function of the Pokemon you wish to
   * restore to.
   */
  Pokemon.prototype.restore = function(stateString){
    var state = stateString.split("\0");
    var flags = state[0].charCodeAt(0);

    this.gender = flags & (1 << 0) ? "male" : "female";
    this.facing = flags & (1 << 1) ? "left" : "right";
    this.moving = !!(flags & (1 << 2));
    this.backTurned = !!(flags & (1 << 3));
    this.calling = !!(flags & (1 << 4));
    this.dead = !!(flags & (1 << 5));
    this.naughty = !!(flags & (1 << 6));

    this.discipline = parseInt(state[1], 36);
    this.frailty = parseInt(state[2], 36);
    this.happiness = parseInt(state[3], 36);
    this.hunger = parseInt(state[4], 36);
    this.sick = parseInt(state[5], 36);
    this.age = parseInt(state[6], 36);
    this.money = parseInt(state[7], 36);
  };

  /**
   * Decodes a Pokemon state string into a Pokemon
   *
   * @param stateString <String>: A string, as returned from
   * Pokemon.prototype.encode which contains the state of a Pokemon
   *
   * @param textureObject <Object> (optional): The texture of the
   * Pokemon you want to create from state. The default is whatever is
   * attached to this Pokemon.
   *
   * @param game <Object> (optional): The game object you want to use
   * for the new Pokemon. The default is the game attached to this
   * Pokemon.
   *
   * @return <Pokemon> The Pokemon made from this state.
   */
  Pokemon.prototype.decode = function(stateString, textureObject, game){
    var pokemon = new Pokemon(textureObject || this.texture, game || this.game);
    pokemon.restore(stateString);

    return pokemon;
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

    // Sometimes Pokemon might be a little naughty
    if(Math.random() < 0.0001 / (this.discipline + 1)){
      this.calling = true;
      this.naughty = true;
    }

    // Hunger grows with time
    this.hunger++;

    // If the Pokemon is feeling bad in some way, it should call us.
    this.calling = (this.sick || this.hunger > 15000 || this.happiness < 0);

    // No more AI if we're dead.
    if(!this.dead){
      this.age++;
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
   * Toggles the lights in the instance the Pokemon is in.
   */
  Pokegotchi.prototype.toggleLights = function(){
    this.interface.setOverlay(this.lights ^= true);
  };


  /**
   * Handles what action to take when a user clicks the canvas. Should
   * have a Pokemon instance as context.
   *
   * @param image <String>: The name of the image clicked if there was one.
   */
  function handleClick(image){
    var hideStats = this.showingStats && image;
    // If we are looking at the Pokemon stats, clicking another button
    // should get rid of the screen.
    if(hideStats){
      this.game.interface.setOverlay(this.game.lights);
      this.showingStats = false;
    }

    switch(image){
      case "Pokemon_Feed.png":
        this.feed();
        break;
      case "Pokemon_Lights.png":
        this.game.toggleLights();
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
        if(!hideStats){
          this.showStats();
        }
        break;
      case "Pokemon_No.png":
        this.scold();
        break;
      default:
        return;
    }

    // Images "blink" when clicked.
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
      pokemon.y = canvas.height * 0.6;
    }

    var animations = pokemon.texture.animations;
    var frames = pokemon.texture.frames;
    var sprites = new Image();
    var lastFrame = {
      "x": 0,
      "y": 0,
      "w": canvas.width,
      "h": canvas.height - (51 * 2)
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
        this.animation = this.facing === "right" ? animations.movingRight : animations.movingLeft;
      } else {
        this.animation = this.facing === "right" ? animations.standingRight : animations.standingLeft;
      }

      if(this.frame == this.animation.length){
        callback.call(this);
      }

      var sprite = frames[(this.frame %= this.animation.length) + this.animation.start];
      var drawX = Math.floor(sprite.spriteSourceSize.x - sprite.sourceSize.w * 0.5) + this.x;
      var drawY = Math.floor(sprite.spriteSourceSize.y - sprite.sourceSize.h * 0.5) + this.y;
      var f = sprite.frame;

      if(!this.game.interface.overlay){
        this.game.interface.drawBackground(lastFrame.x, lastFrame.y, lastFrame.w, lastFrame.h);
        context.drawImage(sprites, f.x, f.y, f.w, f.h, drawX, drawY, f.w, f.h);
      }

      lastFrame.x = drawX;
      lastFrame.y = drawY;
      lastFrame.w = f.w;
      lastFrame.h = f.h;
      this.frame++;

      if(!this.dead){
        var animationSpeed = this.animation.speed || animations.speed || 50;
        // Slows animation down when the Pokemon is hungry
        setTimeout(animate.bind(this), animationSpeed + (this.hunger > 40000 ? 50 : 0));
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

    var background = new Image();
    background.src = "img/Pokeball.svg";

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
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.context.font = "30px Sans";
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
     * Draws the background in the specified coordinates, or across
     * the entire playable section of the canvas if not specified.
     *
     * @param x <Number> (Optional): The x coordinate to draw the
     * background at. Default is 0.
     *
     * @param y <Number> (Optional): The y coordinate to draw the
     * background at. Default is 51 (Where the playble area starts
     * since the border is 50 pixels tall with 1 pixel more for the
     * border)
     *
     * @param w <Number> (Optional): How many pixels wide of the
     * background should we draw? Default is the canvas width.
     *
     * @param h <Number> (Optional): How many pixels tall of the
     * background should we draw? Default is the height of the
     * playable area. (Computed using twice the size of the menu
     * section height).
     */
    Interface.prototype.drawBackground = function(x, y, w, h){
      var alpha = this.context.globalAlpha;
      x = x || 0;
      y = y || 51;
      w = w || this.canvas.width;
      h = h || this.canvas.height - (51 * 2);

      this.context.clearRect(x, y, w, h);
      this.context.globalAlpha = 0.25;
      this.context.drawImage(background, x, y, w, h, x, y, w, h);
      this.context.globalAlpha = alpha;
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
      this.drawBackground();

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

    Interface.prototype.setOverlay = function(on){
      this.overlay = on;

      if(on){
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 51, 320, 138);
      } else {
        this.drawBackground(0, 51, 320, 138);
      }

    };

    return Interface;
  })();


  return Pokegotchi;
})();
