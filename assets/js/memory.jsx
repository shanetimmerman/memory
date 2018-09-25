import React from 'react';
import ReactDOM from 'react-dom';

export default function game_init(root) {
    ReactDOM.render(<Memory/>, root);
}

/**
 * Represents the game of memory.
 *
 * Displays the name, board, and button to restart.
 */
class Memory extends React.Component {
    /**
     * Cunstructs the react component for game_init
     *
     * Initializes list of tile
     * @param props
     */
    constructor(props) {
        super(props);

        let list_of_tiles = [...Array(8).keys()];
        let list_of_pairs = list_of_tiles.concat(list_of_tiles);
        let tiles = this.randomizeTiles(list_of_pairs);
        let visibility_pairs = tiles.map((x) =>
         {return { value: x, visible: false, matched: false }})

        this.state = {
            // Represents the board state
            board: visibility_pairs,

            // Number of tiles clicked
            score: 0,

            // Temporary store for index of the first clicked tile
            // in the data array.
            firstClicked: null,

            // Stores if game has been won
            gameWon: false
        };

        this.incrementScore = this.incrementScore.bind(this);
    }

    /**
     * Shuffles and hide all tiles, sets score back to 0.
     */
    restart() {
        let shuffled_tiles = this.randomizeTiles(this.state.board);
        let reset_tiles = shuffled_tiles.map((x) =>
            {return { value: x.value, visible: false, matched: false }});

        this.setState({ board: reset_tiles,
                        score: 0,
                        firstClicked: null,
                        gameWon: false,
                     });
    }

    /**
     * randomizeTiles - Randomizes the ordering of an array
     *
     * @param  {Array} arr array to shuffle
     * @return {Array}     Shuffled array
     */
    randomizeTiles(arr) {
        return arr.sort(function (t1, t2) {
            return 0.5 - Math.random()
        });
    }

     /**
      * incrementScore - Incremenents the score
      *
      * @return {type}  Void
      */
     incrementScore() {
       this.setState({ score: this.state.score + 1 });
     }

     /**
      * checkMatch - Handles clicks and checking for matches
      *
      * Called twice per potential mathing:
      *   - On first call, shows the clicked tile and stores its index
      *   - On second call, shows the clicked tile and checks its value vs
      *       the previously clicked tile's. If they match, check if the game
      *       has been won. If the don't, wait a bit so the user can see the
      *       tile values then hide both tiles.
      *
      * @param  {type} index index of the clicked tile in this.state.board
      * @return {type}       Void
      */
     checkMatch(index) {
         // Bubbles up the click to the Game
         this.incrementScore();

         let board_copy = this.state.board;
         let this_click = board_copy[index];
         this_click.visible = true;

         if (this.state.firstClicked == null) {
             // If this is the first click, save the index and show the tile
             this.setState({ board: board_copy, firstClicked: index, });
         } else {
             // If this is the second click, show the tile
             this.setState({ board: board_copy });

             let first_click = board_copy[this.state.firstClicked];

             // Check if both tiles have matching values
             if (first_click.value == this_click.value) {
                 first_click.matched = true;
                 this_click.matched = true;
                 this.setState({ board: board_copy })

                 this.checkWin();

             } else {

                 // If the tiles do not match, hide them after 1 seconds,
                 // and remove the stored first click value.
                 let hide_tiles = () => {
                     this_click.visible = false;
                     first_click.visible = false;
                     this.setState({ board: board_copy })
                 };
                 setTimeout(hide_tiles, 1000);
             }
             this.setState({ firstClicked: null });
         }
     }


     /**
      * checkWin - Checks if all tiles are visible (i.e. all pairs have
      *            been matched).
      *
      * If the game is one, it will display an alert.
      *
      * @return {type}  Void
      */
     checkWin() {
         // If they do, check if all tiles are visable
         if (this.state.board.every((tile) => tile.visible)) {
             // If they are, alert the uer the won
             // Delayed as board does not update as fast as the alert
             // would go off. This allows the user to see all tiles.
             this.setState({ gameWon: true })
         }
     }

    /**
     * Renders the memory game
     * @returns {*}
     */
    render() {
        // Generate the list of tiles
        if (this.state.gameWon)
            return <div className="column">

                <h1>Memory Game!</h1>
                <h2>You Won in {this.state.score} clicks</h2>
                <div className="row">
                    <button onClick={() => this.restart()}>Restart Game</button>
                </div>
            </div>
        else {
            return <div className="column">

                <h1>Memory Game!</h1>
                <Board
                    board={ this.state.board }
                    checkMatch={ this.checkMatch.bind(this) }
                    key="gameBoard"/>
                <div className="row">
                    <p id="score-text">Score: { this.state.score }</p>
                    <button onClick={() => this.restart()}>Restart Game</button>
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
    for (var i = 0; i < 4; i++) {
        let row = [];

        for (var k = 0; k < 4; k++) {
            let index = i * 4 + k;
            let tile = props.board[index]
            row.push(<Tile value={ tile.value }
                           visible={ tile.visible }
                           matched={ tile.matched }
                           handleClick={ (x) => props.checkMatch(x) }
                           index={ index }
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
    // Converts the internal value to the corresponinding capital letter.
    // Only works if the number of pairs is <= 26.
    let display = String.fromCharCode(97 + props.value);

    // If the tile has been revealed, show its value and disable clicking on it
    if (props.matched) {
        return <div className="matched tile">
            <p className="tile-text">{ display }</p>
        </div>;
    } else if (props.visible) {
        return <div className="visible tile">
            <p className="tile-text">{ display }</p>
        </div>
    } else {
        // Otherwise, hide the value (show a '?') and propogate clicks up to the
        // handleClick function of the board
        return <div className="hidden tile" onClick={() => props.handleClick(props.index)}>
            <p className="tile-text">?</p>
        </div>;
    }
}
