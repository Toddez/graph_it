class Vector2 {

    /**
     * Creates a vector2
     * @author Toddez
     * @param {Number} x 
     * @param {Number} y 
     */
	constructor(x, y) {
		this.x = x;
		this.y = y;
    }
    
    /**
     * Multiply vector by matrix
     * @author Toddez
     * @param {Vector2} v 
     * @param {Array.<Float>} m matrix
     * @returns {Vector2} vector2
     */
    static multiplyMatrix(v, m) {
        let x = m[0] * v.x + m[1] * v.y;
        let y = m[3] * v.x + m[4] * v.y;
        return new Vector2(x, y);
    }
}