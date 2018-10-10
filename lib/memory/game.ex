defmodule Memory.Game do
  def new do
    %{
      board: random_board(),
      selected: nil,
      score: 0,
      players: %{},
      waiting_for_flip_back: false,
#    TODO change state from tracking last turn to tracking current turn
#    Requires use to preload the two players
      last_turn: nil
    }
  end

  def new(players) do
    players = Enum.map players , fn {name, vals} -> 
      {name, %{ init_player() | score:  vals.score || 0}}
    end
    Map.put(new(), :players, Enum.into(players, %{}))
  end

  def init_player() do
    %{
      score: 0,
      flips: MapSet.new(),
    }
  end

  def client_view(game, user) do
    bd = game.board
    display_board = Enum.map(bd, fn x -> hide_value(x) end)
    players = Enum.map game.players, fn {player_name, player} ->
      %{ name: player_name, flips: Enum.into(player.flips, []), score: player.score }
    end

    current_turn = Enum.at(Enum.filter(Map.keys(game.players), &(&1 != game.last_turn)), 0)

    %{
      board: display_board,
      score: game.score,
      game_won: game_won?(bd),
      players: players,
      current_turn: current_turn,
    }
  end

  def hide_value({value, state}) do
    case state do
      :hidden ->
        %{"value" => "?", "state" => 0}
      :selected ->
        %{"value" => value, "state" => 1}
      :matched ->
        %{"value" => value, "state" => 2}
    end
  end

  def click(game, player, index) do
    if is_not_playing(game, player) || is_not_turn(game, player) || game.waiting_for_flip_back do
      #other player should play
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

  def is_not_turn(game , user) do
    false
#    game.last_turn == user
  end

  def is_not_playing(game, user) do
    valid_players = Map.keys(game.players)
    Kernel.length(valid_players) >= 2 && !Map.has_key?(game.players, user)
  end

  defp first_click(game, player, index) do
    # %{
    #   score: 0,
    #   flips: MapSet.new(),
    #   turn: nil,
    # }
    {val, _} = Enum.at(game.board, index)
    plyr = Map.get(game, player, init_player())
    |> Map.update(:flips, MapSet.new(), &(MapSet.put(&1, index)))

    updated_board = List.replace_at(game.board, index, {val, :selected})
    updated_game = Map.put(game, :board, updated_board)
    |> Map.put(:selected, index)
    |> Map.update(:players, %{}, &(Map.put(&1, player, plyr)))
  end

  defp second_click(game, player, index) do
    board = game.board
    index1 = game.selected

    plyr = Map.get(game, player, init_player())
    |> Map.update(:flips, MapSet.new(), &(MapSet.put(&1, index)))

    {val1, _} = Enum.at(board, index)
    {val2, _} = Enum.at(board, index1)

    updated_game = Map.put(game, :selected, nil)

    if (val1 == val2) do
#      TODO change to lambda with update
#      Something in code is resetting score to 0
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


  def reset(game, player) do
    # restarted = Map.put(game, :selected, nil)
    # restarted = Map.put(restarted, :score, 0)
    # Map.put(restarted, :board, random_board())
    new()
  end

  def flip_back(game, player) do
    board = game.board
    updated_board = Enum.map(board, fn {val, status} -> hide?(val, status) end)

    plyr = Map.get(game.players, player, init_player())

    Map.put(game, :board, updated_board)
    |> Map.update(:players, %{}, &(Map.put(&1, player, plyr)))
    |> Map.put(:waiting_for_flip_back, false)
    |> Map.put(:last_turn, player)
  end

  defp game_won?(board) do
    Enum.all?(board, fn {_, status} -> (status == :matched) end)
  end

  def flip_back?(board) do
    Enum.any?(board, fn {_, status} -> (status == :selected) end)
  end

  defp hide?(val, :selected) do
    {val, :hidden}
  end

  defp hide?(val, status) do
    {val, status}
  end

  def random_board() do
    li = Enum.to_list(1..8)
    vals = Enum.map(li, fn x -> {x, :hidden} end)
    tiles = vals ++ vals
    Enum.shuffle(tiles)
  end
end
