import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.4.0/dist/esm/chess.js";

const chess = new Chess()

export function testChessInstance() {
    while (!chess.isGameOver()) {
        const moves = chess.moves()
        const move = moves[Math.floor(Math.random() * moves.length)]
        chess.move(move)
    }
    console.log(chess.pgn());
}

export function startNewGame() {
    chess.reset();
}

