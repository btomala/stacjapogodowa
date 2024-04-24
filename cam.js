const camConfig = {
  type       : 'fade',
  heightRatio: 0.56,
  pagination : false,
  arrows     : false,
  cover      : true,
}

const thumbnailConfig = {
  rewind          : true,
  fixedWidth      : 130,
  fixedHeight     : 73,
  isNavigation    : true,
  gap             : 10,
  focus           : 'center',
  pagination      : false,
  cover           : true,
  dragMinThreshold: {
    mouse: 4,
    touch: 10,
  },
  breakpoints : {
    640: {
      fixedWidth  : 66,
      fixedHeight : 38,
    },
  },
}

function initCam(id) {
  var main = new Splide(`#cam${id}`, camConfig );
  var thumbnails = new Splide( `#cam${id}-thumbnail`,  thumbnailConfig);
  
  main.sync( thumbnails );
  main.mount();
  thumbnails.mount();
}

document.addEventListener( 'DOMContentLoaded', function() {
  initCam("1");
  initCam("2");
  initCam("3");
} );  
