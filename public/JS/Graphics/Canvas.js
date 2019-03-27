class Canvas {

    /**
     * Creates a canvas
	 * @author Toddez
     * @param {String} id 
     * @param {Vector2} dimensions 
	 * @param {String} parent
	 * @param {Boolean} gl true - WebGL, false - 2D
     */
	constructor(id, dimensions, parent, gl) {
		Canvas.canvases.push(this);

		// Set members
		this.id = id;
		this.dimensions = dimensions;
		this.parent = parent;
		this.position = new Vector2(0, 0);
		this.scale = new Vector2(1, 1);
		this.margin = new Vector2(0, 0);

		// Initialize canvas
		this.createElement();
		if (gl == true)
			this.setupWebGL();
		else
			this.setup2d();

		this.setDimensions();
		this.setupInput();
	}

	/**
	 * Creates html element for this canvas
	 * @author Toddez
	 */
	createElement() {
		// Get parent element
		let parentElement = window.document.body;

		if (this.parent)
			parentElement = document.getElementById(this.parent);

		// Create and append canvas element to parent element
		this.element = document.createElement('canvas');
		this.element.id = this.id;
		parentElement.append(this.element);
	}

	/**
	 * Setup WebGL
	 * @author Toddez
	 */
	setupWebGL() {
		// Grab WebGL context
		this.gl = this.element.getContext('webgl2');

		let ext = this.gl.getExtension('EXT_color_buffer_float');
		this.gl.disable(this.gl.SAMPLE_COVERAGE);

		this.pointTexture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.pointTexture);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA32F, 1, 1, 0, this.gl.RGBA, this.gl.FLOAT, null);

		this.pointBuffer = this.gl.createFramebuffer();
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pointBuffer);

		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.pointTexture, 0);

		// Create arrays for vertices and indices
		this.vertices = [];
		this.indices = [];
	}

	/**
	 * Setup 2d
	 * @author Toddez 
	 */
	setup2d() {
		// Grab 2d context
		this.context2d = this.element.getContext('2d');

		// Create array for text
		this.text = [];
	}

	/**
	 * Creates and sets shader program for canvas
	 * @author Toddez
	 * @param {String} vertex
	 * @param {String} fragment 
	 */
	setupShaders(vertex, fragment) {
		// Create, set source and compile vertex shader
		let vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(vertexShader, vertex);
		this.gl.compileShader(vertexShader);

		// Create, set source and compile fragment shader
		let fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(fragmentShader, fragment);
		this.gl.compileShader(fragmentShader);

		// Create shader programs, attach shaders
		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);

		this.gl.useProgram(this.shaderProgram);
	}

	/**
	 * Push vertices and indicies for the x-axis
	 * @author Toddez
	 * @param {Number} centerX 
	 * @param {Number} centerY 
	 * @param {Number} oneScaledX 
	 * @param {Color} color 
	 */
	renderXAxis(centerX, centerY, oneScaledX, color) {
		this.vertices.push(-centerX - oneScaledX);
		this.vertices.push(0);
		this.vertices.push(color.r);
		this.vertices.push(color.g);
		this.vertices.push(color.b);
		this.vertices.push(color.a);

		this.indices.push(this.indices.length);

		this.vertices.push(-centerX + oneScaledX);
		this.vertices.push(0);
		this.vertices.push(color.r);
		this.vertices.push(color.g);
		this.vertices.push(color.b);
		this.vertices.push(color.a);

		this.indices.push(this.indices.length);
	}

	/**
	 * Push vertices and indicies for the y-axis
	 * @author Toddez
	 * @param {Number} centerY 
	 * @param {Number} centerX 
	 * @param {Number} oneScaledY 
	 * @param {Color} color 
	 */
	renderYAxis(centerY, centerX, oneScaledY, color) {
		this.vertices.push(0);
		this.vertices.push(-centerY - oneScaledY);
		this.vertices.push(color.r);
		this.vertices.push(color.g);
		this.vertices.push(color.b);
		this.vertices.push(color.a);

		this.indices.push(this.indices.length);

		this.vertices.push(0);
		this.vertices.push(-centerY + oneScaledY);
		this.vertices.push(color.r);
		this.vertices.push(color.g);
		this.vertices.push(color.b);
		this.vertices.push(color.a);

		this.indices.push(this.indices.length);
	}

	/**
	 * Push vertices and indicies for a line with fixed x
	 * @author Toddez
	 * @param {Number} minX 
	 * @param {Number} maxX 
	 * @param {Number} length 
	 * @param {Color} color 
	 */
	renderLineX(minX, maxX, length, color) {
		if (!color)
			color = new Color(1, 0, 1, 1);

		let resX = Math.abs(maxX - minX) / length;
		for (let x = minX; x <= maxX; x += resX) {
			this.vertices.push(x);
			this.vertices.push(0);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
		}
	}

	/**
	 * Push vertices and indicies for a line with fixed y
	 * @author Toddez
	 * @param {Number} minY 
	 * @param {Number} maxY 
	 * @param {Number} length 
	 * @param {Color} color 
	 */
	renderLineY(minY, maxY, length, color) {
		if (!color)
			color = new Color(1, 0, 1, 1);

		let resY = Math.abs(maxY - minY) / length;
		for (let y = minY; y <= maxY; y += resY) {
			this.vertices.push(0);
			this.vertices.push(y);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
		}
	}

	/**
	 * Push vertex and index for a point
	 * @author Toddez
	 * @param {Color} color 
	 */
	renderPoint(color) {
		if (!color)
			color = new Color(1, 0, 1, 1);

		this.vertices.push(0);
		this.vertices.push(0);
		this.vertices.push(color.r);
		this.vertices.push(color.g);
		this.vertices.push(color.b);
		this.vertices.push(color.a);

		this.indices.push(this.indices.length);
	}

	/**
	 * Push a text object for a point
	 * @author Toddez
	 * @param {Number} oneX 
	 * @param {Number} oneY 
	 * @param {Vector2} pos 
	 * @param {Color} color 
	 */
	renderPointText(oneX, oneY, pos, color) {
		let textX = (pos.x / oneX) * (this.dimensions.x - this.margin.x) / 2;
		let textY = -(pos.y / oneY) * (this.dimensions.y - this.margin.y) / 2;

		this.text.push({ text: '(' + Math.round((pos.x - this.position.x) * 100) / 100 + ', ' + Math.round((pos.y - this.position.y) * 100) / 100 + ')', pos: new Vector2(textX, textY), color: color, align: 'center', base: 'middle', stroke: '#999', strokeWeight: 1 });
	}

	/**
	 * Push vertices and indicies for grid lines in x axis
	 * @author Toddez
	 * @param {Number} centerX 
	 * @param {Number} centerY 
	 * @param {Number} scale 
	 * @param {Number} oneScaledY 
	 * @param {Number} lines 
	 */
	renderGridX(centerX, centerY, scale, oneScaledY, lines) {
		let i = 0;
		let trueCenterX = Math.round(centerX / scale) * scale;
		for (let x = trueCenterX - scale * lines; x <= trueCenterX + scale * lines; x += scale) {
			let color = new Color(0.9, 0.9, 0.9, 1);
			if (Math.round(x / scale) % 5 == 0)
				color.r = color.g = color.b = 0.6;

			this.vertices.push(x);
			this.vertices.push((i % 2 == 0) ? centerY - oneScaledY * 1.005 : centerY + oneScaledY * 1.005);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);

			this.vertices.push(x);
			this.vertices.push((i % 2 == 0) ? centerY + oneScaledY * 1.005 : centerY - oneScaledY * 1.005);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
			i++;
		}
	}

	/**
	 * Push vertices and indicies for grid lines in y axis
	 * @author Toddez
	 * @param {Number} centerY 
	 * @param {Number} centerX 
	 * @param {Number} scale 
	 * @param {Number} oneScaledX 
	 * @param {Number} lines 
	 */
	renderGridY(centerY, centerX, scale, oneScaledX, lines) {
		let i = 0;
		let trueCenterY = Math.round(centerY / scale) * scale;
		for (let y = trueCenterY - scale * lines; y <= trueCenterY + scale * lines; y += scale) {
			let color = new Color(0.9, 0.9, 0.9, 1);
			if (Math.round(y / scale) % 5 == 0)
				color.r = color.g = color.b = 0.6;

			this.vertices.push((i % 2 == 0) ? centerX - oneScaledX * 1.005 : centerX + oneScaledX * 1.005);
			this.vertices.push(y);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);

			this.vertices.push((i % 2 == 0) ? centerX + oneScaledX * 1.005 : centerX - oneScaledX * 1.005);
			this.vertices.push(y);
			this.vertices.push(color.r);
			this.vertices.push(color.g);
			this.vertices.push(color.b);
			this.vertices.push(color.a);

			this.indices.push(this.indices.length);
			i++;
		}
	}

	/**
	 * Pushes text objects for each line in grid in x axis
	 * @author Toddez
	 * @param {Number} centerX
	 * @param {Number} centerY 
	 * @param {Number} scale 
	 * @param {Number} lines 
	 */
	renderTextX(centerX, centerY, scale, lines) {
		let trueCenterX = Math.round(centerX / scale) * scale;
		for (let x = trueCenterX - scale * lines; x <= trueCenterX + scale * lines; x += scale) {

			let textX = ((x + this.position.x) / (1 / this.scale.x)) * (this.dimensions.x - this.margin.x) / 2;
			let textY = ((-this.position.y) / (1 / this.scale.y)) * (this.dimensions.y - this.margin.y) / 2;

			let text = { text: Math.round(x * 1000000) / 1000000, pos: new Vector2(textX, textY), color: '#000', align: 'center', base: 'top', stroke: '#999', strokeWeight: 1 };
			if (text.text == 0)
				text.align = 'right';

			this.text.push(text);
		}
	}

	/**
	 * Pushes text objects for each line in grid in y axis
	 * @author Toddez
	 * @param {Number} centerY 
	 * @param {Number} centerX 
	 * @param {Number} scale 
	 * @param {Number} lines 
	 */
	renderTextY(centerY, centerX, scale, lines) {
		let trueCenterY = Math.round(centerY / scale) * scale;
		for (let y = trueCenterY - scale * lines; y <= trueCenterY + scale * lines; y += scale) {

			let textX = ((this.position.x) / (1 / this.scale.x)) * (this.dimensions.x - this.margin.x) / 2;
			let textY = ((y - this.position.y) / (1 / this.scale.y)) * (this.dimensions.y - this.margin.y) / 2;

			let text = { text: Math.round(-y * 1000000) / 1000000, pos: new Vector2(textX, textY), color: '#000', align: 'right', base: 'middle', stroke: '#999', strokeWeight: 1 }
			if (text.text != 0)
				this.text.push(text);
		}
	}

	/**
	 * Flush all buffers and render them
	 * @author Toddez
	 * @param {String} type LINE | POINT | CLEAR
	 * @param {Boolean} dontClear 
	 * @param {String} vertex 
	 * @param {String} fragment 
	 * @param {Number} time 
	 * @param {Boolean} addPoints 
	 */
	flush(type, dontClear, vertex, fragment, time, addPoints) {
		try {
			let drawMode;
			switch (type) {
				case 'LINE':
					drawMode = this.gl.LINE_STRIP;
					break;
				case 'POINT':
					drawMode = this.gl.POINTS;
					break;
				default:
					drawMode = 'CLEAR';
					break;
			}

			if (type != 'CLEAR') {
				this.setupShaders(vertex, fragment);

				// Create vertex buffer and bind vertices to it
				var vertexBuffer = this.gl.createBuffer();
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
				this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

				// Create index buffer and bind indices to it
				var indexBuffer = this.gl.createBuffer();
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
				this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

				// Bind buffers
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

				// Set aPos attrib
				var pos = this.gl.getAttribLocation(this.shaderProgram, "aPos");
				this.gl.vertexAttribPointer(pos, 2, this.gl.FLOAT, false, 24, 0);
				this.gl.enableVertexAttribArray(pos);

				// Set aColor attrib
				var color = this.gl.getAttribLocation(this.shaderProgram, "aColor");
				this.gl.vertexAttribPointer(color, 4, this.gl.FLOAT, false, 24, 8);
				this.gl.enableVertexAttribArray(color);

				let matrix = Matrix3.scaling(this.scale.x, this.scale.y);
				matrix = Matrix3.multiply(matrix, Matrix3.translation(this.position.x, this.position.y));

				// Set matrix uniform
				let matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "uMatrix");
				this.gl.uniformMatrix3fv(matrixLocation, false, matrix);

				let resLocation = this.gl.getUniformLocation(this.shaderProgram, "uRes");
				this.gl.uniform2fv(resLocation, [this.dimensions.x - this.margin.x, this.dimensions.y - this.margin.y]);
			}

			// Clear to background color
			if (!dontClear) {
				if (this.background)
					this.gl.clearColor(this.background.r, this.background.g, this.background.b, this.background.a);
				else
					this.gl.clearColor(1, 0, 1, 1);

				// Enable depth, clear color and depth buffers
				this.gl.enable(this.gl.DEPTH_TEST);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			}

			if (type == 'POINT' && addPoints == true) {
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.pointTexture);

				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pointBuffer);
				this.gl.viewport(0, 0, 1, 1);

				this.gl.drawElements(drawMode, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

				var data = new Float32Array(4);
				this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.FLOAT, data);

				this.points.push(new Vector2((-1 + (data[0]) * 2) * (1 / this.scale.x), (-1 + (data[1]) * 2) * (1 / this.scale.y)));

				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
				this.gl.viewport(0, 0, this.dimensions.x - this.margin.x, this.dimensions.y - this.margin.y);
				this.gl.drawElements(drawMode, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
			} else {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
				// Set width and height of WebGL's viewport
				this.gl.viewport(0, 0, this.dimensions.x - this.margin.x, this.dimensions.y - this.margin.y);

				if (type != 'CLEAR') {
					this.gl.drawElements(drawMode, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
				}
			}
		} catch { }

		// Reset buffers
		this.vertices = [];
		this.indices = [];
	}

	/**
	 * Clear 2d
	 * @author Toddez
	 * @param {Boolean} dontClear
	 */
	flush2d(dontClear) {
		if (!dontClear || dontClear == false)
			this.context2d.clearRect(0, 0, this.dimensions.x - this.margin.x, this.dimensions.y - this.margin.y);

		this.context2d.font = '12px Courier New';

		for (let i = 0; i < this.text.length; i++) {
			let text = this.text[i];

			let x = (this.dimensions.x - this.margin.x) / 2 + text.pos.x;
			let y = (this.dimensions.y - this.margin.y) / 2 + text.pos.y;

			let h = 6;
			let w = 6 * (text.text + '').length;

			if (x >= this.dimensions.x - this.margin.x - w) {
				x = this.dimensions.x - this.margin.x;
				text.align = 'right';
			} else if (x < w) {
				x = 0;
				text.align = 'left'
			}

			if (y >= this.dimensions.y - this.margin.y - h) {
				y = this.dimensions.y - this.margin.y;
				text.base = 'bottom';
			} else if (y < h) {
				y = 0;
				text.base = 'top'
			}

			if (text.color)
				this.context2d.fillStyle = text.color;
			else
				this.context2d.fillStyle = '#fff';

			if (text.align)
				this.context2d.textAlign = text.align;
			else
				this.context2d.textAlign = 'right';

			if (text.base)
				this.context2d.textBaseline = text.base;
			else
				this.context2d.textBaseline = 'top';

			if (y >= this.dimensions.y - this.margin.y) {
				y = this.dimensions.y - this.margin.y;
			} else if (y < 0) {
				y = 0;
			}

			if (text.stroke) {
				if (text.strokeWeight)
					this.context2d.lineWidth = text.strokeWeight;
				else
					this.context2d.lineWidth = 1;

				this.context2d.strokeStyle = text.stroke;
				this.context2d.strokeText(text.text, x, y);
			} else {
				this.context2d.strokeStyle = '#fff';
				this.context2d.lineWidth = 1;
			}

			this.context2d.fillText(text.text, x, y);
		}

		this.text = [];
	}

	/**
	 * @author Toddez
	 * @param {Color} color 
	 */
	setBackground(color) {
		this.background = color;
	}

	/**
	 * Set size of canvas element, defaults to this.dimensions
	 * @author Toddez
	 * @param {Vector2} dimensions not necessary
	 */
	setDimensions(dimensions) {
		if (dimensions)
			this.dimensions = dimensions;

		// Set width and height of element
		this.element.width = this.dimensions.x - this.margin.x;
		this.element.height = this.dimensions.y - this.margin.y;
	}

	/**
	 * Sets margin of canvas
	 * @param {Vector2} margin 
	 */
	setMargin(margin) {
		this.margin = margin;
		this.setDimensions();
	}

	/**
	 * Set canvas fullscreen
	 * @author Toddez
	 * @param {Boolean} isFullscreen 
	 */
	fullscreen(isFullscreen) {
		if (!this.isFullscreen)
			this.originalDimensions = this.dimensions;

		this.isFullscreen = isFullscreen;

		if (this.isFullscreen == true) {
			let body = document.body;
			let html = document.documentElement;

			let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.offsetHeight);

			this.dimensions = new Vector2(document.body.clientWidth, height);

			let minDim = Math.min((this.dimensions.x - this.margin.x), (this.dimensions.y - this.margin.y));
			let xScale = ((this.dimensions.y - this.margin.y) / (minDim));
			let yScale = ((this.dimensions.x - this.margin.x) / (minDim));

			let ratio = xScale / yScale;

			this.scale.y = this.scale.x / ratio;
		} else {
			if (this.originalDimensions)
				this.dimensions = this.originalDimensions;
		}

		this.setDimensions();
	}

	/**
	 * Set all callbacks for input
	 * @author Toddez 
	 */
	setupInput() {
		let self = this;

		// Mouse
		this.element.onmousemove = function (event) {
			let rect = self.element.getBoundingClientRect();
			Canvas.mousePos = new Vector2(event.clientX - rect.left, event.clientY - rect.top);

			if (Canvas.firstMouseMove) {
				Canvas.lastMousePos = Canvas.mousePos;
				Canvas.firstMouseMove = false;
			}
		};

		this.element.onmousedown = function () {
			Canvas.mouseDown = true;
		}

		this.element.onmouseup = function () {
			Canvas.mouseDown = false;
		}

		// Scroll
		this.element.addEventListener('wheel', function (event) {
			Canvas.scrollTotal = new Vector2(Canvas.scrollTotal.x + event.deltaX, Canvas.scrollTotal.y + event.deltaY);
		}, false);
	}

	/**
	 * Set listeners for mouse events
	 * @author Toddez
	 */
	static setupMouse() {
		Canvas.mouseDown = false;
		Canvas.mousePos = new Vector2(0, 0);
		Canvas.lastMousePos = new Vector2(0, 0);
		Canvas.firstMouseMove = true;
	}

	/**
	 * Set listener for scroll event
	 * @author Toddez
	 */
	static setupScroll() {
		Canvas.scrollTotal = new Vector2(0, 0);
		Canvas.lastScroll = new Vector2(0, 0);
	}

	/**
	 * Set listener for key events
	 * @author Toddez
	 */
	static setupKeys() {
		Canvas.keys = {};

		window.addEventListener('keydown', (event) => {
			let key = Canvas.keys[event.which];
			if (key) {
				key.down = true;
				if (key.onDown)
					key.onDown();
			}
		});

		window.addEventListener('keyup', (event) => {
			let key = Canvas.keys[event.which];
			if (key) {
				key.down = false;
				if (key.onUp)
					key.onUp();
			}
		});
	}

	/**
	 * Add listeners for specified keycode
	 * @author Toddez
	 * @param {Number} keycode 
	 * @param {Function} onDown 
	 * @param {Function} onUp 
	 */
	static registerKey(keycode, onDown, onUp) {
		Canvas.keys[keycode] = { down: false, onDown: onDown, onUp: onUp };
	}

	/**
	 * Returns if specified key is down
	 * @author Toddez
	 * @param {Number} keycode 
	 * @returns {Boolean} isDown
	 */
	static getKeyDown(keycode) {
		if (Canvas.keys[keycode])
			return Canvas.keys[keycode].down;
		else
			return false;
	}

	/**
	 * Returns the delta mouse position
	 * @author Toddez
	 * @returns {Vector2} delta
	 */
	static mouseDelta() {
		let delta = new Vector2(Canvas.mousePos.x - Canvas.lastMousePos.x, Canvas.mousePos.y - Canvas.lastMousePos.y);
		Canvas.lastMousePos = Canvas.mousePos;
		return delta;
	}

	/**
	 * Returns the delta scroll
	 * @author Toddez
	 * @returns {Vector2} delta
	 */
	static scrollDelta() {
		let delta = new Vector2(Canvas.scrollTotal.x - Canvas.lastScroll.x, Canvas.scrollTotal.y - Canvas.lastScroll.y);
		Canvas.lastScroll = Canvas.scrollTotal;
		return delta;
	}

	/**
	 * On window reseize, update all canvases' dimensions if fullscreen
	 * @author Toddez
	 */
	static windowResizeCallback() {
		if (Canvas.canvases)
			for (let i = 0; i < Canvas.canvases.length; i++) {
				if (Canvas.canvases[i].isFullscreen)
					Canvas.canvases[i].fullscreen(true);
			}
	}
}

// Static variables
Canvas.canvases = new Array();

window.addEventListener('load', () => {
	// Set global callbacks
	window.addEventListener('resize', Canvas.windowResizeCallback)

	// Setup input
	Canvas.setupMouse();
	Canvas.setupKeys();
	Canvas.setupScroll();
});