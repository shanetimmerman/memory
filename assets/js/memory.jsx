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

        this.state = {
            tiles: tiles,
        };

        this.board = React.createRef();
    }

    /**
     * Shuffles and hide all tiles.
     */
    restart() {
        this.setState({tiles: this.randomizeTiles(this.state.tiles)});
        this.board.current.reset();
    }

    /**
     * Randomizes the ordering of a given array
     * @param arr: array to shuffle
     * @returns {*}: Shuffled array
     */
    randomizeTiles(arr) {
        return arr.sort(function (t1, t2) {
            return 0.5 - Math.random()
        });
    }

    /**
     * Renders the memory game
     * @returns {*}
     */
    render() {
        // Generate the list of tiles
        console.log("Render");

        return <div className="column">

            <h1>Memory Game!</h1>
            <Board tiles={this.state.tiles} ref={this.board} key="gameBoard"/>
            <button onClick={() => this.restart()}>Restart Game</button>
        </div>
    }
}

/**
 Represents the game board.

 Displays the tiles, keeps track of whats been clicked,
 and whats been matched.
 */
class Board extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Create an array mirroring props.tiles
            // representing the visibility of each tile.
            revealed: props.tiles.map((x) => false),

            // Temporary store for index of the first clicked tile
            // in the data array.
            firstClicked: null,
        };

        this.checkMatch = this.checkMatch.bind(this);
    }

    /**
     * Resest the state so all tiles are hidden.
     */
    reset() {
        this.setState({revealed: this.state.revealed.map((x) => false), firstClicked: null});
    }

    /**
     * Handles checking for matches, called twice per potential mathing:
     *
     * On first call, shows the clicked tile and stores its index
     * On second call, shows the clicked tile and checks its value vs
     * the previously clicked tile's. If they match, check if the game has
     * been won. If the don't, wait a bit so the user can see the tile values,
     * then hide both tiles.
     *
     * @param index: index of the clicked tile in this.props.tiles
     */
    checkMatch(index) {
        let clicked = this.props.tiles[index];
        let revealed = this.state.revealed;
        revealed[index] = true;

        if (this.state.firstClicked == null) {
            // If this is the first click, save the index and show the tile
            this.setState({revealed: revealed, firstClicked: index,});
        } else {
            // If this is the second click, show the tile
            this.setState({revealed: revealed});
            let first_index = this.state.firstClicked;
            let last_clicked = this.props.tiles[first_index];

            // Check if both tiles have matching values
            if (last_clicked == clicked) {

                // If they do, check if all tiles are visable
                if (this.state.revealed.every((x) => x)) {

                    // If they are, alert the uer the won
                    // Delayed as board does not update as fast as the alert
                    // would go off. This allows the user to see all tiles.
                    setTimeout(() => alert("You WIN!"), 100);
                }
            } else {

                // If the tiles do not match, hide them after 0.5 seconds,
                // and remove the stored first click value.
                let hide_tiles = () => {
                    revealed[index] = false;
                    revealed[first_index] = false;
                    this.setState({revealed: revealed})
                };
                setTimeout(hide_tiles, 500);
            }
            this.setState({firstClicked: null});
        }
    }

    /**
     * Renders the game board (4 x 4)
     * @returns {*}
     */
    render() {

        // Generates the HTML for a 4 x 4 game board.
        let board = [];
        for (var i = 0; i < 4; i++) {
            let row = [];

            for (var k = 0; k < 4; k++) {
                let index = i * 4 + k;
                row.push(<Tile value={this.props.tiles[index]}
                               revealed={this.state.revealed[index]}
                               handleClick={(x) => this.checkMatch(x)}
                               index={index} key={index}/>);
            }

            board.push(<div className="row"> {row}</div>);
        }

        return <div className="column"> {board} </div>
    }
}

/**
 * Renders a tile element
 * @param props: Properties of the tile
 * @returns {*}
 * @constructor
 */
function Tile(props) {
    // If the tile has been revealed, show its value and disable clicking on it
    if (props.revealed) {
        return <button>{props.value}</button>;
    } else {
        // Otherwise, hide the value (show a '?') and propogate clicks up to the
        // handleClick function of the board
        return <button onClick={() => props.handleClick(props.index)}>?</button>;
    }
}
