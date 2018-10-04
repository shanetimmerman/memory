import ReactDOM from "react-dom";
import React from "react";

export default function game_init(root, channel) {
    ReactDOM.render(<Index />, root);
}

function Index(props) {
    return <div className="row">
        <div className="column">
            <h2>Enter the game you want to join</h2>
            <input id="game_input" />
            <button type="submit" onClick={to_game} >Continue</button>
        </div>
    </div>
}

function to_game() {
    let game_name = document.getElementById("game_input").value;
    if (game_name) {
        game_name = encodeURI(game_name);
        document.location.href = "/game/" + game_name;
    }
}