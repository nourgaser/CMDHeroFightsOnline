using UnityEngine;
using System.Collections.Generic;
using H.Socket.IO;
using Newtonsoft.Json;
using UnityEngine.UI;

public class Client : MonoBehaviour
{
    private static readonly System.Uri url = new System.Uri("http://192.168.1.105:8080/socket.io/");

    public SocketIoClient client = new SocketIoClient();

    public static bool isTurn = false;

    public GameObject networkContainer;

    private void Awake()
    {

    }

    // Start is called before the first frame update
    void Start()
    {
        client.Connected += Client_Connected;
        client.Disconnected += Client_Disconnected;
        client.On("startBattle", (e) =>
        {
            addBattleListerners();
        });

        //TEMP!!!
        client.On("backToMainLobby", (e) =>
        {
            client.Emit("queuedIn", "");
        });


        connect();
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
    }

    private async void connect()
    {
        await client.ConnectAsync(url);
    }

    private void Client_Connected(object sender, H.Socket.IO.EventsArgs.SocketIoEventEventArgs e)
    {
        Debug.Log("Connected!");
        client.Emit("queuedIn", "");
    }

    // Update is called once per frame
    void Update()
    {
    }

    void OnApplicationQuit()
    {
        client.Emit("disconnect", "Disconnected.");
        client.DisconnectAsync();
        client.Dispose();
    }

}
