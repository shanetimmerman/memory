defmodule Memory.Game do
#  Create a new memory game
  def new do
    %{
      board: random_board(),
      selected: nil,
      score: 0,
      players: %{},
      waiting_for_flip_back: false,
      last_turn: nil
    }
  end

#  Initializes a player
  def init_player() do
    %{
      score: 0,
    }
  end

#  Gets the view of the game to pipe to the front end
  def client_view(game, user) do
    bd = game.board
    display_board = Enum.map(bd, fn x -> hide_value(x) end)
    players = Enum.map game.players, fn {player_name, player} ->
      %{ name: player_name, score: player.score }
    end

    current_turn = Enum.at(Enum.filter(Map.keys(game.players), &(&1 != game.last_turn)), 0)

    %{
      board: display_board,
      score: game.score,
      game_over: game_won?(bd),
      players: players,
      current_turn: current_turn,
    }
  end

#  Registers a user for the game:
#  NOTE: Only two users can register for any game
#  This function prevents > 2 players per game & duplication of players
  def join(game, user) do
    valid_players = Map.keys(game.players)
    if Kernel.length(valid_players) < 2 && !Map.has_key?(game.players, user) do
      Map.update(game, :players, {}, &(Map.put(&1, user, init_player())))
      |> Map.put(:last_turn, user)
    else
      game
    end
  end

#  Function for client view to hidden tiles
  defp hide_value({value, state}) do
    case state do
      :hidden ->
        %{"value" => "?", "state" => 0}
      :selected ->
        %{"value" => value, "state" => 1}
      :matched ->
        %{"value" => value, "state" => 2}
    end
  end

#  Handles user click on memory tile
  def click(game, player, index) do
    if is_not_playing(game, player)
       || is_not_turn(game, player)
       || game.waiting_for_flip_back do
      game
    else
      updated_game = Map.put(game, :score, game.score + 1)

      case game.selected do
        nil ->
          first_click(updated_game, player, index)
        _ ->
          second_click(updated_game, player, index)
      end
    end
  end

#  Is it not the given user's turn
  defp is_not_turn(game , user) do
    game.last_turn == user
  end

#  Is the given user registered for the game
  defp is_not_playing(game, user) do
    valid_players = Map.keys(game.players)
    Kernel.length(valid_players) != 2 || !Map.has_key?(game.players, user)
  end

#  Handles the first click
  defp first_click(game, player, index) do
    {val, _} = Enum.at(game.board, index)
    plyr = Map.get(game.players, player)

    updated_board = List.replace_at(game.board, index, {val, :selected})
    updated_game = Map.put(game, :board, updated_board)
    |> Map.put(:selected, index)
    |> Map.update(:players, %{}, &(Map.put(&1, player, plyr)))
  end

#  Handles the second click
  defp second_click(game, player, index) do
    board = game.board
    index1 = game.selected

    plyr = Map.get(game.players, player)

    {val1, _} = Enum.at(board, index)
    {val2, _} = Enum.at(board, index1)

    updated_game = Map.put(game, :selected, nil)
                   |> Map.put(:last_turn, player)

    if (val1 == val2) do
      plyr = Map.put(plyr, :score, plyr.score + 1)

      updated_board = List.replace_at(board, index, {val1, :matched})
      updated_board = List.replace_at(updated_board, index1, {val2, :matched})
      Map.put(updated_game, :board, updated_board)
      |> Map.update(:players, %{}, &(Map.put(&1, player, plyr)))
    else
      updated_board = List.replace_at(board, index, {val1, :selected})
      Map.put(updated_game, :board, updated_board)
      |> Map.update(:players, %{}, &(Map.put(&1, player, plyr)))
      |> Map.put(:waiting_for_flip_back, true)
    end
  end

# Resets the board
  def reset(game, player) do
    new()
  end

#  Flips back all tiles marked as selected
  def flip_back(game, player) do
    board = game.board
    updated_board = Enum.map(board, fn {val, status} -> hide?(val, status) end)

    plyr = Map.get(game.players, player, init_player())

    Map.put(game, :board, updated_board)
    |> Map.update(:players, %{}, &(Map.put(&1, player, plyr)))
    |> Map.put(:waiting_for_flip_back, false)
  end

#  Determines if all tiles are matched
  defp game_won?(board) do
    Enum.all?(board, fn {_, status} -> (status == :matched) end)
  end

#  Changes selected tile to hidden
  defp hide?(val, :selected) do
    {val, :hidden}
  end

#  Leaves all hidden and matched tiles unchanged
  defp hide?(val, status) do
    {val, status}
  end

#  Generates a random game board
  def random_board() do
    li = Enum.to_list(1..8)
    vals = Enum.map(li, fn x -> {x, :hidden} end)
    tiles = vals ++ vals
    Enum.shuffle(tiles)
  end
end
