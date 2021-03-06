import React from 'react';
import ReactDOM from 'react-dom';
import css from "../css/memory.css";

export default function game_init(root, channel) {
    ReactDOM.render(<Memory channel={ channel } />, root);
}

/**
 * Represents the game of memory.
 *
 * Displays the name, board, and button to restart.
 */
class Memory extends React.Component {
    /**
     * Constructs the react component for game_init
     *
     * Initializes list of tile
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            // Represents the board state
            board: [],

            // Number of tiles clicked
            score: 0,

            game_over: false,

            players: [],

            current_turn: undefined,
        };

        // Channel interactions and functions piping information inspired by in class hangman examples
        // (https://github.com/NatTuck/hangman)

        this.channel = props.channel;

        this.channel.join()
            .receive("ok", this.updateView.bind(this))
            .receive("error", resp => { console.log("Unable to join", resp) });

        this.channel.on("update_state", (state) => {
            this.setState(state);
        });
    }

    /**
     * Update the view when the game is updated
     *
     * @param view: updated view to display
     */
    updateView(view) {
        this.setState(view.game);
    }

    /**
     * On click, sends the server the index of the tile and updates
     * view based on the result
     * @param index: Tile index
     */
    sendClick(index) {
        this.channel.push("click", { index: index });
    }

    /**
     * Resests the game on the server
     */
    sendReset() {
        this.channel.push("reset");
    }

    /**
     * Renders the appropriate text depending on game outcome
     * @returns {*}
     */
    render_winner() {
        if (this.state.players[0]["score"] === this.state.players[1]["score"]) {
            return <h2>Game is tied</h2>
        } else {
            let winner = this.state.players.reduce((a, b) => a["score"] > b["score"] ? a : b)["name"];
            return <div>
                <h2>{ winner }  wins!</h2>
            </div>
        }
    }

    /**
     * Renders the final score of the game
     * @returns {*}
     */
    render_final_score() {
        let s1 = this.state.players[0]["score"];
        let s2 = this.state.players[1]["score"];
        return <h3>Final score - { s1 } : { s2 }</h3>
    }

    /**
     * Render player name if the player is playing, else Spectating
     * @returns {*}
     */
    render_user_info() {
        let user = window.userName;
        if (this.state.players.some((x) => x["name"] === user + "")) {
            return <h2>Playing as: {user}</h2>
        } else {
            return <h2>Spectating</h2>
        }
    }
    
    /**
     * Renders the memory game
     * @returns {*}
     */
    render() {
        if (this.state.players.length < 2) {
            return this.render_lobby();
        }
        else if (this.state.game_over) {
            return this.render_win();
        } else {
            return this.render_ongoing();
        }
    }

    /**
     * Renders the winning game screen
     * @returns {*}
     */
    render_win() {
        return <div className="column">
            { this.render_user_info() }
            { this.render_winner() }
            { this.render_final_score() }
            <img id="blerner"
                 src="https://www.ccis.northeastern.edu/wp-content/uploads/2016/02/Benjamin-Lerner-index-image-e1456779237510.jpg" />
            <div className="row">
                <button onClick={ this.sendReset.bind(this) }>Restart Game</button>
            </div>
        </div>
    }

    /**
     * Renders the game lobby screen
     * @returns {*}
     */
    render_lobby() {
        let player_announcement;
        if (this.state.players.length === 1) {
            player_announcement = <div>
                <h3>Player {this.state.players[0]["name"]} has joined</h3>
                <h3>Waiting for Additional Players...</h3>
            </div>
        } else {
            player_announcement = <h3>Waiting for Players to join...</h3>
        }
        return <div>
            <h2>Game Lobby</h2>
            <h3> User name: {window.userName}</h3>
            { player_announcement }
            {(this.state.players.length !== 1 || this.state.players[0]["name"] !== window.userName) &&
                <button onClick={() => this.channel.push("player_join")}>Join Game</button>}
        </div>


    }

    /**
     * Renders an in progress game
     * @returns {*}
     */
    render_ongoing() {
        let player_info = [];
        
        // let player;
        // for (player in this.state.players) {
        player_info.push(<div className="row">
            <div className="column"><table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                      <td>{this.state.players[0]["name"]}</td>
                      <td>{this.state.players[0]["score"]}</td>
                    </tr>
                    <tr>
                      <td>{this.state.players[1]["name"]}</td>
                      <td>{this.state.players[1]["score"]}</td>
                    </tr>
                  </tbody>
                </table>
            </div>
            <div className="column"></div>
            </div>);
        // }
                    /* <div className="row">
            <div className="column">
                <h4 className="player_info">User:</h4>
                <h4 className="player_info">{this.state.players[player]["name"]}</h4>
            </div>
            <div className="column">
                <h4 className="player_info">Score:</h4>
                <h4 className="player_info">{ this.state.players[player]["score"] }
                </h4>
            </div>
            </div> */

        let turn_announcement;
        if (this.state.players.length !== 2) {
            turn_announcement = <h3>Waiting for Additional Players...</h3>
        } else if (this.state.current_turn === window.userName) {
            turn_announcement = <h3>Your Turn</h3>
        } else {
            turn_announcement = <h3>User {this.state.current_turn}'s turn</h3>
        }


        return <div className="column">
            { this.render_user_info() }
            { turn_announcement }
            <Board
                board={ this.state.board }
                handleClick={ this.sendClick.bind(this) }
                key="gameBoard"/>
            <div className="column">
                { player_info }
                <h4 id="score-text">Total Clicks: { this.state.score }</h4>
                <button onClick={ this.sendReset.bind(this) }>Restart Game</button>
            </div>
        </div>
    }
}


 /**
  * class Board - Renders the game board (grid of tiles)
  *
  * @param  {type} props Properties of the board
  * @return {type}       HTML to render for a <Board/>
  */
function Board(props) {
    // Generates the HTML for a 4 x 4 game board.
    let board = [];
    for (var i = 0; i < props.board.length / 4; i++) {
        let row = [];

        for (var k = 0; k < 4; k++) {
            let index = i * 4 + k;
            let tile = props.board[index];
            row.push(<Tile value={ tile.value }
                           state ={ tile.state }
                           handleClick={ () => props.handleClick( index ) }
                           key={ index }/>);
        }

        board.push(<div className="row" key={"row"+i}> {row}</div>);
    }

    return <div className="column"> {board} </div>
}


 /**
  * Tile - Renders a tile element
  *
  * @param  {type} props Properties of the tile
  * @return {type}       HTML to render for a <Tile />
  */
function Tile(props) {
    // A tile's state is either 0 (hidden), 1 (selected)
    // or 2 (matched

    // Converts the internal value to the corresponinding capital letter.
    // Only works if the number of pairs is <= 26.
    let display = String.fromCharCode(97 + props.value);

    // If the tile has been revealed, show its value and disable clicking on it
    switch (props.state) {
        case 0:
            return <div className="hidden tile" onClick={() => props.handleClick()}>
                <p className="hidden-text">?</p>
            </div>;
        case 1:
            return <div className="visible tile">
                <p className="tile-text">{ display }</p>
            </div>;
        case 2:
            return <div className="matched tile">
                <p className="tile-text">{ display }</p>
            </div>;
    }
}
