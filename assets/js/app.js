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
    let root = document.getElementById('root');
    let index_base = document.getElementById('index_base');
    if (root) {
       let channel = socket.channel("games:" + window.getName, {});

        game_init(root, channel);
    } else if (index_base) {
        console.log('nice');
        index_init(index_base);
    }
}

$(start);