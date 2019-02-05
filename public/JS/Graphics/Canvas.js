class Canvas {

    /**
     * Creates a canvas
	 * @author Toddez
     * @param {String} id 
     * @param {Vector2} dimensions 
     */
	constructor(id, dimensions, parent) {
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
		this.setupWebGL();
		this.setDimensions();
		this.setupMouse();
		this.setupKeys();
		this.setupScroll();
	}

	/**
	 * Creates html element for this canvas
	 * @author Toddez
	 */
	createElement() {
		// Get parent element
		let parentElement = $('body');
		if (this.parent)
			parentElement = $(this.parent);

		// Create and append canvas element to parent element
		parentElement.append('<canvas id="' + this.id + '"></canvas>');
		this.element = document.getElementById(this.id);
	}

	/**
	 * Setup WebGL
	 * @author Toddez
	 */
	setupWebGL() {
		// Grab WebGL context
		this.gl = this.element.getContext('experimental-webgl');

		// Create arrays for vertices and indices
		this.vertices = [];
		this.indices = [];
	}

	/**
	 * Creates shader program for canvas
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

		// Create shader program, attach shaders and use the shader program
		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);
		this.gl.useProgram(this.shaderProgram);
	}

	/**
	 * Render a single triangle
	 * @author Toddez
	 * @param {Array} verts 
	 */
	renderTriangle(verts, colors) {
		for (let i = 0; i < verts.length; i++) {
			this.vertices.push(verts[i].x);
			this.vertices.push(verts[i].y);
			this.vertices.push(colors[i].r);
			this.vertices.push(colors[i].g);
			this.vertices.push(colors[i].b);
			this.vertices.push(colors[i].a);
			this.indices.push(this.indices.length);
		}
	}

	/**
	 * Renders a square divided into length^2 squares
	 * @author Toddez
	 * @param {Number} min min corner
	 * @param {Number} max max corner
	 * @param {Number} length squares per side, total # squares = length ^ 2
	 */
	renderSquare(min, max, length) {
		let res = Math.abs(max - min) / length;
		for (let y = min; y <= max; y += res) {
			for (let x = min; x <= max; x += res) {
				this.vertices.push(x);
				this.vertices.push(y);
				this.vertices.push(0.15);
				this.vertices.push(0.15);
				this.vertices.push(0.15);
				this.vertices.push(1);
			}
		}

		for (let y = 0; y <= length; y++) {
			for (let x = 0; x <= length; x++) {
				if (y != length && x < length) {
					this.indices.push(x + y * (length + 1));
					this.indices.push(x + 1 + (y + 1) * (length + 1));
					this.indices.push(x + 1 + y * (length + 1));
				}

				if (y != 0 && x < length) {
					this.indices.push(x + y * (length + 1));
					this.indices.push(x + 1 + y * (length + 1));
					this.indices.push(x + (y - 1) * (length + 1));
				}
			}
		}
	}

	renderLineX(minX, maxX, length) {
		let resX = Math.abs(maxX - minX) / length;
		for (let x = minX; x <= maxX; x += resX) {
			this.vertices.push(x);
			this.vertices.push(0);
			this.vertices.push(0.15);
			this.vertices.push(0.15);
			this.vertices.push(0.15);
			this.vertices.push(1);

			this.indices.push(this.indices.length);
		}
	}

	renderLineY(minY, maxY, length) {
		let resY = Math.abs(maxY - minY) / length;
		for (let y = minY; y <= maxY; y += resY) {
			this.vertices.push(0);
			this.vertices.push(y);
			this.vertices.push(0.15);
			this.vertices.push(0.15);
			this.vertices.push(0.15);
			this.vertices.push(1);

			this.indices.push(this.indices.length);
		}
	}

	renderLineDouble(minX, maxX, minY, maxY, length) {
		let resX = Math.abs(maxX - minX) / length;
		let resY = Math.abs(maxY - minY) / length;
		for (let x = minX; x <= maxX; x += resX) {
			for (let y = minY; y <= maxY; y += resY) {
				this.vertices.push(x);
				this.vertices.push(y);
				this.vertices.push(0.15);
				this.vertices.push(0.15);
				this.vertices.push(0.15);
				this.vertices.push(1);

				this.indices.push(this.indices.length);
			}
		}
	}

	renderGridX(minX, maxX, minY, maxY, resX) {
		let i = 0;
		for (let x = minX + resX; x < maxX; x += resX) {
			this.vertices.push(x);
			this.vertices.push((i % 2 == 0) ? minY - 1 : maxY + 1);
			this.vertices.push(0.35);
			this.vertices.push(0.35);
			this.vertices.push(0.35);
			this.vertices.push(0.5);

			this.indices.push(this.indices.length);

			this.vertices.push(x);
			this.vertices.push((i % 2 == 0) ? maxY + 1 : minY - 1);
			this.vertices.push(0.35);
			this.vertices.push(0.35);
			this.vertices.push(0.35);
			this.vertices.push(0.5);

			this.indices.push(this.indices.length);
			i++;
		}
	}

	renderGridY(center, length) {
		let resY = Math.abs(maxY - minY) / length;
	}

	/**
	 * Flush all buffers and render them
	 * @author Toddez
	 */
	flush(dontClear) {
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

		// Calculate matrix
		let translationMatrix = Matrix3.translation(this.position.x, this.position.y);
		let scaleMatrix = Matrix3.scaling(this.scale.x, this.scale.y);
		let matrix = Matrix3.multiply(translationMatrix, scaleMatrix);

		// Set matrix uniform
		let matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "uMatrix");
		this.gl.uniformMatrix3fv(matrixLocation, false, matrix);

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

		// Set width and height of WebGL's viewport
		this.gl.viewport(0, 0, this.dimensions.x - this.margin.x, this.dimensions.y - this.margin.y);

		// Draw the triangles
		this.gl.drawElements(this.gl.LINE_STRIP, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

		// Reset buffers
		this.vertices = [];
		this.indices = [];
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
		} else {
			if (this.originalDimensions)
				this.dimensions = this.originalDimensions;
		}

		this.setDimensions();
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

	/**
	 * Set listeners for mouse events
	 * @author Toddez
	 */
	setupMouse() {
		this.mouseDown = false;
		this.mousePos = new Vector2(0, 0);
		this.lastMousePos = new Vector2(0, 0);
		this.firstMouseMove = true;

		let self = this;
		this.element.onmousemove = function (event) {
			let rect = self.element.getBoundingClientRect();
			self.mousePos = new Vector2(event.clientX - rect.left, event.clientY - rect.top);

			if (self.firstMouseMove) {
				self.lastMousePos = self.mousePos;
				self.firstMouseMove = false;
			}
		};

		this.element.onmousedown = function () {
			self.mouseDown = true;
		}

		this.element.onmouseup = function () {
			self.mouseDown = false;
		}
	}

	/**
	 * Set listener for scroll event
	 * @author Toddez
	 */
	setupScroll() {
		this.scrollTotal = new Vector2(0, 0);
		this.lastScroll = new Vector2(0, 0);

		let self = this;
		this.element.addEventListener('wheel', function (event) {
			self.scrollTotal = new Vector2(self.scrollTotal.x + event.deltaX, self.scrollTotal.y + event.deltaY);
		}, false);
	}

	/**
	 * Set listener for key events
	 * @author Toddez
	 */
	setupKeys() {
		this.keys = {};

		let self = this;
		$(window).on('keydown', function (event) {
			let key = self.keys[event.which];
			if (key) {
				key.down = true;
				if (key.onDown)
					key.onDown();
			}
		});

		$(window).on('keyup', function (event) {
			let key = self.keys[event.which];
			if (key) {
				key.down = false;
				if (key.onUp)
					key.onUp();
			}
		});
	}

	registerKey(keycode, onDown, onUp) {
		this.keys[keycode] = { down: false, onDown: onDown, onUp: onUp };
	}

	getKeyDown(keycode) {
		if (this.keys[keycode])
			return this.keys[keycode].down;
		else
			return false;
	}

	/**
	 * Returns the delta mouse position
	 * @author Toddez
	 * @returns {Vector2} delta
	 */
	mouseDelta() {
		let delta = new Vector2(this.mousePos.x - this.lastMousePos.x, this.mousePos.y - this.lastMousePos.y);
		this.lastMousePos = this.mousePos;
		return delta;
	}

	/**
	 * Returns the delta scroll
	 * @author Toddez
	 * @returns {Vector2} delta
	 */
	scrollDelta() {
		let delta = new Vector2(this.scrollTotal.x - this.lastScroll.x, this.scrollTotal.y - this.lastScroll.y);
		this.lastScroll = this.scrollTotal;
		return delta;
	}
}

// Static variables
Canvas.canvases = new Array();

$(document).ready(function () {

	// Set global callbacks
	$(window).resize(Canvas.windowResizeCallback);
});