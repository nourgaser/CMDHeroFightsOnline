using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using TMPro;
using UnityEngine;

public class QueueIn : MonoBehaviour
{
    public GameObject queuePanel;
    private void Awake()
    {
        GameObject.Find("cancelButton").GetComponent<Button>().onClick.AddListener(() =>
        {
            NetworkManager.client.Emit("queuedOut", "");
            queueElapsedTime.reset();
            queuePanel.SetActive(false);
        });
        GameObject[] temp = GameObject.FindGameObjectsWithTag("classChoiceButton");
        foreach (GameObject choice in temp)
        {
            choice.GetComponent<Button>().onClick.AddListener(() =>
            {
                NetworkManager.client.Emit("queuedIn", choice.GetComponentInChildren<TextMeshProUGUI>().text);
                queuePanel.SetActive(true);
            });
        }
    }

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
    }
}
