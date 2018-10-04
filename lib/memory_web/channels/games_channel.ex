defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel

  alias Memory.Game
  alias Memory.BackupAgent

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = BackupAgent.get(name) || Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      BackupAgent.put(name, game)
      {:ok, %{"join" => name,
              "game" => Game.client_view(game)
             }, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("click", %{"index" => index}, socket) do
    name = socket.assigns[:name]
    game = Game.click(socket.assigns[:game], index)
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  def handle_in("reset", _, socket) do
    name = socket.assigns[:name]
    game = Game.reset(socket.assigns[:game])
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  def handle_in("flip_back", _, socket) do
    name = socket.assigns[:name]
    game = Game.flip_back(socket.assigns[:game])
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  defp authorized?(_payload) do
    true
  end
end
