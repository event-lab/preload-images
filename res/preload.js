//
/**
 * @since 15-08-20 10:35
 * @author vivaxy
 */
'use strict';
Array.prototype.forEach.call(document.querySelectorAll('img[data-preload]'), function (img) {
    var fullSrc = img.dataset.preload;
    var fullImg = new Image();
    fullImg.addEventListener('load', function () {
        img.src = fullSrc;
    }, false);
    fullImg.src = fullSrc;
    img.removeAttribute('data-preload');
});
