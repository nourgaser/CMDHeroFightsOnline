using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class actions : MonoBehaviour
{

    private Button btn;
    private Client networking;

    private void Awake()
    {
        networking = GameObject.Find("[  Code - Networking ]").GetComponent<Client>();
        btn = GetComponent<Button>();
    }

    // Start is called before the first frame update
    void Start()
    {
        btn.onClick.AddListener(() =>
        {
            networking.client.Emit("action", "testtt");
            Debug.Log("Button clicked");
        });
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
