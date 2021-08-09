using H.Socket.IO;
using Newtonsoft.Json;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using System;

public class BattleNetworkManager : MonoBehaviour
{
    private SocketIoClient socket;
    public static bool isTurn = true;
    private bool shouldLoadMainMenu = false;
    private void Awake()
    {
        socket = NetworkManager.socket;
        //NetworkManager.SocketInitialized += (sender, e) =>
        //{
        //socket.Connected += RetrieveBattleState;
        //};
    }
    //private void RetrieveBattleState(object sender, EventArgs e)
    //{
    //    addBattleListerners();
    //    requestStats();
    //    requestAvailableActions();
    //}

    void Start()
    {
        addBattleListerners();
        requestStats();
        requestAvailableActions();
        Debug.Log("Loaded battle scene");
    }

    private void addBattleListerners()
    {
        socket.On("actions", (e) =>
        {
            List<Action> actions = JsonConvert.DeserializeObject<List<Action>>(e);
            Hero.actions = actions;
            ActionButtons.ActionButtonsManager.actionsChanged = true;
        });
        socket.On("yourStats", (e) =>
        {
            List<Stat> stats = JsonConvert.DeserializeObject<List<Stat>>(e);
            Hero.stats = stats;
            UI.UIManager.statsChanged = true;
        });
        socket.On("opponentStats", (e) =>
        {
            List<Stat> stats = JsonConvert.DeserializeObject<List<Stat>>(e);
            Hero.opponentStats = stats;
            UI.UIManager.statsChanged = true;
        });
        socket.On("turnStarted", (e) =>
        {
            Debug.Log("turnStarted!");
            requestStats();
            if (e == "1")
            {
                isTurn = true;
                Debug.Log("Your turn!");
                requestAvailableActions();
            }
        });
        socket.On("actionTaken", (e) =>
        {
            requestStats();
            Debug.Log(e);
            UI.UIManager.textToDisplay = e;
            UI.UIManager.textToDisplayChanged = true;
            if (isTurn) requestAvailableActions();
        });
        socket.On("turnEnded", (e) =>
        {
            isTurn = false;
            Debug.Log("Your turn ended.");
        });
        socket.On("battleWon", (e) =>
        {
            Debug.Log(e);
            removeBattleListeners();
        });
        socket.On("battleLost", (e) =>
        {
            Debug.Log(e);
            removeBattleListeners();
        });
        Debug.Log("Battle listeners added!");
    }
    private void removeBattleListeners()
    {
        socket.Off("actions");
        socket.Off("yourStats");
        socket.Off("opponentStats");
        socket.Off("turnStarted");
        socket.Off("actionTaken");
        socket.Off("turnEnded");
        socket.Off("battleWon");
        socket.Off("battleLost");
        socket.DisconnectAsync();
        shouldLoadMainMenu = true;
    }

    private void requestStats()
    {
        socket.Emit("statsRequested", "");
    }
    private void requestAvailableActions()
    {
        Debug.Log("requesting actions..");
        socket.Emit("availableActionsRequested", "");
    }

    // Update is called once per frame
    void Update()
    {
        if (shouldLoadMainMenu)
        {
            shouldLoadMainMenu = false;
            AsyncOperation loadMainMenu = SceneManager.LoadSceneAsync("MainMenuScene");

        }
    }
}
