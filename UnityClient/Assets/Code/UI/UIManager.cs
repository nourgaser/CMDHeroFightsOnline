using UnityEngine;
using UnityEngine.UI;

namespace UI
{
    public class UIManager : MonoBehaviour
    {
        public static bool statsChanged = true;

        private GameObject[] yourStatsTextArr;
        private GameObject[] opponentStatsTextArr;
        private Client networking;

        private void Awake()
        {
            yourStatsTextArr = GameObject.FindGameObjectsWithTag("UIStatYours");
            opponentStatsTextArr = GameObject.FindGameObjectsWithTag("UIStatOpponent");
            networking = GameObject.Find("[  Code - Networking ]").GetComponent<Client>();
        }

        // Start is called before the first frame update
        void Start()
        {

        }

        public void updateUIStats()
        {
            Debug.Log("UI stats updated!");
            int i = 0;
            Hero.stats.ForEach(Stat => {
                yourStatsTextArr[i].GetComponent<Text>().text = Stat.name + ": " + Stat.value;
                i++;
            });
            Hero.opponentStats.ForEach(Stat => {
                if (Stat.name == "hp")
                {
                    opponentStatsTextArr[0].GetComponent<Text>().text = "HP : " + Stat.value;

                }
                if (Stat.name == "class")
                {
                    opponentStatsTextArr[1].GetComponent<Text>().text = "Class : " + Stat.value;
                }
            });
        }

        // Update is called once per frame
        void Update()
        {
            if (statsChanged)
            {
                updateUIStats();
                statsChanged = false;
            }
        }
    }
}
