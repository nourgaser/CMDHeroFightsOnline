using H.Socket.IO;
using Newtonsoft.Json;
using System.Collections.Generic;
using UnityEngine;

public class Client : MonoBehaviour
{
    private static readonly System.Uri url = new System.Uri("http://192.168.1.105:8080/socket.io/");

    public SocketIoClient client = new SocketIoClient();

    public static bool isTurn = false;

    public GameObject networkContainer;

    public bool needsToAttemptToConnect = false;

    // Start is called before the first frame update
    void Start()
    {
        connect();
    }

    void initClient()
    {
        client = new SocketIoClient();
        client.Connected += Client_Connected;
        client.Disconnected += Client_Disconnected;
        client.On("checkConnection", e =>
        {
            client.Emit("checkConnection", "");
        });
        client.On("startBattle", (e) =>
        {
            addBattleListerners();
        });

        //TEMP!!!
        client.On("backToMainLobby", (e) =>
        {
            client.Emit("queuedIn", "");
        });
    }

    private void addBattleListerners()
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
            isTurn = true;
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
            isTurn = false;
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

    private void removeMatchListeners()
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

    private void Client_Disconnected(object sender, H.WebSockets.Args.WebSocketCloseEventArgs e)
    {
        Debug.Log("Disconnected!");
        needsToAttemptToConnect = true;
    }

    private async void connect()
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
            needsToAttemptToConnect = true;
        }

        //int timeout = 3000;
        //var task = client.ConnectAsync(url);
        //if (await Task.WhenAny(task, Task.Delay(timeout)) == task)
        //{
        //    // task completed within timeout
        //    Debug.Log("Connected successfully!");
        //}
        //else
        //{
        //    // timeout logic
        //    Debug.Log("Failed to connect to the server...");
        //    needsToAttemptToConnect = true;
        //}
    }

    private void Client_Connected(object sender, H.Socket.IO.EventsArgs.SocketIoEventEventArgs e)
    {
        client.Emit("queuedIn", "");
    }

    // Update is called once per frame
    void Update()
    {
        if (needsToAttemptToConnect)
        {
            needsToAttemptToConnect = false;
            connect();
        }
    }

    void OnApplicationQuit()
    {
        //client.Emit("disconnect", "Disconnected.");
        client.DisconnectAsync();
        client.Dispose();
    }

}
