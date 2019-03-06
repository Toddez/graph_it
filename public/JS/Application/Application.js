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
		let self = this;
		setTimeout(function () { self.update(); }, 5);
		
		if (this.onUpdate)
			this.onUpdate();
	}

	// TODO: Implement actual tick/update/render
}