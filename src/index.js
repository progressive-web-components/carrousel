import d from 'd_js';
import Player from './Player';

export default class Carousel {
    constructor(element) {
        if (!('scroll' in Element.prototype)) {
            console.log(
                '[pw-carusel]: Missing Element.prototype.scroll. Consider using a polyfill'
            );
        }

        this.element = element;

        //To calculate the offset of slides relative to the document
        if (d.css(this.element, 'position') === 'static') {
            d.css(this.element, 'position', 'relative');
        }

        this.slides = d.getAll(':scope > *', this.element);

        if (!scrollSnapSupported(this.element)) {
            this.goto('current');

            this.element.addEventListener(
                'scroll',
                debounce(() => this.goto('current'), 100)
            );

            window.addEventListener(
                'resize',
                debounce(() => this.goto('current'), 100)
            );
        }

        d.on('keydown', this.element, e => {
            switch (e.keyCode) {
                case 37: //left
                    this.goto('-1');
                    e.preventDefault();
                    break;

                case 39: //left
                    this.goto('+1');
                    e.preventDefault();
                    break;
            }
        });
    }

    get current() {
        for (let i in this.slides) {
            const slide = this.slides[i];
            const range = slide.offsetLeft + slide.offsetWidth / 3;

            if (range >= this.element.scrollLeft) {
                return slide;
            }
        }
    }

    get player() {
        if (!this._player) {
            this._player = new Player(this);
        }

        return this._player;
    }

    goto(position) {
        const slide = this.getSlide(position);

        try {
            this.element.scroll({
                left: slide.offsetLeft,
                behavior: 'smooth'
            });
        } catch (err) {
            this.element.scrollLeft = slide.offsetLeft;
        }
    }

    getSlide(position) {
        if (Array.prototype.indexOf.call(this.slides, position) !== -1) {
            return position;
        }

        if (position === undefined || position === 'current') {
            return this.current;
        }

        if (position === 'first') {
            return this.slides[0];
        }

        if (position === 'last') {
            return this.slides[this.slides.length - 1];
        }

        let index = Array.prototype.indexOf.call(this.slides, this.current);

        if (typeof position === 'string') {
            if (/^\+[0-9]+$/.test(position)) {
                index += parseInt(position.substr(1), 10);
            } else if (/^\-[0-9]+$/.test(position)) {
                index -= parseInt(position.substr(1), 10);
            } else {
                index = parseInt(position);
            }
        }

        if (index < 0) {
            return this.getSlide('first');
        }

        if (index >= this.slides.length) {
            return this.slides[this.slides.length - 1];
        }

        return this.slides[index];
    }
}

//Check support for CSS scroll snap points
function scrollSnapSupported(el) {
    //Old spec
    const value = d.css(el, 'scroll-snap-points-x');

    if (value) {
        return value !== 'none';
    }

    //New spec
    if (
        d.css(el, 'scroll-snap-type') &&
        d.css(el.firstElementChild, 'scroll-snap-align')
    ) {
        return true;
    }

    return false;
}

function debounce(fn, wait) {
    let timeout;

    return function () {
        const later = function() {
            timeout = null;
            fn();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
