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

            game_won: false,
        };

        this.interactable = true;

        // Channel interactions and functions piping information inspired by in class hangman examples
        // (https://github.com/NatTuck/hangman)

        this.channel = props.channel;

        this.channel.join()
            .receive("ok", this.updateView.bind(this))
            .receive("error", resp => { console.log("Unable to join", resp) });
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
     * Before updating the view, checks if any cards need to be flipped back
     * If any do, sets them to be flipped back after 1 second
     *
     * @param view: updated view to display
     */
    gotClickResult(view) {
        this.updateView(view);
        if (view.game.need_flip_back) {

            this.interactable = false;
            setTimeout(() => {
                this.sendFlipBack();
                this.interactable = true;
            }, 1000);
        }
    }

    /**
     * On click, sends the server the index of the tile and updates
     * view based on the result
     * @param index: Tile index
     */
    sendClick(index) {
        if (this.interactable) {
            this.channel.push("click", { index: index })
                .receive("ok", this.gotClickResult.bind(this));
        }
    }

    /**
     * Resests the game on the server
     */
    sendReset() {
        this.channel.push("reset")
            .receive("ok", this.updateView.bind(this));
    }

    /**
     * Sends message to flip over selected tiles
     */
    sendFlipBack() {
        this.channel.push("flip_back")
            .receive("ok", this.updateView.bind(this));
    }

    /**
     * Renders the memory game
     * @returns {*}
     */
    render() {
        // Generate the list of tiles
        if (this.state.game_won) {
            return <div className="column">
                <h2>You Won in {this.state.score} clicks</h2>
                <img id="blerner"
                     src="https://www.ccis.northeastern.edu/wp-content/uploads/2016/02/Benjamin-Lerner-index-image-e1456779237510.jpg" />
                <div className="row">
                    <button onClick={ this.sendReset.bind(this) }>Restart Game</button>
                </div>
            </div>
        } else {
            return <div className="column">
                <Board
                    board={ this.state.board }
                    handleClick={ this.sendClick.bind(this) }
                    key="gameBoard"/>
                <div className="row">
                    <p id="score-text">Score: { this.state.score }</p>
                    <button onClick={ this.sendReset.bind(this) }>Restart Game</button>
                </div>
            </div>
        }
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

        board.push(<div className="row"> {row}</div>);
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
