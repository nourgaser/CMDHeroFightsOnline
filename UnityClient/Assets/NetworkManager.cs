using H.Socket.IO;
using System;
using UnityEngine;
using UnityEngine.SceneManagement;
public class NetworkManager : MonoBehaviour
{
    private readonly System.Uri url = new System.Uri("http://192.168.1.104:8080/socket.io/");
    public static SocketIoClient socket;
    public bool shouldLoadBattle = false;
    private event System.EventHandler ReconnectNeeded;
    //public static event System.EventHandler SocketInitialized;
    void Awake()
    {
        ReconnectNeeded += connect;
        connect(null, null);
        //SocketInitialized += (sender, e) => { };
    }
    private void initSocket()
    {
        Debug.Log("initializing socket");
        socket = new SocketIoClient();
        socket.Disconnected += Client_Disconnected;
        socket.Connected += (sender, e) =>
        {
            Debug.Log("Connected...");
        };
        socket.On("checkConnection", e =>
        {
            socket.Emit("checkConnection", "");
        });
        socket.On("startBattle", (e) =>
        {
            shouldLoadBattle = true;
            Debug.Log("starting battle");
        });

        socket.On("backToMainLobby", (e) =>
        {

        });
        //SocketInitialized.Invoke(null, null);
    }
    private void Client_Disconnected(object sender, H.WebSockets.Args.WebSocketCloseEventArgs e)
    {
        Debug.Log("Disconnected!");
        socket.Disconnected -= Client_Disconnected;
        ReconnectNeeded.Invoke(null, null);
    }
    private async void connect(object sender, EventArgs e)
    {
        Debug.Log("Attempting to connect to the server...");
        initSocket();
        try
        {
            await socket.ConnectAsync(url);
            Debug.Log("Connected successfully!");
        }
        catch
        {
            Debug.Log("Failed to connect to the server...");
            ReconnectNeeded.Invoke(null, null);
        }
    }
    private void Update()
    {
        if (shouldLoadBattle)
        {
            shouldLoadBattle = false;
            DontDestroyOnLoad(gameObject);
            AsyncOperation loadBattle = SceneManager.LoadSceneAsync("BattleScene");
            loadBattle.completed += (e) =>
            {
                SceneManager.MoveGameObjectToScene(gameObject, SceneManager.GetSceneByName("BattleScene"));
            };
        }
    }
    private void OnApplicationQuit()
    {
        ReconnectNeeded -= connect;
        socket.DisconnectAsync();
        socket.Dispose();
    }
}
