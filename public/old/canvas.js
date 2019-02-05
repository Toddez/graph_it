var colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#0f0'];

class Canvas {

	/**
	 * Constructor for Canvas
	 * @param {String} id 
	 * @param {Number} w 
	 * @param {Number} h 
	 */
	constructor(id, d) {
		this.id = id;
		this.d = d;

		this.create();
		this.resize();

		this.pos = new Vector2(0, 0);
		this.realMouse = new Vector2(0, 0);
		let self = this;
		this.element.onmousemove = function(event) {
			let rect = self.element.getBoundingClientRect();
			self.realMouse = new Vector2(event.clientX - rect.left, event.clientY - rect.top);
		};

		this.mouseDown = false;
		this.element.onmousedown = function() {
			self.getDeltaPos();
			self.mouseDown = true;
		}

		this.element.onmouseup = function() {
			self.mouseDown = false;
		}
	}

	/**
	 * Create html element for this canvas 
	 */
	create() {
		$('body').append('<canvas id="canvas-' + this.id + '"></canvas>');
		this.element = document.getElementById('canvas-' + this.id);
		this.ctx = this.element.getContext('2d');
	}

	resize(d) {
		if (d)
			this.d = d;

		this.element.width = this.d.x;
		this.element.height = this.d.y;
	}

	renderLines(lines, functions) {
		this.ctx.clearRect(0, 0, this.d.x, this.d.y);

		for (let k = 0; k < lines.length; k++) {
			let points = lines[k];
			let color = colors[k % colors.length];

			let first = true;
			for (let i = 0; i < points.length; i++) {
				let x = points[i].x + this.d.x / 2;
				let y = -points[i].y + this.d.y / 2;

				if (first == true) {
					if (x >= 0 && x <= this.d.x && y >= 0 && y <= this.d.y) {
						first = false;
						this.ctx.font = "15px Arial";
						this.ctx.fillStyle = color;
						this.ctx.fillText(functions[k], x + 5, y + 15);

						this.ctx.beginPath();
						this.ctx.arc(x, y, 1, 0 * Math.PI, 2 * Math.PI);
						this.ctx.stroke();
						this.ctx.fill();
					}
				}

				if (i == 0) {
					this.ctx.strokeStyle = color;
					this.ctx.fillStyle = color;
					this.ctx.lineWidth = 1;
					this.ctx.beginPath();
					this.ctx.moveTo(x, y);					
				}

				this.ctx.lineTo(x, y);
				this.ctx.stroke();
			}
		}
	}

	getDeltaPos() {
		let delta = Vector2.subtract(this.realMouse, this.pos);

		this.pos = this.realMouse;
		return delta;
	}
}

class Vector2 {

	/**
	 * Constructor for Vector2
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	static add(a, b) {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	static subtract(a, b) {
		return new Vector2(a.x - b.x, a.y - b.y);
	}

	static multiply(a, b) {
		return new Vector2(a.x * b.x, a.y * b.y);
	}

	static divide(a, b) {
		return new Vector2(a.x / b.x, a.y / b.y);
	}

	static addS(a, v) {
		return new Vector2(a.x + v, a.y + v);
	}

	static subtractS(a, v) {
		return new Vector2(a.x - v, a.y - v);
	}

	static multiplyS(a, v) {
		return new Vector2(a.x * v, a.y * v);
	}

	static divideS(a, v) {
		return new Vector2(a.x / v, a.y / v);
	}

	static abs(v) {
		return new Vector2(Math.abs(v.x), Math.abs(v.y));
	}

	static min(v) {
		return Math.min(v.x, v.y);
	}
}	