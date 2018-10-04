defmodule Memory.Game do
  def new do
    %{
      board: random_board(),
      selected: nil,
      score: 0,
    }
  end

  def client_view(game) do
    bd = game.board
    display_board = Enum.map(bd, fn x -> hide_value(x) end)
    %{
      board: display_board,
      score: game.score,
      game_won: game_won?(bd),
      need_flip_back: !game.selected && flip_back?(bd),
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

  def click(game, index) do
    updated_game = Map.put(game, :score, game.score + 1)

    case game.selected do
      nil ->
        first_click(updated_game, index)
      _ ->
        second_click(updated_game, index)
    end
  end

  defp first_click(game, index) do
    {val, _} = Enum.at(game.board, index)
    updated_board = List.replace_at(game.board, index, {val, :selected})
    updated_game = Map.put(game, :board, updated_board)
    Map.put(updated_game, :selected, index)
  end

  defp second_click(game, index) do
    board = game.board
    index1 = game.selected

    {val1, _} = Enum.at(board, index)
    {val2, _} = Enum.at(board, index1)

    updated_game = Map.put(game, :selected, nil)

    if (val1 == val2) do
      updated_board = List.replace_at(board, index, {val1, :matched})
      updated_board = List.replace_at(updated_board, index1, {val2, :matched})
      Map.put(updated_game, :board, updated_board)
    else
      updated_board = List.replace_at(board, index, {val1, :selected})
      Map.put(updated_game, :board, updated_board)
    end
  end


  def reset(game) do
    restarted = Map.put(game, :selected, nil)
    restarted = Map.put(restarted, :score, 0)
    Map.put(restarted, :board, random_board())
  end

  def flip_back(game) do
    board = game.board
    updated_board = Enum.map(board, fn {val, status} -> hide?(val, status) end)

    Map.put(game, :board, updated_board)
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
