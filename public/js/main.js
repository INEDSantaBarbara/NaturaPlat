/**
 * Arranque del recorrido NaturaPlát.
 *
 * Orden: diapositivas → galería del héroe → simulador de impacto → carrito demo.
 */

import { initCart } from './cart.js';
import { initGallery } from './gallery.js';
import { initGuide } from './guide.js';
import { initImpact } from './impact.js';
import { initSlides } from './slides.js';
import { initProductVideo } from './video.js';

initSlides();
initGallery();
initGuide();
initProductVideo();
initImpact();
initCart();
