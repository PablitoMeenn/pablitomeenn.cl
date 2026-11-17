/* pablitomeenn.cl — JavaScript del sitio, sin dependencias externas. */
(function () {
	'use strict';

	var doc = document;
	var body = doc.body;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var hasObserver = 'IntersectionObserver' in window;

	function $$(selector, root) {
		return Array.prototype.slice.call((root || doc).querySelectorAll(selector));
	}

	// ---------------------------------------------------------------
	// Pantalla de carga
	// ---------------------------------------------------------------
	function loader() {
		var el = doc.querySelector('.fh5co-loader');
		if (el) el.classList.add('is-hidden');
	}

	// ---------------------------------------------------------------
	// Cuenta regresiva (la fecha se define en index.html, atributo data-fecha)
	// ---------------------------------------------------------------
	function countdown() {
		var wrap = doc.querySelector('[data-fecha]');
		if (!wrap) return;

		var target = new Date(wrap.getAttribute('data-fecha'));
		var parts = {
			days: doc.getElementById('countdown-days'),
			hours: doc.getElementById('countdown-hours'),
			minutes: doc.getElementById('countdown-minutes'),
			seconds: doc.getElementById('countdown-seconds')
		};
		var timer;

		function set(name, value) {
			if (parts[name]) parts[name].textContent = String(value).padStart(2, '0');
		}

		function update() {
			var diff = target - new Date();
			if (isNaN(diff) || diff <= 0) {
				// La fecha ya pasó (o es inválida): queda en cero y se detiene.
				set('days', 0); set('hours', 0); set('minutes', 0); set('seconds', 0);
				clearInterval(timer);
				return;
			}
			set('days', Math.floor(diff / 86400000));
			set('hours', Math.floor((diff % 86400000) / 3600000));
			set('minutes', Math.floor((diff % 3600000) / 60000));
			set('seconds', Math.floor((diff % 60000) / 1000));
		}

		timer = setInterval(update, 1000);
		update();
	}

	// ---------------------------------------------------------------
	// Menú lateral en móviles
	// ---------------------------------------------------------------
	function offcanvasMenu() {
		var page = doc.getElementById('page');
		var menu = doc.querySelector('.menu-1 > ul');
		if (!page || !menu) return;

		var panel = doc.createElement('div');
		panel.id = 'fh5co-offcanvas';
		panel.appendChild(menu.cloneNode(true));

		var toggle = doc.createElement('a');
		toggle.href = '#';
		toggle.className = 'js-fh5co-nav-toggle fh5co-nav-toggle fh5co-nav-white';
		toggle.setAttribute('role', 'button');
		toggle.setAttribute('aria-label', 'Menú');
		toggle.setAttribute('aria-controls', 'fh5co-offcanvas');
		toggle.setAttribute('aria-expanded', 'false');
		toggle.appendChild(doc.createElement('i'));

		page.insertBefore(panel, page.firstChild);
		page.insertBefore(toggle, page.firstChild);

		function isOpen() {
			return body.classList.contains('offcanvas');
		}
		function setOpen(open) {
			body.classList.toggle('offcanvas', open);
			body.classList.toggle('overflow', open);
			toggle.classList.toggle('active', open);
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
		}

		toggle.addEventListener('click', function (event) {
			event.preventDefault();
			setOpen(!isOpen());
		});
		doc.addEventListener('click', function (event) {
			if (isOpen() && !panel.contains(event.target) && !toggle.contains(event.target)) {
				setOpen(false);
			}
		});
		doc.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && isOpen()) setOpen(false);
		});

		var lastWidth = window.innerWidth;
		window.addEventListener('resize', function () {
			// Solo al cambiar el ancho: en móviles el alto cambia al hacer scroll.
			if (window.innerWidth !== lastWidth) {
				lastWidth = window.innerWidth;
				if (isOpen()) setOpen(false);
			}
		});
	}

	// ---------------------------------------------------------------
	// Fondos diferidos: data-bg="ruta" se carga al acercarse a pantalla
	// ---------------------------------------------------------------
	function lazyBackgrounds() {
		var items = $$('[data-bg]');
		if (!items.length) return;

		function load(el) {
			el.style.backgroundImage = 'url("' + el.getAttribute('data-bg') + '")';
			el.removeAttribute('data-bg');
		}

		if (!hasObserver) {
			items.forEach(load);
			return;
		}
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					observer.unobserve(entry.target);
					load(entry.target);
				}
			});
		}, { rootMargin: '600px 0px' });
		items.forEach(function (el) { observer.observe(el); });
	}

	// ---------------------------------------------------------------
	// Animación de entrada de los bloques .animate-box
	// ---------------------------------------------------------------
	function animateBoxes() {
		var boxes = $$('.animate-box');
		if (!boxes.length) return;

		var effects = ['fadeIn', 'fadeInLeft', 'fadeInRight'];
		function show(el) {
			var effect = el.getAttribute('data-animate-effect');
			el.classList.add(effects.indexOf(effect) !== -1 ? effect : 'fadeInUp', 'animated-fast');
		}

		if (!hasObserver || reduceMotion) {
			boxes.forEach(show);
			return;
		}
		var observer = new IntersectionObserver(function (entries) {
			var order = 0;
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				observer.unobserve(entry.target);
				// Los bloques que aparecen juntos entran en cascada.
				setTimeout(show, 100 + Math.min(order++, 8) * 150, entry.target);
			});
		}, { rootMargin: '0px 0px -12% 0px' });
		boxes.forEach(function (el) { observer.observe(el); });
	}

	// ---------------------------------------------------------------
	// Contadores numéricos
	// ---------------------------------------------------------------
	function counters() {
		var section = doc.getElementById('fh5co-counter');
		var items = $$('.js-counter');
		if (!items.length) return;

		function run(el) {
			var from = parseFloat(el.getAttribute('data-from')) || 0;
			var to = parseFloat(el.getAttribute('data-to')) || 0;
			var duration = parseFloat(el.getAttribute('data-speed')) || 1000;
			if (reduceMotion) {
				el.textContent = to;
				return;
			}
			var start = null;
			function frame(now) {
				if (start === null) start = now;
				var progress = Math.min((now - start) / duration, 1);
				el.textContent = Math.round(from + (to - from) * progress);
				if (progress < 1) requestAnimationFrame(frame);
			}
			requestAnimationFrame(frame);
		}

		if (!hasObserver || !section) {
			items.forEach(run);
			return;
		}
		items.forEach(function (el) {
			el.textContent = el.getAttribute('data-from') || 0;
		});
		var observer = new IntersectionObserver(function (entries) {
			if (entries.some(function (entry) { return entry.isIntersecting; })) {
				observer.disconnect();
				setTimeout(function () { items.forEach(run); }, 400);
			}
		}, { rootMargin: '0px 0px -10% 0px' });
		observer.observe(section);
	}

	// ---------------------------------------------------------------
	// Scroll: parallax de la portada y botón "volver arriba"
	// ---------------------------------------------------------------
	function scrollEffects() {
		var hero = doc.querySelector('[data-parallax]');
		var ratio = hero ? parseFloat(hero.getAttribute('data-parallax')) || 0 : 0;
		var topButton = doc.querySelector('.js-top');
		var ticking = false;

		function update() {
			ticking = false;
			var y = window.scrollY;
			if (topButton) topButton.classList.toggle('active', y > 200);
			if (hero && ratio && !reduceMotion && y <= hero.offsetHeight) {
				hero.style.backgroundPositionY = Math.round(y * ratio) + 'px';
			}
		}

		window.addEventListener('scroll', function () {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		}, { passive: true });
		update();

		$$('.js-gotop').forEach(function (link) {
			link.addEventListener('click', function (event) {
				event.preventDefault();
				window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
			});
		});
	}

	// ---------------------------------------------------------------
	// Carrusel de mensajes (desplazamiento nativo con scroll-snap)
	// ---------------------------------------------------------------
	function carousels() {
		$$('.testimonial-carousel').forEach(function (carousel) {
			var slides = $$('.item', carousel);
			if (slides.length < 2) return;

			carousel.setAttribute('tabindex', '0');
			carousel.setAttribute('role', 'region');
			carousel.setAttribute('aria-label', 'Mensajes de amistad');

			var dots = doc.createElement('div');
			dots.className = 'carousel-dots';
			var buttons = slides.map(function (slide, index) {
				var button = doc.createElement('button');
				button.type = 'button';
				button.setAttribute('aria-label', 'Mensaje ' + (index + 1) + ' de ' + slides.length);
				button.addEventListener('click', function () { goTo(index); });
				dots.appendChild(button);
				return button;
			});
			carousel.parentNode.insertBefore(dots, carousel.nextSibling);

			function current() {
				return Math.round(carousel.scrollLeft / (carousel.clientWidth || 1));
			}
			function goTo(index) {
				index = (index + slides.length) % slides.length;
				carousel.scrollTo({
					left: index * carousel.clientWidth,
					behavior: reduceMotion ? 'auto' : 'smooth'
				});
			}
			function mark() {
				var active = current();
				buttons.forEach(function (button, index) {
					button.setAttribute('aria-current', index === active ? 'true' : 'false');
				});
			}

			var ticking = false;
			carousel.addEventListener('scroll', function () {
				if (!ticking) {
					ticking = true;
					requestAnimationFrame(function () { ticking = false; mark(); });
				}
			}, { passive: true });
			carousel.addEventListener('keydown', function (event) {
				if (event.key === 'ArrowRight') { event.preventDefault(); goTo(current() + 1); }
				if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(current() - 1); }
			});
			mark();
		});
	}

	// ---------------------------------------------------------------
	// Visor de fotos de la galería (<dialog> nativo)
	// ---------------------------------------------------------------
	function lightbox() {
		var links = $$('a.image-popup');
		// Sin soporte de <dialog> los enlaces abren la foto directamente.
		if (!links.length || typeof HTMLDialogElement !== 'function') return;

		var dialog = doc.createElement('dialog');
		dialog.className = 'lightbox';
		dialog.setAttribute('aria-label', 'Visor de fotos');
		dialog.innerHTML =
			'<button type="button" class="lightbox-close" aria-label="Cerrar">&times;</button>' +
			'<figure><img alt=""><figcaption></figcaption></figure>' +
			'<button type="button" class="lightbox-prev" aria-label="Foto anterior">&#8249;</button>' +
			'<button type="button" class="lightbox-next" aria-label="Foto siguiente">&#8250;</button>';
		body.appendChild(dialog);

		var image = dialog.querySelector('img');
		var caption = dialog.querySelector('figcaption');
		var index = 0;

		function titleOf(link) {
			var title = link.querySelector('h2');
			return title ? title.textContent.trim() : '';
		}
		function show(i) {
			index = (i + links.length) % links.length;
			var link = links[index];
			var text = titleOf(link);
			image.src = link.href;
			image.alt = text;
			caption.textContent = text + ' (' + (index + 1) + ' de ' + links.length + ')';
			// Precarga la siguiente para que el avance sea inmediato.
			new Image().src = links[(index + 1) % links.length].href;
		}

		links.forEach(function (link, i) {
			link.addEventListener('click', function (event) {
				event.preventDefault();
				show(i);
				if (!dialog.open) dialog.showModal();
			});
		});

		dialog.querySelector('.lightbox-prev').addEventListener('click', function () { show(index - 1); });
		dialog.querySelector('.lightbox-next').addEventListener('click', function () { show(index + 1); });
		dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
		dialog.addEventListener('click', function (event) {
			// Clic en el fondo o en la propia foto: cerrar.
			if (!event.target.closest('button')) dialog.close();
		});
		dialog.addEventListener('keydown', function (event) {
			if (event.key === 'ArrowLeft') show(index - 1);
			if (event.key === 'ArrowRight') show(index + 1);
		});
		dialog.addEventListener('close', function () { image.removeAttribute('src'); });

		var touchX = null;
		dialog.addEventListener('touchstart', function (event) {
			touchX = event.changedTouches[0].clientX;
		}, { passive: true });
		dialog.addEventListener('touchend', function (event) {
			if (touchX === null) return;
			var delta = event.changedTouches[0].clientX - touchX;
			touchX = null;
			if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
		}, { passive: true });
	}

	// Cada módulo es independiente: si uno falla, el resto sigue funcionando
	// y la pantalla de carga siempre se retira.
	[countdown, offcanvasMenu, lazyBackgrounds, animateBoxes, counters, scrollEffects, carousels, lightbox, loader]
		.forEach(function (init) {
			try {
				init();
			} catch (error) {
				console.error(error);
			}
		});
}());
