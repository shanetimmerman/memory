import React from 'react';
import ReactDOM from 'react-dom';

export default function game_init(root) {
    ReactDOM.render(<Memory/>, root);
}

function hideTiles() {
  this.setState({ revealed: this.state.revealed.map( (x) => false) });
}

class Memory extends React.Component {
  constructor(props) {
    super(props);

    let list_of_tiles = [...Array(8).keys()];
    let list_of_pairs = list_of_tiles.concat(list_of_tiles);
    let tiles = this.randomizeTiles(list_of_pairs);

    this.state = {
      tiles: tiles,
    }
  }

  restart() {
    this.setState({ tiles: this.randomizeTiles(this.state.tiles) });
    hideTiles();
  }

  randomizeTiles(arr) {
      return arr.sort(function (t1, t2) {
          return 0.5 - Math.random()
      });
  }

  render() {
    // Generate the list of tiles
    console.log("Render");

    return <div className="column">

      <h1>Memory Game!</h1>
      <Board tiles={ this.state.tiles } reset={ hideTiles } key="gameBoard" />
      <button onClick={() => this.restart()}>Restart Game</button>
    </div>
  }
}


class Board extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            revealed: props.tiles.map( (x) => false ),
            firstClicked: null,
        };

        hideTiles = this.props.reset.bind(this);
        this.checkMatch = this.checkMatch.bind(this)
    }

    checkMatch(index) {
      let clicked = this.props.tiles[index];
      let revealed = this.state.revealed;
      revealed[index] = true;

      if (this.state.firstClicked == null) {
        this.setState({ revealed: revealed, firstClicked: index, });
      } else {
        this.setState({ revealed: revealed });
        let first_index = this.state.firstClicked;
        let last_clicked = this.props.tiles[first_index];

        if (last_clicked == clicked) {
          if (this.state.revealed.every((x) => x)) {
            setTimeout(() => alert("You WIN!"), 100);
          }
        } else {
          let hide_tiles = () => {
            revealed[index] = false;
            revealed[first_index] = false;
            this.setState({ revealed: revealed })
          }
          setTimeout(hide_tiles, 500);
        }
        this.setState({ firstClicked: null });
      }
    }

    render() {

        // Generates the HTML for a 4 x 4 game board.
        let board = [];
        for (var i = 0; i < 4; i++) {
            let row = [];

            for (var k = 0; k < 4; k++) {
                let index = i * 4 + k;
                row.push(<Tile value={ this.props.tiles[index] }
                  revealed={ this.state.revealed[index] }
                  handleClick={(x) => this.checkMatch(x)}
                  index={index} key={index}/>);
            }

            board.push(<div className="row"> {row}</div>);
        }

        return <div className="column"> {board} </div>
    }
}

function Tile(props) {
  if (props.revealed) {
    return <button>{ props.value }</button>;
  } else {
    return <button onClick={ () => props.handleClick(props.index) }>?</button>;
  }
}
