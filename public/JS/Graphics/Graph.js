class Graph {

	/**
	 * Creates a graph
	 * @author Toddez
	 * @param {Canvas} gl 
	 * @param {Canvas} text 
	 */
	constructor(gl, text) {
		this.gl = gl;
		this.text = text;

		this.functions = new Array();

		this.lineShader = 'attribute vec2 aPos; attribute vec4 aColor; uniform mat3 uMatrix; varying lowp vec4 vColor; void main(void) { float x = aPos.x; float y = aPos.y; x = X; y = Y; vec2 position = (uMatrix * vec3(x, y, 1.0)).xy; gl_Position = vec4(position.xy, 0.0, 1.0); vColor = aColor; }';
		this.pointShader = 'attribute vec2 aPos; attribute vec4 aColor; uniform mat3 uMatrix; varying lowp vec4 vColor; void main(void) { vec2 pos = vec2POS; vec2 position = (uMatrix * vec3(pos.x, pos.y, 1.0)).xy; gl_Position = vec4(position.xy, 0.0, 1.0); vColor = aColor; gl_PointSize = 10.0; }';
		this.fragmentShader = 'varying lowp vec4 vColor; void main(void) { gl_FragColor = vColor; }';
	}

	/**
	 * Set functions
	 * @author Toddez
	 * @param {Array.<String>} functions 
	 */
	setFunctions(functions) {
		this.functions = new Array();

		for (let i = 0; i < functions.length; i++) {
			if (functions[i].length > 0) {
				let string = functions[i].trim();
				let type = string[0];
				if (type == 'x')
					this.functions.push({ type: type, x: string.substring(2, string.length) })
				else if (type == 'y')
					this.functions.push({ type: type, y: string.substring(2, string.length) })
				else if (type == '(' && string[string.length - 1] == ')') {
					this.functions.push({ type: type, pos: string });
				}
			}
		}
	}

	/**
	 * Renders all functions
	 * @author Toddez
	 */
	render() {
		let canvas = this.gl;
		let text = this.text;
		let functions = this.functions;

		let matrix = Matrix3.multiply(Matrix3.scaling(canvas.scale.x, canvas.scale.y), Matrix3.translation(canvas.position.x, canvas.position.y));

		let centerX = matrix[6] / matrix[0];
		let centerY = matrix[7] / matrix[4];

		let oneScaledX = 1 / matrix[0];
		let oneScaledY = 1 / matrix[4];

		let fragment = this.fragmentShader;

		canvas.flush('CLEAR');
		text.flush2d();
		if (functions.length > 0) {
			for (let i = 0; i < functions.length; i++) {
				if (functions[i].type == 'x') {
					try {
						let x = functions[i].x;
						let y = 'aPos.y';

						let vertex = this.lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y).replace(/(time)/gm, this.time);

						canvas.renderLineY(-centerY - oneScaledY, -centerY + oneScaledY, this.gl.dimensions.y - this.gl.margin.y, functions[i].f, new Color(1, 0, 0, 1));
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == 'y') {
					try {
						let x = 'aPos.x';
						let y = functions[i].y;

						let vertex = this.lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y).replace(/(time)/gm, this.time);

						canvas.renderLineX(-centerX - oneScaledX, -centerX + oneScaledX, this.gl.dimensions.x - this.gl.margin.x, functions[i].f, new Color(0, 1, 0, 1));
						canvas.flush('LINE', true, vertex, fragment, this.time);
					} catch { }
				} else if (functions[i].type == '(') {
					try {
						let pos = functions[i].pos;
	
						let vertex = this.pointShader.replace(/(POS)/gm, pos).replace(/(time)/gm, this.time);

						canvas.renderPoint(new Color(0, 0, 1, 1));
						canvas.flush('POINT', true, vertex, fragment, this.time);

						text.renderPointText(oneScaledX, oneScaledY, new Vector2(0, 0), '#00f');
						text.flush2d(true);
					} catch { }
				}
			}
		}

		text.position = canvas.position;
		text.scale = canvas.scale;

		let x = 'aPos.x';
		let y = 'aPos.y';

		let vertex = this.lineShader.replace(/(X)/gm, x).replace(/(Y)/gm, y);

		canvas.renderLineX(-centerX - oneScaledX, -centerX + oneScaledX, 1, function (x) {
			return 0;
		}, new Color(0, 0, 0, 1));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		canvas.renderLineY(-centerY - oneScaledY, -centerY + oneScaledY, 1, function (y) {
			return 0;
		}, new Color(0, 0, 0, 1));
		canvas.flush('LINE', true, vertex, fragment, this.time);

		let min = Math.min(oneScaledX, oneScaledY);
		let size = Math.max(Math.round(min), 10);
		while (size % 10 != 0) {
			size--;
		}

		while (size > min * 0.2) {
			size *= 0.1;
		}

		if (size > 1) {
			centerX = Math.round(centerX);
			while (centerX % size != 0) {
				centerX--;
			}

			centerY = Math.round(centerY);
			while (centerY % size != 0) {
				centerY--;
			}
		}

		canvas.renderGridX(Math.round((-centerX)), -centerY - oneScaledY, -centerY + oneScaledY, size, oneScaledX);
		canvas.flush('LINE', true, vertex, fragment, this.time);

		canvas.renderGridY(Math.round((-centerY)), -centerX - oneScaledX, -centerX + oneScaledX, size, oneScaledY);
		canvas.flush('LINE', true, vertex, fragment, this.time);

		text.renderTextX(Math.round((-centerX)), -centerY - oneScaledY, -centerY + oneScaledY, size, oneScaledX);
		text.renderTextY(Math.round((-centerY)), -centerX - oneScaledX, -centerX + oneScaledX, size, oneScaledY);

		text.flush2d(true);
	}
}