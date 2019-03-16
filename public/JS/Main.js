window.addEventListener('load', () => {

    let app = new Application(30, 30);
    let canvas = new Canvas('webgl', new Vector2(500, 500), null, true);
    let text = new Canvas('2d', new Vector2(500, 500), null, false);
    let graph = new Graph(canvas, text);

    let lastInput = 0;
    let inputChanged = false;

    function map(v, a, b, c, d) {
        if (v == a)
            return c;
        if (v == b)
            return d;

        return c + ((v - a) / (b - a)) * d;
    }

    function checkInput() {
        var functionStrings = document.getElementById('functions').value.split('\n');
        graph.setFunctions(functionStrings);

        var variableStrings = document.getElementById('variables').value.split('\n');
        graph.setVariables(variableStrings);
    }

    app.onStart = function () {
        canvas.setBackground(new Color(0.1, 0.1, 0.11, 1));
        canvas.setMargin(new Vector2(400, 0));
        canvas.fullscreen(true);

        text.setMargin(new Vector2(400, 0));
        text.fullscreen(true);

        let minDim = Math.min((canvas.dimensions.x - canvas.margin.x), (canvas.dimensions.y - canvas.margin.y));
        let xScale = (canvas.dimensions.y - canvas.margin.y) / (minDim * 5);
        let yScale = (canvas.dimensions.x - canvas.margin.x) / (minDim * 5);

        canvas.scale = new Vector2(xScale, yScale);

        let inputCallback = () => {
            inputChanged = true;
            lastInput = app.getTime();
        }

        document.getElementById('functions').addEventListener('input', inputCallback);
        document.getElementById('variables').addEventListener('input', inputCallback);

        document.getElementById('functions').addEventListener('load', checkInput);
        document.getElementById('variables').addEventListener('load', checkInput);
    };

    app.onRender = function (deltaTime) {
        graph.time = app.getTime();
        graph.render();
    }

    app.onUpdate = function (deltaTime) {
        if (inputChanged == true && app.getTime() - lastInput >= 0.15) {
            checkInput();
            inputChanged = false;
        }

        let mouseDelta = Canvas.mouseDelta();
        let scrollDelta = Canvas.scrollDelta();

        if (Canvas.mouseDown) {
            canvas.position.x += ((mouseDelta.x * 2) / (canvas.dimensions.x - canvas.margin.x) * (1 / canvas.scale.x));
            canvas.position.y -= ((mouseDelta.y * 2) / (canvas.dimensions.y - canvas.margin.y) * (1 / canvas.scale.y));
        }

        let mouseRealX = map(Canvas.mousePos.x * 2, 0, canvas.dimensions.x - canvas.margin.x, -1, 1) * (1 / canvas.scale.x);
        let mouseRealY = map(Canvas.mousePos.y * 2, 0, canvas.dimensions.y - canvas.margin.y, -1, 1) * (1 / canvas.scale.y);

        let mousePosX = (canvas.position.x - mouseRealX);
        let mousePosY = (canvas.position.y - mouseRealY);

        if (Math.abs(scrollDelta.x) + Math.abs(scrollDelta.y) > 0) {
            let delta = (scrollDelta.x + scrollDelta.y);

            delta = 10 / ((Math.min(Math.max(0.01, Math.abs(delta)), 1) * Math.sign(delta)) / canvas.scale.x);

            let xDiff = (delta / ((canvas.dimensions.x - canvas.margin.x)));
            let yDiff = (delta / ((canvas.dimensions.y - canvas.margin.y)));

            canvas.scale.x -= Math.min(xDiff * 8, canvas.scale.x * 0.9);
            canvas.scale.y -= Math.min(yDiff * 8, canvas.scale.y * 0.9);

            let ratio = (canvas.dimensions.x - canvas.margin.x) / (canvas.dimensions.y - canvas.margin.y);
            canvas.scale.x = Math.min(Math.max(0.000001 / ratio, canvas.scale.x), 1000000 / ratio);
            canvas.scale.y = Math.min(Math.max(0.000001, canvas.scale.y), 1000000);

            mouseRealX = map(Canvas.mousePos.x * 2, 0, canvas.dimensions.x - canvas.margin.x, -1, 1) * (1 / canvas.scale.x);
            mouseRealY = map(Canvas.mousePos.y * 2, 0, canvas.dimensions.y - canvas.margin.y, -1, 1) * (1 / canvas.scale.y);

            let mousePosXNew = (canvas.position.x - mouseRealX);
            let mousePosYNew = (canvas.position.y - mouseRealY);

            let deltaMousePosX = mousePosX - mousePosXNew;
            let deltaMousePosY = mousePosYNew - mousePosY;

            canvas.position.x += deltaMousePosX;
            canvas.position.y += deltaMousePosY;
        }
    }

    app.start();
});