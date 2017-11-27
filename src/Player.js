export default class Player {
    constructor(carrousel) {
        this.carrousel = carrousel;
        this.interval = 5000;
        this.direction = '+1';
        this.isPlaying = false;
    }

    play(interval = this.interval) {
        const go = () => {
            let slide = this.carrousel.getSlide(this.direction);

            if (slide === this.carrousel.current) {
                this.direction = this.direction === '+1' ? '-1' : '+1';
                slide = this.carrousel.getSlide(this.direction);
            }

            this.carrousel.goto(slide);
            this.play();
        };

        this.isPlaying = true;
        this.timeout = setTimeout(go, interval);
    }

    stop() {
        clearInterval(this.timeout);
        this.isPlaying = false;
    }
}
