// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html";
import $ from 'jquery';


import socket from "./socket";
import game_init from "./memory";
import index_init from "./index_base";

function start() {
    // Based on class notes for hangman (https://github.com/NatTuck/hangman)
    let root = document.getElementById('root');
    if (root) {
        socket.connect();
        let channel = socket.channel("games:" + window.gameName, {});

        game_init(root, channel);
    }
}

$(start);