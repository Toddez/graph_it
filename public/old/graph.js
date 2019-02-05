class Graph {
	constructor(pos, view, points) {
		this.pos = pos;
		this.view = view;
		this.points = points;
	}

	setOnMove(fn) {
		this.onMove = fn;
	}

	move(change) {
		this.pos = Vector2.add(this.pos, change);

		if (this.onMove)
			this.onMove();
	}

	scale(change) {
		this.view = Vector2.add(this.view, change);
	}

	getLines(functions, script) {
		console.log(this.pos);
		
		let dim = this.getDimensions();
		let min = this.getMin();
		let max = this.getMax();
		let res = Vector2.min(dim) / this.points;

		let lines = new Array();
		for (let i = 0; i < functions.length; i++) {
			let line = new Array();
			for (let X = min.x; X <= max.x + res; X += res) {
				for (let Y = min.y; Y <= max.y + res; Y += res) {
					let x = X;
					let y = Y;
					eval(script + ';' + functions[i]);

					let found = false;
					for (let j = 0; j < line.length; j++)
						if (line[j].x == x - this.pos.x && line[j].y == y - this.pos.x)
							found = true;
					if (found == false)
						line.push(new Vector2(x - this.pos.x, y - this.pos.y));
				}
			}
			lines.push(line);
		}

		return lines;
	}

	getMin() {
		return Vector2.subtract(this.pos, Vector2.divideS(this.view, 2));
	}

	getMax() {
		return Vector2.add(this.pos, Vector2.divideS(this.view, 2));
	}

	getDimensions() {
		return Vector2.abs(Vector2.subtract(this.getMin(), this.getMax()));
	}
}