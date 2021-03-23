using UnityEngine;
using H.Socket.IO;
public class Client : MonoBehaviour
{
    private static readonly System.Uri url = new System.Uri("http://localhost:8080/socket.io/");

    SocketIoClient client = new SocketIoClient();

    // Start is called before the first frame update
    void Start()
    {
        client.Connected += Client_Connected;
        client.Disconnected += Client_Disconnected;
        client.On("message", (e) =>
        {
            Debug.Log(e as string);
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
        await client.Emit("message", "HIII NODE! I connected.");
    }

    private void Client_Connected(object sender, H.Socket.IO.EventsArgs.SocketIoEventEventArgs e)
    {
        Debug.Log("Connected!");
    }

    // Update is called once per frame
    void Update()
    {
    }
}
