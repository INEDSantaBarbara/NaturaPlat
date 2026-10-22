/**
 * Arranque del recorrido NaturaPlát.
 *
 * Orden: motor de diapositivas → simulador de impacto → carrito demo.
 */

import { initCart } from './cart.js';
import { initImpact } from './impact.js';
import { initSlides } from './slides.js';

initSlides();
initImpact();
initCart();
