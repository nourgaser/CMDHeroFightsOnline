using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using H.Socket.IO;
using System;

namespace UI
{
    public class UIManager : MonoBehaviour
    {
        public static bool statsChanged = true;
        public static bool textToDisplayChanged = true;
        public static string textToDisplay;
        private GameObject textToDisplayObj;
        private GameObject[] yourStatsTextArr;
        private GameObject[] opponentStatsTextArr;
        private void Awake()
        {
            textToDisplayObj = GameObject.Find("anyText");
            yourStatsTextArr = GameObject.FindGameObjectsWithTag("UIStatYours");
            opponentStatsTextArr = GameObject.FindGameObjectsWithTag("UIStatOpponent");
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
                if (Stat.name == "luck")
                {
                    yourStatsTextArr[i].GetComponent<Text>().text = "Luck: ";
                    if (Convert.ToSingle(Stat.value) > 0f)
                    {
                        yourStatsTextArr[i].GetComponent<Text>().text += "+" + Convert.ToSingle(Stat.value) * 100 + "%";
                    }
                    else if (Convert.ToSingle(Stat.value) < 0f)
                    {
                        yourStatsTextArr[i].GetComponent<Text>().text += Convert.ToSingle(Stat.value) * 100 + "%";
                    }
                    else
                    {
                        yourStatsTextArr[i].GetComponent<Text>().text += "+/- 0%";
                    }
                }
                else
                {
                yourStatsTextArr[i].GetComponent<Text>().text = Stat.name + ": " + Stat.value;
                }
                i++;
            });
            Hero.opponentStats.ForEach(Stat => {
                if (Stat.name == "hp")
                {
                    opponentStatsTextArr[0].GetComponent<Text>().text = "HP: " + Stat.value;

                }
                if (Stat.name == "class")
                {
                    opponentStatsTextArr[1].GetComponent<Text>().text = "Class: " + Stat.value;
                }
                if (Stat.name == "luck")
                {
                    opponentStatsTextArr[2].GetComponent<Text>().text = "Luck: ";
                    if (Convert.ToSingle(Stat.value) > 0f)
                    {
                        opponentStatsTextArr[2].GetComponent<Text>().text += "+" + Convert.ToSingle(Stat.value) * 100 + "%";
                    }
                    else if (Convert.ToSingle(Stat.value) < 0f)
                    {
                        opponentStatsTextArr[2].GetComponent<Text>().text += Convert.ToSingle(Stat.value) * 100 + "%";
                    }
                    else
                    {
                        opponentStatsTextArr[2].GetComponent<Text>().text += "+/- 0";
                    }
                }
            });
        }
        public void updateDisplayText()
        {
            textToDisplayObj.GetComponent<Text>().text = textToDisplay;
            textToDisplayObj.SetActive(true);
            StartCoroutine(turnOffText());
        }
        IEnumerator turnOffText()
        {
            yield return new WaitForSeconds(5);
            textToDisplayObj.SetActive(false);
        }

        // Update is called once per frame
        void Update()
        {
            if (statsChanged)
            {
                updateUIStats();
                statsChanged = false;
            }
            if (textToDisplayChanged)
            {
                updateDisplayText();
                textToDisplayChanged = false;
            }
        }
    }
}
