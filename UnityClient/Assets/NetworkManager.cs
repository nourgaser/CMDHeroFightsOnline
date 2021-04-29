using H.Socket.IO;
using Newtonsoft.Json;
using System.Collections.Generic;
using UnityEngine;
public static class NetworkManager
{
    private static readonly System.Uri url = new System.Uri("http://192.168.1.105:8080/socket.io/");

    public static SocketIoClient client;

    //private static bool isTurn = false;
    public static bool shouldLoadBattle = false;

    private static event System.EventHandler ReconnectNeeded;
    static NetworkManager()
    {
        ReconnectNeeded += (sender, e) =>
        {
            connect();
        };
        connect();
    }

    private static void initClient()
    {
        client = new SocketIoClient();
        client.Disconnected += Client_Disconnected;
        client.On("checkConnection", e =>
        {
            client.Emit("checkConnection", "");
        });
        client.On("startBattle", (e) =>
        {
            addBattleListerners();
            shouldLoadBattle = true;
            Debug.Log("starting battle");
        });

        client.On("backToMainLobby", (e) =>
        {

        });
    }

    private static void addBattleListerners()
    {
        client.On("actions", (e) =>
        {
            List<Action> actions = JsonConvert.DeserializeObject<List<Action>>(e);
            Hero.actions = actions;
            ActionButtons.ActionButtonsManager.actionsChanged = true;
        });
        client.On("yourStats", (e) =>
        {
            List<Stat> stats = JsonConvert.DeserializeObject<List<Stat>>(e);
            Hero.stats = stats;
            UI.UIManager.statsChanged = true;
        });
        client.On("opponentStats", (e) =>
        {
            List<Stat> stats = JsonConvert.DeserializeObject<List<Stat>>(e);
            Hero.opponentStats = stats;
            UI.UIManager.statsChanged = true;
        });
        client.On("turnStarted", (e) =>
        {
            Debug.Log("Your turn!");
            //isTurn = true;
        });
        client.On("actionTaken", (e) =>
        {
            Debug.Log(e);
            UI.UIManager.textToDisplay = e;
            UI.UIManager.textToDisplayChanged = true;
        });
        client.On("turnEnded", (e) =>
        {
            Debug.Log("Your turn ended.");
            //isTurn = false;
        });
        client.On("battleWon", (e) =>
        {
            Debug.Log(e);
            removeMatchListeners();
        });
        client.On("battleLost", (e) =>
        {
            Debug.Log(e);
            removeMatchListeners();
        });
        Debug.Log("Battle listeners added!");
    }

    private static void removeMatchListeners()
    {
        client.Off("actions");
        client.Off("yourStats");
        client.Off("opponentStats");
        client.Off("turnStarted");
        client.Off("actionTaken");
        client.Off("turnEnded");
        client.Off("battleWon");
        client.Off("battleLost");
        client.Emit("backToMainLobby", "");
    }

    private static void Client_Disconnected(object sender, H.WebSockets.Args.WebSocketCloseEventArgs e)
    {
        Debug.Log("Disconnected!");
        ReconnectNeeded.Invoke(null, null);
    }

    private static async void connect()
    {
        Debug.Log("Attempting to connect to the server...");
        initClient();
        try
        {
            await client.ConnectAsync(url);
            Debug.Log("Connected successfully!");
        }
        catch
        {
            Debug.Log("Failed to connect to the server...");
            ReconnectNeeded.Invoke(null, null);
        }
    }
}
