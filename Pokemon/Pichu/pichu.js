var pichuFrames = {
  "frames": [
    {
      "filename": "001-NeutralRight.png",
      "frame": {"x":86,"y":72,"w":77,"h":73},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":9,"y":14,"w":77,"h":73},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "002-SwingRight.png",
      "frame": {"x":171,"y":1,"w":81,"h":68},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":7,"y":19,"w":81,"h":68},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "003-MiddleRight.png",
      "frame": {"x":1,"y":1,"w":83,"h":69},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":7,"y":17,"w":83,"h":69},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "004-TopRight.png",
      "frame": {"x":86,"y":147,"w":85,"h":64},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":6,"y":20,"w":85,"h":64},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "005-AirRight1.png",
      "frame": {"x":1,"y":72,"w":83,"h":69},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":7,"y":15,"w":83,"h":69},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "006-AirRight2.png",
      "frame": {"x":1,"y":214,"w":80,"h":69},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":8,"y":16,"w":80,"h":69},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "007-NeutralLeft.png",
      "frame": {"x":173,"y":141,"w":77,"h":73},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":14,"y":14,"w":77,"h":73},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "008-SwingLeft.png",
      "frame": {"x":171,"y":71,"w":81,"h":68},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":12,"y":19,"w":81,"h":68},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "009-MiddleLeft.png",
      "frame": {"x":86,"y":1,"w":83,"h":69},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":10,"y":17,"w":83,"h":69},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "010-TopLeft.png",
      "frame": {"x":165,"y":216,"w":85,"h":64},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":9,"y":20,"w":85,"h":64},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "011-AirLeft1.png",
      "frame": {"x":1,"y":143,"w":83,"h":69},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":10,"y":15,"w":83,"h":69},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    },
    {
      "filename": "012-AirLeft2.png",
      "frame": {"x":83,"y":214,"w":80,"h":69},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x":12,"y":16,"w":80,"h":69},
      "sourceSize": {"w":100,"h":100},
      "pivot": {"x":0.5,"y":0.5}
    }],
  "meta": {
    "app": "http://www.codeandweb.com/texturepacker",
    "version": "1.0",
    "image": "Pokemon/Pichu/Pichu.png",
    "format": "RGBA8888",
    "size": {"w":253,"h":284},
    "scale": "0.1",
    "smartupdate": "$TexturePacker:SmartUpdate:b7239ceddc430c1430163022edac0c73:9f59b3d5f76c061fade3a80b62329625:a209abc03f5c6cb61c2115445901959f$"
  }, "animations": {
    "speed": 100,
    "movingRight": {
      "start":0,
      "length":6
    },
    "movingLeft": {
      "start":6,
      "length":6
    },
    "standingRight": {
      "speed": 500,
      "start":0,
      "length": 2
    },
    "standingLeft": {
      "speed": 500,
      "start":6,
      "length": 2
    },
    "backMoving": {
      "start": 0,
      "length": 6
    },
    "backStanding": {
      "speed": 500,
      "start": 0,
      "length": 2
    },
    "sick": {
      "speed": 750,
      "start": 0,
      "length": 2
    },
    "dead": {
      "start": 0,
      "length": 1
    }
  }
};

var pokegotchi, pichu;
window.onload = function(){
  pokegotchi = new Pokegotchi("pokegotchi");
  pichu = pokegotchi.newPokemon(pichuFrames);
};
