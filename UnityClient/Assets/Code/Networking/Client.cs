using UnityEngine;
using System.Collections.Generic;
using H.Socket.IO;
using Newtonsoft.Json;
public class Client : MonoBehaviour
{
    private static readonly System.Uri url = new System.Uri("http://192.168.1.104:8080/socket.io/");

    public SocketIoClient client = new SocketIoClient();


    public GameObject networkContainer;

    private void Awake()
    {
    }

    // Start is called before the first frame update
    void Start()
    {
        client.Connected += Client_Connected;
        client.Disconnected += Client_Disconnected;
        client.On("message", (e) =>
        {
            Debug.Log(e as string);
        });
        client.On("actions", (e) =>
        {
            Debug.Log(e);
            List<Action> actions = JsonConvert.DeserializeObject<List<Action>>(e);
            Hero.actions = actions;
            ActionButtons.ActionButtonsManager.actionsChanged = true;
        });
        client.On("yourStats", (e) =>
        {
            Debug.Log(e);
            List<Stat> stats = JsonConvert.DeserializeObject<List<Stat>>(e);
            Hero.stats = stats;
            Hero.stats.ForEach(stat =>
            {
                Debug.Log("YOU: "+stat.name + ": " + stat.value);
            });
            UI.UIManager.statsChanged = true;
        });
        client.On("opponentStats", (e) =>
        {
            Debug.Log(e);
            List<Stat> stats = JsonConvert.DeserializeObject<List<Stat>>(e);
            Hero.opponentStats = stats;
            Hero.opponentStats.ForEach(stat =>
            {
                Debug.Log("OPPONENT: " + stat.name + ": " + stat.value);
            });
            UI.UIManager.statsChanged = true;
        });

        connect();
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
