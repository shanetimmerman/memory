defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel

  alias Memory.GameServer

  # join and handle_in functions inspired by those used in in-class
  # hangman example (https://github.com/NatTuck/hangman)


  def join("games:" <> game, payload, socket) do
    if authorized?(payload) do
      socket = assign(socket, :game, game)
      view = GameServer.view(game, socket.assigns[:user])
      {:ok, %{"join" => game, "game" => view}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("click", %{"index" => index}, socket) do
    view = GameServer.click(socket.assigns[:game], socket.assigns[:user], index)

    IO.inspect view, label: "The current state is"

    broadcast(socket, "update_state", view)
    {:noreply, socket}

  end

  def handle_in("reset", _, socket) do
    view = GameServer.reset(socket.assigns[:game], socket.assigns[:user])
    broadcast(socket, "update_state", view)

    IO.inspect view, label: "The current state is"

    {:noreply, socket}
  end

  defp authorized?(_payload) do
    true
  end
end
