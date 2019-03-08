// TODO: Implement actual tick/update/render
class Application {
    /**
     * Creates a application
	 * @author Toddez
     * @param {Number} ups desired ups
     * @param {Number} fps desired fps
     */
	constructor(ups, fps) {
		// Set members
		this.ups = ups;
		this.fps = fps;
	}

	/**
	 * Run application
	 * @author Toddez
	 */
	start() {
		if (this.onStart)
			this.onStart();

		this.update();
	}

	/**
	 * Update application
	 * @author Toddez
	 */
	update() {
		let self = this;
		setTimeout(function () { self.update(); }, 10);

		if (this.onUpdate)
			this.onUpdate();
	}
}