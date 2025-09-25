//Gets an Area of Widht by Height
//Returns a random point within that area

export function rngPoint(width, height) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    return { x: x, y: y };
}