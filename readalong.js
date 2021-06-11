var H5P = H5P || {};

H5P.ReadAlong = (function ($) {
  /**
   * Constructor function.
   */
  function C(options, id) {
    this.$ = $(this);
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      text: 'Hello world!',
      audioFile: null,
      image: null
    }, options);
    // Keep provided id.
    this.id = id;
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var self = this;
    var textToShow = "";
    var text = this.options.text;
    var selectableStrings = text.replace(/(&nbsp;|\r\n|\n|\r)/g, ' ')
      .match(/\*[^\*]+\*|[^\s]|\s+/g);

    if (this.options.audioFiles && this.options.audioFiles[0].path) {
      var audio = this.options.audioFiles[0].path;
      var audioUrl = H5P.getPath(audio, this.id)
    }

    if (selectableStrings) {
      selectableStrings.forEach(function (entry) {
        if (entry[0] === "*") {
          var timestamps = entry.match(/\{[^\s]+\}/g);
          if(timestamps){
            timestamps = timestamps[0].replace(/(\{|\}|\s)/g,"").split(":");
          } else {
            timestamps = [0,0];
          }

          entry = entry.replace(/\{[^\s]+\}/g,"");
          
          textToShow += '<span class="clickable" data-start="' + timestamps[0] + '" data-end="' + timestamps[1] + '">' + entry.slice(1, entry.length - 1) + '</span>';
       } else {
          textToShow += entry;
        }

      });
    } 

    $container.addClass("h5p-readalong");

    if (this.options.image && this.options.image.path) {
      $container.append('<img class="cover-image" src="' + H5P.getPath(this.options.image.path, this.id) + '">');
    }
    if (this.options.enablePlay) {
      $container.append('<div class="h5p-audio-minimal-button" id="playall"></div>');
    } 
    
    $container.append('<div class="text">'+textToShow+'</div>');

    // var sb = {
    //   song: null,
    //   init: function () {
    //     sb.song = new Audio();
    //     sb.listeners();
    //   },
    //   listeners: function () {
    //     $("span").click(sb.play);
    //   },
    //   play: function (e) {
    //     sb.song.src = audioUrl;
    //     var st = $(this).attr("data-start");
    //     var et = $(this).attr("data-end");
    //     sb.song.currentTime = st;
    //     sb.song.play();
    //     setTimeout(() => {
    //       sb.song.pause();
    //     }, (et-st)*1000);
    //   }
    // };

    // $(document).ready(sb.init);
    var song = new Audio(audioUrl);

    $(".clickable").on("click", function (e) {
      $("#playall").removeClass("playing");
      $(".clickable").attr("aria-selected", "false");
      $(this).attr("aria-selected", "true");
      song.pause();
      var st = $(this).attr("data-start");
      var et = $(this).attr("data-end");
      song.currentTime = st;
      song.play();
      if (et != 0) {
        setTimeout(() => {
          song.pause();
          $(".clickable").attr("aria-selected", "false");
        }, (et - st) * 1000);
      }  
    });
    

    $("#playall").on("click", function(e){
      
      $(".clickable").attr("aria-selected", "false");
      song.pause();
      song.currentTime = 0;
      song.play();
      $("#playall").addClass("playing");
      var tid = setInterval(selectText,200);
      function selectText() {
        var currentTime = song.currentTime;
        $(".clickable").each(function () {
          var stt = $(this).attr("data-start");
          var ett = $(this).attr("data-end");
          if (stt <= currentTime && ett >= currentTime) {
            $(this).attr("aria-selected", "true");
          } else {
            $(this).attr("aria-selected", "false");
          }
        });
       if (currentTime >= song.duration) {
          clearInterval(tid);
          $("#playall").removeClass("playing");
        }
      }
    });

    // TODO - need to wait for image beeing loaded
    // For now using timer. Should wait for image is loaded...
    // setTimeout(function () {
    //   self.$.trigger('resize');
    // }, 1000);
  };

  return C;
})(H5P.jQuery);