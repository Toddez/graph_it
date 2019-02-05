class Vector2 {

    /**
     * Creates a vector2
     * @param {Number} x 
     * @param {Number} y 
     */
	constructor(x, y) {
		this.x = x;
		this.y = y;
    }
    
    static multiplyMatrix(v, m) {
        let x = m[0] * v.x + m[1] * v.y;
        let y = m[3] * v.x + m[4] * v.y;
        return new Vector2(x, y);
    }
}