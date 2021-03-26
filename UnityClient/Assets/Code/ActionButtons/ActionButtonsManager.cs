using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
namespace ActionButtons
{
    public class ActionButtonsManager : MonoBehaviour
    {
        private List<Button> actionButtons = new List<Button>();
        //private Button btn;
        private Client networking;

        public static bool actionsChanged = false;

        private void Awake()
        {
            GameObject[] temp = GameObject.FindGameObjectsWithTag("actionButtons");
            foreach (GameObject action in temp)
            {
                actionButtons.Add(action.GetComponent<Button>());
            }
            networking = GameObject.Find("[  Code - Networking ]").GetComponent<Client>();
            //btn = GetComponent<Button>();
        }

        // Start is called before the first frame update
        void Start()
        {
            
            //btn.onClick.AddListener(() =>
            //{
            //    networking.client.Emit("action", "swingSword");
            //    Debug.Log("Button clicked");
            //});
        }

        public void updateActionButtons()
        {
            int i = 0;
            Hero.actions.ForEach(action =>
            {
                actionButtons[i].transform.GetChild(0).gameObject.GetComponent<Text>().text = action.name;
                actionButtons[i].onClick.AddListener(() =>
                {
                    networking.client.Emit("action", action.name);
                    //actionButtons[i].interactable = false;
                    Debug.Log("Button clicked");
                }); 
                //actionButtons[i].transform.gameObject.SetActive(true);
                i++;
            });
        }

        // Update is called once per frame
        void Update()
        {
            if (actionsChanged)
            {
                updateActionButtons();
                actionsChanged = false;
            }
        }
    }
}
