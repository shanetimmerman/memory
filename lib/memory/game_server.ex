defmodule Memory.GameServer do
  use GenServer
  alias Memory.Game

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def view(game, user) do
    GenServer.call(__MODULE__, {:view, game, user})
  end

  def flip_back(id) do
    call_genserver(id, :flip_back)
  end

  def click(id, index) do
    call_genserver(id, {:click, index})
  end

  def reset(id) do
    call_genserver(id, :reset)
  end

  defp call_genserver(id, data) do
    {_, state, _} = GenServer.call(reg(id), data)
    {:ok, state}
  end

  # Server (callbacks)

  #@impl true
  def init(state) do
    {:ok, state}
  end
  
  def handle_call({:click, index}, state) do
    f = fn(game) -> Game.click(game, index) end
    handle_call_gen(state, f)
  end

  def handle_call(:flip_back, state) do
    handle_call_gen(state, &Game.flip_back/1)
  end

  def handle_call(:reset, state) do
    handle_call_gen(state, &Game.reset/1)
  end
  
  defp handle_call_gen(state, f) do
    game = f.(state)
    {:reply, Game.client_view(game), game}
  end
end
