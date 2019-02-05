class Application {
    /**
     * Creates a application
     * @param {Number} ups desired ups
     * @param {Number} fps desired fps
     */
	constructor(ups, fps) {
		// Set members
		this.ups = ups;
		this.fps = fps;
	}

	start() {
		if (this.onStart)
			this.onStart();

		this.update();
	}

	update() {
		if (this.onUpdate)
			this.onUpdate();

		let self = this;
		setTimeout(function () { self.update(); }, parseInt(1000 / this.ups));
	}

	// TODO: Implement actual tick/update/render
}