//*********************************************************************
//      Daddelkiste Disco Points Version 0.90 - 2016 / 2017
//      Javascript implementation of an "Advanced Slot Machine"
//
//      Copyright (C) 2017 Rainer Wess, Osnabrück, Germany
//      Open Source / Freeware - released under GPL 2
//*********************************************************************

var audio = new Audio();
       audio.src = "sound/audio_sprite.mp3";
       audio.pause();
       audio.load();
       
       audio.addEventListener('ended',function(){
         audio.pause();
         audio.currentTime = 0.0;
    });
    
function audio_pause() {
    audio.pause();
    audio.currentTime = 0.0;
}

function audio_stop() {
    audio.pause();
    audio.currentTime = 0.0;
}

function audio_play(sprite) {

  switch (sprite) {
  
      case "stille":
          audio.currentTime = 0.0;
      break;
      case "walzenstop":
          audio.currentTime = 2.0;
      break;
      case "abbuchen":
          audio.currentTime = 5.0;
      break;
      case "risiko1":
           audio.currentTime = 8.0;
       break;
       case "risiko2":
            audio.currentTime = 10.0;
       break;
       case "angenommen":
           audio.currentTime = 12.0;
       break;
       case "ausspielung":
            audio.currentTime = 15.0;
       break;
       case "hauptgewinn":
            audio.currentTime = 30.0;
       break;
       }
    audio.play();
}