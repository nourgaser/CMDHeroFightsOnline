using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using TMPro;
using UnityEngine;

public class queueElapsedTime : MonoBehaviour
{
    private static short elapsedSecs, elapsedMins;
    private static float msCounter;
    // Start is called before the first frame update
    void Start()
    {
        elapsedSecs = 0; elapsedMins = 0; msCounter = 0;
    }
    // Update is called once per frame
    void Update()
    {
        if (msCounter >= 1000)
        {
            if (elapsedSecs == 59)
            {
                elapsedSecs = 0;
                elapsedMins++;
            }
            else
            {
                elapsedSecs++;
            }
            msCounter = 0;
            string temp = "";
            if (elapsedMins < 10)
            {
                temp += "0" + elapsedMins.ToString();
            }
            else temp += elapsedMins.ToString();
            temp += ":";
            if (elapsedSecs < 10)
            {
                temp += "0" + elapsedSecs.ToString();
            }
            else temp += elapsedSecs.ToString();
            gameObject.GetComponent<TextMeshProUGUI>().text = temp;
        }
        else
        {
            msCounter += Time.deltaTime * 1000;
        }
    }

    public static void reset()
    {
        elapsedMins = 0;
        elapsedSecs = 0;
        msCounter = 0;
        GameObject.Find("queueTimeText").GetComponent<TextMeshProUGUI>().text = "00:00";
    }
}
