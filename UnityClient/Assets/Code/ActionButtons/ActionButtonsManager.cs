using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using H.Socket.IO;
namespace ActionButtons
{
    public class ActionButtonsManager : MonoBehaviour
    {
        private Button endTurnButton;
        private List<Button> actionButtons = new List<Button>();
        //private Button btn;
        private SocketIoClient socket = NetworkManager.socket;

        public static bool actionsChanged = false;

        private void Awake()
        {
            endTurnButton = GameObject.FindGameObjectWithTag("endTurnButton").GetComponent<Button>();
            GameObject[] temp = GameObject.FindGameObjectsWithTag("actionButtons");
            foreach (GameObject action in temp)
            {
                actionButtons.Add(action.GetComponent<Button>());
            }
            //btn = GetComponent<Button>();
        }

        public void updateActionButtons()
        {
            Debug.Log("actionButtons updated!");
            actionButtons.ForEach(button =>
            {
                button.transform.GetChild(0).gameObject.GetComponent<Text>().text = "";
                button.onClick.RemoveAllListeners();
                button.transform.gameObject.SetActive(false);
            });
            int i = 0;
            Hero.actions.ForEach(action =>
            {
                actionButtons[i].transform.gameObject.SetActive(true);
                actionButtons[i].transform.GetChild(0).gameObject.GetComponent<Text>().text = action.name + ": " + action.moveCost;
                actionButtons[i].onClick.RemoveAllListeners();
                actionButtons[i].onClick.AddListener(() =>
                {
                    socket.Emit("action", action.name);
                    actionButtons[i].transform.gameObject.SetActive(false);
                    Debug.Log("Button clicked");
                }); 
                i++;
            });

            endTurnButton.onClick.RemoveAllListeners();
            endTurnButton.onClick.AddListener(() =>
            {
                socket.Emit("turnEnded");
                Debug.Log("Ending turn..");
                endTurnButton.interactable = false;
            });
            endTurnButton.interactable = true;
        }

        // Update is called once per frame
        void Update()
        {
            if (actionsChanged)
            {
                actionsChanged = false;
                updateActionButtons();
            }
        }
    }
}
