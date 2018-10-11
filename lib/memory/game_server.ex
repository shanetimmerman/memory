defmodule Memory.GameServer do
  use GenServer
  alias Memory.Game

  def start_link(_args) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def player_join(game, user) do
    GenServer.call(__MODULE__, {:join, game, user})
  end

  def view(game, user) do
    GenServer.call(__MODULE__, {:view, game, user})
  end

  def click(game, user, index) do
    GenServer.call(__MODULE__, {:click, game, user, index})
  end

  def reset(game, user) do
    GenServer.call(__MODULE__, {:reset, game, user})
  end

  # Server (callbacks)
  ## Implementations

  def init(state) do
    {:ok, state}
  end

  def handle_call({:join, game, user}, _from, state) do
    gg = Map.get(state, game, Game.new)
         |> Game.join(user)
    {:reply, Game.client_view(gg, user), Map.put(state, game, gg)}
  end

  def handle_call({:view, game, user}, _from, state) do
    gg = Map.get(state, game, Game.new)
    {:reply, Game.client_view(gg, user), Map.put(state, game, gg)}
  end

  def handle_call({:click, game, user, index}, _from, state) do
    gg = Map.get(state, game, Game.new)
         |> Game.click(user, index)

    if gg.waiting_for_flip_back do
      Process.send_after(self(), {:flip_back, game, user}, 1000)
    end

    {:reply, Game.client_view(gg, user), Map.put(state, game, gg)}
  end

  def handle_info({:flip_back, game, user}, state) do
    gg = Map.get(state, game, Game.new)
         |> Game.flip_back(user)
    view = Game.client_view(gg, user)
    MemoryWeb.Endpoint.broadcast("games:" <> game, "update_state", view)
    {:noreply, Map.put(state, game, gg)}
  end

  def handle_call({:reset, game, user}, _from, state) do
    gg = Map.get(state, game, Game.new)
         |> Game.reset(user)
    {:reply, Game.client_view(gg, user), Map.put(state, game, gg)}
  end
end
