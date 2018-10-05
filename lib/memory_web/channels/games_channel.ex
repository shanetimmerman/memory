defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel

  alias Memory.Game
  alias Memory.BackupAgent

  # join and handle_in functions inspired by those used in in-class
  # hangman example (https://github.com/NatTuck/hangman)
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


  # Each of these functions propagates call to internal
  # Game class and return a JSON with the view
  def handle_in("click", %{"index" => index}, socket) do
    f = fn(game) -> Game.click(game, index) end
    handle(socket, f)
  end

  def handle_in("reset", _, socket) do
    handle(socket, &Game.reset/1)
  end

  def handle_in("flip_back", _, socket) do
    handle(socket, &Game.flip_back/1)
  end

  # Abstracted default behavior for handle_in
  defp handle(socket, f) do
    name = socket.assigns[:name]
    game = f.(socket.assigns[:game])
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  defp authorized?(_payload) do
    true
  end
end
